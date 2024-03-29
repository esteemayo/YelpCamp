const multer = require('multer');
const cloudinary = require('cloudinary');
const { StatusCodes } = require('http-status-codes');

const AppError = require('../utils/appError');
const Campground = require('../models/Campground');
const catchErrors = require('../utils/catchErrors');

const storage = multer.diskStorage({
  filename: function (req, file, callback) {
    callback(null, Date.now() + file.originalname);
  },
});

const imageFilter = function (req, file, cb) {
  // accept image files only
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
    return cb(new Error('Only image files are allowed'), false);
  }
  cb(null, true);
};

const upload = multer({ storage: storage, fileFilter: imageFilter });

exports.upload = upload.single('image');

cloudinary.config({
  cloud_name: 'learnhowtocode',
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const NodeGeocoder = require('node-geocoder');

const options = {
  provider: 'google',
  httpAdapter: 'https',
  apiKey: process.env.GEOCODER_API_KEY,
  formatter: null,
};

const geocoder = NodeGeocoder(options);

exports.getAllCampgrounds = catchErrors(async (req, res, next) => {
  let noMatch = null;
  if (req.query.search) {
    const regex = new RegExp(escapeRegex(req.query.search), 'gi');

    const page = req.params.page * 1 || 1;
    const limit = 8;
    const skip = (page - 1) * limit;

    const campgroundsPromise = Campground.find({ name: regex })
      .skip(skip)
      .limit(limit)
      .sort('-date');

    const countPromise = Campground.countDocuments();

    const [campgrounds, count] = await Promise.all([
      campgroundsPromise,
      countPromise,
    ]);

    const pages = Math.ceil(count / limit);

    if (!campgrounds.length && skip) {
      req.flash(
        'info',
        `Hey! You asked for page ${page}. But that doesn't exist. So I put you on page ${pages}`
      );
      return res.redirect(`/campgrounds/page/${pages}`);
    }

    if (campgrounds.length < 1) {
      return (noMatch = 'No campgrounds match that query, please try again.');
    }
    return res.status(StatusCodes.OK).render('campgrounds/index', {
      title: 'Campgrounds',
      campgrounds,
      count,
      pages,
      page,
      noMatch,
    });
  }
  const page = req.params.page * 1 || 1;
  const limit = 8;
  const skip = (page - 1) * limit;

  // get all campgrounds from the DB
  const campgroundsPromise = Campground.find()
    .skip(skip)
    .limit(limit)
    .sort('-date');

  const countPromise = Campground.countDocuments();

  const [campgrounds, count] = await Promise.all([
    campgroundsPromise,
    countPromise,
  ]);

  const pages = Math.ceil(count / limit);

  if (!campgrounds.length && skip) {
    req.flash(
      'info',
      `Hey! You asked for page ${page}. But that doesn't exist. So I put you on page ${pages}`
    );
    return res.redirect(`/campgrounds/page/${pages}`);
  }

  return res.status(StatusCodes.OK).render('campgrounds/index', {
    title: 'Campgrounds',
    campgrounds,
    count,
    pages,
    page,
    noMatch,
  });
});

exports.createCampground = catchErrors(async (req, res, next) => {
  const result = await cloudinary.uploader.upload(req.file.path);

  req.body.image = result.secure_url;
  req.body.imageId = result.public_id;
  if (!req.body.author)
    req.body.author = { id: req.user._id, username: req.user.username };

  res.status(StatusCodes.CREATED).redirect('/campgrounds');
});

exports.add = (req, res) => {
  res.status(StatusCodes.OK).render('campgrounds/new', {
    title: 'Create new campground',
  });
};

exports.getCampgroundBySlug = catchErrors(async (req, res, next) => {
  // find the campground with provided SLUG
  const campground = await Campground.findOne({
    slug: req.params.slug,
  }).populate('comments');

  if (!campground) {
    return next(
      new AppError('No campground found with that SLUG.', StatusCodes.NOT_FOUND)
    );
  }

  // build and render show template with that campground
  res.status(StatusCodes.OK).render('campgrounds/show', {
    title: `${campground.name} Campground`,
    campground,
  });
});

exports.editCampground = catchErrors(async (req, res, next) => {
  const campground = await Campground.findById(req.params.id);

  if (!campground) {
    return next(
      new AppError('No campground found with that ID.', StatusCodes.NOT_FOUND)
    );
  }

  res.status(StatusCodes.OK).render('campgrounds/edit', {
    title: `${campground.name} Campground`,
    campground,
  });
});

exports.updateCampground = catchErrors(async (req, res, next) => {
  const campground = await Campground.findById(req.params.id);

  if (!campground) {
    return next(
      new AppError('No campground found with that ID.', StatusCodes.NOT_FOUND)
    );
  }

  if (req.file) {
    try {
      await cloudinary.v2.uploader.destroy(campground.imageId);
      const result = await cloudinary.v2.uploader.upload(req.file.path);
      campground.imageId = result.public_id;
      campground.image = result.secure_url;
    } catch (err) {
      req.flash('error', err.message);
      return res.redirect('back');
    }
  }
  campground.name = req.body.name;
  campground.price = req.body.price;
  campground.description = req.body.description;
  campground.save();
  req.flash('success', 'Campground Updated Successfully!');
  res.redirect('back');
});

exports.deleteCampground = catchErrors(async (req, res, next) => {
  const campground = await Campground.findById(req.params.id);

  if (!campground) {
    return next(
      new AppError('No campground found with that ID.', StatusCodes.NOT_FOUND)
    );
  }

  await cloudinary.uploader.destroy(campground.imageId);
  campground.remove();
  req.flash('success', 'Campground Deleted Successfully!');
  res.redirect('/campgrounds');
});

function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

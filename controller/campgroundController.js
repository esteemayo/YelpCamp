const multer = require('multer');
const cloudinary = require('cloudinary');
const Campground = require('../models/Campground');
const AppError = require('../utils/appError');
const catchErrors = require('../utils/catchErrors');

const storage = multer.diskStorage({
    filename: function (req, file, callback) {
        callback(null, Date.now() + file.originalname);
    }
});

const imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed'), false);
    }
    cb(null, true);
}

const upload = multer({ storage: storage, fileFilter: imageFilter });

exports.upload = upload.single('image');

cloudinary.config({
    cloud_name: 'learnhowtocode',
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const NodeGeocoder = require('node-geocoder');

const options = {
    provider: 'google',
    httpAdapter: 'https',
    apiKey: process.env.GEOCODER_API_KEY,
    formatter: null
};

const geocoder = NodeGeocoder(options);

exports.getAllCampgrounds = catchErrors(async(req, res, next) => {
    let noMatch = null;
    if (req.query.search) {
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        const campgrounds = await Campground.find({ 'name': regex });

        if (campgrounds.length < 1) {
            return noMatch = 'No campgrounds match that query, please try again.'
        }
        return res.status(200).render('campgrounds/index', {
            title: 'Campgrounds',
            campgrounds,
            noMatch
        });
    }
    // get all campgrounds from the DB
    const campgrounds = await Campground.find();

    return res.status(200).render('campgrounds/index', {
        title: 'Campgrounds',
        campgrounds,
        noMatch
    });
});

exports.createCampground = catchErrors(async (req, res, next) => {
    const result = await cloudinary.uploader.upload(req.file.path);

    req.body.image = result.secure_url;
    req.body.imageId = result.public_id;
    if (!req.body.author) req.body.author = { id: req.user._id, username: req.user.username };

    await Campground.create(req.body);
    res.status(201).redirect('/campgrounds');
});

exports.add = (req, res) => {
    res.status(200).render('campgrounds/new', {
        title: 'Create new campground'
    });
}

exports.getCampgroundBySlug = catchErrors(async (req, res, next) => {
    // find the campground with provided SLUG
    const campground = await Campground
        .findOne({ 'slug': req.params.slug })
        .populate('comments');

    if (!campground) {
        return next(new AppError('No campground found with that SLUG.', 404));
    }

    // build and render show template with that campground
    res.status(200).render('campgrounds/show', {
        title: `${campground.name} Campground`,
        campground
    });
});

exports.editCampground = catchErrors(async (req, res, next) => {
    const campground = await Campground.findById(req.params.id);

    if (!campground) {
        return next(new AppError('No campground found with that ID.', 404));
    }

    res.status(200).render('campgrounds/edit', {
        title: `${campground.name} Campground`,
        campground
    });
});

exports.updateCampground = catchErrors(async (req, res, next) => {
    const campground = await Campground.findById(req.params.id);

    if (!campground) {
        return next(new AppError('No campground found with that ID.', 404));
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
        return next(new AppError('No campground found with that ID.', 404));
    }

    await cloudinary.uploader.destroy(campground.imageId);
    campground.remove();
    req.flash('success', 'Campground Deleted Successfully!');
    res.redirect('/campgrounds');
});

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};
const express = require('express');
const router = express.Router();
const Campground = require('../models/campgrounds');
const middleware = require('../middleware');
const multer = require('multer');
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

const cloudinary = require('cloudinary');
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

// CAMPGROUNDS ROUTE
router.get('/', middleware.isLoggedIn, (req, res) => {
    let noMatch = null;
    if (req.query.search) {
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        Campground.find({ 'name': regex }, (err, allCampgrounds) => {
            if (err) {
                console.log(err);
            } else {
                if (allCampgrounds.length < 1) {
                    noMatch = 'No campgrounds match that query, please try again.'
                }
                res.render('campgrounds/index', { campgrounds: allCampgrounds, noMatch: noMatch });
            }
        });
    } else {
        // get all campgrounds from the DB
        Campground.find({}, (err, allCampgrounds) => {
            if (err) {
                console.log(err);
            } else {
                res.render('campgrounds/index', { campgrounds: allCampgrounds, noMatch: noMatch });
            }
        });
    }
});

// router.post('/', upload.single('image'), (req, res) => {
//     cloudinary.uploader.upload(req.file.path, (result) => {
//         const newData = {
//             name: req.body.name,
//             description: req.body.description,
//             imageId: result.public_id,
//             image: result.secure_url,
//             author: {
//                 id: req.user._id,
//                 username: req.user.username
//             }
//         }

//         new Campground(newData)
//             .save()
//             .then(campground => {
//                 res.redirect('/campgrounds');
//             });
//     });
// });

router.post('/', upload.single('image'), (req, res) => {
    cloudinary.uploader.upload(req.file.path, (result) => {
        let name = req.body.name;
        let price = req.body.price;
        let description = req.body.description;
        let image = result.secure_url;
        let imageId = result.public_id;
        let author = {
            id: req.user._id,
            username: req.user.username
        }

        let newCampground = { name: name, price: price, description: description, image: image, imageId: imageId, author: author };

        Campground.create(newCampground, (err, campground) => {
            if (err) {
                console.log(err);
            } else {
                res.redirect('/campgrounds');
            }
        });
    });
});


// POST ROUTE
// router.post('/', middleware.isLoggedIn, (req, res) => {
//     let name = req.body.name;
//     let price = req.body.price;
//     let image = req.body.image;
//     let desc = req.body.description;
//     let author = {
//         id: req.user._id,
//         username: req.user.username
//     }

//     let newCampground = {name: name, price: price, image: image, description: desc, author: author}
//     Campground.create(newCampground, (err, newlyCreated) => {
//         if (err) {
//             console.log(err);
//         } else {
//             res.redirect('/campgrounds');
//         }
//     });
// });

// NEW/ADD(FORM) CAMPGROUNDS ROUTE
router.get('/new', middleware.isLoggedIn, (req, res) => {
    res.render('campgrounds/new');
});

// SHOW ROUTE
router.get('/:id', (req, res) => {
    // find the campground with provided ID
    Campground.findById(req.params.id).populate('comments').exec((err, foundCampground) => {
        if (err) {
            console.log(err);
        } else {
            // render show template with that campground
            res.render('campgrounds/show', { campground: foundCampground });
        }
    });
});

// EDIT CAMPGROUND ROUTE
router.get('/:id/edit', middleware.checkCampgroundOwnership, (req, res) => {
    Campground.findById(req.params.id, (err, foundCampground) => {
        res.render('campgrounds/edit', { campground: foundCampground });
    });
});

// UPDATE CAMPGROUND ROUTE
router.put('/:id', upload.single('image'), (req, res) => {
    Campground.findById(req.params.id, async (err, campground) => {
        if (err) {
            req.flash('error', err.message);
            return res.redirect('back');
        } else {
            if (req.file) {
                try {
                    await cloudinary.v2.uploader.destroy(campground.imageId);
                    let result = await cloudinary.v2.uploader.upload(req.file.path);
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
            res.redirect('/campgrounds/' + campground._id);
        }
    });
});


// UPDATE CAMPGROUND ROUTE
// router.put('/:id', (req, res) => {
//     Campground.findOneAndUpdate(req.params.id, req.body.campground, (err, updatedCampground) => {
//         if (err) {
//             res.redirect('/campgrounds');
//         } else {
//             req.flash('success', 'Campground updated!');
//             res.redirect('/campgrounds/' + req.params.id);
//         }
//     });
// });

// DESTROY CAMPGROUND ROUTE
router.delete('/:id', (req, res) => {
    Campground.findById(req.params.id, async (err, campground) => {
        try {
            await cloudinary.uploader.destroy(campground.imageId);
            campground.remove();
            req.flash('success', 'Campground Deleted Successfully!');
            res.redirect('/campgrounds');
        } catch (err) {
            req.flash('error', err.message);
            res.redirect('back');
        }
    });
});

// DESTROY CAMPGROUND ROUTE
// router.delete('/:id', (req, res) => {
//     Campground.findOneAndDelete(req.params.id, err => {
//         if (err) {
//             res.redirect('/campgrounds');
//         } else {
//             res.redirect('/campgrounds');
//         }
//     });
// });

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

module.exports = router;
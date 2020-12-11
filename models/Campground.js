const mongoose = require('mongoose');
const slugify = require('slugify');

const campgroundSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A campground must have a name'],
        unique: true,
        trim: true,
        maxlength: [50, 'A campground name must have less or equal than 50 characters'],
        minlength: [5, 'A campground name must have more or equal than 5 characters']
    },
    price: {
        type: Number,
        required: [true, 'A campground must have a price']
    },
    slug: String,
    image: String,
    imageId: String,
    description: {
        type: String,
        trim: true
    },
    location: String,
    lat: Number,
    lng: Number,
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'A campground must belong to an author.']
        },
        username: String
    },
    comments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Comment'
        }
    ],
    date: {
        type: Date,
        default: Date.now
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

campgroundSchema.index({ name: 1, price: 1 });
campgroundSchema.index({ slug: 1 });

campgroundSchema.pre('save', async function (next) {
    if (!this.isModified('name')) return next();

    this.slug = slugify(this.name, { lower: true });

    const slugRegExp = new RegExp(`^(${this.slug})((-[0-9]*$)?)$`, 'i');
    const campgroundWithSlug = await this.constructor.find({ slug: slugRegExp });

    if (campgroundWithSlug.length) {
        this.slug = `${this.slug}-${campgroundWithSlug.length + 1}`;
    }

    next();
});

const Campground = mongoose.model('Campground', campgroundSchema);

module.exports = Campground;
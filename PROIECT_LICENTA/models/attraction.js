const mongoose = require('mongoose');
const Review = require('./review')
const Schema = mongoose.Schema;

const ImageSchema = new Schema({
    url: String,
    filename: String
});

ImageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_200');
});

const opts = { toJSON: { virtuals: true } };

const AttractionSchema = new Schema({ // Define a new Mongoose schema for an Attraction object
    title: String,  // The title of the attraction, stored as a string
    images: [ImageSchema], // An array of images, defined by the ImageSchema
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    price: Number,
    description: String,
    location: String,
    author: { // A reference to the author of the attraction, stored as an ObjectId
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [// An array of references to reviews of the attraction, stored as ObjectIds
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
}, opts);


AttractionSchema.virtual('properties.popUpMarkup').get(function () {
    return `
    <strong><a href="/attractions/${this._id}">${this.title}</a><strong>
    <p>${this.description.substring(0, 20)}...</p>`
});



AttractionSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        })
    }
})

module.exports = mongoose.model('Attraction', AttractionSchema);
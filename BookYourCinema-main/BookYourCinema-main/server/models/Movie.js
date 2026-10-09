const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const MovieSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    posterUrl: {
        type: String,
        required: true
    },
    trailerUrl: {
        type: String,
        required: true
    },
    language: {
        type: String,
        required: true
    },
    cast: [{
        type: String,
        required: true
    }],
    description: {
        type: String,
        required: true
    },
    genre: [{
        type: String,
        required: true
    }],
    releaseDate: {
        type: Date,
        required: true
    },
    duration: {
        type: Number,
        required: true
    },
    rating: {
        type: Number,
        required: true
    },
    admin: {
        type: Schema.Types.ObjectId,
        ref: 'Admin',
        required: true
    },
    bookings: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Reservation',
        }
    ]
}, { timestamps: true });

module.exports = mongoose.model('Movie', MovieSchema)
const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const BookingSchema = new Schema({
    users: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    movies: {
        type: Schema.Types.ObjectId,
        ref: 'Movie',
        require: true
    },
    showtimeId: {
        type: Schema.Types.ObjectId,
        ref: 'Showtime',
        required: true
    },
    seats: {
        type: [String],
        required: true,
        validate: {
            validator: (seats) => seats.length > 0 && new Set(seats).size === seats.length,
            message: 'Select at least one unique seat.'
        }
    },
    totalPrice: {
        type: Number,
        required:
            true
    },
    checkIn: {
        type: Boolean,
        default: false
    },
}, { timestamps: true });

module.exports = mongoose.model('Reservation', BookingSchema);  
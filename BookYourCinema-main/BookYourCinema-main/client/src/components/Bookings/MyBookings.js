import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { getMyReservations } from '../../api-helpers/api-helper';
import { useAuth } from '../../context/AuthContext';

export default function MyBookings() {
  const { session, openAuth } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const response = await getMyReservations();
      setBookings(response.data);
      setError('');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not load your bookings.');
    }
  }, []);

  useEffect(() => {
    if (session?.role === 'user') load();
    else openAuth();
  }, [session, load, openAuth]);

  const cancel = async (id) => {
    try {
      await api.delete(`/reservation/${id}`);
      await load();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not cancel this booking.');
    }
  };

  if (session?.role !== 'user') {
    return <main className="bookings-page"><h1>Your bookings</h1><p>Sign in with your customer account to see your tickets.</p></main>;
  }

  return (
    <main className="bookings-page">
      <span className="eyebrow">YOUR TICKETS</span>
      <h1>My bookings</h1>
      <p className="bookings-intro">Every great night out, all in one place.</p>
      {error && <p className="form-error" role="alert">{error}</p>}
      {!bookings.length ? (
        <section className="empty-bookings"><span aria-hidden="true">✳</span><h2>No bookings yet</h2><p>Your next favorite movie is waiting.</p><Link to="/" className="button button-primary">Browse movies</Link></section>
      ) : (
        <div className="booking-list">
          {bookings.map((booking) => (
            <article className="booking-ticket" key={booking._id}>
              {booking.movies?.posterUrl && <img src={booking.movies.posterUrl} alt="" />}
              <div className="ticket-info">
                <span className="eyebrow">BOOKING #{booking._id.slice(-6).toUpperCase()}</span>
                <h2>{booking.movies?.title || 'Movie ticket'}</h2>
                <p>{booking.showtimeId ? `${new Date(booking.showtimeId.showDate).toLocaleDateString()} · ${booking.showtimeId.showTime}` : 'Showtime details unavailable'}</p>
                <p>Seats: <strong>{booking.seats.join(', ')}</strong></p>
              </div>
              <div className="ticket-total"><strong>₹{booking.totalPrice}</strong><span>{booking.checkIn ? 'Checked in' : 'Confirmed'}</span>{!booking.checkIn && <button type="button" onClick={() => cancel(booking._id)}>Cancel booking</button>}</div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}

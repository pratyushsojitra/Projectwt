import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AuthForm from './AuthForm';
import { useAuth } from '../../context/AuthContext';
import api, { adminAuthRequest, getAllMovies, getTheaters, getShowtimes } from '../../api-helpers/api-helper';

const initialMovie = {
  title: '', posterUrl: '', trailerUrl: '', language: '', cast: '', description: '',
  genre: '', releaseDate: '', duration: '', rating: ''
};

export default function AdminAuth() {
  const { session, login, logout } = useAuth();
  const [movies, setMovies] = useState([]);
  const [theaters, setTheaters] = useState([]);
  const [showtimes, setShowtimes] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [showAuth, setShowAuth] = useState(true);
  const [movie, setMovie] = useState(initialMovie);
  const [theater, setTheater] = useState({ name: '', address: '', city: '', state: '', ticketPrice: '' });
  const [showtime, setShowtime] = useState({ movieId: '', theaterId: '', showDate: '', showTime: '', price: '', totalSeats: 60 });
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  const isAdmin = session?.role === 'admin';
  const refreshData = useCallback(async () => {
    try {
      const [movieResult, theaterResult, showtimeResult, reservationResult] = await Promise.all([
        getAllMovies(), getTheaters(), getShowtimes(), api.get('/reservation')
      ]);
      setMovies(movieResult.data);
      setTheaters(theaterResult.data);
      setShowtimes(showtimeResult.data);
      setReservations(reservationResult.data);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not load cinema data.');
    }
  }, []);

  useEffect(() => {
    if (isAdmin) refreshData();
  }, [isAdmin, refreshData]);

  const submit = async (event, request, after) => {
    event.preventDefault();
    setError('');
    setNotice('');
    try {
      await request();
      setNotice('Saved successfully.');
      if (after) after();
      await refreshData();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not save this information.');
    }
  };

  const saveMovie = (event) => submit(event, () => api.post('/movies', {
    ...movie,
    cast: movie.cast.split(',').map((value) => value.trim()).filter(Boolean),
    genre: movie.genre.split(',').map((value) => value.trim()).filter(Boolean),
    duration: Number(movie.duration),
    rating: Number(movie.rating)
  }), () => setMovie(initialMovie));

  const saveTheater = (event) => submit(event, () => api.post('/theaters', {
    name: theater.name,
    location: { address: theater.address, city: theater.city, state: theater.state },
    ticketPrice: theater.ticketPrice
  }), () => setTheater({ name: '', address: '', city: '', state: '', ticketPrice: '' }));

  const saveShowtime = (event) => submit(event, () => api.post('/showtime', {
    ...showtime,
    showDate: new Date(`${showtime.showDate}T${showtime.showTime}`).toISOString(),
    price: Number(showtime.price),
    totalSeats: Number(showtime.totalSeats)
  }), () => setShowtime({ movieId: '', theaterId: '', showDate: '', showTime: '', price: '', totalSeats: 60 }));

  const deleteEntry = async (path) => {
    setError('');
    setNotice('');
    try {
      await api.delete(path);
      setNotice('Deleted successfully.');
      await refreshData();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not delete this item.');
    }
  };

  const checkInReservation = async (id) => {
    setError('');
    setNotice('');
    try {
      await api.patch(`/reservation/${id}/check-in`);
      setNotice('Customer checked in.');
      await refreshData();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not check in this booking.');
    }
  };

  if (!isAdmin) {
    return (
      <main className="auth-page">
        <Link className="back-link" to="/">← Back to movies</Link>
        <section className="auth-card">
          <span className="eyebrow">PARTNER PORTAL</span>
          <h1>Manage your cinema</h1>
          <p>Sign in or create a partner account to publish movies, theaters and showtimes.</p>
          <button className="button button-primary auth-trigger" type="button" onClick={() => setShowAuth(true)}>Open partner sign in</button>
          <AdminLogin
            showModal={showAuth}
            handleClose={() => setShowAuth(false)}
            onSubmit={async (input, isSignIn) => login(await adminAuthRequest(input, isSignIn), 'admin')}
          />
        </section>
      </main>
    );
  }

  return (
    <main className="admin-page">
      <div className="admin-heading">
        <div><span className="eyebrow">PARTNER DASHBOARD</span><h1>Hello, {session.adminName}</h1></div>
        <button className="button button-outline" onClick={logout} type="button">Sign out</button>
      </div>
      {notice && <p className="form-success" role="status">{notice}</p>}
      {error && <p className="form-error" role="alert">{error}</p>}

      <section className="admin-grid">
        <form className="admin-card" onSubmit={saveMovie}>
          <h2>Add a movie</h2>
          <div className="form-grid">
            <label>Title<input required value={movie.title} onChange={(e) => setMovie({ ...movie, title: e.target.value })} /></label>
            <label>Poster image URL<input required type="url" value={movie.posterUrl} onChange={(e) => setMovie({ ...movie, posterUrl: e.target.value })} /></label>
            <label>Trailer URL<input required type="url" value={movie.trailerUrl} onChange={(e) => setMovie({ ...movie, trailerUrl: e.target.value })} /></label>
            <label>Language<input required value={movie.language} onChange={(e) => setMovie({ ...movie, language: e.target.value })} /></label>
            <label>Genres (comma separated)<input required value={movie.genre} onChange={(e) => setMovie({ ...movie, genre: e.target.value })} /></label>
            <label>Cast (comma separated)<input value={movie.cast} onChange={(e) => setMovie({ ...movie, cast: e.target.value })} /></label>
            <label>Release date<input required type="date" value={movie.releaseDate} onChange={(e) => setMovie({ ...movie, releaseDate: e.target.value })} /></label>
            <label>Duration (minutes)<input required min="1" type="number" value={movie.duration} onChange={(e) => setMovie({ ...movie, duration: e.target.value })} /></label>
            <label>Rating / 10<input required min="0" max="10" step="0.1" type="number" value={movie.rating} onChange={(e) => setMovie({ ...movie, rating: e.target.value })} /></label>
            <label className="full-width">Description<textarea required rows="3" value={movie.description} onChange={(e) => setMovie({ ...movie, description: e.target.value })} /></label>
          </div>
          <button className="button button-primary">Publish movie</button>
        </form>

        <div className="admin-card">
          <h2>Add a theater</h2>
          <form className="form-grid" onSubmit={saveTheater}>
            <label>Name<input required value={theater.name} onChange={(e) => setTheater({ ...theater, name: e.target.value })} /></label>
            <label>Address<input required value={theater.address} onChange={(e) => setTheater({ ...theater, address: e.target.value })} /></label>
            <label>City<input required value={theater.city} onChange={(e) => setTheater({ ...theater, city: e.target.value })} /></label>
            <label>State<input required value={theater.state} onChange={(e) => setTheater({ ...theater, state: e.target.value })} /></label>
            <label>Base ticket price<input required min="1" type="number" value={theater.ticketPrice} onChange={(e) => setTheater({ ...theater, ticketPrice: e.target.value })} /></label>
            <div className="full-width"><button className="button button-primary">Add theater</button></div>
          </form>
          <ItemList items={theaters} label={(item) => `${item.name} · ${item.location.city}`} onDelete={(item) => deleteEntry(`/theaters/${item._id}`)} />
        </div>

        <div className="admin-card">
          <h2>Schedule a show</h2>
          <form className="form-grid" onSubmit={saveShowtime}>
            <label>Movie<select required value={showtime.movieId} onChange={(e) => setShowtime({ ...showtime, movieId: e.target.value })}><option value="">Select a movie</option>{movies.map((item) => <option key={item._id} value={item._id}>{item.title}</option>)}</select></label>
            <label>Theater<select required value={showtime.theaterId} onChange={(e) => setShowtime({ ...showtime, theaterId: e.target.value })}><option value="">Select a theater</option>{theaters.map((item) => <option key={item._id} value={item._id}>{item.name}</option>)}</select></label>
            <label>Date<input required type="date" min={new Date().toISOString().slice(0, 10)} value={showtime.showDate} onChange={(e) => setShowtime({ ...showtime, showDate: e.target.value })} /></label>
            <label>Time<input required type="time" value={showtime.showTime} onChange={(e) => setShowtime({ ...showtime, showTime: e.target.value })} /></label>
            <label>Ticket price<input required min="1" type="number" value={showtime.price} onChange={(e) => setShowtime({ ...showtime, price: e.target.value })} /></label>
            <label>Seats (1–300)<input required min="1" max="300" type="number" value={showtime.totalSeats} onChange={(e) => setShowtime({ ...showtime, totalSeats: e.target.value })} /></label>
            <div className="full-width"><button className="button button-primary">Create showtime</button></div>
          </form>
          <ItemList items={showtimes} label={(item) => `${item.movieId?.title || 'Movie'} · ${item.theaterId?.name || 'Theater'} · ${new Date(item.showDate).toLocaleDateString()} ${item.showTime}`} onDelete={(item) => deleteEntry(`/showtime/${item._id}`)} />
        </div>

        <div className="admin-card">
          <h2>Published movies</h2>
          <ItemList items={movies} label={(item) => item.title} onDelete={(item) => deleteEntry(`/movies/${item._id}`)} />
        </div>
        <div className="admin-card">
          <h2>Bookings & check-in</h2>
          {!reservations.length ? <p className="muted small-note">No customer bookings yet.</p> : (
            <ul className="item-list">
              {reservations.map((booking) => (
                <li key={booking._id}>
                  <span>{booking.movies?.title || 'Movie'} · {booking.users?.username || 'Customer'} · {booking.seats.join(', ')} · ₹{booking.totalPrice}</span>
                  {booking.checkIn ? <small>Checked in</small> : <button type="button" onClick={() => checkInReservation(booking._id)}>Check in</button>}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </main>
  );
}

function AdminLogin({ onSubmit, showModal, handleClose }) {
  return <AuthForm onSubmit={onSubmit} isUser={false} showModal={showModal} handleClose={handleClose} />;
}

function ItemList({ items, label, onDelete }) {
  if (!items.length) return <p className="muted small-note">Nothing here yet.</p>;
  return <ul className="item-list">{items.map((item) => (
    <li key={item._id}><span>{label(item)}</span><button type="button" onClick={() => onDelete(item)} aria-label={`Delete ${label(item)}`}>Delete</button></li>
  ))}</ul>;
}

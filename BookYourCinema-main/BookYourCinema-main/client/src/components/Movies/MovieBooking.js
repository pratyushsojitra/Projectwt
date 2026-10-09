import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { createReservation, getMovie, getShowtimes } from '../../api-helpers/api-helper';
import { useAuth } from '../../context/AuthContext';

export default function MovieBooking() {
  const { id } = useParams();
  const { session, openAuth } = useAuth();
  const [movie, setMovie] = useState(null);
  const [showtimes, setShowtimes] = useState([]);
  const [showtimeId, setShowtimeId] = useState('');
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [movieResponse, showtimeResponse] = await Promise.all([getMovie(id), getShowtimes(id)]);
      setMovie(movieResponse.data.movie);
      setShowtimes(showtimeResponse.data);
      setShowtimeId((current) => showtimeResponse.data.some((item) => item._id === current) ? current : showtimeResponse.data[0]?._id || '');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not load this movie.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const selectedShow = showtimes.find((show) => show._id === showtimeId);
  const seats = useMemo(() => {
    if (!selectedShow) return [];
    const screens = selectedShow.screens || [];
    const configured = screens.flatMap((screen) => (screen.seatingLayout || []).filter((seat) => typeof seat === 'string'));
    if (configured.length) return configured;
    const capacity = screens.reduce((total, screen) => total + Number(screen.totalSeats || 0), 0);
    return Array.from({ length: capacity }, (_, index) => `S${index + 1}`);
  }, [selectedShow]);

  const toggleSeat = (seat) => {
    setSelectedSeats((current) => current.includes(seat) ? current.filter((item) => item !== seat) : [...current, seat]);
    setError('');
    setNotice('');
  };

  const bookSeats = async () => {
    if (!selectedShow || !selectedSeats.length) {
      setError('Choose at least one seat before continuing.');
      return;
    }
    if (!session || session.role !== 'user') {
      openAuth();
      setError('Sign in with a customer account to book your seats.');
      return;
    }
    setBusy(true);
    setError('');
    setNotice('');
    try {
      await createReservation(showtimeId, selectedSeats);
      setSelectedSeats([]);
      setNotice('Booking confirmed! Your tickets are available under My bookings.');
      await load();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Booking failed. Please try again.');
      await load();
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <main className="detail-page"><p className="empty-state">Loading movie…</p></main>;
  if (!movie) return <main className="detail-page"><p className="form-error" role="alert">{error || 'Movie not found.'}</p><Link to="/">Back to movies</Link></main>;

  const formatRuntime = (minutes) => `${Math.floor(minutes / 60)}h ${minutes % 60}m`;

  return (
    <main className="detail-page">
      <Link className="back-link" to="/">← All movies</Link>
      <section className="movie-detail-hero">
        <img className="detail-poster" src={movie.posterUrl} alt={`${movie.title} poster`} />
        <div className="detail-copy">
          <span className="eyebrow">FEATURED FILM</span>
          <h1>{movie.title}</h1>
          <p className="detail-meta"><span>★ {movie.rating ?? '—'} / 10</span><span>{movie.duration ? formatRuntime(movie.duration) : 'Runtime TBA'}</span><span>{movie.language}</span></p>
          <p className="genre-tags">{(movie.genre || []).map((genre) => <span key={genre}>{genre}</span>)}</p>
          <p className="detail-description">{movie.description}</p>
          {movie.cast?.length > 0 && <p className="cast-line"><strong>Cast</strong> {movie.cast.join(', ')}</p>}
          {movie.releaseDate && <p className="cast-line"><strong>Release date</strong> {new Date(movie.releaseDate).toLocaleDateString()}</p>}
          {movie.trailerUrl && <a className="trailer-link" href={movie.trailerUrl} target="_blank" rel="noreferrer">▶ Watch trailer</a>}
        </div>
      </section>

      <section className="booking-panel">
        <div className="booking-heading"><div><span className="eyebrow">MAKE IT A MOVIE NIGHT</span><h2>Choose a show</h2></div></div>
        {error && <p className="form-error" role="alert">{error}</p>}
        {notice && <p className="form-success" role="status">{notice}</p>}
        {!showtimes.length ? <p className="empty-state">There are no upcoming showtimes for this movie yet.</p> : (
          <>
            <div className="showtime-list">
              {showtimes.map((show) => (
                <button type="button" key={show._id} className={`showtime-card ${showtimeId === show._id ? 'selected' : ''}`} onClick={() => { setShowtimeId(show._id); setSelectedSeats([]); setNotice(''); }}>
                  <strong>{show.showTime}</strong>
                  <span>{new Date(show.showDate).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                  <small>{show.theaterId?.name || 'Cinema'} · {show.theaterId?.location?.city || ''}</small>
                  <b>₹{show.price}</b>
                </button>
              ))}
            </div>
            {selectedShow && <div className="seat-picker">
              <div className="screen-line"><span>SCREEN</span></div>
              <p className="seat-hint">Select seats (up to 10 per booking)</p>
              <div className="seat-grid">
                {seats.map((seat) => {
                  const booked = (selectedShow.bookedSeats || []).includes(seat);
                  const selected = selectedSeats.includes(seat);
                  return <button type="button" key={seat} disabled={booked || (!selected && selectedSeats.length >= 10)} className={`seat ${booked ? 'booked' : ''} ${selected ? 'chosen' : ''}`} onClick={() => toggleSeat(seat)} aria-label={`${seat}${booked ? ' booked' : selected ? ' selected' : ''}`}>{seat.replace(/^S/, '')}</button>;
                })}
              </div>
              <div className="seat-legend"><span><i className="seat-dot" /> Available</span><span><i className="seat-dot chosen-dot" /> Selected</span><span><i className="seat-dot booked-dot" /> Taken</span></div>
              <div className="checkout-row"><p>{selectedSeats.length} seat{selectedSeats.length === 1 ? '' : 's'} · <strong>₹{selectedSeats.length * selectedShow.price}</strong></p><button className="button button-primary" type="button" onClick={bookSeats} disabled={busy || !selectedSeats.length}>{busy ? 'Booking…' : 'Book tickets'}</button></div>
            </div>}
          </>
        )}
      </section>
    </main>
  );
}

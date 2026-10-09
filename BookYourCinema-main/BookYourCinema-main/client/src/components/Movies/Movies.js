import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllMovies } from '../../api-helpers/api-helper';

export default function Movies() {
  const [movies, setMovies] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    const loadMovies = async () => {
      try {
        const response = await getAllMovies(search.trim());
        if (active) setMovies(response.data);
      } catch (requestError) {
        if (active) setError(requestError.response?.data?.message || 'Could not load movies. Check that the API is running.');
      } finally {
        if (active) setLoading(false);
      }
    };
    loadMovies();
    return () => { active = false; };
  }, [search]);

  return (
    <main className="movies-page">
      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">YOUR NEXT NIGHT OUT</span>
          <h1>Movies worth<br />leaving home for.</h1>
          <p>Find your film. Pick your seats. Make it a night.</p>
          <a className="button button-primary" href="#now-showing">Explore movies <span aria-hidden="true">↓</span></a>
        </div>
        <div className="hero-art" aria-hidden="true"><span>★</span><span>NOW<br />SHOWING</span></div>
      </section>

      <section className="movie-section" id="now-showing">
        <div className="section-heading">
          <div><span className="eyebrow">ON THE BIG SCREEN</span><h2>Now showing</h2></div>
          <label className="search-box">
            <span aria-hidden="true">⌕</span>
            <input aria-label="Search movies" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search movies" />
          </label>
        </div>
        {error && <p className="form-error" role="alert">{error}</p>}
        {loading ? <p className="empty-state">Finding your next movie…</p> : movies.length ? (
          <div className="movie-grid">
            {movies.map((movie) => (
              <Link to={`/movie/${movie._id}`} className="movie-card" key={movie._id}>
                <div className="poster-wrap">
                  <img src={movie.posterUrl} alt={`${movie.title} poster`} loading="lazy" />
                  <span className="rating-badge">★ {movie.rating ?? '—'}</span>
                  <span className="poster-cta">View details <span aria-hidden="true">↗</span></span>
                </div>
                <div className="movie-card-copy">
                  <h3>{movie.title}</h3>
                  <p>{(movie.genre || []).join(' · ') || movie.language}</p>
                </div>
              </Link>
            ))}
          </div>
        ) : <p className="empty-state">{search ? 'No movies match your search.' : 'No movies are listed yet. Check back soon.'}</p>}
      </section>
    </main>
  );
}

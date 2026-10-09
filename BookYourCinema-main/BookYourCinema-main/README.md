# BookYourCinema

A MERN cinema ticket booking application: React client, Express/Node API, and MongoDB persistence.

## Requirements

- Node.js 18 or newer and npm
- MongoDB running locally, or a MongoDB Atlas connection string

## Run locally

1. Open a terminal in this directory and install dependencies:

   ```sh
   npm install
   npm --prefix server install
   npm --prefix client install
   ```

2. Copy `server/.env.example` to `server/.env`. Set `MONGO_URI` to your MongoDB connection string and replace `JWT_SECRET` with a long, random secret.

3. Start the API and React app together:

   ```sh
   npm start
   ```

   The React app is at `http://localhost:3000`; the API is at `http://localhost:5000`. The API health check is `http://localhost:5000/health`.

To use a different API URL, set `REACT_APP_API_URL` in `client/.env`. For development with automatic server restarts, run `npm run server:dev` in place of the combined command.

## Features

- Browse and search movies, with movie details, cast, rating, duration, genres, and trailer links.
- Customer sign-up/sign-in with hashed passwords and JWT sessions.
- Browse movie showtimes and seat availability, book up to 10 seats, and view/cancel personal bookings.
- Partner sign-up/sign-in and dashboard for publishing movies, theaters, and showtimes.
- Role-protected write APIs, ownership checks for movie updates/deletes, and atomic seat claims to prevent two customers booking the same seat.

The first partner can create an account from **List your cinema**. For a public production deployment, partner registration should be restricted to an invitation or operator approval flow.

## API overview

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| `POST` | `/user/signup`, `/user/signin` | Public | Customer authentication |
| `GET` | `/user/bookings` | Customer | List the signed-in customer's bookings |
| `GET` | `/movies`, `/movies/:id` | Public | Browse/search and view a movie |
| `POST`, `PATCH`, `DELETE` | `/movies` and `/movies/:id` | Partner | Manage movies |
| `GET` | `/theaters` | Public | Browse theaters |
| `POST`, `PATCH`, `DELETE` | `/theaters` and `/theaters/:id` | Partner | Manage theaters |
| `GET` | `/showtime?movieId=...` | Public | Browse showtimes and booked seats |
| `POST`, `PATCH`, `DELETE` | `/showtime` and `/showtime/:id` | Partner | Manage showtimes |
| `POST` | `/reservation` | Customer | Reserve available seats |
| `GET` | `/reservation/mine` | Customer | List personal reservations |
| `GET` | `/reservation` | Partner | List customer bookings for check-in |
| `DELETE` | `/reservation/:id` | Reservation owner | Cancel a reservation |
| `PATCH` | `/reservation/:id/check-in` | Partner | Check in a reservation |

Protected endpoints accept `Authorization: Bearer <token>`.

## Build and test

```sh
npm run build
npm test
```

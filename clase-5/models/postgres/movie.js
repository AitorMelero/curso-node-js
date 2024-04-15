import 'dotenv/config'
import pg from 'pg'

const DEFAULT_CONFIG = {
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  port: process.env.DATABASE_PORT,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
}

const { Pool } = pg

const pool = new Pool(DEFAULT_CONFIG)

export class MovieModel {
  static async getAll({ genre }) {
    console.log('getAll')

    if (genre) {
      const lowerCaseGenre = genre.toLowerCase()

      // get genre ids from database table using genre names
      const { rows: genres } = await pool.query(
        'SELECT id, name FROM genres WHERE LOWER(name) = $1;',
        [lowerCaseGenre]
      )

      // no genre found
      if (genres.length === 0) return []

      // genre found
      const GENRE_QUERY =
        'SELECT id, title, year, director, duration, poster, rate FROM movie_genres INNER JOIN movies ON movie_genres.movie_id = movies.id WHERE genre_id = $1;'
      const { id: genre_id } = genres[0]
      const { rows: movies } = await pool.query(GENRE_QUERY, [genre_id])

      return movies
    }

    const { rows: movies } = await pool.query(
      'SELECT title, year, director, duration, poster, rate, id FROM movies;'
    )

    return movies
  }
}

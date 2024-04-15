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

  static async getById({ id }) {
    const { rows: movies } = await pool.query(
      `SELECT title, year, director, duration, poster, rate, id
        FROM movies WHERE id = $1;`,
      [id]
    )

    if (movies.length === 0) return null

    return movies[0]
  }

  static async create({ input }) {
    const {
      genre: genreInput, // genre is an array
      title,
      year,
      duration,
      director,
      rate,
      poster,
    } = input

    // todo: crear la conexión de genre

    // crypto.randomUUID()
    const { rows: uuidResult } = await pool.query('SELECT uuid_generate_v4();')
    const [{ uuid_generate_v4: uuid }] = uuidResult

    try {
      await pool.query(
        `INSERT INTO movies (id, title, year, director, duration, poster, rate)
          VALUES ($1, $2, $3, $4, $5, $6, $7);`,
        [uuid, title, year, director, duration, poster, rate]
      )
    } catch (e) {
      // puede enviarle información sensible
      throw new Error('Error creating movie')
      // enviar la traza a un servicio interno
      // sendLog(e)
    }

    const { rows: movies } = await pool.query(
      `SELECT title, year, director, duration, poster, rate, id
        FROM movies WHERE id = $1;`,
      [uuid]
    )

    return movies[0]
  }

  static async delete({ id }) {
    await pool.query(`DELETE FROM movies WHERE id = $1;`, [id])
  }

  static async update({ id, input }) {
    const input_length = Object.keys(input).length
    let input_set = []
    let input_set_string = ''

    Object.keys(input).forEach((key, index) => {
      input_set.push(key + ' = $' + (index + 1))
    })

    input_set_string = input_set.join(', ')

    const query_string = `UPDATE movies SET ${input_set_string} WHERE id = ${
      '$' + (input_length + 1)
    };`

    await pool.query(query_string, [...Object.values(input), id])

    const { rows: movies } = await pool.query(
      `SELECT title, year, director, duration, poster, rate, id
        FROM movies WHERE id = $1;`,
      [id]
    )

    return movies[0]
  }
}

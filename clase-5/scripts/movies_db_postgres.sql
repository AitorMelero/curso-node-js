-- Database: moviesdb

DROP DATABASE IF EXISTS moviesdb;

CREATE DATABASE moviesdb
    WITH
    OWNER = postgres
    ENCODING = 'UTF8'
    LC_COLLATE = 'English_United States.1252'
    LC_CTYPE = 'English_United States.1252'
    LOCALE_PROVIDER = 'libc'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1
    IS_TEMPLATE = False;

COMMENT ON DATABASE moviesdb
    IS 'Movies Database';

-- UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- SELECT uuid_generate_v4();

-- MOVIE TABLE
DROP TABLE IF EXISTS movies CASCADE;
CREATE TABLE movies (
	id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
	title VARCHAR(255) NOT NULL,
	year INT NOT NULL,
	director VARCHAR(255) NOT NULL,
	duration INT NOT NULL,
	poster TEXT,
	rate DECIMAL(2, 1) NOT NULL
);

-- GENRES TABLE
DROP TABLE IF EXISTS genres CASCADE;
CREATE TABLE genres (
	id SERIAL PRIMARY KEY,
	name VARCHAR(255) NOT NULL UNIQUE
);

-- MOVIE_GENRES TABLE
DROP TABLE IF EXISTS movie_genres;
CREATE TABLE movie_genres (
	movie_id uuid REFERENCES movies(id),
	genre_id INT REFERENCES genres(id),
	PRIMARY KEY (movie_id, genre_id)
);

-- INSERTS
INSERT INTO genres (name) VALUES
('Drama'),
('Action'),
('Crime'),
('Adventure'),
('Sci-fi'),
('Romance');

INSERT INTO movies (id, title, year, director, duration, poster, rate) VALUES
(uuid_generate_v4(), 'The Shawshank Redemption', 1994, 'Frank Darabont', 142, 'https://i.ebayimg.com/images/g/4goAAOSwMyBe7hnQ/s-l1200.webp', 9.3),
(uuid_generate_v4(), 'The Dark Knight', 2008, 'Christopher Nolan', 152, 'https://i.ebayimg.com/images/g/yokAAOSw8w1YARbm/s-l1200.jpg', 9.0),
(uuid_generate_v4(), 'Inception', 2010, 'Christopher Nolan', 148, 'https://m.media-amazon.com/images/I/91Rc8cAmnAL._AC_UF1000,1000_QL80_.jpg', 8.8),
(uuid_generate_v4(), 'Pulp Fiction', 1994, 'Quentin Tarantino', 154, 'https://www.themoviedb.org/t/p/original/vQWk5YBFWF4bZaofAbv0tShwBvQ.jpg', 8.9);

INSERT INTO movie_genres (movie_id, genre_id)
VALUES
	((SELECT id FROM movies WHERE title='The Shawshank Redemption'), (SELECT id FROM genres WHERE name='Drama')),
	((SELECT id FROM movies WHERE title='The Dark Knight'), (SELECT id FROM genres WHERE name='Action')),
	((SELECT id FROM movies WHERE title='The Dark Knight'), (SELECT id FROM genres WHERE name='Crime')),
	((SELECT id FROM movies WHERE title='The Dark Knight'), (SELECT id FROM genres WHERE name='Drama')),
	((SELECT id FROM movies WHERE title='Inception'), (SELECT id FROM genres WHERE name='Action')),
	((SELECT id FROM movies WHERE title='Inception'), (SELECT id FROM genres WHERE name='Adventure')),
	((SELECT id FROM movies WHERE title='Inception'), (SELECT id FROM genres WHERE name='Sci-fi')),
	((SELECT id FROM movies WHERE title='Pulp Fiction'), (SELECT id FROM genres WHERE name='Crime')),
	((SELECT id FROM movies WHERE title='Pulp Fiction'), (SELECT id FROM genres WHERE name='Drama'));

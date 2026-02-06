/**
 * Given this existing books table:
 * CREATE TABLE books (
 *     book_id SERIAL PRIMARY KEY,
 *     title VARCHAR(150) NOT NULL,
 *     author VARCHAR(100) NOT NULL,
 *     genre VARCHAR(50),
 *     publication_year INTEGER,
 *     available BOOLEAN DEFAULT true
 * );
 *
 * Write SQL commands to perform these CRUD operations:
 */

-- 1. CREATE: Add a new book titled "The Great Gatsby" by "F. Scott Fitzgerald", 
--    genre "Fiction", published in 1925, and available
INSERT INTO books (title, author, genre, publication_year, available)
VALUES ('The Great Gatsby', 'F. Scott Fitzgerald', 'Fiction', 1925, true);

-- 2. READ: Get all books by "F. Scott Fitzgerald" showing title and publication year
SELECT title, publication_year FROM books WHERE author = 'F. Scott Fitzgerald';

-- 3. UPDATE: Mark "The Great Gatsby" as not available (set available to false)
UPDATE books SET available = false WHERE title = 'The Great Gatsby';

-- 4. DELETE: Remove all books published before 1900
DELETE FROM books WHERE publication_year < 1900;
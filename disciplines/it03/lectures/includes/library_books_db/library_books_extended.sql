-- Таблица авторов
CREATE TABLE
  authors (
    id INTEGER PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    birth_year INTEGER
  )
;

-- Таблица книг
CREATE TABLE
  books (
    id INTEGER PRIMARY KEY,
    title TEXT NOT NULL,
    publication_year INTEGER,
    isbn TEXT UNIQUE,
    genre TEXT,
    author_id INTEGER NOT NULL,
    pages INTEGER,
    available_copies INTEGER DEFAULT 1,
    FOREIGN KEY (author_id) REFERENCES authors(id)
  )
;

-- Вставка данных в таблицу авторов
INSERT INTO
  authors (id, first_name, last_name, birth_year)
VALUES
  (1, 'Лев', 'Толстой', 1828),
  (2, 'Федор', 'Достоевский', 1821),
  (3, 'Михаил', 'Булгаков', 1891),
  (4, 'Александр', 'Пушкин', 1799),
  (5, 'Александр', 'Грибоедов', 1795)
;

-- Вставка данных в таблицу книг
INSERT INTO
  books (id, title, publication_year, isbn, genre, author_id, pages, available_copies)
VALUES
  (1, 'Война и мир', 1869, '978-5-17-081547-7', 'Роман', 1, 1225, 3),
  (2, 'Преступление и наказание', 1866, '978-5-17-079456-3', 'Роман', 2, 671, 2),
  (3, 'Мастер и Маргарита', 1967, '978-5-17-082141-6', 'Роман', 3, 480, 1),
  (4, 'Евгений Онегин', 1833, '978-5-17-081548-4', 'Поэма', 4, 224, 4),
  (5, 'Анна Каренина', 1877, '978-5-17-081549-1', 'Роман', 1, 864, 2),
  (6, 'Собачье сердце', 1925, '978-5-17-081550-7', 'Повесть', 3, 120, 3),
  (7, 'Идиот', 1869, '978-5-17-081551-4', 'Роман', 2, 640, 1),
  (8, 'Братья Карамазовы', 1880, '978-5-17-081552-1', 'Роман', 2, 992, 2),
  (9, 'Горе от ума', 1825, '978-5-17-081553-8', 'Комедия', 5, 224, 2)
;

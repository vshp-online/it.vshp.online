SET foreign_key_checks = 0;

CREATE DATABASE IF NOT EXISTS bookstore_db;
USE bookstore_db;

CREATE TABLE books (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    author_id INT NOT NULL,
    supplier_id INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    stock INT NOT NULL,
    FOREIGN KEY (author_id) REFERENCES authors (id),
    FOREIGN KEY (supplier_id) REFERENCES suppliers (id)
);

INSERT INTO books (title, author_id, supplier_id, price, stock) VALUES
('Война и мир', 1, 1, 500.00, 20),
('Преступление и наказание', 2, 2, 300.00, 15),
('Мастер и Маргарита', 3, 1, 400.00, 10);

CREATE TABLE authors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    birth_date DATE NOT NULL
);

INSERT INTO authors (name, birth_date) VALUES
('Лев Толстой', '1828-09-09'),
('Фёдор Достоевский', '1821-11-11'),
('Михаил Булгаков', '1891-05-15');

CREATE TABLE suppliers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL
);

INSERT INTO suppliers (name, contact_person, phone) VALUES
('ООО "Книжный Мир"', 'Иван Иванов', '8005551234'),
('ИП "Книги для всех"', 'Пётр Петров', '8005555678');

CREATE TABLE sales (
    id INT AUTO_INCREMENT PRIMARY KEY,
    book_id INT NOT NULL,
    sale_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    quantity INT NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (book_id) REFERENCES books (id)
);

CREATE TABLE change_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    entity_id INT,
    old_value VARCHAR(255),
    new_value VARCHAR(255),
    change_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

SET foreign_key_checks = 1;

SET foreign_key_checks = 0;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS orders_details;
SET foreign_key_checks = 1;
CREATE TABLE users (
    id INT UNSIGNED NOT NULL PRIMARY KEY AUTO_INCREMENT,
    first_name VARCHAR(50) NULL,
    last_name VARCHAR(50) NULL
);
INSERT INTO users (id, first_name, last_name)
VALUES
    (1, 'Виктор', 'Алтушев'),
    (2, 'Светлана', 'Иванова'),
    (3, 'Елена', 'Абрамова'),
    (4, 'Василиса', 'Кац'),
    (5, 'Антон', 'Сорокин'),
    (6, 'Алёна', 'Алясева'),
    (7, 'Антон', 'Белый'),
    (8, 'Игорь', 'Маф'),
    (9, 'Анастасия', 'Дейчман'),
    (10, 'Александр', 'Дмитриев');
CREATE TABLE products (
    id INT UNSIGNED NOT NULL PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NULL,
    count INTEGER NULL,
    price INTEGER NULL
);
INSERT INTO products (id, name, count, price)
VALUES
    (1, 'Стиральная машина', 5, 12000),
    (2, 'Холодильник', 11, 17800),
    (3, 'Микроволновка', 3, 4100),
    (4, 'Пылесос', 2, 4500),
    (5, 'Вентилятор', 8, 700),
    (6, 'Телевизор', 7, 31740),
    (7, 'Тостер', 2, 2500),
    (8, 'Принтер', 4, 3000),
    (9, 'XBOX', 5, 19900),
    (10, 'Флешка 8Gb', 14, 700);
CREATE TABLE orders (
    id INT UNSIGNED NOT NULL PRIMARY KEY AUTO_INCREMENT,
    user_id INTEGER NULL,
    date DATETIME NULL,
    status VARCHAR(50) NULL
);
INSERT INTO orders (id, user_id, date, status)
VALUES
    (1, 7, '2017-01-04 18:23:09', 'success'),
    (2, 1, '2017-01-04 18:25:27', 'cancelled'),
    (3, 4, '2017-01-12 09:23:14', 'success'),
    (4, 10, '2017-01-14 17:16:39', 'new'),
    (5, 3, '2017-01-23 17:04:04', 'success'),
    (6, 2, '2017-02-01 13:04:47', 'success'),
    (7, 1, '2017-02-01 13:32:17', 'success'),
    (8, 10, '2017-02-12 08:30:23', 'success'),
    (9, 5, '2017-02-12 12:12:43', 'success'),
    (10, 2, '2017-02-14 23:21:25', 'success'),
    (11, 3, '2017-02-16 14:44:05', 'success'),
    (12, 5, '2017-02-28 02:00:47', 'cancelled'),
    (13, 10, '2017-03-02 08:53:25', 'new');
CREATE TABLE orders_details (
    order_id INTEGER NULL,
    product_id INTEGER NULL
);
INSERT INTO orders_details (order_id, product_id)
VALUES
    (1, 1),
    (2, 2),
    (5, 3),
    (13, 10),
    (8, 7),
    (9, 8),
    (2, 4),
    (5, 5),
    (1, 4),
    (2, 6),
    (5, 6),
    (13, 4),
    (9, 1),
    (9, 2),
    (1, 8),
    (2, 10),
    (3, 9),
    (7, 8);
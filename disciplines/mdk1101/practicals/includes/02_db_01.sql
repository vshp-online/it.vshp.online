SET foreign_key_checks = 0;
DROP TABLE IF EXISTS products;
SET foreign_key_checks = 1;
CREATE TABLE products (
    id INT NOT NULL PRIMARY KEY,
    category_id INT NULL,
    name VARCHAR(255) NULL,
    count INTEGER NULL,
    price INTEGER NULL
);
INSERT INTO products (id, category_id, name, count, price)
VALUES
    (1, 7, 'Стиральная машина', 5, 10000),
    (2, 12, 'Холодильник', 0, 10000),
    (3, 12, 'Микроволновка', 3, 4000),
    (4, 8, 'Пылесос', 2, 4500),
    (5, NULL, 'Вентилятор', 0, 700),
    (6, 9, 'Телевизор', 7, 31740),
    (7, 12, 'Тостер', 2, 2500),
    (8, NULL, 'Принтер', 4, 3000),
    (9, NULL, 'Активные колонки', 1, 2900);

SET foreign_key_checks = 0;
DROP TABLE IF EXISTS orders;
CREATE TABLE orders (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id INT NULL,
    products_count INT NULL,
    sum INT NULL,
    status VARCHAR(20) NULL,
    PRIMARY KEY (id)
);
INSERT INTO orders (id, user_id, products_count, sum, status)
VALUES
    (1, 1, 2, 1300, 'new'),
    (2, 18, 1, 10000, 'cancelled'),
    (3, 45, 3, 800, 'cancelled'),
    (4, 11, 1, 2140, 'in_progress'),
    (5, 145, 5, 6800, 'new'),
    (6, 23, 1, 999, 'new'),
    (7, 1, 2, 7690, 'cancelled'),
    (8, 17, 1, 1600, 'new'),
    (9, 5, 4, 400, 'delivery'),
    (10, 2355, 1, 1450, 'new'),
    (11, 13, 7, 13000, 'cancelled'),
    (12, 123, 1, 1000, 'in_progress'),
    (13, 45, 2, 3000, 'returned')
    ;
SET foreign_key_checks = 1;
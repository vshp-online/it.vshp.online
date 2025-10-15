SET foreign_key_checks = 0;
DROP TABLE IF EXISTS roles;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS users_roles;
SET foreign_key_checks = 1;
CREATE TABLE roles (
    id INT UNSIGNED NOT NULL PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NULL
);
INSERT INTO roles (id, name)
VALUES
    (1, 'Менеджер'),
    (2, 'Дизайнер'),
    (3, 'Программист'),
    (4, 'Маркетолог'),
    (5, 'Бухгалтер');
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
CREATE TABLE users_roles (
    user_id INTEGER NULL,
    role_id INTEGER NULL
);
INSERT INTO users_roles (user_id, role_id)
VALUES
    (1, 2),
    (2, 1),
    (3, 2),
    (4, 5),
    (5, 3),
    (6, 4),
    (7, 3),
    (8, 3),
    (1, 1),
    (3, 4),
    (5, 1);
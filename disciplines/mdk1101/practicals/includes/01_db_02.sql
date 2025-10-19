SET foreign_key_checks = 0;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS users_details;
SET foreign_key_checks = 1;
CREATE TABLE users (
    id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(50) NULL
);
INSERT INTO users (id, email)
VALUES
    (1, 'user1@domain.com'),
    (2, 'user2@domain.com'),
    (3, 'user3@domain.com'),
    (4, 'user4@domain.com'),
    (5, 'user5@domain.com'),
    (6, 'user6@domain.com'),
    (7, 'user7@domain.com'),
    (8, 'user8@domain.com'),
    (9, 'user9@domain.com'),
    (10, 'user10@domain.com');
CREATE TABLE users_details (
    id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    first_name VARCHAR(50) NULL,
    last_name VARCHAR(50) NULL,
    age INTEGER NULL
);
INSERT INTO users_details (id, first_name, last_name, age)
VALUES
    (1, 'Виктор', 'Алтушев', 20),
    (2, 'Светлана', 'Иванова', 17),
    (3, 'Елена', 'Абрамова', 18),
    (4, 'Василиса', 'Кац', 15),
    (5, 'Антон', 'Сорокин', 22),
    (6, 'Алёна', 'Алясева', 28),
    (7, 'Дмитрий', 'Калякин', 21),
    (8, 'Карина', 'Белая', 30),
    (9, 'Анастасия', 'Дейчман', 16),
    (10, 'Юлия', 'Фёдорова', 25);

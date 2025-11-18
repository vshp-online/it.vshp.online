SET foreign_key_checks = 0;

CREATE DATABASE IF NOT EXISTS restaurant_db;
USE restaurant_db;

CREATE TABLE tables (
    id INT AUTO_INCREMENT PRIMARY KEY,
    table_number INT NOT NULL UNIQUE,
    capacity INT NOT NULL,
    status ENUM('available', 'occupied') NOT NULL DEFAULT 'available'
);

INSERT INTO tables (table_number, capacity, status) VALUES
(1, 4, 'available'),
(2, 2, 'available'),
(3, 6, 'available');

CREATE TABLE clients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL
);

INSERT INTO clients (full_name, phone) VALUES
('Иван Иванов', '8007001111'),
('Мария Смирнова', '8007002222'),
('Пётр Петров', '8007003333');

CREATE TABLE waiters (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    salary DECIMAL(10,2) NOT NULL DEFAULT 50000.00
);

INSERT INTO waiters (full_name, phone, salary) VALUES
('Анна Кузнецова', '8005551234', 50000.00),
('Сергей Волков', '8005555678', 48000.00);

CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    table_id INT NOT NULL,
    client_id INT NOT NULL,
    waiter_id INT NOT NULL,
    order_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    total_cost DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (table_id) REFERENCES tables (id),
    FOREIGN KEY (client_id) REFERENCES clients (id),
    FOREIGN KEY (waiter_id) REFERENCES waiters (id)
);

CREATE TABLE change_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    entity_id INT,
    old_value VARCHAR(255),
    new_value VARCHAR(255),
    change_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

SET foreign_key_checks = 1;

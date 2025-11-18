SET foreign_key_checks = 0;

CREATE DATABASE IF NOT EXISTS hotel_db;
USE hotel_db;

CREATE TABLE rooms (
    id INT AUTO_INCREMENT PRIMARY KEY,
    room_number INT NOT NULL UNIQUE,
    room_type VARCHAR(50) NOT NULL,
    price_per_day DECIMAL(10,2) NOT NULL,
    status ENUM('available', 'booked') NOT NULL DEFAULT 'available'
);

INSERT INTO rooms (room_number, room_type, price_per_day, status) VALUES
(101, 'standard', 3000.00, 'available'),
(202, 'deluxe', 5000.00, 'available'),
(303, 'suite', 8000.00, 'available');

CREATE TABLE guests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(15) NOT NULL
);

INSERT INTO guests (full_name, phone) VALUES
('Иван Иванов', '8007001111'),
('Мария Смирнова', '8007002222'),
('Пётр Петров', '8007003333');

CREATE TABLE employees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    position VARCHAR(100) NOT NULL
);

INSERT INTO employees (full_name, position) VALUES
('Анна Кузнецова', 'администратор'),
('Сергей Волков', 'менеджер');

CREATE TABLE bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    guest_id INT NOT NULL,
    room_id INT NOT NULL,
    employee_id INT NOT NULL,
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    total_cost DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (guest_id) REFERENCES guests (id),
    FOREIGN KEY (room_id) REFERENCES rooms (id),
    FOREIGN KEY (employee_id) REFERENCES employees (id)
);

CREATE TABLE change_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    entity_id INT,
    old_value VARCHAR(255),
    new_value VARCHAR(255),
    change_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

SET foreign_key_checks = 1;

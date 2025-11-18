SET foreign_key_checks = 0;

CREATE DATABASE IF NOT EXISTS car_dealership_db;
USE car_dealership_db;

CREATE TABLE cars (
    id INT AUTO_INCREMENT PRIMARY KEY,
    vin VARCHAR(17) NOT NULL UNIQUE,
    model VARCHAR(255) NOT NULL,
    mileage INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    status ENUM('available', 'sold') NOT NULL DEFAULT 'available'
);

INSERT INTO cars (vin, model, mileage, price, status) VALUES
('1HGCM82633A123456', 'Toyota Camry', 20000, 2500000, 'available'),
('WBA3A5C58DF123457', 'BMW X5', 10000, 5500000, 'available'),
('KM8J3CA46KU123458', 'Hyundai Solaris', 15000, 1200000, 'available');

CREATE TABLE clients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL
);

INSERT INTO clients (full_name, phone) VALUES
('Алексей Смирнов', '8007001111'),
('Елена Кузнецова', '8007002222'),
('Дмитрий Павлов', '8007003333');

CREATE TABLE managers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    commission_rate DECIMAL(5,2) NOT NULL DEFAULT 0.01
);

INSERT INTO managers (full_name, phone) VALUES
('Иван Иванов', '8005551234'),
('Пётр Петров', '8005555678');

CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    client_id INT NOT NULL,
    car_id INT NOT NULL,
    manager_id INT NOT NULL,
    order_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    total DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (client_id) REFERENCES clients (id),
    FOREIGN KEY (car_id) REFERENCES cars (id),
    FOREIGN KEY (manager_id) REFERENCES managers (id)
);

CREATE TABLE change_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    entity_id INT,
    old_value VARCHAR(255),
    new_value VARCHAR(255),
    change_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

SET foreign_key_checks = 1;

SET foreign_key_checks = 0;

CREATE DATABASE IF NOT EXISTS company_db;
USE company_db;

CREATE TABLE employees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    birth_date DATE NOT NULL,
    position VARCHAR(100) NOT NULL
);

INSERT INTO employees (full_name, birth_date, position) VALUES
('Иван Иванов', '1985-02-14', 'аналитик'),
('Петр Петров', '1990-08-10', 'разработчик'),
('Мария Смирнова', '1987-05-22', 'тестировщик');

CREATE TABLE projects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_name VARCHAR(255) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE DEFAULT NULL
);

INSERT INTO projects (project_name, start_date, end_date) VALUES
('CRM-система', '2023-01-01', '2023-12-31'),
('Веб-приложение', '2023-03-01', NULL);

CREATE TABLE employee_projects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    project_id INT NOT NULL,
    role VARCHAR(100) NOT NULL,
    hours_worked INT DEFAULT 0,
    FOREIGN KEY (employee_id) REFERENCES employees (id),
    FOREIGN KEY (project_id) REFERENCES projects (id)
);

INSERT INTO employee_projects (employee_id, project_id, role, hours_worked) VALUES
(1, 1, 'аналитик', 120),
(2, 1, 'разработчик', 200),
(3, 2, 'тестировщик', 80);

CREATE TABLE project_changes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT NOT NULL,
    operation VARCHAR(255) NOT NULL,
    operation_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects (id)
);

CREATE TABLE change_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    entity_id INT,
    old_value VARCHAR(255),
    new_value VARCHAR(255),
    change_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

SET foreign_key_checks = 1;

SET foreign_key_checks = 0;
DROP TABLE IF EXISTS employees;
CREATE TABLE employees (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    birthday DATE NULL,
    salary INTEGER NOT NULL,
    job_title VARCHAR(255) NULL,
    email VARCHAR(255) NULL,
    bonus VARCHAR(255) NULL,
    gender CHAR(1) NULL,
    PRIMARY KEY (id)
);
INSERT INTO employees (id, first_name, last_name, birthday, salary, job_title, email, bonus, gender)
VALUES
    (1, 'Дмитрий', 'Петров', '2000-03-14', 25000, 'офис-менеджер', 'd.petrov@company.ru', NULL, 'М'),
    (2, 'Ольга', 'Антонова', '1999-12-01', 41000, 'дизайнер', 'designer_olga@nemail.ru', NULL, 'Ж'),
    (3, 'Сергей', 'Васильев', '2002-02-20', 40000, 'программист', NULL, '+500 руб. за каждую выполненную задачу', 'М'),
    (4, 'Константин', 'Сергеев', NULL, 30000, 'водитель', 'k.sergeev@company.net', 'компенсация топлива', 'М'),
    (5, 'Алена', 'Голубева', '1999-08-17', 53000, 'фотограф', 'alena_photo@negmail.com', NULL, 'Ж'),
    (6, 'Василиса', 'Иванова', '2000-10-10', 28000, 'программист', 'v.ivanova@company.ru', NULL, 'Ж'),
    (7, 'Александр', 'Петров', '2002-02-20', 120000, 'ведущий программист', 'a.petrov@company.ru', '+3% к окладу от сданного проекта', 'М'),
    (8, 'Алина', 'Антонова', '2002-01-01', 40000, 'программист', 'a.antonova@company.ru', '+2% к окладу от сданного проекта', 'Ж'),
    (9, 'Федор', 'Яковлев', '2000-11-02', 27000, 'программист-стажер', NULL, NULL, 'М')
    ;
SET foreign_key_checks = 1;

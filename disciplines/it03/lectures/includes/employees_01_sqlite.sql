CREATE TABLE
  employees (
    id INT PRIMARY KEY,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    salary INTEGER NOT NULL,
    job_title VARCHAR(255) NULL,
    email VARCHAR(255) NULL,
    bonus VARCHAR(255) NULL,
    gender CHAR(1) NULL,
    department VARCHAR(255) NULL
  )
;

INSERT INTO
  employees (id, first_name, last_name, salary, job_title, email, bonus, gender, department)
VALUES
  (1, 'Дмитрий', 'Петров', 25000, 'офис-менеджер', 'd.petrov@company.ru', NULL, 'М', 'Администрация'),
  (2, 'Ольга', 'Антонова', 41000, 'дизайнер', 'designer_olga@nemail.ru', NULL, 'Ж', 'Дизайн'),
  (3, 'Сергей', 'Васильев', 40000, 'программист', NULL, '+5000 руб. за проект', 'М', 'IT'),
  (4, 'Константин', 'Сергеев', 30000, 'водитель', 'k.sergeev@company.net', 'компенсация топлива', 'М', 'Логистика'),
  (5, 'Алена', 'Голубева', 53000, 'фотограф', 'alena_photo@negmail.com', NULL, 'Ж', 'Маркетинг'),
  (6, 'Василиса', 'Иванова', 28000, 'программист', 'v.ivanova@company.ru', NULL, 'Ж', 'IT'),
  (7, 'Александр', 'Петров', 120000, 'ведущий программист', 'a.petrov@company.ru', '+3% к окладу', 'М', 'IT'),
  (8, 'алина', 'Антонова', 40000, 'программист', 'a.antonova@company.ru', '+2% к окладу', 'Ж', 'IT'),
  (9, 'Федор', 'Яковлев', 27000, 'программист-стажер', NULL, NULL, 'М', 'IT')
;

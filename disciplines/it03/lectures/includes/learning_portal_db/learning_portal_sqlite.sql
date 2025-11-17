PRAGMA foreign_keys = ON;

DROP TABLE IF EXISTS teachers;
DROP TABLE IF EXISTS courses;
DROP TABLE IF EXISTS students;
DROP TABLE IF EXISTS enrollments;

CREATE TABLE teachers (
  id INTEGER PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT
);

CREATE TABLE courses (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  hours INTEGER NOT NULL,
  teacher_id INTEGER NOT NULL REFERENCES teachers(id)
);

CREATE TABLE students (
  id INTEGER PRIMARY KEY,
  full_name TEXT NOT NULL,
  group_code TEXT
);

CREATE TABLE enrollments (
  id INTEGER PRIMARY KEY,
  student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  enrolled_at TEXT DEFAULT (date('now')),
  UNIQUE(student_id, course_id)
);

INSERT INTO teachers (id, full_name, email) VALUES
  (1, 'Анна Кузнецова', 'anna@skills.example'),
  (2, 'Михаил Орлов', NULL),
  (3, 'Ирина Гаврилова', 'gavr@skills.example');

INSERT INTO courses (id, title, hours, teacher_id) VALUES
  (1, 'SQL для аналитиков', 32, 1),
  (2, 'Python для аналитиков', 48, 2),
  (3, 'Основы BI', 24, 1),
  (4, 'Проектирование БД', 36, 3),
  (5, 'Data Visualization', 20, 2);

INSERT INTO students (id, full_name, group_code) VALUES
  (1, 'Сергей Ломов', 'DA-01'),
  (2, 'Елена Голубева', 'DA-01'),
  (3, 'Владимир Титов', 'DA-02'),
  (4, 'Александра Соколова', 'DA-02'),
  (5, 'Кирилл Демидов', 'DA-03'),
  (6, 'Мария Жукова', NULL);

INSERT INTO enrollments (id, student_id, course_id, enrolled_at) VALUES
  (1, 1, 1, '2024-02-10'),
  (2, 1, 2, '2024-02-15'),
  (3, 2, 1, '2024-02-12'),
  (4, 3, 3, '2024-02-18'),
  (5, 4, 4, '2024-02-20'),
  (6, 5, 2, '2024-02-21');

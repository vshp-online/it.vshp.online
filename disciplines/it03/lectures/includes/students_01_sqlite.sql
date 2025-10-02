CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    age INTEGER CHECK (age >= 0),
    gender TEXT CHECK (gender IN ('male', 'female')) NOT NULL
);

INSERT INTO students (id, name, age, gender) VALUES
  (1, 'Иванов Иван',         19, 'male'),
  (2, 'Петрова Мария',       20, 'female'),
  (3, 'Сидоров Алексей',     18, 'male'),
  (4, 'Смирнова Екатерина',  21, 'female'),
  (5, 'Кузнецов Даниил',     22, 'male'),
  (6, 'Новикова Анна',       19, 'female'),
  (7, 'Фёдоров Михаил',      20, 'male');

CREATE TABLE
  students (
    id INT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    age INT CHECK (age >= 0),
    gender VARCHAR(6) CHECK (gender IN ('male', 'female')) NOT NULL
  )
;

INSERT INTO
  students (id, name, age, gender)
VALUES
  (1, 'Иванов Иван', 19, 'male'),
  (2, 'Петрова Мария', 20, 'female'),
  (3, 'Сидоров Алексей', 18, 'male'),
  (4, 'Смирнова Екатерина', 21, 'female'),
  (5, 'Кузнецов Даниил', 22, 'male'),
  (6, 'Новикова Анна', 19, 'female'),
  (7, 'Фёдоров Михаил', 20, 'male')
;

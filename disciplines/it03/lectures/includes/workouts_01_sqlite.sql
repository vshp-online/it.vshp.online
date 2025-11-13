CREATE TABLE
  workouts (
    id INTEGER PRIMARY KEY,
    athlete TEXT NOT NULL,
    session_type TEXT NOT NULL,
    duration INTEGER NOT NULL,
    calories INTEGER NOT NULL,
    effort TEXT NOT NULL,
    recorded_at TEXT NOT NULL
  )
;

INSERT INTO
  workouts (
    id,
    athlete,
    session_type,
    duration,
    calories,
    effort,
    recorded_at
  )
VALUES
  (1, 'Анна П.', 'Бег по парку', 45, 520, 'medium', '2024-02-12'),
  (2, 'Денис Р.', 'Велотренажер', 30, 360, 'high', '2024-02-12'),
  (3, 'Мария К.', 'Силовая тренировка', 55, 610, 'high', '2024-02-13'),
  (4, 'Илья С.', 'Плавание', 45, 470, 'medium', '2024-02-14'),
  (5, 'Анна П.', 'Йога', 50, 280, 'low', '2024-02-15'),
  (6, 'Денис Р.', 'Бег по парку', 38, 450, 'medium', '2024-02-16'),
  (7, 'Мария К.', 'Велопрогулка', 65, 700, 'high', '2024-02-16'),
  (8, 'Илья С.', 'Бег по парку', 35, 510, 'high', '2024-02-17')
;

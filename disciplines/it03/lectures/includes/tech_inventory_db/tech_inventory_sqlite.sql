CREATE TABLE
  inventory (
    id INT PRIMARY KEY, -- первичный ключ
    sku VARCHAR(32) NOT NULL UNIQUE, -- уникальный артикул
    title VARCHAR(255) NOT NULL, -- наименование
    amount INT NOT NULL DEFAULT 0, -- остаток (шт.)
    price INT NULL, -- цена (руб.)
    is_active BOOLEAN NOT NULL DEFAULT 1 -- 1=активен, 0=скрыт
  )
;

INSERT INTO
  inventory (id, sku, title, amount, price, is_active)
VALUES
  (1, 'A-001', 'Флешка 32GB', 12, 790, 1),
  (2, 'B-100', 'Кабель USB-C', 0, 390, 1),
  (3, 'C-777', 'Клавиатура', 5, 2490, 1),
  (4, 'D-050', 'Мышь беспроводная', 0, 1290, 0),
  (5, 'E-010', 'Коврик для мыши', 20, 350, 1),
  (6, 'E-020', 'USB-хаб 4 порта', 7, 990, 1),
  (7, 'Y-100', 'Карта памяти 64GB', 15, 1250, 1),
  (8, 'X-000', 'Адаптер HDMI', 3, 690, 1)
;

CREATE TABLE
  products (
    id INT PRIMARY KEY,
    title VARCHAR(255),
    amount INT,
    price INT
  )
;

INSERT INTO
  products (id, title, amount, price)
VALUES
  (1, 'Стиральная машина', 5, 10000),
  (2, 'Холодильник', 0, 10000),
  (3, 'Микроволновка', 3, 4000),
  (4, 'Пылесос', 2, 4500),
  (5, 'Вентилятор', 0, 700),
  (6, 'Телевизор', 7, 31740),
  (7, 'Тостер', 2, 2500),
  (8, 'Принтер', 4, 3000)
;

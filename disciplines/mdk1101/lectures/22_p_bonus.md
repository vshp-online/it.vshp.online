# МДК.11.01 - BONUS. Проверка существования записей

## Как проверить, есть ли запись в таблице?

Иногда нужно понять, существует ли связь между данными в таблице. Например, в таблице заказов мы хотим проверить, делал ли покупатель уже заказ на определённый товар. Вот простой подход, который поможет это сделать.

---

## Учебная база данных

Примеры в этой теме используют упрощённую таблицу заказов.

::: tabs

@tab Таблица orders

| order_id | customer_id | product_id | quantity |
|----------|-------------|------------|----------|
| 1        | 1           | 101        | 2        |
| 2        | 2           | 102        | 1        |
| 3        | 1           | 103        | 5        |
| 4        | 1           | 101        | 3        |
| 5        | 3           | 104        | 7        |

@tab Дамп

```sql
-- Создание базы данных
CREATE DATABASE IF NOT EXISTS test_db;
USE test_db;

-- Создание таблицы заказов
CREATE TABLE orders (
    order_id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL
);

-- Наполнение таблицы данными
INSERT INTO orders (customer_id, product_id, quantity) VALUES
(1, 101, 2),
(2, 102, 1),
(1, 103, 5),
(1, 101, 3),
(3, 104, 7);
```

:::

---

## Пример задачи

**Вопросы:**

1. Покупал ли клиент с `customer_id = 1` товар с `product_id = 101`? (Есть несколько записей)
2. Покупал ли клиент с `customer_id = 2` товар с `product_id = 103`? (Нет записей)
3. Покупал ли клиент с `customer_id = 3` товар с `product_id = 104`? (Есть одна запись)

---

## Подход к решению

Мы считаем количество записей, соответствующих условиям. Вот запрос:

```sql
SELECT COUNT(*) AS record_count
FROM orders
WHERE customer_id = 1 AND product_id = 101;
```

**Результаты:**

- `record_count = 0` — клиент ещё не покупал этот товар.
- `record_count = 1` — клиент покупал этот товар один раз.
- `record_count > 1` — клиент покупал этот товар несколько раз.

---

## Пример использования в процедуре

Автоматизируем проверку и добавление заказа:

```sql
DELIMITER //

CREATE PROCEDURE add_order(
    IN p_customer_id INT,
    IN p_product_id INT,
    IN p_quantity INT
)
BEGIN
    DECLARE record_count INT DEFAULT 0;

    -- Считаем количество подходящих записей
    SELECT COUNT(*) INTO record_count
    FROM orders
    WHERE customer_id = p_customer_id AND product_id = p_product_id;

    -- Проверяем результат
    IF record_count > 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Заказ уже существует';
    ELSE
        INSERT INTO orders (customer_id, product_id, quantity)
        VALUES (p_customer_id, p_product_id, p_quantity);
    END IF;
END //

DELIMITER ;
```

---

## Проверка

1. Если записей несколько:

```sql
CALL add_order(1, 101, 2);
-- Выдаст ошибку: "Заказ уже существует"
```

2. Если записи нет:

```sql
CALL add_order(2, 103, 1);
-- Успешно добавит новый заказ.
```

3. Если запись одна:

```sql
CALL add_order(3, 104, 2);
-- Выдаст ошибку: "Заказ уже существует"
```

---

Этот подход помогает просто и надёжно проверить наличие данных и избежать дублирования записей. Вы можете использовать его как основу для множества задач, связанных с проверкой связей в таблицах.

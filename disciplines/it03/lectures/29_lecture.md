# ИТ.03 - 29 - Хранимые процедуры в MySQL

## Введение

В предыдущих лекциях мы изучили основы SQL, работу с транзакциями и расширенные механизмы обеспечения целостности данных. Однако по мере роста сложности приложений часто возникает необходимость инкапсулировать бизнес-логику непосредственно на уровне базы данных. Это позволяет уменьшить дублирование кода, повысить производительность и обеспечить централизованное управление критическими операциями.

Именно для этих целей в MySQL существуют **хранимые процедуры** — именованные наборы SQL-инструкций, которые хранятся на сервере и могут быть вызваны по имени. Хранимые процедуры поддерживают параметры, переменные, условные конструкции, циклы и обработку ошибок, что делает их мощным инструментом для реализации сложной логики обработки данных.

В этой лекции мы познакомимся с синтаксисом создания и вызова хранимых процедур, рассмотрим типы параметров, научимся использовать управляющие конструкции и обрабатывать исключения. Мы также разберём практические примеры, которые покажут, как хранимые процедуры могут упростить разработку и повысить надёжность ваших приложений.

---

## Что такое хранимые процедуры?

**Хранимая процедура** (stored procedure) — это предварительно скомпилированный блок SQL-кода, который хранится в базе данных и выполняется на сервере. Процедура может принимать входные параметры, возвращать выходные значения, а также содержать произвольную последовательность SQL-операторов, включая выборку, вставку, обновление, удаление данных и вызов других процедур.

### Преимущества хранимых процедур

1. **Производительность** — процедура компилируется один раз и сохраняется в скомпилированном виде, что уменьшает время выполнения. Кроме того, сокращается сетевой трафик, потому что вместо отправки множества отдельных запросов клиент отправляет всего один вызов процедуры.
2. **Инкапсуляция бизнес-логики** — логика, связанная с данными, хранится рядом с данными, что упрощает поддержку и уменьшает риск рассогласования между приложением и БД.
3. **Безопасность** — можно предоставлять пользователям права на выполнение процедуры, не давая им прямого доступа к таблицам.
4. **Уменьшение дублирования кода** — одна процедура может использоваться в разных частях приложения или даже разными приложениями.

### Отличие хранимых процедур от функций

В MySQL, помимо процедур, существуют **хранимые функции**. Ключевые различия:

- **Процедура** вызывается оператором `CALL`, может возвращать несколько значений через параметры `OUT` или `INOUT`, а также не обязана возвращать результат в виде значения.
- **Функция** вызывается как часть выражения (например, `SELECT func()`), всегда возвращает одно скалярное значение и не может изменять состояние базы данных (хотя в MySQL это ограничение нестрогое).

В этой лекции мы сосредоточимся именно на хранимых процедурах.

---

## Создание и вызов процедур

### Базовый синтаксис

Для создания хранимой процедуры используется оператор `CREATE PROCEDURE`. Поскольку тело процедуры может содержать несколько SQL-операторов, разделённых точкой с запятой, необходимо временно изменить разделитель (delimiter), чтобы MySQL не интерпретировал точку с запятой внутри процедуры как конец всего оператора `CREATE`.

```sql
DELIMITER $$

CREATE PROCEDURE имя_процедуры([параметры])
BEGIN
    -- Тело процедуры
    SQL-операторы;
END $$

DELIMITER ;
```

**Пример 1: Простая процедура без параметров**

```sql
DELIMITER $$

CREATE PROCEDURE GetAllUsers()
BEGIN
    SELECT * FROM users;
END $$

DELIMITER ;
```

Вызов процедуры:

```sql
CALL GetAllUsers();
```

### Временное изменение разделителя

Конструкция `DELIMITER $$` меняет стандартный разделитель `;` на `$$`. Это позволяет использовать `;` внутри тела процедуры. После создания процедуры разделитель возвращается к `;` с помощью `DELIMITER ;`. В качестве временного разделителя можно использовать любую последовательность символов, но традиционно применяют `$$` или `//`.

---

## Параметры и переменные

### Типы параметров

Хранимые процедуры могут иметь три типа параметров:

1. **IN** — входной параметр. Значение передаётся в процедуру, внутри процедуры может использоваться, но изменения не возвращаются вызывающему коду.
2. **OUT** — выходной параметр. Процедура может записать в него значение, которое будет доступно после вызова.
3. **INOUT** — параметр одновременно и входной, и выходной. Передаётся в процедуру, может быть изменён, и новое значение возвращается.

Синтаксис объявления параметров:

```sql
CREATE PROCEDURE имя_процедуры(
    IN param1 INT,
    OUT param2 VARCHAR(255),
    INOUT param3 DECIMAL(10,2)
)
```

**Пример 2: Процедура с параметром IN**

```sql
DELIMITER $$

CREATE PROCEDURE GetUserByID(IN userID INT)
BEGIN
    SELECT * FROM users WHERE id = userID;
END $$

DELIMITER ;
```

Вызов:

```sql
CALL GetUserByID(5);
```

**Пример 3: Процедура с параметром OUT**

```sql
DELIMITER $$

CREATE PROCEDURE CountUsers(OUT total INT)
BEGIN
    SELECT COUNT(*) INTO total FROM users;
END $$

DELIMITER ;
```

Вызов с передачей пользовательской переменной:

```sql
SET @result = 0;
CALL CountUsers(@result);
SELECT @result AS user_count;
```

**Пример 4: Процедура с параметром INOUT**

```sql
DELIMITER $$

CREATE PROCEDURE ApplyDiscount(INOUT price DECIMAL(10,2), IN discount_percent INT)
BEGIN
    SET price = price * (1 - discount_percent / 100);
END $$

DELIMITER ;
```

Вызов:

```sql
SET @current_price = 1000.00;
CALL ApplyDiscount(@current_price, 15);
SELECT @current_price AS discounted_price; -- 850.00
```

### Локальные переменные

Внутри процедуры можно объявлять локальные переменные с помощью оператора `DECLARE`. Они видны только внутри блока `BEGIN ... END`.

```sql
DELIMITER $$

CREATE PROCEDURE CalculateTax(IN amount DECIMAL(10,2), OUT tax DECIMAL(10,2))
BEGIN
    DECLARE tax_rate DECIMAL(5,2) DEFAULT 0.20;
    SET tax = amount * tax_rate;
END $$

DELIMITER ;
```

---

## Управляющие конструкции

Хранимые процедуры поддерживают стандартные управляющие конструкции, которые позволяют реализовывать сложную логику.

### Условный оператор IF

```sql
IF условие THEN
    операторы;
ELSEIF другое_условие THEN
    операторы;
ELSE
    операторы;
END IF;
```

**Пример: Проверка возраста пользователя**

```sql
DELIMITER $$

CREATE PROCEDURE CheckUserAge(IN userID INT, OUT category VARCHAR(20))
BEGIN
    DECLARE age INT;
    
    SELECT TIMESTAMPDIFF(YEAR, birth_date, CURDATE()) INTO age
    FROM users WHERE id = userID;
    
    IF age < 18 THEN
        SET category = 'Несовершеннолетний';
    ELSEIF age BETWEEN 18 AND 60 THEN
        SET category = 'Взрослый';
    ELSE
        SET category = 'Пенсионер';
    END IF;
END $$

DELIMITER ;
```

### Оператор CASE

```sql
CASE
    WHEN условие1 THEN операторы;
    WHEN условие2 THEN операторы;
    ELSE операторы;
END CASE;
```

**Пример: Определение уровня скидки**

```sql
DELIMITER $$

CREATE PROCEDURE GetDiscountLevel(IN purchase_amount DECIMAL(10,2), OUT discount_level VARCHAR(20))
BEGIN
    CASE
        WHEN purchase_amount >= 10000 THEN SET discount_level = 'Золотой';
        WHEN purchase_amount >= 5000 THEN SET discount_level = 'Серебряный';
        WHEN purchase_amount >= 1000 THEN SET discount_level = 'Бронзовый';
        ELSE SET discount_level = 'Без скидки';
    END CASE;
END $$

DELIMITER ;
```

### Циклы

MySQL поддерживает три вида циклов: `LOOP`, `WHILE` и `REPEAT`.

**LOOP с условием выхода**

```sql
цикл_метка: LOOP
    операторы;
    IF условие_выхода THEN
        LEAVE цикл_метка;
    END IF;
END LOOP цикл_метка;
```

**WHILE**

```sql
WHILE условие DO
    операторы;
END WHILE;
```

**REPEAT**

```sql
REPEAT
    операторы;
UNTIL условие
END REPEAT;
```

**Пример: Генерация тестовых записей**

```sql
DELIMITER $$

CREATE PROCEDURE GenerateTestUsers(IN count INT)
BEGIN
    DECLARE i INT DEFAULT 1;
    
    WHILE i <= count DO
        INSERT INTO users (name, email, created_at)
        VALUES (CONCAT('User', i), CONCAT('user', i, '@example.com'), NOW());
        SET i = i + 1;
    END WHILE;
END $$

DELIMITER ;
```

---

## Обработка ошибок

Для обработки ошибок в хранимых процедурах MySQL предоставляет механизм **обработчиков условий** (handlers). Можно определить, как процедура должна реагировать на определённые SQL-состояния (например, дублирование ключа, деление на ноль).

### Объявление обработчика

```sql
DECLARE действие HANDLER FOR условие оператор;
```

- **действие**: `CONTINUE` (продолжить выполнение после ошибки) или `EXIT` (выйти из текущего блока).
- **условие**: `SQLSTATE 'код'`, `SQLEXCEPTION`, `SQLWARNING` или конкретный код ошибки MySQL.
- **оператор**: обычно `SET переменная = значение` или другой оператор.

**Пример: Обработка дублирования уникального ключа**

```sql
DELIMITER $$

CREATE PROCEDURE AddUserSafe(
    IN userName VARCHAR(255),
    IN userEmail VARCHAR(255),
    OUT result VARCHAR(100)
)
BEGIN
    DECLARE duplicate_key CONDITION FOR SQLSTATE '23000';
    DECLARE EXIT HANDLER FOR duplicate_key
    BEGIN
        SET result = 'Ошибка: пользователь с таким email уже существует';
    END;
    
    INSERT INTO users (name, email) VALUES (userName, userEmail);
    SET result = 'Пользователь успешно добавлен';
END $$

DELIMITER ;
```

Вызов:

```sql
CALL AddUserSafe('Иван Иванов', 'ivan@example.com', @msg);
SELECT @msg;
```

### Использование SIGNAL для генерации пользовательских ошибок

Оператор `SIGNAL` позволяет сгенерировать собственную ошибку с заданным SQLSTATE и сообщением.

```sql
SIGNAL SQLSTATE '45000'
SET MESSAGE_TEXT = 'Пользовательское сообщение об ошибке';
```

**Пример: Проверка входных данных**

```sql
DELIMITER $$

CREATE PROCEDURE TransferFunds(
    IN from_account INT,
    IN to_account INT,
    IN amount DECIMAL(10,2)
)
BEGIN
    DECLARE balance DECIMAL(10,2);
    
    -- Проверка наличия средств
    SELECT balance INTO balance FROM accounts WHERE id = from_account;
    
    IF balance < amount THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Недостаточно средств на счете';
    END IF;
    
    -- Выполнение перевода
    UPDATE accounts SET balance = balance - amount WHERE id = from_account;
    UPDATE accounts SET balance = balance + amount WHERE id = to_account;
END $$

DELIMITER ;
```

---

## Практические примеры

### Пример 1: Комплексная обработка заказа

```sql
DELIMITER $$

CREATE PROCEDURE ProcessOrder(
    IN order_id INT,
    OUT status VARCHAR(50)
)
BEGIN
    DECLARE total_price DECIMAL(10,2);
    DECLARE customer_id INT;
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET status = 'Ошибка при обработке заказа';
    END;
    
    START TRANSACTION;
    
    -- Получаем информацию о заказе
    SELECT customer_id, SUM(price * quantity) INTO customer_id, total_price
    FROM order_items WHERE order_id = order_id;
    
    -- Проверяем наличие товаров на складе
    UPDATE products p
    JOIN order_items oi ON p.id = oi.product_id
    SET p.stock = p.stock - oi.quantity
    WHERE oi.order_id = order_id AND p.stock >= oi.quantity;
    
    -- Если какое-то обновление не прошло (товара недостаточно), откатываем
    IF ROW_COUNT() < (SELECT COUNT(*) FROM order_items WHERE order_id = order_id) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Недостаточно товара на складе';
    END IF;
    
    -- Обновляем статус заказа
    UPDATE orders SET status = 'processed', processed_at = NOW() WHERE id = order_id;
    
    -- Фиксируем транзакцию
    COMMIT;
    
    SET status = 'Заказ успешно обработан';
END $$

DELIMITER ;
```

### Пример 2: Ежедневный отчёт

```sql
DELIMITER $$

CREATE PROCEDURE GenerateDailyReport(IN report_date DATE)
BEGIN
    DECLARE total_orders INT;
    DECLARE total_revenue DECIMAL(10,2);
    DECLARE avg_order_value DECIMAL(10,2);
    
    -- Считаем статистику
    SELECT COUNT(*), SUM(total_amount), AVG(total_amount)
    INTO total_orders, total_revenue, avg_order_value
    FROM orders
    WHERE DATE(created_at) = report_date;
    
    -- Вставляем отчёт в таблицу отчётов
    INSERT INTO daily_reports (report_date, orders_count, revenue, avg_order_value)
    VALUES (report_date, total_orders, total_revenue, avg_order_value);
    
    -- Возвращаем результаты
    SELECT 
        report_date AS 'Дата',
        total_orders AS 'Количество заказов',
        total_revenue AS 'Выручка',
        avg_order_value AS 'Средний чек';
END $$

DELIMITER ;
```

### Пример 3: Рекурсивная обработка иерархических данных

```sql
DELIMITER $$

CREATE PROCEDURE GetSubtree(IN root_id INT)
BEGIN
    -- Создаём временную таблицу для хранения результатов
    CREATE TEMPORARY TABLE IF NOT EXISTS temp_tree (
        id INT,
        name VARCHAR(255),
        level INT
    );
    
    DELETE FROM temp_tree;
    
    -- Рекурсивное заполнение через цикл (в MySQL 8+ можно использовать CTE)
    INSERT INTO temp_tree
    SELECT id, name, 0 FROM categories WHERE id = root_id;
    
    SET @level = 0;
    
    REPEAT
        INSERT INTO temp_tree
        SELECT c.id, c.name, @level + 1
        FROM categories c
        JOIN temp_tree t ON c.parent_id = t.id
        WHERE t.level = @level
        AND c.id NOT IN (SELECT id FROM temp_tree);
        
        SET @level = @level + 1;
    UNTIL ROW_COUNT() = 0 END REPEAT;
    
    -- Возвращаем результат
    SELECT * FROM temp_tree ORDER BY level, id;
    
    DROP TEMPORARY TABLE temp_tree;
END $$

DELIMITER ;
```

---

## Управление хранимыми процедурами

### Просмотр существующих процедур

```sql
-- Список всех процедур в текущей базе данных
SHOW PROCEDURE STATUS WHERE Db = DATABASE();

-- Просмотр кода конкретной процедуры
SHOW CREATE PROCEDURE имя_процедуры;
```

### Изменение процедуры

Для изменения процедуры используется оператор `ALTER PROCEDURE`, но он позволяет менять только характеристики (например, комментарий), а не тело процедуры. Чтобы изменить логику, нужно удалить процедуру и создать заново.

```sql
ALTER PROCEDURE имя_процедуры COMMENT 'Новый комментарий';
```

### Удаление процедуры

```sql
DROP PROCEDURE IF EXISTS имя_процедуры;
```

---

## Заключение

Хранимые процедуры — мощный инструмент MySQL, который позволяет переносить сложную бизнес-логику на уровень базы данных. Они обеспечивают:

1. **Повышение производительности** за счёт компиляции и сокращения сетевого трафика.
2. **Централизацию логики**, что упрощает поддержку и обеспечение согласованности данных.
3. **Улучшенную безопасность** через контроль доступа на уровне процедур.
4. **Возможность реализации сложных алгоритмов** с использованием переменных, условий, циклов и обработки ошибок.

Однако у хранимых процедур есть и недостатки: они привязывают логику к конкретной СУБД, усложняют миграцию между разными системами и могут затруднить отладку. Поэтому важно использовать их там, где преимущества перевешивают недостатки — для критичных к производительности операций, сложных расчётов и обеспечения целостности данных.

На практике рекомендуется:
- Документировать хранимые процедуры с помощью комментариев.
- Тестировать их так же тщательно, как и код приложения.
- Избегать излишне сложной логики, которую проще реализовать на уровне приложения.
- Использовать версионирование для отслеживания изменений.

В следующих лекциях мы рассмотрим другие программные объекты MySQL: хранимые функции, триггеры и события.

::: quiz source=./includes/quiz-29.yaml
:::
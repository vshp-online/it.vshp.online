# ИТ.03 - 23 - Практикум: запросы (DDL/DML), JOIN, VIEW и ограничения.

## Введение

На предыдущих занятиях мы изучили основы DDL (Data Definition Language) и DML (Data Manipulation Language) в MySQL, различные типы JOIN-запросов, а также создание и использование представлений (VIEW). Этот практикум закрепит полученные знания через выполнение серии заданий на реальной учебной базе данных.

**Цель практикума:** научиться комбинировать DDL, DML, JOIN и VIEW для решения типовых задач администрирования и анализа данных.

## Учебная база данных

Для выполнения заданий используется база данных `bank_sim`, состоящая из трёх таблиц:

- **users** – информация о клиентах банка.
- **accounts** – счета клиентов.
- **transactions** – транзакции по счетам.

Структура и данные базы идентичны тем, что использовались в лекции 22. Если у вас ещё нет этой базы, выполните следующий SQL-скрипт:

```sql :collapsed-lines=10
-- Создание базы и таблиц
CREATE DATABASE IF NOT EXISTS bank_sim;
USE bank_sim;

DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS accounts;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE accounts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  account_number VARCHAR(20) UNIQUE NOT NULL,
  balance DECIMAL(15,2) DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  account_id INT NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  transaction_type ENUM('deposit', 'withdrawal', 'transfer') NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Заполнение тестовыми данными
INSERT INTO users (name, email) VALUES
  ('Иван Петров', 'ivan@example.com'),
  ('Мария Сидорова', 'maria@example.com'),
  ('Алексей Кузнецов', 'alex@example.com'),
  ('Елена Орлова', 'elena@example.com');

INSERT INTO accounts (user_id, account_number, balance) VALUES
  (1, 'ACC001', 15000.00),
  (2, 'ACC002', 8000.00),
  (3, 'ACC003', 12000.00),
  (4, 'ACC004', 3000.00);

INSERT INTO transactions (account_id, amount, transaction_type, description) VALUES
  (1, 5000.00, 'deposit', 'Пополнение счёта'),
  (1, 2000.00, 'withdrawal', 'Снятие наличных'),
  (2, 3000.00, 'deposit', 'Зарплата'),
  (3, 1500.00, 'withdrawal', 'Оплата услуг'),
  (4, 500.00, 'deposit', 'Перевод от друга');
```

После выполнения скрипта у вас будет готовая база с тестовыми данными.

## Задания

Ниже приведены 7 практических заданий. Каждое задание состоит из условия и шаблона для решения. Рекомендуется выполнять задания последовательно, проверяя результат после каждого шага.

### Задание 1. DDL: добавление нового столбца и ограничения

**Условие:**  
В таблицу `users` необходимо добавить столбец `phone` типа `VARCHAR(20)`, который может содержать `NULL`. Также добавьте проверочное ограничение (`CHECK`), чтобы длина номера телефона была не менее 10 символов (если значение не `NULL`).

**Решение:**  
```sql
ALTER TABLE users
ADD COLUMN phone VARCHAR(20) NULL,
ADD CONSTRAINT chk_phone_length CHECK (phone IS NULL OR CHAR_LENGTH(phone) >= 10);
```

### Задание 2. DML: массовое обновление данных

**Условие:**  
Увеличьте баланс всех счетов, у которых текущий баланс меньше 10 000, на 5%. Одновременно для этих же счетов добавьте в таблицу `transactions` запись о бонусном начислении с типом `deposit` и описанием `'Бонус за низкий баланс'`.

**Решение:**  
```sql
-- Шаг 1: обновление балансов
UPDATE accounts
SET balance = balance * 1.05
WHERE balance < 10000;

-- Шаг 2: добавление записей о бонусных транзакциях
INSERT INTO transactions (account_id, amount, transaction_type, description)
SELECT id, balance * 0.05, 'deposit', 'Бонус за низкий баланс'
FROM accounts
WHERE balance < 10000;
```

### Задание 3. JOIN: анализ активности клиентов

**Условие:**  
Выведите список всех пользователей вместе с общим количеством их счетов и общей суммой всех транзакций (по абсолютному значению `amount`). Если у пользователя нет счетов или транзакций, выводите `0`. Используйте `LEFT JOIN` и агрегатные функции.

**Решение:**  
```sql
SELECT
  u.id,
  u.name,
  COUNT(DISTINCT a.id) AS accounts_count,
  COALESCE(SUM(ABS(t.amount)), 0) AS total_transaction_amount
FROM users u
LEFT JOIN accounts a ON u.id = a.user_id
LEFT JOIN transactions t ON a.id = t.account_id
GROUP BY u.id, u.name;
```

### Задание 4. Создание представления (VIEW) для отчёта

**Условие:**  
Создайте представление `client_summary`, которое для каждого пользователя будет содержать:
- имя пользователя,
- количество его счетов,
- общий баланс по всем счетам,
- дату последней транзакции (если есть).

**Решение:**  
```sql
CREATE VIEW client_summary AS
SELECT
  u.id,
  u.name,
  COUNT(a.id) AS accounts_count,
  COALESCE(SUM(a.balance), 0) AS total_balance,
  MAX(t.created_at) AS last_transaction_date
FROM users u
LEFT JOIN accounts a ON u.id = a.user_id
LEFT JOIN transactions t ON a.id = t.account_id
GROUP BY u.id, u.name;
```

### Задание 5. Обновление данных через VIEW

**Условие:**  
Используя представление `client_summary`, выберите пользователей, у которых общий баланс превышает 15 000, и для этих пользователей в таблице `users` обновите поле `phone` на значение `'+79990000001'` (симулируем присвоение VIP-номера). Учтите, что прямое обновление через представление может быть невозможно из-за агрегации, поэтому выполните обновление через базовую таблицу.

**Решение:**  
```sql
UPDATE users
SET phone = '+79990000001'
WHERE id IN (
  SELECT id FROM client_summary WHERE total_balance > 15000
);
```

### Задание 6. Комбинированный сценарий: DDL + DML + JOIN

**Условие:**  
1. Добавьте в таблицу `accounts` новый столбец `status` типа `ENUM('active', 'blocked', 'closed')` со значением по умолчанию `'active'`.
2. Заблокируйте (`status = 'blocked'`) все счета, по которым не было ни одной транзакции за последние 30 дней (от текущей даты).
3. Выведите список заблокированных счетов вместе с именами владельцев.

**Решение:**  
```sql
-- Шаг 1: добавление столбца
ALTER TABLE accounts
ADD COLUMN status ENUM('active', 'blocked', 'closed') DEFAULT 'active';

-- Шаг 2: блокировка неактивных счетов
UPDATE accounts a
SET status = 'blocked'
WHERE NOT EXISTS (
  SELECT 1 FROM transactions t
  WHERE t.account_id = a.id
    AND t.created_at >= CURDATE() - INTERVAL 30 DAY
);

-- Шаг 3: вывод результата
SELECT a.account_number, u.name, a.balance, a.status
FROM accounts a
JOIN users u ON a.user_id = u.id
WHERE a.status = 'blocked';
```

### Задание 7. Оптимизация запросов с использованием VIEW и индексов

**Условие:**  
1. Создайте представление `high_value_transactions`, которое показывает транзакции с суммой больше 5 000, включая имя владельца счета и тип транзакции.
2. Добавьте индекс на столбец `amount` в таблице `transactions` для ускорения выборки по сумме.
3. Проверьте, как работает запрос к представлению, с помощью `EXPLAIN`.

**Решение:**  
```sql
-- Шаг 1: создание представления
CREATE VIEW high_value_transactions AS
SELECT
  t.id,
  t.amount,
  t.transaction_type,
  t.created_at,
  u.name AS account_owner
FROM transactions t
JOIN accounts a ON t.account_id = a.id
JOIN users u ON a.user_id = u.id
WHERE t.amount > 5000;

-- Шаг 2: добавление индекса
CREATE INDEX idx_transactions_amount ON transactions(amount);

-- Шаг 3: анализ плана выполнения
EXPLAIN SELECT * FROM high_value_transactions;
```

## Заключение

Выполнив эти задания, вы закрепили навыки работы с DDL (добавление столбцов, ограничений, индексов), DML (вставка, обновление, удаление данных), JOIN (соединение таблиц) и VIEW (создание и использование представлений). Эти умения являются фундаментальными для любого разработчика или администратора баз данных.

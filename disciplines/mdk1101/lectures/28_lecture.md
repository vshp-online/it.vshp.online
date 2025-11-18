# МДК.11.01 - 28 - Мониторинг и аудит

## Введение

Мониторинг и аудит баз данных — это важные процессы, которые позволяют администраторам отслеживать производительность системы, выявлять проблемы и обеспечивать безопасность данных. Мониторинг помогает контролировать состояние сервера в реальном времени, а аудит фиксирует действия пользователей и изменения в базе данных для анализа и расследования инцидентов. В этой лекции мы рассмотрим ключевые инструменты мониторинга и аудита в MySQL 8, включая `Performance Schema`, `INFORMATION_SCHEMA` и команды `SHOW`, с акцентом на их практическое применение.

---

## Основные аспекты мониторинга и аудита

### 1. **Что такое мониторинг?**

Мониторинг — это процесс непрерывного наблюдения за состоянием базы данных, включая использование ресурсов (CPU, память, диск), выполнение запросов и общее состояние сервера. Основная цель мониторинга — выявление узких мест и предотвращение сбоев.

::: info

Регулярный мониторинг позволяет администраторам предсказывать потенциальные проблемы и принимать меры до того, как они повлияют на пользователей.

:::

### 2. **Что такое аудит?**

Аудит — это процесс записи и анализа действий, выполненных в базе данных. Он включает отслеживание операций пользователей и изменений данных для обеспечения безопасности и соответствия требованиям (например, GDPR или локальных нормативов).

::: tip

Аудит особенно важен для выявления несанкционированного доступа или ошибок, допущенных пользователями.

:::

### 3. **Инструменты мониторинга и аудита в MySQL 8**

- **`Performance Schema`:** Инструмент для мониторинга производительности, предоставляющий детализированные данные о запросах, ожиданиях и использовании ресурсов.
- **`INFORMATION_SCHEMA`:** Схема, содержащая метаданные о базе данных, такие как таблицы, столбцы, статистика и состояние процессов.
- **`SHOW` команды:** Быстрый способ получения текущего состояния сервера (например, `SHOW PROCESSLIST`, `SHOW VARIABLES`).

---

## Мониторинг базы данных

### 1. **Создание тестовой базы данных `monitoring_demo`**

Перед началом работы с инструментами мониторинга и аудита создадим учебную базу данных `monitoring_demo` с тремя связанными таблицами: `users` (пользователи), `sessions` (сессии пользователей) и `logs` (логи действий).

```sql
CREATE DATABASE monitoring_demo;
USE monitoring_demo;

-- Таблица пользователей
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Таблица сессий
CREATE TABLE sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    login_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    logout_time DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Таблица логов
CREATE TABLE logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    session_id INT NOT NULL,
    action VARCHAR(100) NOT NULL,
    action_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
);

-- Наполнение данными
INSERT INTO users (username) VALUES
('admin'),
('user1'),
('user2'),
('guest');

INSERT INTO sessions (user_id, login_time, logout_time) VALUES
(1, '2025-03-10 10:00:00', '2025-03-10 10:30:00'),
(2, '2025-03-10 11:00:00', NULL),
(3, '2025-03-10 12:00:00', '2025-03-10 12:15:00'),
(1, '2025-03-11 09:00:00', NULL),
(4, '2025-03-11 10:00:00', '2025-03-11 10:10:00');

INSERT INTO logs (session_id, action) VALUES
(1, 'Viewed dashboard'),
(1, 'Updated profile'),
(2, 'Logged in'),
(2, 'Generated report'),
(3, 'Viewed logs'),
(4, 'Logged in'),
(5, 'Accessed guest page');
```

Эти таблицы связаны:

- `users` → `sessions` через `user_id`.
- `sessions` → `logs` через `session_id`.
- Использованы внешние ключи с каскадным удалением (`ON DELETE CASCADE`).

::: note

Все последующие примеры в лекции будут использовать эту базу данных.

:::

---

### 2. **Использование `Performance Schema`**

`Performance Schema` — это встроенная база данных в MySQL 8, предназначенная для мониторинга производительности сервера в реальном времени. Она собирает статистику о запросах, ожиданиях, блокировках и использовании ресурсов, храня данные в памяти (без записи на диск в традиционном виде). Это позволяет анализировать работу сервера с минимальной нагрузкой.

#### Включение и настройка

По умолчанию `Performance Schema` включена в MySQL 8. Проверьте это:

```sql
SHOW VARIABLES LIKE 'performance_schema';
```

Если значение `OFF`, включите её в файле конфигурации (`my.cnf` или `my.ini`):

```ini
[mysqld]
performance_schema = 1
```

Перезапустите сервер:

- **Linux:**

  ```bash
  sudo systemctl restart mysql
  ```

- **Windows:**

  ```cmd
  net stop mysql && net start mysql
  ```

#### Основные таблицы `Performance Schema`

`Performance Schema` содержит множество таблиц, разделённых на категории. Вот ключевые из них и их назначение:

- **`events_statements_summary_by_digest`**: Агрегированная статистика по SQL-запросам, сгруппированная по уникальному хэшу (дайджесту).
  - Основные столбцы: `DIGEST_TEXT` (текст запроса), `COUNT_STAR` (количество выполнений), `SUM_TIMER_WAIT` (общее время ожидания в пикосекундах).
  - Назначение: Анализ производительности запросов за всё время.
- **`events_statements_current`**: Информация о текущих выполняемых запросах.
  - Основные столбцы: `SQL_TEXT`, `TIMER_START`, `TIMER_END`.
  - Назначение: Мониторинг активных операций.
- **`events_waits_summary_global_by_event_name`**: Суммарная статистика ожиданий по типам событий (например, ожидание ввода-вывода или блокировок).
  - Основные столбцы: `EVENT_NAME`, `COUNT_STAR`, `SUM_TIMER_WAIT`.
  - Назначение: Выявление узких мест.
- **`table_io_waits_summary_by_table`**: Статистика операций ввода-вывода по таблицам.
  - Основные столбцы: `OBJECT_SCHEMA`, `OBJECT_NAME`, `COUNT_READ`, `COUNT_WRITE`.
  - Назначение: Определение "горячих" таблиц с высокой нагрузкой.

::: info

Полный список таблиц: `SHOW TABLES FROM performance_schema;`

:::

#### Пример: Анализ времени выполнения запросов

```sql
SELECT
    DIGEST_TEXT AS query_text,
    COUNT_STAR AS total_executions,
    SUM_TIMER_WAIT / 1000000000 AS total_wait_ms
FROM performance_schema.events_statements_summary_by_digest
WHERE DIGEST_TEXT LIKE '%sessions%'
ORDER BY total_wait_ms DESC
LIMIT 5;
```

Этот запрос показывает 5 самых "дорогих" запросов, связанных с таблицей `sessions`, по времени выполнения. Выводит текст запроса, количество выполнений и общее время в миллисекундах.

#### Пример: Анализ ожиданий

```sql
SELECT
    EVENT_NAME,
    COUNT_STAR AS total_occurrences,
    SUM_TIMER_WAIT / 1000000000 AS total_wait_ms
FROM performance_schema.events_waits_summary_global_by_event_name
WHERE SUM_TIMER_WAIT > 0
ORDER BY total_wait_ms DESC
LIMIT 5;
```

Выводит 5 событий ожидания, которые больше всего замедляют сервер (например, простой `idle` или ввод-вывод `wait/io/...`). Показывает их тип, частоту и общее время задержки в миллисекундах.

::: tip

Для включения дополнительных данных (например, истории запросов):

```sql
UPDATE performance_schema.setup_consumers SET ENABLED = 'YES' WHERE NAME = 'events_statements_history';
```

:::

---

### 3. **Мониторинг с помощью `INFORMATION_SCHEMA`**

`INFORMATION_SCHEMA` — это системная база данных в MySQL, которая предоставляет метаданные о структуре и состоянии базы данных. Она полезна для мониторинга текущих процессов, статистики таблиц и индексов.

#### Основные таблицы для мониторинга

- **`PROCESSLIST`**: Информация о текущих подключениях и выполняемых запросах (аналог `SHOW PROCESSLIST`).
  - Основные столбцы: `ID`, `USER`, `HOST`, `COMMAND`, `TIME`, `INFO`.
  - Назначение: Анализ активных процессов.
- **`TABLES`**: Метаданные о таблицах в базах данных.
  - Основные столбцы: `TABLE_SCHEMA`, `TABLE_NAME`, `TABLE_ROWS`, `DATA_LENGTH`.
  - Назначение: Оценка размеров таблиц и их роста.
- **`STATISTICS`**: Информация об индексах.
  - Основные столбцы: `TABLE_NAME`, `INDEX_NAME`, `COLUMN_NAME`, `CARDINALITY`.
  - Назначение: Проверка использования индексов.

#### Пример: Анализ текущих процессов

```sql
SELECT
    ID AS process_id,
    USER AS user,
    TIME AS execution_time,
    INFO AS query
FROM information_schema.PROCESSLIST
WHERE TIME > 5 AND COMMAND != 'Sleep'
ORDER BY TIME DESC;
```

Этот запрос показывает активные запросы, выполняющиеся дольше 5 секунд (кроме спящих подключений), с их ID, пользователем, временем и текстом.

#### Пример: Проверка размеров таблиц

```sql
SELECT
    TABLE_SCHEMA AS db_name,
    TABLE_NAME AS table_name,
    TABLE_ROWS AS row_count,
    ROUND(DATA_LENGTH / 1024 / 1024, 2) AS size_mb
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = 'monitoring_demo';
```

Этот запрос выводит информацию о таблицах в базе `monitoring_demo`, включая их размер в мегабайтах.

::: tip

Используйте `INFORMATION_SCHEMA.STATISTICS` для проверки эффективности индексов:

```sql
SELECT TABLE_NAME, INDEX_NAME, COLUMN_NAME, CARDINALITY
FROM information_schema.STATISTICS
WHERE TABLE_SCHEMA = 'monitoring_demo';
```

:::

---

### 4. **Мониторинг с помощью `SHOW` команд**

Команды `SHOW` предоставляют быстрый доступ к текущему состоянию сервера и его конфигурации.

#### Основные команды для мониторинга

- **`SHOW PROCESSLIST`**: Показывает текущие подключения и запросы.
  - Вывод: `Id`, `User`, `Time`, `Command`, `Info`.
  - Назначение: Быстрый анализ активных процессов.
- **`SHOW VARIABLES`**: Отображает текущие значения системных переменных.
  - Пример: `SHOW VARIABLES LIKE '%buffer%';` — проверка параметров буфера.
- **`SHOW STATUS`**: Показывает статистику работы сервера.
  - Пример: `SHOW STATUS LIKE 'Innodb%';` — статистика движка InnoDB.
- **`SHOW ENGINE INNODB STATUS`**: Подробная информация о состоянии движка InnoDB.
  - Назначение: Диагностика блокировок и производительности.

#### Пример: Проверка активных процессов

```sql
SHOW FULL PROCESSLIST;
```

Используйте `FULL`, чтобы увидеть полный текст запросов в столбце `Info`.

#### Пример: Анализ системных переменных

```sql
SHOW VARIABLES LIKE 'innodb_buffer_pool_size';
```

Этот запрос показывает размер буферного пула InnoDB, который влияет на производительность.

::: warning

Использование `SHOW ENGINE INNODB STATUS` может быть ресурсоёмким на загруженных серверах. Применяйте его с осторожностью.

:::

---

## Аудит базы данных

### 1. **Аудит с помощью `INFORMATION_SCHEMA`**

`INFORMATION_SCHEMA` можно использовать не только для мониторинга, но и для анализа изменений в структуре базы данных, что полезно для аудита.

#### Пример: Проверка изменений в таблицах

```sql
SELECT
    TABLE_NAME,
    CREATE_TIME,
    UPDATE_TIME
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = 'monitoring_demo'
ORDER BY UPDATE_TIME DESC;
```

Этот запрос показывает, когда таблицы в базе `monitoring_demo` были созданы или обновлены, что может указывать на изменения данных или структуры.

::: note

Столбец `UPDATE_TIME` обновляется только для таблиц с движком InnoDB, если включена опция `innodb_stats_on_metadata`.

:::

---

### 2. **Аудит с помощью `SHOW` команд**

Команды `SHOW` полезны для проверки конфигурации и состояния, которые могут быть частью аудита безопасности и производительности.

#### Пример: Проверка привилегий пользователей

```sql
SHOW GRANTS FOR CURRENT_USER;
```

Этот запрос показывает привилегии текущего пользователя. Для конкретного пользователя:

```sql
SHOW GRANTS FOR 'test_user'@'localhost';
```

#### Пример: Проверка глобальной статистики

```sql
SHOW GLOBAL STATUS LIKE 'Connections';
```

Этот запрос показывает общее количество подключений к серверу с момента его запуска.

::: tip

Для аудита изменений конфигурации используйте:

```sql
SHOW VARIABLES LIKE '%log%';
```

:::

---

## Практическая часть: Тестирование мониторинга и аудита

### 1. **Мониторинг активных процессов с `SHOW PROCESSLIST`**

**Описание:** Использование `SHOW PROCESSLIST` для анализа текущих операций.

**Шаги тестирования:**

1. Откройте два терминала (или два окна MySQL CLI).

2. В первом терминале выполните долгий запрос:

   ```sql
   SELECT SLEEP(10), u.username, s.login_time
   FROM users u
   JOIN sessions s ON u.id = s.user_id;
   ```

3. Во втором терминале проверьте активные процессы:

   ```sql
   SHOW FULL PROCESSLIST;
   ```

   Найдите процесс с запросом `SLEEP(10)` и запомните его `Id`.

4. Завершите процесс (если требуется):

   ```sql
   KILL <Id>;
   ```

::: warning

Используйте `KILL` осторожно, так как это может прервать важные операции.

:::

---

### 2. **Мониторинг с `INFORMATION_SCHEMA.PROCESSLIST`**

**Описание:** Анализ текущих процессов через `INFORMATION_SCHEMA`.

**Шаги тестирования:**

1. Выполните несколько запросов в разных терминалах:

   ```sql
   SELECT SLEEP(5), u.username
   FROM users u
   JOIN sessions s ON u.id = s.user_id
   WHERE s.logout_time IS NULL;
   ```

   ```sql
   SELECT l.action, s.login_time
   FROM logs l
   JOIN sessions s ON l.session_id = s.id
   WHERE l.action LIKE '%report%';
   ```

2. Проверьте активные процессы:

   ```sql
   SELECT
       ID AS process_id,
       USER AS user,
       TIME AS execution_time,
       INFO AS query
   FROM information_schema.PROCESSLIST
   WHERE COMMAND != 'Sleep'
   ORDER BY TIME DESC;
   ```

   Это покажет все активные запросы с их временем выполнения.

---

### 3. **Анализ производительности через `Performance Schema`**

**Описание:** Использование `Performance Schema` для анализа запросов.

**Шаги тестирования:**

1. Убедитесь, что `Performance Schema` включён:

   ```sql
   SHOW VARIABLES LIKE 'performance_schema';
   ```

2. Выполните несколько запросов:

   ```sql
   SELECT u.username, COUNT(l.id) AS action_count
   FROM users u
   JOIN sessions s ON u.id = s.user_id
   JOIN logs l ON s.id = l.session_id
   WHERE u.username LIKE '%user%'
   GROUP BY u.id, u.username;
   ```

   ```sql
   SELECT s.login_time, l.action
   FROM sessions s
   JOIN logs l ON s.id = l.session_id
   WHERE s.logout_time IS NULL;
   ```

3. Проанализируйте статистику:

   ```sql
   SELECT
       DIGEST_TEXT AS query_text,
       COUNT_STAR AS total_executions,
       SUM_TIMER_WAIT / 1000000000 AS total_time_ms
   FROM performance_schema.events_statements_summary_by_digest
   WHERE DIGEST_TEXT LIKE '%sessions%'
   ORDER BY total_wait_ms DESC;
   ```

   Это покажет запросы, связанные с таблицей `sessions`, их частоту и время выполнения.

---

## Заключение

В этой лекции мы рассмотрели ключевые инструменты мониторинга и аудита в MySQL 8. Мы подробно изучили `Performance Schema` для анализа производительности, `INFORMATION_SCHEMA` для мониторинга процессов и структуры, а также команды `SHOW` для быстрого доступа к состоянию сервера. Эти навыки помогут вам поддерживать базу данных в стабильном состоянии и эффективно проводить аудит.

Следующая лекция будет посвящена оптимизации запросов и структуры базы данных.

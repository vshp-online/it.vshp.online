# ИТ.03 - 09 - Основные типы данных SQLite. Работа с датой и временем. Создание и удаление таблиц

## Введение

В предыдущих темах мы научились извлекать, фильтровать и модифицировать данные в уже существующих таблицах. Но прежде чем работать с данными, необходимо создать структуру для их хранения — таблицы.

В этой теме мы рассмотрим:

- Основные типы данных в SQLite и их сравнение с MySQL
- Работу с датой и временем в SQLite
- Как создавать таблицы с помощью оператора `CREATE TABLE`
- Как удалять таблицы с помощью оператора `DROP TABLE`

Эти операции относятся к DDL (Data Definition Language) — языку определения данных, который позволяет создавать и изменять структуру базы данных.

При создании таблиц мы будем использовать типы данных, которые совместимы как с SQLite, так и с MySQL, чтобы облегчить переход к изучению MySQL в дальнейшем.

## Типы данных в SQLite

В отличие от большинства других СУБД, SQLite использует динамическую типизацию. Это означает, что тип значения определяется не по типу столбца таблицы, а по значению самого значения.

Тем не менее, при определении структуры таблицы мы можем указывать типы данных для столбцов, что помогает лучше понимать структуру данных и улучшает читаемость кода. При этом мы будем использовать типы, которые совместимы с MySQL, чтобы облегчить дальнейшее изучение.

### Основные типы данных SQLite

SQLite поддерживает следующие категории типов данных:

#### 1. **NULL**

Значение NULL представляет собой "пустое" значение, отсутствие данных.

#### 2. **INTEGER**

Целочисленные значения. В зависимости от величины числа SQLite использует разное количество байт для хранения:

- 1, 2, 3, 4, 6 или 8 байт

В MySQL аналогичными типами являются `TINYINT`, `SMALLINT`, `MEDIUMINT`, `INT`, `BIGINT`. В SQLite мы используем просто `INTEGER` для всех целочисленных значений.

#### 3. **REAL**

Числа с плавающей точкой (вещественные числа), хранятся в 8-байтовом формате IEEE.

В MySQL это соответствует типу `DOUBLE`. Для меньшей точности можно использовать `FLOAT`, но в SQLite это будет также храниться как `REAL`.

#### 4. **TEXT**

Текстовые строки, хранятся в кодировке UTF-8, UTF-16BE или UTF-16LE.

В MySQL это соответствует типам `CHAR`, `VARCHAR`, `TEXT` и их вариантам. В SQLite мы используем просто `TEXT` для всех текстовых данных.

#### 5. **BLOB**

Двоичные данные (Binary Large Object), хранятся "как есть", без преобразований.

В MySQL это соответствует типам `BLOB`, `TINYBLOB`, `MEDIUMBLOB`, `LONGBLOB`.

::: tip Зачем нужны типы данных?

Правильный выбор типов данных влияет на:

- **Размер базы данных** — числа занимают меньше места, чем их текстовое представление
- **Скорость поиска и фильтрации** — поиск по числовым полям быстрее, чем по текстовым
- **Доступные функции** — для чисел доступны математические операции, для дат — функции работы с календарем
- **Целостность данных** — типы данных помогают предотвратить ошибки ввода

:::

### Как SQLite определяет типы данных (Type Affinity)

При создании таблиц в SQLite вы можете указывать различные типы данных для столбцов, но SQLite интерпретирует их по-своему. Эта особенность называется "типизирующее сходство" или "type affinity".

Когда вы указываете тип данных для столбца, SQLite пытается определить, к какой из пяти основных категорий он относится:

1. **Числовой тип (INTEGER)** — для целых чисел
2. **Вещественный тип (REAL)** — для чисел с плавающей точкой
3. **Текстовый тип (TEXT)** — для строк
4. **Двоичный тип (BLOB)** — для бинарных данных
5. **Числовой тип (NUMERIC)** — для остальных случаев

Это означает, что даже если вы укажете тип `VARCHAR(255)` или `DATETIME`, SQLite преобразует его в одну из этих пяти категорий.

Например:

- Если вы укажете тип `INT`, `INTEGER`, `TINYINT`, `BIGINT` и т.д., SQLite будет считать это числовым типом INTEGER
- Если вы укажете тип `CHAR`, `VARCHAR`, `TEXT` и т.д., SQLite будет считать это текстовым типом TEXT
- Если вы укажете тип `FLOAT`, `DOUBLE`, SQLite будет считать его вещественным типом REAL
- Если вы укажете тип `BLOB`, SQLite будет считать его двоичным типом BLOB
- Если вы укажете тип `DATE`, `DATETIME`, SQLite будет считать это числовым типом NUMERIC

::: warning Что произойдет, если положить текст в числовое поле?

SQLite позволяет хранить значения любого типа в любом столбце, независимо от объявленного типа. Это означает, что вы можете положить текст "привет" в числовое поле INTEGER.

Однако это может привести к неожиданным результатам:

- При математических операциях текст будет преобразован в 0
- При сортировке текстовые значения будут упорядочены по-другому, чем числа
- Это может затруднить поиск и фильтрацию данных

Поэтому важно придерживаться объявленных типов данных для обеспечения целостности и предсказуемости работы с базой данных.

:::

### Сравнение типов данных SQLite и MySQL

Для облегчения перехода к изучению MySQL важно понимать, как типы данных SQLite соотносятся с типами MySQL:

| SQLite | MySQL | Назначение |
|--------|-------|------------|
| INTEGER | INT, BIGINT | Целые числа |
| REAL | DOUBLE, FLOAT | Вещественные числа |
| TEXT | CHAR, VARCHAR, TEXT | Текстовые данные |
| BLOB | BLOB | Двоичные данные |
| - | DATE, TIME, DATETIME | Календарные данные (в SQLite хранятся как TEXT) |

При создании таблиц в SQLite мы будем использовать типы, которые имеют прямые аналоги в MySQL, чтобы облегчить дальнейшее изучение.

## Работа с датой и временем в SQLite

Важно понимать, что SQLite не имеет отдельных типов данных для хранения даты и времени. Это не значит, что вы не можете хранить даты в SQLite — просто они будут храниться как текст или числа, но с определенными правилами обработки.

В SQLite дата и время хранятся в виде:

- TEXT (в формате ISO8601: "YYYY-MM-DD HH:MM:SS.SSS")
- REAL (в виде количества дней с момента дня в юлианском календаре)
- INTEGER (в виде количества секунд с 1970-01-01 00:00:00 UTC)

Несмотря на это, SQLite предоставляет богатый набор функций для работы с датами и временем.

::: note Зачем используется юлианский день?

Функция `julianday()` возвращает количество дней с юлианской эпохи (полдень 1 января 4713 г. до н.э. по юлианскому календарю). Это может показаться странным, но на самом деле это очень удобно для вычислений:

- Это позволяет представлять любую дату в истории в виде одного числа
- Для вычисления разницы между датами достаточно просто вычесть одно число из другого
- Например, `julianday('2025-12-31') - julianday('2025-01-01')` сразу даст вам количество дней между этими датами

Такой подход используется не только в SQLite, но и в астрономии, где юлианская система счисления дней применяется уже много веков.

:::

### Форматы хранения даты и времени

#### TEXT формат

Строка в формате "YYYY-MM-DD HH:MM:SS.SSS". Это наиболее распространенный формат.

Пример: "2025-11-05 15:30:00.000"

#### REAL формат

Число дней с полудня 24 ноября 4714 г. до н.э. по юлианскому календарю.

#### INTEGER формат

Число секунд с 1970-01-01 00:00:00 UTC (Unix время).

### Функции работы с датой и временем

SQLite предоставляет следующие функции для работы с датами и временем:

#### `date(timestring, modifier, modifier, ...)`

Возвращает дату в формате "YYYY-MM-DD".

Примеры:

::: play sandbox=sqlite editor=basic

```sql
-- Текущая дата
SELECT date('now');
```

:::

::: play sandbox=sqlite editor=basic

```sql
-- Дата через 3 дня
SELECT date('now', '+3 days');
```

:::

::: play sandbox=sqlite editor=basic

```sql
-- Дата начала текущего месяца
SELECT date('now', 'start of month');
```

:::

#### `time(timestring, modifier, modifier, ...)`

Возвращает время в формате "HH:MM:SS".

Примеры:

::: play sandbox=sqlite editor=basic

```sql
-- Текущее время
SELECT time('now');
```

:::

::: play sandbox=sqlite editor=basic

```sql
-- Время через 2 часа
SELECT time('now', '+2 hours');
```

:::

#### `datetime(timestring, modifier, modifier, ...)`

Возвращает дату и время в формате "YYYY-MM-DD HH:MM:SS".

Примеры:

```sql
-- Текущая дата и время
SELECT datetime('now');

-- Дата и время через 1 неделю
SELECT datetime('now', '+7 days');
```

#### `strftime(format, timestring, modifier, modifier, ...)`

Возвращает дату/время в заданном формате.

Примеры:

```sql
-- Год
SELECT strftime('%Y', 'now');

-- Месяц и год
SELECT strftime('%m-%Y', 'now');

-- День недели (1-7, где 1=понедельник)
SELECT strftime('%w', 'now');
```

#### `julianday(timestring, modifier, modifier, ...)`

Возвращает количество дней с юлианской эпохи.

Примеры:

```sql
-- Юлианский день для текущей даты
SELECT julianday('now');

-- Разница в днях между двумя датами
SELECT julianday('2025-12-31') - julianday('2025-01-01');
```

### Модификаторы даты и времени

Модификаторы позволяют изменять дату и время:

- `NNN days`, `NNN hours`, `NNN minutes`, `NNN seconds`
- `NNN months`, `NNN years`
- `start of month`, `start of year`, `start of day`
- `weekday N` (переход к дню недели)
- `unixepoch` (для работы с Unix временем)
- `utc`, `localtime` (преобразование часовых поясов)

Примеры:

```sql
-- Первый день следующего месяца
SELECT date('now', '+1 month', 'start of month');

-- Последний день текущего месяца
SELECT date('now', 'start of month', '+1 month', '-1 day');
```

### Практические примеры работы с датами

::: play sandbox=sqlite editor=basic id=date_examples.sql

```sql
-- Примеры работы с датами
SELECT
  date('now') as current_date,
  time('now') as current_time,
  datetime('now') as current_datetime,
  strftime('%Y-%m-%d %H:%M:%S', 'now') as formatted_datetime,
  julianday('now') as julian_day;
```

:::

## Создание таблиц (CREATE TABLE)

Для создания новой таблицы в базе данных используется оператор `CREATE TABLE`.

### Базовый синтаксис

```sql
CREATE TABLE [IF NOT EXISTS] имя_таблицы (
  имя_столбца1 тип_данных [ограничения],
  имя_столбца2 тип_данных [ограничения],
  ...
  [ограничения_таблицы]
);
```

### Пример простой таблицы

Рассмотрим создание таблицы для хранения информации о сотрудниках:

::: play sandbox=sqlite editor=basic id=employees_create.sql

```sql
CREATE TABLE employees (
  id INTEGER PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  salary INTEGER NOT NULL,
  department TEXT,
  hire_date TEXT DEFAULT (date('now'))
);
```

:::

В этом примере:

- `id` — целочисленный столбец, являющийся первичным ключом
- `first_name` и `last_name` — текстовые столбцы, обязательные для заполнения
- `salary` — целочисленный столбец, обязательный для заполнения
- `department` — текстовый столбец, необязательный (может содержать NULL)
- `hire_date` — текстовый столбец с датой найма по умолчанию

### Ограничения (Constraints)

При создании таблиц можно задавать различные ограничения, которые обеспечивают целостность данных:

#### PRIMARY KEY

Уникальный идентификатор записи в таблице. Может быть только один первичный ключ в таблице.

```sql
CREATE TABLE products (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL
);
```

#### NOT NULL

Запрещает хранить в столбце значение NULL.

```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  username TEXT NOT NULL,
  email TEXT
);
```

#### UNIQUE

Гарантирует уникальность значений в столбце.

```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  username TEXT UNIQUE,
  email TEXT UNIQUE
);
```

#### CHECK

Позволяет задать условие, которому должны соответствовать значения в столбце.

```sql
CREATE TABLE employees (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  age INTEGER CHECK (age >= 0 AND age < 150),
  salary INTEGER CHECK (salary > 0)
);
```

#### DEFAULT

Задает значение по умолчанию для столбца.

```sql
CREATE TABLE orders (
  id INTEGER PRIMARY KEY,
  product_name TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  status TEXT DEFAULT 'pending',
  created_at TEXT DEFAULT (datetime('now'))
);
```

#### FOREIGN KEY

Создает связь между таблицами (внешний ключ).

```sql
CREATE TABLE orders (
  id INTEGER PRIMARY KEY,
  customer_id INTEGER,
  product_id INTEGER,
  quantity INTEGER,
  FOREIGN KEY (customer_id) REFERENCES customers (id),
  FOREIGN KEY (product_id) REFERENCES products (id)
);
```

### Пример сложной таблицы с ограничениями

::: play sandbox=sqlite editor=basic id=complex_table.sql

```sql
CREATE TABLE orders (
  id INTEGER PRIMARY KEY,
  customer_name TEXT NOT NULL,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  price REAL NOT NULL CHECK (price >= 0),
  order_date TEXT DEFAULT (date('now')),
  delivery_date TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'shipped', 'delivered', 'cancelled')),
  CHECK (delivery_date >= order_date OR delivery_date IS NULL)
);
```

:::

В этом примере:

- `id` — первичный ключ
- `customer_name` и `product_name` — обязательные текстовые поля
- `quantity` — целое число по умолчанию 1, с проверкой на положительность
- `price` — вещественное число с проверкой на неотрицательность
- `order_date` — дата заказа по умолчанию (текущая дата)
- `delivery_date` — дата доставки (может быть NULL)
- `status` — текстовое поле с ограниченным набором значений
- Проверка, что дата доставки не меньше даты заказа

## Удаление таблиц (DROP TABLE)

Для удаления таблицы используется оператор `DROP TABLE`.

### Базовый синтаксис

```sql
DROP TABLE [IF EXISTS] имя_таблицы;
```

### Примеры

Удаление существующей таблицы:

::: play sandbox=sqlite editor=basic depends-on=employees_create.sql

```sql
DROP TABLE employees;
```

:::

Безопасное удаление таблицы (не вызывает ошибку, если таблицы не существует):

::: play sandbox=sqlite editor=basic

```sql
DROP TABLE IF EXISTS non_existent_table;
```

:::

## Практические задания

### Задание 1

::: tabs

@tab Условие

Создайте таблицу `students` со следующими полями:

- `id` — целое число, первичный ключ
- `name` — текст, обязательное поле
- `age` — целое число, обязательное поле
- `group_name` — текст, необязательное поле
- `gpa` — вещественное число, значение по умолчанию 0.0
- `enrollment_date` — текст, дата зачисления, по умолчанию текущая дата

  ::: play sandbox=sqlite editor=basic

  ```sql
  -- Ваш код можете писать тут


  ```

  :::

@tab Решение

```sql
CREATE TABLE students (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  age INTEGER NOT NULL,
  group_name TEXT,
  gpa REAL DEFAULT 0.0,
  enrollment_date TEXT DEFAULT (date('now'))
);
```

:::

### Задание 2

::: tabs

@tab Условие

Создайте таблицу `products` со следующими полями:

- `id` — целое число, первичный ключ
- `name` — текст, обязательное поле, уникальное
- `category` — текст, обязательное поле
- `price` — вещественное число, обязательное поле, должно быть больше 0
- `in_stock` — целое число, значение по умолчанию 0, должно быть не меньше 0
- `created_at` — текст, дата создания, по умолчанию текущая дата и время

  ::: play sandbox=sqlite editor=basic

  ```sql
  -- Ваш код можете писать тут


  ```

  :::

@tab Решение

```sql
CREATE TABLE products (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  price REAL NOT NULL CHECK (price > 0),
  in_stock INTEGER DEFAULT 0 CHECK (in_stock >= 0),
  created_at TEXT DEFAULT (datetime('now'))
);
```

:::

### Задание 3

::: tabs

@tab Условие

Удалите таблицу `students`, созданную в первом задании.

  ::: play sandbox=sqlite editor=basic

  ```sql
  -- Ваш код можете писать тут


  ```

  :::

@tab Решение

```sql
DROP TABLE students;
```

:::

### Задание 4

::: tabs

@tab Условие

Создайте таблицу `library_books` со следующими полями:

- `id` — целое число, первичный ключ
- `title` — текст, обязательное поле
- `author` — текст, обязательное поле
- `isbn` — текст, уникальное поле
- `year_published` — целое число, должно быть в диапазоне от 1000 до текущего года
- `available_copies` — целое число, значение по умолчанию 1, должно быть больше 0
- `added_date` — текст, дата добавления в библиотеку, по умолчанию текущая дата

  ::: play sandbox=sqlite editor=basic

  ```sql
  -- Ваш код можете писать тут


  ```

  :::

@tab Решение

```sql
CREATE TABLE library_books (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  isbn TEXT UNIQUE,
  year_published INTEGER CHECK (year_published >= 1000 AND year_published <= 2025),
  available_copies INTEGER DEFAULT 1 CHECK (available_copies > 0),
  added_date TEXT DEFAULT (date('now'))
);
```

:::

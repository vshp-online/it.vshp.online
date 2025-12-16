# ИТ.03 - 14 - Практикум - Проектирование БД и простые SQL-запросы

## Цель и формат

- Работаем локально в `sqlite3` (см. [инструкцию по установке](../../manuals/sqlite_manual.md)).
- Все команды фиксируем в `practice_log.sql`, чтобы преподаватель мог воспроизвести ход работы.
- На выполнение отводится 90 минут, задания охватывают темы лекций 01-13.

## Подготовка

1. Перейдите в папку, содержащую исполняемый файл `sqlite3.exe`.
2. Запустите SQLite и создайте БД:

   ```bash
   .open practice.db
   ```

3. Включите внешние ключи и отображение NULL:

   ```sql
    .nullvalue 'NULL'
    PRAGMA foreign_keys = ON;
   ```

4. Подготовьте файл `practice_log.sql`: первым комментарием укажите ФИО студента (например, `-- Иванов Иван Иванович`), далее по ходу занятия вставляйте команды и краткие пояснения (что делает запрос / какой результат ожидается).

::: details Пример `practice_log.sql`

```sql
-- Иванов Иван Иванович

-- 00. Подготовка
.open practice.db
.nullvalue 'NULL'
PRAGMA foreign_keys = ON;

-- 01. Создание таблицы клиентов
CREATE TABLE clients (...);

-- 02. Заполнение таблицы клиентов
INSERT INTO clients VALUES (...);

-- 03. Проверка данных
SELECT * FROM clients;

-- и т.д.
...
```

:::

## Легенда

Столярная мастерская **WoodFlow** производит кастомные изделия из массива дерева и продаёт их локальным магазинам. Компания выпускает линейки готовых изделий (столы, стеллажи, панели), назначает на заказы мастеров, отслеживает статусы и стоимость материалов. Мастерской нужен учебный прототип БД, чтобы анализировать заказы, загрузку сотрудников и предпочтения VIP-клиентов.

## Структура базы

Основные сущности разрабатываемой БД:

- `clients` — магазины и торговые партнёры.
- `products` — каталог изделий, которые изготавливает мастерская.
- `masters` — сотрудники (мастера и стажёры), выполняющие заказы.
- `orders` — заказы клиентов, связывающие клиента, изделие и исполнителя.
- `order_items` — материалы и комплектующие внутри каждого заказа.

Требования и примеры DDL приведены ниже.

### ER-диаграмма

@[code mermaid](./includes/woodflow_erd.mermaid)

### Требования к таблицам

Ниже раскрыта структура каждой таблицы: во вкладках показаны описание требований и пример SQL (можно адаптировать под группу).

#### `clients`

::: tabs

@tab Требования

- хранить магазины и сетевых партнёров, уникальный `email`;
- флаг `is_vip` (0/1) с ограничением `CHECK`;

@tab SQL

```sql
CREATE TABLE clients (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  email TEXT UNIQUE,
  is_vip INTEGER DEFAULT 0 CHECK (is_vip IN (0, 1))
);
```

:::

#### `products`

::: tabs

@tab Требования

- справочник изделий с категорией и базовой стоимостью;
- статус `is_active` (0/1), запрещено хранить нулевую/отрицательную цену;

@tab SQL

```sql
CREATE TABLE products (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  base_price REAL NOT NULL CHECK (base_price > 0),
  is_active INTEGER DEFAULT 1 CHECK (is_active IN (0, 1))
);
```

:::

#### `masters`

::: tabs

@tab Требования

- список сотрудников мастерской;
- `grade` ограничивается значениями `intern/junior/middle/senior`;
- `hire_date` — дата найма, строка в формате `YYYY-MM-DD`.

@tab SQL

```sql
CREATE TABLE masters (
  id INTEGER PRIMARY KEY,
  full_name TEXT NOT NULL,
  grade TEXT CHECK (grade IN ('intern','junior','middle','senior')),
  hire_date TEXT NOT NULL
);
```

:::

#### `orders`

::: tabs

@tab Требования

- связывает клиента, изделие и мастера;
- `status` ограничен перечнем значений, даты могут быть пустыми (`actual_ship_date`);
- по умолчанию фиксируем момент создания через `CURRENT_TIMESTAMP`.

@tab SQL

```sql
CREATE TABLE orders (
  id INTEGER PRIMARY KEY,
  client_id INTEGER NOT NULL REFERENCES clients(id),
  product_id INTEGER NOT NULL REFERENCES products(id),
  master_id INTEGER NOT NULL REFERENCES masters(id),
  status TEXT NOT NULL CHECK (status IN ('draft','in_production','ready','shipped','cancelled')),
  planned_ship_date TEXT NOT NULL,
  actual_ship_date TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

:::

#### `order_items`

::: tabs

@tab Требования

- детализация материалов внутри заказа;
- `quantity` и `unit_price` должны быть положительными;
- каждая строка относится к строке в `orders`.

@tab SQL

```sql
CREATE TABLE order_items (
  id INTEGER PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(id),
  material TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price REAL NOT NULL CHECK (unit_price > 0)
);
```

:::

### Минимальный набор данных

Используйте предложенные значения (по 4-6 записей). Их достаточно для выполнения всех запросов.

#### `clients`

::: tabs

@tab Таблица

| id | name | city | email | is_vip |
| --- | --- | --- | --- | --- |
| 1 | ООО «Дом Леса» | Москва | domlesa@example.com | 1 |
| 2 | ИП «Комфорт Плюс» | Санкт-Петербург | comfort@example.com | 0 |
| 3 | Магазин «LoftLine» | Казань | loftline@example.com | 0 |
| 4 | ООО «ЭкоИнтерьер» | Самара | ecoint@example.com | 0 |
| 5 | ИП «СкандиДом» | Екатеринбург | scandi@example.com | 0 |

@tab SQL

```sql
INSERT INTO clients (id, name, city, email, is_vip) VALUES
  (1, 'ООО «Дом Леса»', 'Москва', 'domlesa@example.com', 1),
  (2, 'ИП «Комфорт Плюс»', 'Санкт-Петербург', 'comfort@example.com', 0),
  (3, 'Магазин «LoftLine»', 'Казань', 'loftline@example.com', 0),
  (4, 'ООО «ЭкоИнтерьер»', 'Самара', 'ecoint@example.com', 0),
  (5, 'ИП «СкандиДом»', 'Екатеринбург', 'scandi@example.com', 0);
```

:::

#### `products`

::: tabs
@tab Таблица

| id | title | category | base_price | is_active |
| --- | --- | --- | --- | --- |
| 1 | Стол «Nordic» | table | 42000 | 1 |
| 2 | Стеллаж «Loft» | shelf | 36000 | 1 |
| 3 | Панель «Wave» | panel | 28000 | 1 |
| 4 | Панно «Rustic» | decor | 18000 | 0 |

@tab SQL

```sql
INSERT INTO products (id, title, category, base_price, is_active) VALUES
  (1, 'Стол «Nordic»', 'table', 42000, 1),
  (2, 'Стеллаж «Loft»', 'shelf', 36000, 1),
  (3, 'Панель «Wave»', 'panel', 28000, 1),
  (4, 'Панно «Rustic»', 'decor', 18000, 0);
```

:::

#### `masters`

::: tabs

@tab Таблица

| id | full_name | grade | hire_date |
| --- | --- | --- | --- |
| 1 | Панов Дмитрий | senior | 2019-03-15 |
| 2 | Соколова Мария | middle | 2020-07-01 |
| 3 | Иванов Артём | junior | 2022-02-10 |
| 4 | Кузнецов Павел | intern | 2023-09-05 |

@tab SQL

```sql
INSERT INTO masters (id, full_name, grade, hire_date) VALUES
  (1, 'Панов Дмитрий', 'senior', '2019-03-15'),
  (2, 'Соколова Мария', 'middle', '2020-07-01'),
  (3, 'Иванов Артём', 'junior', '2022-02-10'),
  (4, 'Кузнецов Павел', 'intern', '2023-09-05');
```

:::

#### `orders`

::: tabs

@tab Таблица

| id | client_id | product_id | master_id | status | planned_ship_date | actual_ship_date | created_at |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | 1 | 1 | 1 | shipped | 2024-03-05 | 2024-03-06 | 2024-02-20 |
| 2 | 2 | 2 | 2 | ready | 2024-03-12 |  | 2024-02-25 |
| 3 | 3 | 3 | 2 | in_production | 2024-03-18 |  | 2024-03-01 |
| 4 | 4 | 1 | 3 | draft | 2024-03-20 |  | 2024-03-04 |
| 5 | 5 | 2 | 1 | cancelled | 2024-03-09 |  | 2024-02-18 |
| 6 | 1 | 3 | 4 | ready | 2024-03-15 | 2024-03-14 | 2024-02-28 |

@tab SQL

```sql
INSERT INTO orders (id, client_id, product_id, master_id, status, planned_ship_date, actual_ship_date, created_at) VALUES
  (1, 1, 1, 1, 'shipped', '2024-03-05', '2024-03-06', '2024-02-20'),
  (2, 2, 2, 2, 'ready', '2024-03-12', NULL, '2024-02-25'),
  (3, 3, 3, 2, 'in_production', '2024-03-18', NULL, '2024-03-01'),
  (4, 4, 1, 3, 'draft', '2024-03-20', NULL, '2024-03-04'),
  (5, 5, 2, 1, 'cancelled', '2024-03-09', NULL, '2024-02-18'),
  (6, 1, 3, 4, 'ready', '2024-03-15', '2024-03-14', '2024-02-28');
```

:::

#### `order_items`

::: tabs

@tab Таблица

| id | order_id | material | quantity | unit_price |
| --- | --- | --- | --- | --- |
| 1 | 1 | дубовые доски | 8 | 3200 |
| 2 | 1 | металлический каркас | 2 | 4500 |
| 3 | 2 | сосновые панели | 10 | 2100 |
| 4 | 2 | матовый лак | 3 | 900 |
| 5 | 3 | ясеневые рейки | 6 | 3500 |
| 6 | 3 | латунная фурнитура | 4 | 1500 |
| 7 | 4 | дубовые доски | 5 | 3200 |
| 8 | 5 | декоративная краска | 4 | 1200 |
| 9 | 6 | ореховый шпон | 7 | 4000 |
| 10 | 6 | LED-подсветка | 2 | 1800 |

@tab SQL

```sql
INSERT INTO order_items (id, order_id, material, quantity, unit_price) VALUES
  (1, 1, 'дубовые доски', 8, 3200),
  (2, 1, 'металлический каркас', 2, 4500),
  (3, 2, 'сосновые панели', 10, 2100),
  (4, 2, 'матовый лак', 3, 900),
  (5, 3, 'ясеневые рейки', 6, 3500),
  (6, 3, 'латунная фурнитура', 4, 1500),
  (7, 4, 'дубовые доски', 5, 3200),
  (8, 5, 'декоративная краска', 4, 1200),
  (9, 6, 'ореховый шпон', 7, 4000),
  (10, 6, 'LED-подсветка', 2, 1800);
```

:::

## Практикум (90 минут) — задания по темам лекций 01-13

> После каждого задания заносите SQL и вывод в `practice_log.sql`. Если нужно, добавляйте `-- комментарии`.

**ЗАДАНИЯ В ПРОЦЕССЕ РАЗРАБОТКИ!**

## Критерии оценки

- Схема и данные соответствуют легенде, ограничения целостности работают.
- Каждое задание оформлено отдельным запросом/блоком с комментарием в логе.
- Запросы покрывают все темы лекций 01-13.
- Итоговые файлы позволяют преподавателю повторить практикум без доработок.

## Что сдавать

1. `practice.db` — база с созданными таблицами и данными.
2. `practice_log.sql` — последовательность команд и комментариев.

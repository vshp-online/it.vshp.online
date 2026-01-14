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

-- Настройка окружения
.open practice.db
.nullvalue 'NULL'
PRAGMA foreign_keys = ON;

-- Создание структуры
CREATE TABLE clients (...);
CREATE TABLE products (...);
-- и т.д.

-- Наполнение базовыми данными
INSERT INTO clients VALUES (...);
INSERT INTO products VALUES (...);
-- и т.д.

-- Задание 1. Расширяем данные
INSERT INTO clients (...) VALUES (...);
INSERT INTO orders (...) VALUES (...);

-- Задание 2. Простые выборки
SELECT ... FROM products WHERE ...;
SELECT ... FROM orders WHERE ...;

-- Задание 3. ...
-- и т.д.
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
- статус `is_active` (0/1)
- запрещено хранить нулевую/отрицательную цену;

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
| 1 | 1 | 1 | 1 | shipped | 2025-12-05 | 2025-12-06 | 2025-11-20 |
| 2 | 2 | 2 | 2 | ready | 2025-12-12 | NULL | 2025-11-25 |
| 3 | 3 | 3 | 2 | in_production | 2025-12-18 | NULL | 2025-11-30 |
| 4 | 4 | 1 | 3 | draft | 2025-12-20 | NULL | 2025-12-02 |
| 5 | 5 | 2 | 1 | cancelled | 2025-12-09 | NULL | 2025-11-18 |
| 6 | 1 | 3 | 4 | ready | 2025-12-15 | 2025-12-14 | 2025-11-28 |

@tab SQL

```sql
INSERT INTO orders (id, client_id, product_id, master_id, status, planned_ship_date, actual_ship_date, created_at) VALUES
  (1, 1, 1, 1, 'shipped', '2025-12-05', '2025-12-06', '2025-11-20'),
  (2, 2, 2, 2, 'ready', '2025-12-12', NULL, '2025-11-25'),
  (3, 3, 3, 2, 'in_production', '2025-12-18', NULL, '2025-11-30'),
  (4, 4, 1, 3, 'draft', '2025-12-20', NULL, '2025-12-02'),
  (5, 5, 2, 1, 'cancelled', '2025-12-09', NULL, '2025-11-18'),
  (6, 1, 3, 4, 'ready', '2025-12-15', '2025-12-14', '2025-11-28');
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

## Практикум (90 минут) — последовательность заданий

::: tip

Выполняйте пункты по порядку и фиксируйте каждое действие в `practice_log.sql`, предваряя блоки комментариями `-- Задание 1: ...`, `-- Задание 2: ...` и т.д.

:::

### Задание 1. Расширяем данные

- Добавьте клиента «Студия "Loft&Light"» (Новосибирск, `loftlight@example.com`, `is_vip = 0`), изделие «Тумба "Flow"» (`category = 'table'`, `base_price = 31000`, `is_active = 1`), мастера «Николай Журавлёв» (`grade = 'junior'`, `hire_date = '2025-02-12'`).
- Создайте заказ №7 для нового клиента на «Тумбу "Flow"», назначьте мастера Николая, задайте `status = 'draft'`, `planned_ship_date = '2025-12-07'`, `actual_ship_date = NULL` и добавьте материалы: «берёзовые панели» (6×2600) и «масло для дерева» (2×1100).

### Задание 2. Простые выборки

- Получите активные изделия с ценой > 30 000 ₽, отсортируйте по убыванию.
- Выведите заказы в статусах `draft`/`in_production` с полями `id`, `status`, `planned_ship_date`, `client_id`.

### Задание 3. Составные фильтры

- Найдите клиентов из городов Москва, Санкт-Петербург, Новосибирск, покажите `name`, `city`, `is_vip`.
- Отберите заказы с плановой датой с 1 по 25 декабря 2025 и статусом не `cancelled`; выведите `id`, `client_id`, `status`, `planned_ship_date`.

### Задание 4. NULL, LIKE и LIMIT

- Покажите три ближайших заказа без фактической отгрузки (`actual_ship_date IS NULL`).
- Найдите материалы, где название содержит «дуб», выведите `order_id`, `material`, `quantity`.

### Задание 5. Агрегаты

- Посчитайте стоимость каждого заказа (`order_total = SUM(quantity * unit_price)`), верните `order_id`, `order_total`.
- Постройте сводку по статусам (`status`, `COUNT(*)`), оставьте только статусы с количеством ≥ 2.

### Задание 6. Обновления и удаление строки

- Обновите заказ №7: `status = 'in_production'`, `planned_ship_date = '2025-12-09'`.
- В заказе №5 замените материал «декоративная краска» на «экологичная краска».
- Удалите позицию «масло для дерева» из заказа №7.

### Задание 7. Работа с датами

- Создайте заказ №8 для клиента «Дом Леса» на «Панель "Wave"» (мастер — Соколова Мария, `status = 'ready'`, `planned_ship_date = '2025-12-22'`, `actual_ship_date = '2025-12-21'`, `created_at = '2025-12-10 09:30'`) с позицией «LED-подсветка» (3×1800).
- Выведите заказы, созданные за последние 14 дней относительно даты 2025-12-31 (используйте `DATE('2025-12-31','-14 day')`).

### Задание 8. Подзапросы

- Найдите заказы дороже среднего (`order_total > (SELECT AVG...)`).
- Выведите клиентов, у которых нет заказов в статусе `ready` (`NOT EXISTS`).

### Задание 9. Ограничения и нагрузка

- Запросом покажите мастеров с более чем двумя активными заказами (`status IN ('draft','in_production','ready')` и `actual_ship_date IS NULL`).

### Задание 10. JOIN и отчёты

- Сформируйте отчёт по заказам: `orders.id`, название клиента, изделие, мастер, статус, плановая дата.
- Постройте список участников процесса (клиенты + мастера) через `UNION ALL` с колонками `name`, `role`.

### Задание 11. Изменение структуры

- Добавьте колонку `priority INTEGER DEFAULT 0` в `orders`.
- Проставьте `priority = 2` для заказов со стоимостью > 100 000 ₽ и `priority = 1` для заказов VIP-клиентов.
- Выведите `id`, `client_id`, `status`, `priority`, `order_total` для контроля.

## Что сдавать

Сдать нужно **папку, названную ФИО студента**, например: `Иванов Иван Иванович`. Внутри папки должны лежать файлы:

1. `practice.db` — база с созданными таблицами и данными.
2. `practice_log.sql` — последовательность команд и комментариев.

Пример структуры папки:

```txt
Иванов Иван Иванович/
├── practice.db
└── practice_log.sql
```

## Критерии оценки

::: warning

- Перед выполнением заданий структура БД должна соответствовать разделу «Структура базы» и быть заполнена стартовыми данными.
- Оцениваются только те задания, которые преподаватель может воспроизвести по `practice_log.sql`: итоговая `practice.db` после выполнения всех команд должна совпасть с вашей.

:::

- Схема и данные соответствуют легенде, ограничения целостности работают.
- Каждое задание оформлено отдельным запросом/блоком с комментарием в логе.
- Итоговые файлы позволяют преподавателю повторить практикум без доработок.

| Верных заданий | Оценка |
| :---: | --- |
| 0-2 | неудовлетворительно |
| 3-5 | удовлетворительно |
| 6-8 | хорошо |
| 9-11 | отлично |

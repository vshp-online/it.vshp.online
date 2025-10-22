# ИТ.03 - 07 - Агрегатные функции, операторы GROUP BY и HAVING

## Введение

На предыдущих занятиях вы освоили выборку и фильтрацию данных (`SELECT`, `WHERE`, `LIKE`, сортировку, ограничение выборки), а также модификаторы `DISTINCT` и работу с составными условиями. Сегодня — первый шаг к **сводной аналитике по группам**: агрегатные функции, группировка `GROUP BY` и постфильтрация групп `HAVING`.

Ключевые идеи темы:

- **Агрегатные функции** вычисляют одно значение по набору строк: `COUNT`, `SUM`, `AVG`, `MIN`, `MAX`.
- **GROUP BY** объединяет строки в группы по заданному критерию.
- **HAVING** отбирает группы по условиям на агрегаты (в отличие от `WHERE`, который отбирает строки до группировки).
- Порядок этапов выполнения запроса: `FROM` -> `WHERE` -> `GROUP BY` -> `HAVING` -> `ORDER BY` -> `LIMIT`.

## Пример таблицы `orders`

<!-- @include: ./includes/table_orders_02.md -->

::: details Код создания таблицы на языке SQL в диалекте SQLite

  ::: play sandbox=sqlite editor=basic id=orders_02_sqlite.sql
  @[code sql](./includes/orders_02_sqlite.sql)
  :::

:::

## Агрегатные функции: обзор

> Агрегатная функция — это функция, которая выполняет вычисление на наборе значений и возвращает одиночное значение.

В разных СУБД существует довольно много разных агрегатных функций, но мы рассмотрим основные:

| Функция             | Что считает                                 | Учитывает `NULL` |
|---------------------|---------------------------------------------|------------------|
| `COUNT(*)`          | Число строк                                 | Да               |
| `COUNT(col)`        | Число **ненулевых** значений в столбце      | Нет              |
| `COUNT(DISTINCT x)` | Число **уникальных** ненулевых значений `x` | Нет              |
| `SUM(col)`          | Сумма значений                              | Нет              |
| `AVG(col)`          | Среднее                                     | Нет              |
| `MIN(col)`          | Минимум                                     | Нет              |
| `MAX(col)`          | Максимум                                    | Нет              |

### Базовые примеры (без группировки)

::: play sandbox=sqlite editor=basic depends-on=orders_02_sqlite.sql

```sql
SELECT COUNT(*) AS total_orders
FROM orders;
```

:::

**Результат:**
Сколько всего строк (заказов) в таблице.

::: play sandbox=sqlite editor=basic depends-on=orders_02_sqlite.sql

```sql
SELECT SUM(amount) AS total_qty
FROM orders;
```

:::

**Результат:**
Сколько единиц товара продано суммарно.

::: play sandbox=sqlite editor=basic depends-on=orders_02_sqlite.sql

```sql
SELECT COUNT(DISTINCT category) AS unique_categories
FROM orders;
```

:::

**Результат:**
Сколько различных категорий товаров встречается в заказах.

## Группировка `GROUP BY`

Оператор `GROUP BY` объединяет данные с одинаковым ключом в **группы**, после чего в `SELECT` допустимы:

- столбцы из списка группировки;
- **агрегатные** выражения по строкам внутри группы.

### Простейшая группировка по товару

::: play sandbox=sqlite editor=basic depends-on=orders_02_sqlite.sql

```sql
SELECT
  title,
  SUM(amount) AS total_qty
FROM orders
GROUP BY title
ORDER BY total_qty DESC;
```

:::

**Результат:**
Сколько единиц каждого товара продано суммарно.

### Группировка по покупателю

::: play sandbox=sqlite editor=basic depends-on=orders_02_sqlite.sql

```sql
SELECT
  customer,
  SUM(amount) AS total_qty
FROM orders
GROUP BY customer
ORDER BY total_qty DESC, customer ASC;
```

:::

**Результат:**
Сколько единиц заказал каждый покупатель.

### Группировка по категории

::: play sandbox=sqlite editor=basic depends-on=orders_02_sqlite.sql

```sql
SELECT
  category,
  SUM(amount) AS total_qty
FROM orders
GROUP BY category
ORDER BY total_qty DESC;
```

:::

**Результат:**
Суммарные продажи по категориям.

### Группировка по двум ключам (покупатель × категория)

::: play sandbox=sqlite editor=basic depends-on=orders_02_sqlite.sql

```sql
SELECT
  customer,
  category,
  SUM(amount) AS total_qty
FROM orders
GROUP BY customer, category
HAVING SUM(amount) > 0
ORDER BY customer ASC, total_qty DESC;
```

:::

**Результат:**
Сколько покупатель взял по каждой категории

### Заказы на каждый товар

::: play sandbox=sqlite editor=basic depends-on=orders_02_sqlite.sql

```sql
SELECT
  title,
  COUNT(*) AS orders_count
FROM orders
GROUP BY title
ORDER BY orders_count DESC, title ASC;
```

:::

**Результат:**
Сколько заказов пришлось на каждый товар.

### Средний размер заказа

::: play sandbox=sqlite editor=basic depends-on=orders_02_sqlite.sql

```sql
SELECT
  title,
  AVG(amount) AS avg_per_order
FROM orders
GROUP BY title
ORDER BY avg_per_order DESC;
```

:::

**Результат:**
Средний размер заказа по каждому товару

### Группировка по выражению

::: tip

В SQLite существует функция `LOWER(col)`, которая приводит переданное ей значение к нижнему регистру. Однако, следует помнить что она не работает для кириллицы!

:::

Группировать можно по вычисляемому выражению, например по «нормализованному» названию:

::: play sandbox=sqlite editor=basic depends-on=orders_02_sqlite.sql

```sql
SELECT
  LOWER(title) AS norm_title,
  SUM(amount)  AS total_qty
FROM orders
GROUP BY LOWER(title)
ORDER BY total_qty DESC;
```

:::

**Результат:**
Объединены возможные варианты регистра в одно наименование

::: warning

Примечание о разных СУБД: в SQLite допускается выбирать в `SELECT` столбцы, которых нет в `GROUP BY`, но их значения **недетерминированы**; в MySQL с включённым режимом `ONLY_FULL_GROUP_BY` это приведёт к ошибке. Безопасная практика: в `SELECT` — только поля группировки и агрегаты.

:::

---

## `WHERE` vs `HAVING`

- `WHERE` фильтрует **строки до** группировки.
- `HAVING` фильтрует **группы после** вычисления агрегатов.

### Пример 1. Отобрать «крупные» **строки** заказов

::: play sandbox=sqlite editor=basic depends-on=orders_02_sqlite.sql
```sql
-- Только те строки, где amount >= 10 (до группировки)
SELECT
  title, SUM(amount) AS total_qty
FROM orders
WHERE amount >= 10
GROUP BY title;
```
:::

### Пример 2. Отобрать «крупные» **товары по итогу**

::: play sandbox=sqlite editor=basic depends-on=orders_02_sqlite.sql
```sql
-- Все строки учитываются, но оставляем только те группы,
-- где суммарные продажи по товару >= 25
SELECT
  title, SUM(amount) AS total_qty
FROM orders
GROUP BY title
HAVING SUM(amount) >= 25  -- допустимо также: HAVING total_qty >= 25 в SQLite/MySQL
ORDER BY total_qty DESC;
```
:::

### Частые условия в `HAVING`

::: play sandbox=sqlite editor=basic depends-on=orders_02_sqlite.sql
```sql
-- Товары, у которых не менее 3 заказов
SELECT title, COUNT(*) AS orders_count
FROM orders
GROUP BY title
HAVING COUNT(*) >= 3;

-- Товары со "стабильными" заказами: минимальный размер заказа не ниже 5
SELECT title, MIN(amount) AS min_per_order
FROM orders
GROUP BY title
HAVING MIN(amount) >= 5;

-- Средний размер заказа в разумных пределах
SELECT title, AVG(amount) AS avg_per_order
FROM orders
GROUP BY title
HAVING AVG(amount) BETWEEN 5 AND 8;
```
:::

::: play sandbox=sqlite editor=basic depends-on=orders_02_sqlite.sql
```sql
-- Покупатели с суммарными закупками не менее 40 единиц
SELECT customer, SUM(amount) AS total_qty
FROM orders
GROUP BY customer
HAVING SUM(amount) >= 40
ORDER BY total_qty DESC;

-- Категории, по которым сделано не менее 3 строк заказов
SELECT category, COUNT(*) AS rows_cnt
FROM orders
GROUP BY category
HAVING COUNT(*) >= 3
ORDER BY rows_cnt DESC;
```
:::

### `HAVING` без `GROUP BY`

Можно фильтровать агрегат по **всей таблице** одной строкой результата:

::: play sandbox=sqlite editor=basic depends-on=orders_02_sqlite.sql
```sql
-- Показать суммарные продажи только если они превышают 60
SELECT SUM(amount) AS total_qty
FROM orders
HAVING SUM(amount) > 60;
```
:::

---

## Порядок и «скелет» запроса сводной аналитики

1) Сформулировать вопрос на обычном языке.
2) Выбрать ключ группировки.
3) Выбрать агрегаты.
4) Доп-фильтры по строкам (`WHERE`).
5) Фильтр по итогам групп (`HAVING`).
6) Сортировка результатов (`ORDER BY`) и порог (`LIMIT`).

Шаблон:

```sql
SELECT group_key, AGG(...) AS metric, ...
FROM table
[WHERE ...]
GROUP BY group_key
[HAVING ...]
[ORDER BY metric DESC]
[LIMIT N];
```

---

## Типичные ошибки и как их избежать

- **Выбор неагрегированных полей вне `GROUP BY`.** Работает не везде / даёт недетерминированные значения. Решение: добавьте поле в `GROUP BY` или заверните в агрегат/выражение.
- **Использование `HAVING` вместо `WHERE` для построчных условий.** Если критерий относится к строкам (напр. `amount >= 10`) — это `WHERE`. Если к агрегатам группы (`SUM(amount) >= 25`) — это `HAVING`.
- **Неуправляемый порядок строк.** Добавляйте явный `ORDER BY` по метрике/ключу.
- **Смешение регистров/вариантов написания ключа группировки.** Нормализуйте (`LOWER(...)`, `TRIM(...)`) в `GROUP BY`.

---

## Практикум

1. Суммарные продажи по каждому товару (title), по убыванию суммы.
2. Покупатели с не менее чем тремя строками заказов.
3. Топ‑N покупателей по суммарным продажам; покажите сумму и число строк.
4. Категории с суммарными продажами ≥ 50.
5. Средний размер строки заказа по каждому покупателю.
6. Минимальный и максимальный размер строки по каждому товару.
7. Число **уникальных** покупателей и число **уникальных** товаров.
8. Нормализуйте наименования (`LOWER(title)`) и пересчитайте продажи по товарам.
9. Матрица покупатель × категория с суммой; выведите только ячейки с суммой > 0.
10. Топ‑1 товар и топ‑1 покупатель по суммарным продажам (двумя запросами).

::: play sandbox=sqlite editor=basic depends-on=orders_02_sqlite.sql

```sql
-- Ваш код можете писать тут


```

:::

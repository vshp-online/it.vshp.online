# ИТ.03 - 05 - Специальные операторы IN и BETWEEN. Составные условия запросов AND, OR, NOT. Модификатор запроса DISTINCT

## Введение

В предыдущей теме мы познакомились с базовыми конструкциями SQL — `SELECT`, `FROM` и `WHERE`.
Сегодня разберём **логические операторы**, которые позволяют задавать сложные условия фильтрации данных: `AND`, `OR`, `NOT`, **специальные операторы** `IN`, `BETWEEN` для работы с наборами значений и диапазонами, а также изучим **модификатор** `DISTINCT`, который помогает убирать повторяющиеся строки из результата запроса.

Эти операторы позволяют делать запросы гибкими и точными.

- **`AND`** — возвращает строки, где выполняются оба условия
- **`OR`** — возвращает строки, где выполняется хотя бы одно условие
- **`NOT`** — исключает строки, удовлетворяющие условию
- **`XOR`** — возвращает строки, где выполняется **только одно из условий**, но не оба
- **`IN`** — проверяет, входит ли значение в заданный список
- **`BETWEEN`** — проверяет, находится ли значение в диапазоне
- **`DISTINCT`** — убирает дубликаты из результатов запроса

## Пример таблицы `orders`

| id | user_id | products_count | sum   | status      |
| -- | ------- | -------------- | ----- | ----------- |
| 1  | 1       | 2              | 1300  | new         |
| 2  | 18      | 1              | 10000 | cancelled   |
| 3  | 45      | 3              | 800   | cancelled   |
| 4  | 11      | 1              | 2140  | in_progress |
| 5  | 145     | 5              | 6800  | new         |
| 6  | 23      | 1              | 999   | new         |
| 7  | 1       | 2              | 7690  | cancelled   |
| 8  | 17      | 1              | 1600  | new         |
| 9  | 5       | 4              | 400   | delivery    |
| 10 | 11      | 1              | 1450  | new         |
| 11 | 13      | 7              | 13000 | cancelled   |
| 12 | 11      | 1              | 1000  | in_progress |
| 13 | 45      | 2              | 3000  | returned    |

::: details Код создания таблицы на языке SQL в диалекте SQLite

  ::: play sandbox=sqlite editor=basic id=orders_01_sqlite.sql
  @[code sql](./includes/orders_01_sqlite.sql)
  :::

:::

## Оператор AND

Оператор **`AND`** используется, когда нужно выбрать строки, удовлетворяющие **всем условиям одновременно**.

::: play sandbox=sqlite editor=basic depends-on=orders_01_sqlite.sql

```sql
SELECT id, user_id, sum, status
FROM orders
WHERE status = 'new' AND sum > 1000;
```

:::

**Результат:**
Отбираются только заказы со статусом `new`, сумма которых превышает 1000.

## Оператор OR

Оператор **`OR`** возвращает строки, где выполняется **хотя бы одно** из указанных условий.

::: play sandbox=sqlite editor=basic depends-on=orders_01_sqlite.sql

```sql
SELECT id, user_id, sum, status
FROM orders
WHERE status = 'cancelled' OR status = 'returned';
```

:::

**Результат:**
Отбираются все отменённые (`cancelled`) и возвращённые (`returned`) заказы.

## Оператор NOT

Оператор **`NOT`** исключает строки, удовлетворяющие условию.

::: play sandbox=sqlite editor=basic depends-on=orders_01_sqlite.sql

```sql
SELECT id, user_id, sum, status
FROM orders
WHERE NOT status = 'cancelled';
```

:::

**Результат:**
Выводятся все заказы, **кроме отменённых**.

## Приоритет операторов

Порядок выполнения в SQL следующий:

1. `NOT`
2. `AND`
3. `OR`

Чтобы задать свой порядок, используйте скобки `()`.

::: play sandbox=sqlite editor=basic depends-on=orders_01_sqlite.sql

```sql
SELECT id, user_id, sum, status
FROM orders
WHERE (status = 'new' OR status = 'in_progress') AND sum < 2000;
```

:::

**Результат:**
Отбираются заказы в статусах `new` или `in_progress`, при этом сумма меньше 2000.

## Оператор XOR

Оператор **`XOR`** (исключающее ИЛИ) используется редко,
но бывает полезен, когда нужно выбрать строки, где **только одно из двух условий истинно**, а если оба выполняются — строка не попадёт в результат.

```sql
SELECT id, user_id, sum, status
FROM orders
WHERE (sum > 5000) XOR (status = 'new');
```

**Результат:**
Будут показаны заказы, где **либо сумма больше 5000**,
**либо статус "new"**, но не оба одновременно.

::: warning

Поддержка `XOR` зависит от диалекта SQL.
В MySQL он есть, а в SQLite можно заменить выражением:

  ::: play sandbox=sqlite editor=basic depends-on=orders_01_sqlite.sql

  ```sql
  SELECT id, user_id, sum, status
  FROM orders
  WHERE (sum > 5000 AND status != 'new')
      OR (sum <= 5000 AND status = 'new');
  ```

  :::
:::

## Оператор IN

Оператор **`IN`** используется для проверки, входит ли значение в **указанный список**.
Он делает запросы короче и нагляднее, чем несколько `OR`.

::: play sandbox=sqlite editor=basic depends-on=orders_01_sqlite.sql

```sql
SELECT id, user_id, sum, status
FROM orders
WHERE status IN ('cancelled', 'returned', 'delivery');
```

:::

**Результат:**
Отбираются все заказы, у которых статус — `cancelled`, `returned` или `delivery`.

**Аналогичный запрос через OR:**

```sql
WHERE status = 'cancelled' OR status = 'returned' OR status = 'delivery';
```

## Оператор BETWEEN

Оператор **`BETWEEN`** используется для проверки, входит ли значение в **заданный диапазон включительно**.

::: play sandbox=sqlite editor=basic depends-on=orders_01_sqlite.sql

```sql
SELECT id, user_id, sum, status
FROM orders
WHERE sum BETWEEN 1000 AND 5000;
```

:::

**Результат:**
Выводятся заказы, сумма которых **от 1000 до 5000 включительно**.

::: tip

Диапазон можно использовать и с датами — SQL корректно сравнивает даты по порядку.

:::

## DISTINCT — уникальные значения

`DISTINCT` используется, чтобы **убрать дубли** в результатах запроса.

::: play sandbox=sqlite editor=basic depends-on=orders_01_sqlite.sql

```sql
SELECT DISTINCT status
FROM orders;
```

:::

**Результат:**
Показывает список **уникальных статусов заказов** без повторений.

---

## Комбинация DISTINCT и WHERE

Можно объединять `DISTINCT` с условиями фильтрации:

::: play sandbox=sqlite editor=basic depends-on=orders_01_sqlite.sql

```sql
SELECT DISTINCT user_id
FROM orders
WHERE status = 'cancelled';
```

:::

**Результат:**
Выводятся **уникальные пользователи**, у которых есть хотя бы один отменённый заказ.

---

## Практические задания

1. Выведите заказы, у которых статус `new` и сумма больше 1500.
2. Покажите заказы, которые либо отменены, либо возвращены.
3. Выведите заказы, **кроме** тех, что находятся в статусе `delivery`.
4. Найдите всех уникальных пользователей, у которых есть активные (`in_progress`) заказы.
5. Покажите уникальные значения статусов заказов.
6. Выведите заказы, сумма которых находится **в диапазоне от 2000 до 7000**.
7. Покажите заказы, статус которых входит в список `('new', 'in_progress')`.

::: play sandbox=sqlite editor=basic depends-on=orders_01_sqlite.sql

```sql
-- Ваши решения можно писать здесь


```

:::

# ИТ.03 - 05 - Составные условия запросов AND, OR, NOT. Специальные операторы IN и BETWEEN. Модификатор запроса DISTINCT

## Введение

В предыдущей теме мы познакомились с базовыми конструкциями SQL — `SELECT`, `FROM` и `WHERE`.

Сегодня разберём **специальные и логические операторы**, которые позволяют гибко управлять выборкой данных и делать запросы более точными.

### Логические операторы

Используются для объединения или отрицания условий фильтрации:

- `AND` — оба условия должны выполняться;
- `OR` — достаточно выполнения одного условия;
- `NOT` — исключает строки, подходящие под условие;
- `XOR` — выполняется только одно из условий, но не оба.

### Специальные операторы

Помогают работать со списками и диапазонами:

- `IN` — проверяет, входит ли значение в указанный набор;
- `BETWEEN` — проверяет, находится ли значение в пределах заданного диапазона.

### Модификатор выборки

- `DISTINCT` — исключает дублирующиеся строки из результата запроса.

Эти инструменты часто комбинируются в одном запросе, делая фильтрацию данных гибкой и читаемой.

## Пример таблицы `orders`

<!-- @include: ./includes/table_orders_01.md -->

::: details Код создания таблицы на языке SQL в диалекте SQLite

  ::: play sandbox=sqlite editor=basic id=orders_01_sqlite.sql
  @[code sql](./includes/orders_01_sqlite.sql)
  :::

:::

## Оператор AND

Оператор **`AND`** используется, когда нужно выбрать строки, удовлетворяющие **всем условиям одновременно**.

::: play sandbox=sqlite editor=basic depends-on=orders_01_sqlite.sql

```sql
SELECT id, user_id, price, status
FROM orders
WHERE status = 'new' AND price > 1000;
```

:::

**Результат:**
Отбираются только заказы со статусом `new`, сумма которых превышает 1000.

## Оператор OR

Оператор **`OR`** возвращает строки, где выполняется **хотя бы одно** из указанных условий.

::: play sandbox=sqlite editor=basic depends-on=orders_01_sqlite.sql

```sql
SELECT id, user_id, price, status
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
SELECT id, user_id, price, status
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
SELECT id, user_id, price, status
FROM orders
WHERE (status = 'new' OR status = 'in_progress') AND price < 2000;
```

:::

**Результат:**
Отбираются заказы в статусах `new` или `in_progress`, при этом сумма меньше 2000.

## Оператор XOR

Оператор **`XOR`** (исключающее ИЛИ) используется редко,
но бывает полезен, когда нужно выбрать строки, где **только одно из двух условий истинно**, а если оба выполняются — строка не попадёт в результат.

```sql
SELECT id, user_id, price, status
FROM orders
WHERE (price > 5000) XOR (status = 'new');
```

**Результат:**
Будут показаны заказы, где **либо сумма больше 5000**,
**либо статус "new"**, но не оба одновременно.

::: warning

Поддержка `XOR` зависит от диалекта SQL.
В MySQL он есть, а в SQLite можно заменить выражением:

  ::: play sandbox=sqlite editor=basic depends-on=orders_01_sqlite.sql

  ```sql
  SELECT id, user_id, price, status
  FROM orders
  WHERE
    (price > 5000 AND status != 'new')
      OR
    (price <= 5000 AND status = 'new')
  ;
  ```

  :::
:::

## Оператор IN

Оператор **`IN`** используется для проверки, входит ли значение в **указанный список**.

Он делает запросы короче и нагляднее, чем несколько `OR`.

::: play sandbox=sqlite editor=basic depends-on=orders_01_sqlite.sql

```sql
SELECT id, user_id, price, status
FROM orders
WHERE status IN ('cancelled', 'returned', 'delivery');
```

:::

**Результат:**
Отбираются все заказы, у которых статус — `cancelled`, `returned` или `delivery`.

**Аналогичный запрос через OR:**

::: play sandbox=sqlite editor=basic depends-on=orders_01_sqlite.sql

```sql
SELECT id, user_id, price, status
FROM orders
WHERE
  status = 'cancelled'
    OR
  status = 'returned'
    OR
  status = 'delivery'
;
```

:::

## Оператор BETWEEN

Оператор **`BETWEEN`** используется для проверки, входит ли значение в **заданный диапазон включительно**.

Он делает запросы короче и нагляднее, чем два условия с `AND`.

::: play sandbox=sqlite editor=basic depends-on=orders_01_sqlite.sql

```sql
SELECT id, user_id, price, status
FROM orders
WHERE price BETWEEN 1000 AND 5000;
```

:::

**Результат:**
Выводятся заказы, сумма которых **от 1000 до 5000 включительно**.

**Аналогичный запрос через AND:**

::: play sandbox=sqlite editor=basic depends-on=orders_01_sqlite.sql

```sql
SELECT id, user_id, price, status
FROM orders
WHERE
  price >= 1000
    AND
  price <= 5000
;
```

:::

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

### Задание 1

::: tabs

@tab Условие

Выведите все новые заказы (`new`), сумма которых больше `1500`.

  ::: play sandbox=sqlite editor=basic depends-on=orders_01_sqlite.sql

  ```sql
  -- Ваш код можете писать тут


  ```

  :::

@tab Решение

```sql
SELECT *
FROM orders
WHERE
  status = "new"
    AND
  price >= 1500
```

:::

### Задание 2

::: tabs

@tab Условие

Выведите заказы, которые либо отменены (`cancelled`), либо возвращены (`returned`).

В решении **не используйте** оператор `IN`.

  ::: play sandbox=sqlite editor=basic depends-on=orders_01_sqlite.sql

  ```sql
  -- Ваш код можете писать тут


  ```

  :::

@tab Решение

```sql
SELECT *
FROM orders
WHERE
  status = "cancelled"
    OR
  status = "returned"
```

:::

### Задание 3

::: tabs

@tab Условие

Выведите все заказы, **кроме** тех, что находятся в доставке (`delivery`) или в обработке (`in_progress`).

В решении **не используйте** символ `!=` и оператор `OR`.

  ::: play sandbox=sqlite editor=basic depends-on=orders_01_sqlite.sql

  ```sql
  -- Ваш код можете писать тут


  ```

  :::

@tab Решение

```sql
SELECT *
FROM orders
WHERE
  status NOT IN("delivery", "in_progress")
```

:::

### Задание 4

::: tabs

@tab Условие

Выведите все заказы, сумма которых находится в диапазоне от `2000` до `7000` включительно.

В решении **не используйте** символы `>=` или `<=`.

  ::: play sandbox=sqlite editor=basic depends-on=orders_01_sqlite.sql

  ```sql
  -- Ваш код можете писать тут


  ```

  :::

@tab Решение

```sql
SELECT *
FROM orders
WHERE
  price BETWEEN 2000 AND 7000
```

:::

### Задание 5

::: tabs

@tab Условие

Выведите все уникальные значения статусов заказов.

  ::: play sandbox=sqlite editor=basic depends-on=orders_01_sqlite.sql

  ```sql
  -- Ваш код можете писать тут


  ```

  :::

@tab Решение

```sql
SELECT DISTINCT
  status
FROM orders
```

:::

### Задание 6

::: tabs

@tab Условие

Найдите всех уникальных пользователей, у которых есть новые (`new`), отмененные (`cancelled`) или возвращенные (`returned`) заказы.

В решении **не используйте** символ `=` и оператор `OR`.

  ::: play sandbox=sqlite editor=basic depends-on=orders_01_sqlite.sql

  ```sql
  -- Ваш код можете писать тут


  ```

  :::

@tab Решение

```sql
SELECT DISTINCT
  user_id
FROM orders
WHERE
  status IN('new', 'cancelled', 'returned')
```

:::

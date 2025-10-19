# Практикум №1 - Связи между таблицами

## Связи один-к-одному

### 1. Задача - Персональные данные

::: tabs

@tab Условия

Регистрационные данные пользователей хранятся в таблице `users`, а персональные данные в `users_p`. Таблицы связаны друг с другом отношением один-к-одному так, что первичные ключи совпадают.

Получите идентификатор, имя и фамилию для пользователей зарегистрировавшихся (`date_joined`) *после полуночи 1 января 2016 года* с паспортами *серия которых начинается на 32*.

Отсортируйте данные по фамилии пользователей.

@tab Структура БД

@[code mermaid](./includes/01_db_01.mermaid)

@tab Дамп

@[code sql:collapsed-lines=10](./includes/01_db_01.sql)

@tab Таблицы

  ::: tabs

  @tab **users**
  <!-- @include: ./includes/01_db_01_table_users.md -->

  @tab **users_p**
  <!-- @include: ./includes/01_db_01_table_users_p.md -->

  :::

:::

::: details **Решение задачи**

```sql
SELECT users.id, users.first_name, users.last_name
FROM users, users_p
WHERE
  users.id = users_p.id
    AND
  users.date_joined > '2016-01-01 00:00:00'
    AND
  users_p.series LIKE '32%'
ORDER BY users.last_name
```

:::

### 2. Задача - Обновление пользователя

::: tabs

@tab Условия

В таблице `users` хранится базовая информация о пользователях, а в таблице `users_details` — подробная. Таблицы связаны отношением один-к-одному так, что первичные ключи в таблицах совпадают.

Обновите данные о пользователе c `id` равным `8`: измените `email` на **`karina.n@domain.com`**, а фамилию на **`Некифорова`**.

Выполните все изменения в одном SQL запросе.

@tab Структура БД

@[code mermaid](./includes/01_db_02.mermaid)

@tab Дамп

@[code sql:collapsed-lines=10](./includes/01_db_02.sql)

@tab Таблицы

  ::: tabs

  @tab **users**
  <!-- @include: ./includes/01_db_02_table_users.md -->

  @tab **users_details**
  <!-- @include: ./includes/01_db_02_table_users_details.md -->

  :::

:::

::: details **Решение задачи**

```sql
UPDATE users, users_details
SET
  users.email = 'karina.n@domain.com',
  users_details.last_name = 'Некифорова'
WHERE
  users.id = users_details.id
    AND
  users.id = 8
```

:::

## Связи один-ко-многим

### 3. Задача - Завершенные заказы

::: tabs

@tab Условия

Таблицы `users` и `orders` связанны отношением один-ко-многим.
`orders` содержит внешний ключ `user_id`, который ссылается на `id` пользователя.

Получите из таблиц дату и стоимость каждого выполненного заказа, а также фамилию и имя пользователя, который этот заказ оформил.

Информацию отсортируйте по дате заказа, дату выведите в формате `ДД.ММ.ГГГГ` в поле `date`.

@tab Структура БД

@[code mermaid](./includes/01_db_03.mermaid)

@tab Дамп

@[code sql:collapsed-lines=10](./includes/01_db_03.sql)

@tab Таблицы

  ::: tabs

  @tab **users**
  <!-- @include: ./includes/01_db_03_table_users.md -->

  @tab **orders**
  <!-- @include: ./includes/01_db_03_table_orders.md -->

  :::

:::

::: details **Решение задачи**

```sql
SELECT
  DATE_FORMAT(orders.date,'%d.%m.%Y') AS date,
  orders.amount,
  users.last_name,
  users.first_name
FROM users, orders
WHERE
  orders.user_id = users.id
    AND
  orders.status = 'completed'
ORDER BY orders.date ASC
```

:::

### 4. Задача - Товары с категориями и брендами

::: tabs

@tab Условия

В базе данных есть три таблицы: `products`, `categories` и `brands`.

Выведите `id` и название товара, его цену, название категории и название бренда для товаров, которые есть на складе.

Название товара выведите в поле `name`, категорию в `category`, бренда в `brand`.

Отсортируйте данные по цене, а затем по `id` товара.

@tab Структура БД

@[code mermaid](./includes/01_db_04.mermaid)

@tab Дамп

@[code sql:collapsed-lines=10](./includes/01_db_04.sql)

@tab Таблицы

  ::: tabs

  @tab **products**
  <!-- @include: ./includes/01_db_04_table_products.md -->

  @tab **categories**
  <!-- @include: ./includes/01_db_04_table_categories.md -->

  @tab **brands**
  <!-- @include: ./includes/01_db_04_table_brands.md -->

  :::

:::

::: details **Решение задачи**

```sql
SELECT
  products.id,
  products.name AS name,
  categories.name AS category,
  brands.name AS brand
FROM products
JOIN brands ON products.brand_id = brands.id
JOIN categories ON products.category_id = categories.id
WHERE
  products.count > 0
ORDER BY products.price ASC, products.id ASC
```

:::

## Связи многие-ко-многим

### 5. Задача - Сотрудники компании

::: tabs

@tab Условия

Таблицы `users` и `roles` связаны отношением многие ко многим через таблицу `users_roles`.

Получите *список всех ролей* и *количество сотрудников* в каждой роли.

Выведите два поля: `role` — название должности и `members` — количество сотрудников в этой должности.

Данные отсортируйте по названию должности.

@tab Структура БД

@[code mermaid](./includes/01_db_05.mermaid)

@tab Дамп

@[code sql:collapsed-lines=10](./includes/01_db_05.sql)

@tab Таблицы

  ::: tabs

  @tab **users**
  <!-- @include: ./includes/01_db_05_table_users.md -->

  @tab **roles**
  <!-- @include: ./includes/01_db_05_table_roles.md -->

  @tab **users_roles**
  <!-- @include: ./includes/01_db_05_table_users_roles.md -->

  :::

:::

::: details **Решение задачи**

```sql
SELECT
  roles.name as role,
  COUNT(users.id) as members
FROM roles
JOIN users_roles ON users_roles.role_id = roles.id
JOIN users ON users.id = users_roles.user_id
GROUP BY role
ORDER BY role ASC
```

:::

### 6. Задача - Самые продаваемые товары

::: tabs

@tab Условия

Рассмотрим базу данных интернет-магазина:

Также `orders` связана отношением многие ко многим с таблицей `products` через таблицу `orders_details`, что дает возможность указывать какие именно товары находятся в заказе.

Получите *5 самых продаваемых товаров* (тех, которых больше всего покупали). Учитывайте *только выполненные заказы*.

Выведите поля: `id` и название товара, количество проданных товаров (в поле `sold`), общую стоимость проданных товаров (в поле `total`).

Данные отсортируйте сперва по полю `sold` в обратном порядке, а затем по `total`, также в обратном порядке.

@tab Структура БД

@[code mermaid](./includes/01_db_06.mermaid)

@tab Дамп

@[code sql:collapsed-lines=10](./includes/01_db_06.sql)

@tab Таблицы

  ::: tabs

  @tab **products**
  <!-- @include: ./includes/01_db_06_table_products.md -->

  @tab **orders**
  <!-- @include: ./includes/01_db_06_table_orders.md -->

  @tab **orders_details**
  <!-- @include: ./includes/01_db_06_table_orders_details.md -->

  :::

:::

::: details **Решение задачи**

```sql
SELECT
  p.id,
  p.name,
  COUNT(o.id) as sold,
  SUM(p.price) as total
FROM products as p
JOIN orders_details as od on p.id = od.product_id
JOIN orders as o on o.id = od.order_id
WHERE
  o.status = 'success'
GROUP BY id
ORDER BY sold DESC, total DESC
LIMIT 5
```

:::

# Практикум №1 - Связи между таблицами

## Связи один-к-одному

### Задача - Персональные данные

Регистрационные данные пользователей хранятся в таблице `users`, а персональные данные в `users_p`. Таблицы связаны друг с другом отношением один-к-одному так, что первичные ключи совпадают.

Получите идентификатор, имя и фамилию для пользователей зарегистрировавшихся (`date_joined`) *после полуночи 1 января 2016 года* с паспортами *серия которых начинается на 32*.

Отсортируйте данные по фамилии пользователей.

::: details lab_13_01.sql

@[code sql](./includes/lab_13_01.sql)

:::

### Задача - Обновление пользователя

В таблице `users` хранится базовая информация о пользователях, а в таблице `users_details` — подробная. Таблицы связаны отношением один-к-одному так, что первичные ключи в таблицах совпадают.

Обновите данные о пользователе c `id` равным `8`: измените `email` на **`karina.n@domain.com`**, а фамилию на **`Некифорова`**.

Выполните все изменения в одном SQL запросе.

::: details lab_13_02.sql

@[code sql](./includes/lab_13_02.sql)

:::

## Связи один-ко-многим

### Задача - Завершенные заказы

Таблицы `orders` и `users` связанны отношением многие к одному.
`orders` содержит внешний ключ `user_id`, который ссылается на `id` пользователя.

Получите из таблиц дату и стоимость каждого выполненного заказа, а также фамилию и имя пользователя, который этот заказ оформил.

Информацию отсортируйте по дате заказа, дату выведите в формате `ДД.ММ.ГГГГ` в поле `date`.

::: details lab_13_02.sql

@[code sql](./includes/lab_13_02.sql)

:::

### Задача - Товары с категориями и брендами

В базе данных есть три таблицы: `products`, `categories` и `brands`.

Выведите `id` и название товара, его цену, название категории и название бренда для товаров, которые есть на складе.

Название товара выведите в поле `name`, категорию в `category`, бренда в `brand`.

Отсортируйте данные по цене, а затем по `id` товара.

::: details lab_13_04.sql

@[code sql](./includes/lab_13_04.sql)

:::

## Связи многие-ко-многим

### Задача - Сотрудники компании

Таблицы `users` и `roles` связаны отношением многие ко многим через таблицу `users_roles`.

Получите *список всех ролей* и *количество сотрудников* в каждой роли.

Выведите два поля: `role` — название должности и `members` — количество сотрудников в этой должности.

Данные отсортируйте по названию должности.

::: details lab_13_05.sql

@[code sql](./includes/lab_13_05.sql)

:::

### Задача - Самые продаваемые товары

Рассмотрим базу данных интернет-магазина:

1. Таблица `orders` содержит список заказов пользователей и связана с `users` отношением один ко многим через поле `user_id`.

2. Также `orders` связана отношением многие ко многим с таблицей `products` через таблицу `orders_details`, что дает возможность указывать какие именно товары находятся в заказе.

Получите *5 самых продаваемых товаров* (тех, которых больше всего покупали). Учитывайте *только выполненные заказы*.

Выведите четыре поля: `id` и название товара, количество проданных товаров (в поле `sold`), общую стоимость проданных товаров (в поле `total`).

Данные отсортируйте сперва по полю `sold` в обратном порядке, а затем по `total`, также в обратном порядке.

::: details lab_13_06.sql

@[code sql](./includes/lab_13_06.sql)

:::

---

## Решения задач

---

::: details Решение задачи - Персональные данные

```sql
SELECT users.id, users.first_name, users.last_name
FROM users, users_p
WHERE users.id = users_p.id AND users.date_joined > '2016-01-01 00:00:00' AND users_p.series LIKE '32%'
ORDER BY users.last_name;
```

:::

---

::: details Решение задачи - Обновление пользователя

```sql
UPDATE users, users_details
SET
  users.email = 'karina.n@domain.com',
  users_details.last_name = 'Некифорова'
WHERE users.id = users_details.id AND users.id = 8;
```

:::

---

::: details Решение задачи - Завершенные заказы

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
  ORDER BY orders.date;
```

:::

---

::: details Решение задачи - Товары с категориями и брендами

```sql
SELECT
  products.id,
  products.name AS name,
  categories.name AS category,
  brands.name AS brand
FROM products
JOIN brands
ON products.brand = brands.id
JOIN categories
ON products.category = categories.id
WHERE products.count > 0
ORDER BY products.price, products.id;
```

:::

---

::: details Решение задачи - Сотрудники компании

```sql
SELECT
  roles.name as role,
  COUNT(users.id) as members
FROM roles
JOIN users_roles ON users_roles.role_id = roles.id
JOIN users ON users.id = users_roles.user_id
GROUP BY role
ORDER BY role;
```

:::

---

::: details Решение задачи - Самые продаваемые товары

```sql
SELECT
  p.id,
  p.name,
  COUNT(p.count) as sold,
  SUM(p.price) as total
FROM products as p
JOIN orders_details as od on p.id = od.product_id
JOIN orders as o on o.id = od.order_id
JOIN users as u on u.id = o.user_id
WHERE
  o.status = 'success'
GROUP BY id
ORDER BY sold desc, total desc
LIMIT 5;
```

:::

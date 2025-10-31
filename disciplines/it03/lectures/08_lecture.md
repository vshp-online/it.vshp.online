# ИТ.03 - 08 - Добавление, обновление и удаление данных: операторы INSERT, UPDATE, DELETE

## Введение

В предыдущих темах мы извлекали и агрегировали данные (SELECT, фильтры, сортировки, группировки). Теперь переходим к модификации данных:

- `INSERT` — добавление новых строк;
- `UPDATE` — изменение существующих строк;
- `DELETE` — удаление строк из таблицы.

Эти операции называют DML (Data Manipulation Language). Они меняют состояние таблиц и по умолчанию не выводят результат на экран. Контекст выполнения — SQLite; необходимые отличия других СУБД отметим по месту.

## Пример таблицы `inventory`

<!-- @include: ./includes/table_inventory_01.md -->

::: note

**Договорённости для примеров.**

- `sku` - уникальный идентификатор товара, при этом не являющийся первичным ключом. Повторяющееся значение даёт ошибку вставки.
- Значения по умолчанию заданы для `amount = 0` и `is_active = 1`;
- `price` допускает значение `NULL` (например если цена на новый товар ещё не была установлена).
- Эти ограничения уже настроены в учебной БД; к синтаксису их создания вернёмся позже.

:::

::: details Код создания таблицы на языке SQL в диалекте SQLite

  ::: play sandbox=sqlite editor=basic id=inventory_01_sqlite.sql
  @[code sql](./includes/inventory_01_sqlite.sql)
  :::

  Скачать код создания таблицы в виде файла можно по ссылке: [inventory_01_sqlite.sql](./includes/inventory_01_sqlite.sql)

:::

::: warning
Операторы `INSERT`, `UPDATE` и `DELETE` **не выводят изменения на экран**. Чтобы убедиться в результате, обычно выполняют `SELECT` **после** модификации.

```sql {#auto_select_after}
-- чтобы видеть значения NULL
.nullvalue 'NULL'

-- здесь может идти код модификации:
##CODE##

-- запрашиваем состояние таблицы ПОСЛЕ внесения изменений
SELECT * FROM inventory;
```

**В наших интерактивных блоках лекций эти запросы будут выполняться автоматически.**
:::

Посмотреть все данные исходной таблицы до каких-либо модификаций мы можем запросом:

::: play sandbox=sqlite editor=basic depends-on=inventory_01_sqlite.sql

```sql
SELECT * FROM inventory;
```

:::

## INSERT — добавление строк

Для добавления новых записей в таблицу предназначен оператор `INSERT`.
Рассмотрим его общую структуру.

```sql
INSERT INTO имя_таблицы [(поле_таблицы, ...)]
-- значения прописанные вручную
VALUES (значение_поля_таблицы, ...)
-- или значения полученные запросом SELECT
SELECT поле_таблицы, ... FROM имя_таблицы ...
```

Значения можно вставлять перечислением с помощью слова `VALUES`, перечислив их в круглых скобках через запятую или c помощью оператора `SELECT`. Добавление записей через `INSERT INTO ... SELECT ...` мы рассмотрим в рамках данного курса позднее, когда научимся работать с несколькими таблицами.

::: tip

Следует помнить, что первичный ключ таблицы является уникальным значением и добавление уже существующего значения приведёт к ошибке, но в большинстве СУБД для решения подобной задачи в автоматическом режиме принято использовать уникальное свойство поля `AUTO_INCREMENT` (в MySQL) или `AUTOINCREMENT` (SQLite). Подробнее их мы разберём в последующих темах.

:::

### Вставка одной строки

::: play sandbox=sqlite editor=basic template="#auto_select_after" depends-on=inventory_01_sqlite.sql id=insert_one.sql

```sql
INSERT INTO inventory (id, sku, title, amount, price, is_active)
VALUES
  (9, 'Z-900', 'Тестовый товар', 2, 1200, 1);
```

:::

### Вставка нескольких строк

::: play sandbox=sqlite editor=basic template="#auto_select_after" depends-on=insert_one.sql id=insert_multiple.sql

```sql
INSERT INTO inventory (id, sku, title, amount, price, is_active)
VALUES
  (10, 'E-030', 'USB-хаб 10 портов', 2, 1990, 1),
  (11, 'E-031', 'USB-хаб 3 порта',   9,  690, 1);
```

:::

### Вставка `NULL`

Если цена неизвестна, мы можем явно передать значение `NULL`.

::: play sandbox=sqlite editor=basic template="#auto_select_after" depends-on=insert_multiple.sql id=insert_null.sql

```sql
INSERT INTO inventory (id, sku, title, amount, price, is_active)
VALUES (12, 'P-002', 'Переходник miniDP→HDMI', 5, NULL, 0);
```

:::

### Значения по-умолчанию

В исходной таблице значения полей `amount` и `is_active` определяются через свойство `DEFAULT`. В дальнейшем мы детально рассмотрим все свойства полей, но сейчас важно лишь то, что при создании таблицы можно задать значения по умолчанию. Если при вставке данных конкретное значение не указано, система автоматически использует значение, определённое в свойстве `DEFAULT`.

Например, `amount = 0` и `is_active = 1` подставятся автоматически, т.к. они заданы по-умолчанию для соответствующих строк.

::: play sandbox=sqlite editor=basic template="#auto_select_after" depends-on=insert_null.sql id=insert_default.sql

```sql
INSERT INTO inventory (id, sku, title)
VALUES (13, 'P-001', 'Переходник microSD');
```

:::

### Обработка конфликтов для уникальных значений

::: tip

Если столбец должен быть уникальным, но не является первичным ключом, используют **ограничение `UNIQUE`** или **уникальный индекс**. `UNIQUE` гарантирует отсутствие дубликатов, но некоторых СУБД допускает единственное `NULL`.

:::

При попытке вставить в таблицу неуникальное значение в поле, определенное при помощи уникального индекса, возникнет ошибка.

::: play sandbox=sqlite editor=basic depends-on=insert_default.sql

```sql
INSERT INTO inventory (id, sku, title, amount, price, is_active)
VALUES (14, 'A-001', 'Дубликат флешки', 1, 800, 1);
```

:::

В таком случае, в SQLite мы можем обработать данную ситуацию несколькими способами, которые рассмотрим дальше в рамках курса, а пока проще всего — «мягко» игнорировать такую ситуацию при помощи `INSERT OR IGNORE`, в таком случае мы не увидим никаких сообщений об ошибке, но и вставить данные очевидно не получится.

::: play sandbox=sqlite editor=basic template="#auto_select_after" depends-on=insert_default.sql

```sql
INSERT OR IGNORE INTO inventory (id, sku, title, amount, price, is_active)
VALUES (14, 'A-001', 'Дубликат флешки', 1, 800, 1);
```

:::

<!-- TODO: UPSERT + REPLACE -->

## UPDATE — изменение строк

Для редактирования существующих записей в таблицах существует SQL оператор `UPDATE`.
Рассмотрим его общую структуру.

```sql
UPDATE имя_таблицы
SET поле_таблицы1 = значение_поля_таблицы1,
    поле_таблицыN = значение_поля_таблицыN
[WHERE условие_выборки]
```

::: tip

В различных СУБД существуют некоторые ограничения на изменения полей, в большинстве из них связка `UPDATE ... SET` не будет работать без `WHERE`. В MySQL по-умолчанию включен т.н. «безопасный режим» или `safe_mode`, который не позволит выполнить запрос обновления без `WHERE`, при этом будет требоваться чтобы одним из условий `WHERE` было ключевое поле. Тем не менее, подобные ограничения отключаемы, но они защищают от случайно обновления лишних данных при неверно написанном запросе. Несмотря на то что в SQLite такого ограничения нет, настоятельно рекомендуется **всегда указывать** после `WHERE` условия, содержащие первичные ключи.

:::

### Точечное обновление по первичному ключу

::: play sandbox=sqlite editor=basic template="#auto_select_after" depends-on=insert_default.sql id=update_id_3.sql

```sql
UPDATE inventory
SET price = 2990,
    amount = 1
WHERE id = 3;
```

:::

### Вычисляемые значения

В запросах на обновление данных можно менять значения, опираясь на предыдущие значения.

::: play sandbox=sqlite editor=basic template="#auto_select_after" depends-on=update_id_3.sql id=update_id_5.sql

```sql
UPDATE inventory
SET price = price * 1.1,
    amount = amount + 2
WHERE id = 5;
```

:::

Разрешается также значения одних столбцов присваивать другим столбцам. Но при этом, естественно, типы столбцов должны быть совместимыми.

### Массовое обновление по условию

Например, если мы хотим скрыть все позиции без остатка.

::: play sandbox=sqlite editor=basic template="#auto_select_after" depends-on=update_id_5.sql id=update_is_active.sql

```sql
UPDATE inventory
SET is_active = 0
WHERE amount = 0;
```

:::

::: warning

В MySQL такая конструкция не сработает из-за требования явно указывать первичные ключи после `WHERE`, однако варианты решения подобной проблемы мы затронем позднее в рамках курса.

:::

## DELETE — удаление строк

Время от времени возникает задача удаления записей из таблицы. Для этого в SQL предусмотрен оператор `DELETE`.

### Удаление конкретной записи по `id`

::: play sandbox=sqlite editor=basic template="#auto_select_after" depends-on=update_is_active.sql id=delete_id_11.sql

```sql
DELETE FROM inventory
WHERE id = 11;
```

:::

### Удаление по условию

Например, если нам нужно удалить скрытые позиции по которым нулевой остаток.

::: play sandbox=sqlite editor=basic template="#auto_select_after" depends-on=delete_id_11.sql id=delete_empty.sql

```sql
DELETE FROM inventory
WHERE
  is_active = 0
    AND
  amount = 0;
```

:::

### Полная очистка таблицы

Если условие отбора записей `WHERE` отсутствует, то будут удалены все записи указанной таблицы.

::: play sandbox=sqlite editor=basic template="#auto_select_after" depends-on=delete_empty.sql

```sql
DELETE FROM inventory;
```

:::

::: warning

С включенным `safe_mode` СУБД MySQL такую операцию выполнить не позволит, сообщив о том что операция небезопасна, и выкинет соответствующую ошибку. При этом, в SQLite всё пройдёт без ошибок, однако `SELECT` ничего не выведет, т.к. таблица пуста.

:::

---

## Практические задания

### Задание 1

::: tabs

@tab Условие

Добавьте в таблицу следующую запись:

| id  | sku   | title          | amount | price | is_active |
|:---:|:-----:|:--------------:|:------:|:-----:|:---------:|
| 101 | T‑100 | Кабель HDMI 2м | 5      | 450   | 1         |

  ::: play sandbox=sqlite editor=basic template="#auto_select_after" depends-on=inventory_01_sqlite.sql

  ```sql
  -- Ваш код можете писать тут


  ```

  :::

@tab Решение

```sql
INSERT INTO inventory (id, sku, title, amount, price, is_active)
VALUES
  (101, 'T‑100', 'Кабель HDMI 2м', 5, 450, 1);
```

:::

### Задание 2

::: tabs

@tab Условие

Добавьте в таблицу следующие запись одним запросом:

| id  | sku   | title                  | amount | price | is_active |
|:---:|:-----:|:----------------------:|:------:|:-----:|:---------:|
| 102 | T‑200 | Адаптер USB-A->USB-C    | 10     | 290  | 1         |
| 103 | T‑201 | Адаптер USB-C->Jack 3.5  | 4     | NULL  | 1        |

  ::: play sandbox=sqlite editor=basic template="#auto_select_after" depends-on=inventory_01_sqlite.sql

  ```sql
  -- Ваш код можете писать тут


  ```

  :::

@tab Решение

```sql
INSERT INTO inventory (id, sku, title, amount, price, is_active)
VALUES
    (102, 'T-200', 'Адаптер USB-A->USB-C', 10, 290, 1),
    (103, 'T-201', 'Адаптер USB-C->Jack 3.5', 4, NULL, 1);
```

:::

### Задание 3

::: tabs

@tab Условие

Для товара с `id = 3` увеличьте цену (`price`) на `50%` и количество (`amount`) на `20`.

  ::: play sandbox=sqlite editor=basic template="#auto_select_after" depends-on=inventory_01_sqlite.sql

  ```sql
  -- Ваш код можете писать тут


  ```

  :::

@tab Решение

```sql
UPDATE inventory
SET price = price * 1.5,
    amount = amount + 20
WHERE id = 3;
```

:::

### Задание 4

::: tabs

@tab Условие

Для всех товаров, которых осталось меньше 10 штук на складе установить `is_active = 0`.

  ::: play sandbox=sqlite editor=basic template="#auto_select_after" depends-on=inventory_01_sqlite.sql

  ```sql
  -- Ваш код можете писать тут


  ```

  :::

@tab Решение

```sql
UPDATE inventory
SET is_active = 0
WHERE amount < 10;
```

:::

### Задание 5

::: tabs

@tab Условие

Удалить товар с артикулом `'X-000'`.

  ::: play sandbox=sqlite editor=basic template="#auto_select_after" depends-on=inventory_01_sqlite.sql

  ```sql
  -- Ваш код можете писать тут


  ```

  :::

@tab Решение

```sql
DELETE FROM inventory
WHERE sku = 'X-000';
```

:::

### Задание 6

::: tabs

@tab Условие

Удалить товары дешевле `1000`, которые закончились на складе.

  ::: play sandbox=sqlite editor=basic template="#auto_select_after" depends-on=inventory_01_sqlite.sql

  ```sql
  -- Ваш код можете писать тут


  ```

  :::

@tab Решение

```sql
DELETE FROM inventory
WHERE
  price < 1000
    AND
  amount < 1
;
```

:::

# ИТ.03 - 13 - Изменение структуры таблиц. Операция `ALTER TABLE`

## Введение

В предыдущих темах мы научились создавать таблицы в базе данных с помощью оператора `CREATE TABLE`. Однако на практике структура таблиц часто нуждается в изменении по мере развития проекта. Например, может потребоваться добавить новые поля, изменить типы существующих данных или удалить ненужные столбцы.

В этой теме мы рассмотрим, как изменять структуру уже существующих таблиц в SQLite с помощью команды `ALTER TABLE`. Мы изучим основные операции, которые можно выполнять с таблицами, и рассмотрим практические примеры на основе созданной нами учебной базы данных.

## Учебная база данных «Библиотека»

::: tabs

@tab Таблицы

  ::: tabs

  @tab books
  <!-- @include: ./includes/library_books_db/books_table.md -->

  @tab authors
  <!-- @include: ./includes/library_books_db/authors_table.md -->

  :::

@tab Описание

  Учебная база данных библиотеки, содержащая информацию о книгах, авторах и связях между ними.

  **Особенности:**

  - содержит разнотипные данные (текстовые, числовые, даты)
  - имеет ограничения целостности (первичные ключи, внешние ключи)
  - демонстрирует связь один-ко-многим (один автор — много книг)
  - подходит для демонстрации различных операций `ALTER TABLE`

@tab Поля и ограничения

  **Поля**

  - **`books`**
    - `id` — целочисленный первичный ключ
    - `title` — название книги (текст)
    - `publication_year` — год издания (целое число)
    - `isbn` — ISBN книги (текст, уникальный)
    - `genre` — жанр книги (текст)
    - `author_id` — ссылка на автора (целое число)
    - `pages` — количество страниц (целое число)
    - `available_copies` — количество доступных экземпляров (целое число, по умолчанию 1)

  - **`authors`**
    - `id` — целочисленный первичный ключ
    - `first_name` — имя автора (текст)
    - `last_name` — фамилия автора (текст)
    - `birth_year` — год рождения (целое число)

  **Ограничения**

  - `books.id`, `authors.id` — первичные ключи
  - `books.isbn` — уникальное значение
  - `books.available_copies` — значение по умолчанию 1
  - `books.author_id` — внешний ключ к `authors.id`

@tab Структура

  @[code mermaid](./includes/library_books_db/library_books.mermaid)

@tab SQL-код

  Скачать в виде файла: [library_books_extended.sql](./includes/library_books_db/library_books_extended.sql)

  ::: play sandbox=sqlite editor=basic id=library_books_extended.sql
  @[code sql:collapsed-lines=10](./includes/library_books_db/library_books_extended.sql)
  :::

:::

## Как смотреть список таблиц

Команда `.tables` в консоли SQLite выводит все таблицы и представления текущей базы. Её удобно запускать перед и после операций `ALTER TABLE` или `DROP TABLE`, чтобы быстро увидеть, как изменилась структура.

::: play sandbox=sqlite editor=basic template="#show_null_and_enable_foreign_keys" depends-on=library_books_extended.sql

```sql
-- Посмотрим, какие таблицы есть в учебной базе
.tables
```

:::

## Команда `ALTER TABLE`

`ALTER TABLE` — это команда SQL, которая позволяет изменять структуру существующей таблицы в базе данных. С её помощью можно:

- добавлять новые столбцы
- удалять существующие столбцы
- изменять типы данных столбцов
- переименовывать столбцы
- переименовывать таблицу

Важно помнить, что изменение структуры таблицы может повлиять на целостность данных, поэтому необходимо тщательно продумывать каждое изменение.

::: info
Впервые команда `ALTER TABLE` появилась в языке SQL в 1992 году как часть стандарта SQL-92. До этого разработчики должны были удалять таблицы и создавать их заново с новой структурой, что было неудобно и опасно для данных.
:::

## Как запускать примеры

Чтобы не повторять служебные команды в каждой демо-вставке, используем единый шаблон подключения к SQLite. Он настраивает вывод `NULL` и включает проверку внешних ключей.

::: warning

```sql {#show_null_and_enable_foreign_keys}
-- включаем явный вывод NULL
.nullvalue 'NULL'

-- включаем проверку внешних ключей
PRAGMA foreign_keys = ON;

-- дальше может идти ваш код
##CODE##
```

:::

- `PRAGMA foreign_keys = ON` действует только в текущем подключении, поэтому команда должна выполняться перед `CREATE TABLE`, `INSERT` и другими примерами.
- `.nullvalue 'NULL'` помогает отличить настоящий `NULL` от пустой строки в текстовом выводе консоли.
- Все интерактивные блоки ниже уже завязаны на шаблон `#show_null_and_enable_foreign_keys`, но в собственных проектах команды следует добавлять вручную.

## Добавление столбца

Чтобы добавить новый столбец в таблицу, используйте следующий синтаксис:

```sql
ALTER TABLE table_name ADD COLUMN column_name data_type [constraints];
```

Обратите внимание, что в SQLite при добавлении столбца используется ключевое слово `COLUMN`, которое не является обязательным, но рекомендуется для лучшей читаемости.

### Пример: добавление столбца с описанием

Предположим, мы хотим добавить в таблицу `books` столбец для хранения краткого описания книги:

::: play sandbox=sqlite editor=basic template="#show_null_and_enable_foreign_keys" depends-on=library_books_extended.sql

```sql
-- Проверим структуру до изменения
PRAGMA table_info(books);

-- Добавим новый столбец
ALTER TABLE books ADD COLUMN description TEXT;

-- Убедимся, что столбец появился
PRAGMA table_info(books);
```

:::

После выполнения этой команды в таблице появится новый столбец `description` типа `TEXT`.

::: tip
При добавлении нового столбца в существующую таблицу, все существующие строки получают значение `NULL` для этого столбца (если не указано другое значение по умолчанию). Это может повлиять на работу приложения, если оно ожидает наличие значения в этом столбце.
:::

### Пример: добавление столбца с ограничениями

Можно также добавлять столбцы с ограничениями. Например, добавим столбец для хранения рейтинга книги (от 1 до 5):

::: play sandbox=sqlite editor=basic template="#show_null_and_enable_foreign_keys" depends-on=library_books_extended.sql

```sql
-- Сравним структуру до изменения
PRAGMA table_info(books);
.schema books

-- Добавим столбец с ограничением
ALTER TABLE books ADD COLUMN rating INTEGER
CHECK (rating >= 1 AND rating <= 5);

-- Проверим актуальную схему
PRAGMA table_info(books);
.schema books
```

:::

::: info
`PRAGMA table_info` показывает столбцы и их типы, но не выводит формулу `CHECK`. Команда `.schema books` печатает полный `CREATE TABLE`, поэтому сразу видно, что ограничение добавлено.
:::

::: warning
В SQLite ограничения `CHECK` применяются только к новым данным. Существующие данные не проверяются на соответствие ограничениям при добавлении столбца с ограничением.
:::

## Переименование таблицы

Для переименования таблицы используется следующий синтаксис:

```sql
ALTER TABLE old_table_name RENAME TO new_table_name;
```

### Пример: переименование таблицы

Если мы хотим переименовать таблицу `books` в `library_books`:

::: play sandbox=sqlite editor=basic template="#show_null_and_enable_foreign_keys" depends-on=library_books_extended.sql

```sql
-- Посмотрим список таблиц до переименования
.tables

-- Выполним переименование
ALTER TABLE books RENAME TO library_books;

-- Убедимся, что новое имя появилось
.tables
```

:::

После выполнения этой команды таблица будет доступна под новым именем `library_books`.

::: note
При переименовании таблицы в SQLite автоматически обновляются все ссылки на эту таблицу в представлениях, триггерах и индексах.
:::

## Переименование столбца

Для переименования столбца используется следующий синтаксис:

```sql
ALTER TABLE table_name RENAME COLUMN old_column_name TO new_column_name;
```

### Пример: переименование столбца

Если мы хотим переименовать столбец `title` в `book_title`:

::: play sandbox=sqlite editor=basic template="#show_null_and_enable_foreign_keys" depends-on=library_books_extended.sql

```sql
-- Фиксируем структуру до переименования столбца
PRAGMA table_info(books);

-- Переименуем столбец
ALTER TABLE books RENAME COLUMN title TO book_title;

-- Проверим результат
PRAGMA table_info(books);
```

:::

::: info
Возможность переименования столбцов в SQLite появилась в версии 3.25.0 (2018 год). В более ранних версиях это можно было сделать только через сложные обходные пути.
:::

## Удаление столбца

Удаление столбца выполняется тем же оператором `ALTER TABLE`, что и другие операции изменения структуры таблицы:

```sql
ALTER TABLE table_name DROP COLUMN column_name;
```

### Пример: удаление столбца

Если мы хотим удалить столбец `publication_year` из таблицы `books`:

::: play sandbox=sqlite editor=basic template="#show_null_and_enable_foreign_keys" depends-on=library_books_extended.sql

```sql
-- Снимем структуру до удаления столбца
PRAGMA table_info(books);

-- Удалим столбец
ALTER TABLE books DROP COLUMN publication_year;

-- Убедимся, что столбца больше нет
PRAGMA table_info(books);
```

:::

::: info
Поддержка `ALTER TABLE ... DROP COLUMN` появилась в SQLite 3.35.0 (2021 год). Если вы работаете с очень старой версией, проверьте документацию — раньше приходилось пересоздавать таблицу вручную.
:::

::: danger
Удаление столбца необратимо! Все данные в этом столбце будут безвозвратно потеряны. Перед выполнением такой операции рекомендуется создать резервную копию базы данных.
:::

## Ограничения SQLite при работе с ALTER TABLE

SQLite имеет некоторые ограничения при работе с командой `ALTER TABLE` по сравнению с другими СУБД:

1. **Невозможно изменить тип данных существующего столбца** напрямую
2. **Невозможно добавить ограничения** к существующим столбцам
3. **Невозможно удалить ограничения** из существующих столбцов

Для выполнения этих операций в SQLite необходимо использовать обходные пути, которые мы рассмотрим ниже.

::: info
Эти ограничения связаны с архитектурой SQLite, которая использует динамическую типизацию и не хранит строгую схему таблиц в том же виде, что и другие СУБД.
:::

## Обходные пути для ограничений SQLite

### Изменение типа данных столбца

Для изменения типа данных столбца в SQLite необходимо:

1. Создать новую таблицу с нужной структурой
2. Скопировать данные из старой таблицы в новую
3. Удалить старую таблицу
4. Переименовать новую таблицу
5. При необходимости пересоздать зависимости (например, индексы, триггеры или представления), которые ссылались на исходную таблицу

### Пример: изменение типа данных

Предположим, мы хотим хранить не только числовой год издания, но и текстовые пометки вроде «не позднее 1850» или полную ISO‑дату (`2024-09-12`). Создадим новое текстовое поле `published`, в которое перенесём прежние значения `publication_year`:

::: play sandbox=sqlite editor=basic template="#show_null_and_enable_foreign_keys" depends-on=library_books_extended.sql

```sql
-- Базовая структура исходной таблицы
PRAGMA table_info(books);

-- 1. Создаём новую таблицу с нужной структурой
CREATE TABLE books_new (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  published TEXT,
  isbn TEXT UNIQUE,
  genre TEXT,
  author_id INTEGER NOT NULL,
  pages INTEGER,
  available_copies INTEGER DEFAULT 1,
  FOREIGN KEY (author_id) REFERENCES authors(id)
);

-- 2. Копируем данные, преобразуя тип
INSERT INTO books_new SELECT
  id, title, CAST(publication_year AS TEXT), isbn, genre,
  author_id, pages, available_copies
FROM books;

-- 3. Удаляем старую таблицу
DROP TABLE books;

-- 4. Переименовываем новую таблицу
ALTER TABLE books_new RENAME TO books;

-- Подтверждаем структуру обновленной таблицы
PRAGMA table_info(books);

-- Добавляем книгу с текстовой пометкой вместо года
INSERT INTO books (id, title, published, isbn, genre, author_id, pages, available_copies)
VALUES (10, 'Старинная рукопись', 'не позднее 1850', '978-5-17-099999-7', 'Рукопись', 4, 180, 1);

-- Проверяем, что новое поле сохраняет текст
SELECT title, published FROM books;
```

:::

::: info
В коде выше появляются две новые конструкции:

- `INSERT INTO ... SELECT ...` — переносит данные из старой таблицы в новую. Дальше по тексту есть отдельный раздел, где разбираем синтаксис и простую демо-схему.
- `CAST(publication_year AS TEXT)` — явное приведение типов при вставке. Оно нужно, чтобы «старые» целые числа корректно попали в новый текстовый столбец и не нарушили ограничения.
:::

::: tip
При использовании обходных путей для изменения структуры таблицы важно учитывать все зависимости (индексы, триггеры, представления), которые могут ссылаться на изменяемую таблицу.
:::

## Вставка через `INSERT INTO ... SELECT ...`

Чтобы массово скопировать данные между таблицами, SQLite позволяет выбрать строки и сразу вставить их в другую таблицу. Это избавляет от циклов и удобен при перестройке схемы.

```sql
INSERT INTO новая_таблица (список_столбцов)
SELECT выражения_или_столбцы
FROM старая_таблица
WHERE условия;
```

Такая запись читается как «вставь в новую таблицу результаты запроса».

Внутри `SELECT` можно:

- перечислить столбцы 1:1;
- вычислять новые значения (например, при помощи различных функций или математических выражений);
- фильтровать строки через `WHERE`, чтобы переносить только часть данных.

Ниже — практическая демонстрация, в которой мы переносим список сотрудников и на лету формируем двухбуквенный код страны.

::: play sandbox=sqlite editor=basic template="#show_null_and_enable_foreign_keys"

```sql
-- создаём таблицу-источник
CREATE TABLE employees_src (id INTEGER PRIMARY KEY, full_name TEXT, country TEXT);
INSERT INTO employees_src VALUES
  (1, 'Анна Иванова', 'Russia'),
  (2, 'Эльчин Сафаралиев', 'Azerbaijan');

-- создаём новую таблицу с дополнительным столбцом
CREATE TABLE employees_dst (
  id INTEGER PRIMARY KEY,
  full_name TEXT,
  country TEXT,
  country_code TEXT
);

-- переносим данные и сразу вычисляем новое поле
INSERT INTO employees_dst (id, full_name, country, country_code)
SELECT id, full_name, country, UPPER(SUBSTR(country, 1, 2))
FROM employees_src;

SELECT * FROM employees_dst;
```

:::

::: info
В блоке выше мы пользуемся базовыми текстовыми функциями SQLite:

- `SUBSTR(строка, начало, длина)` возвращает подстроку; `SUBSTR(country, 1, 2)` берёт первые две буквы страны.
- `UPPER(строка)` переводит строку в верхний регистр. В комбинации `UPPER(SUBSTR(...))` получаем код наподобие `RU`, `AZ`.
:::

### Изменение поведения внешнего ключа

В SQLite нельзя «переключить» `ON DELETE`/`ON UPDATE` у существующего внешнего ключа. Чтобы, например, включить каскадное удаление для столбца `books.author_id`, придётся пересоздать таблицу. Шаги похожи на предыдущий пример:

1. сохранить данные и удалить таблицу `books`;
2. создать структуру заново с нужными параметрами внешнего ключа;
3. вернуть данные в обновлённую таблицу.

::: play sandbox=sqlite editor=basic template="#show_null_and_enable_foreign_keys" depends-on=library_books_extended.sql

```sql
-- Посмотрим текущее поведение внешнего ключа
PRAGMA foreign_key_list('books');

-- 1. Сохраняем данные и удаляем исходную таблицу
CREATE TABLE books_backup AS SELECT * FROM books;
DROP TABLE books;

-- 2. Создаём таблицу заново, добавляя ON DELETE CASCADE / ON UPDATE CASCADE
CREATE TABLE books (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  publication_year INTEGER,
  isbn TEXT UNIQUE,
  genre TEXT,
  author_id INTEGER NOT NULL,
  pages INTEGER,
  available_copies INTEGER DEFAULT 1,
  FOREIGN KEY (author_id) REFERENCES authors(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
);

-- 3. Возвращаем данные
INSERT INTO books SELECT * FROM books_backup;
DROP TABLE books_backup;

-- Проверяем, что поведение обновилось
PRAGMA foreign_key_list('books');
```

:::

::: note
Важно помнить, что изменения структуры таблиц могут повлиять на производительность базы данных, особенно при работе с большими объемами данных. Поэтому такие операции лучше выполнять в периоды минимальной нагрузки на систему.
:::

## Самопроверка

::: quiz source=./includes/quiz-13.yaml
:::

## Практические задания

### Задание 1. Добавление нового столбца

::: tabs

@tab Условие

Добавьте в таблицу `books` столбец `language` типа `TEXT` со значением по умолчанию `'ru'`, чтобы фиксировать язык издания.

  ::: play sandbox=sqlite editor=basic template="#show_null_and_enable_foreign_keys" depends-on=library_books_extended.sql

  ```sql
  -- Проверим текущую структуру таблицы
  PRAGMA table_info(books);

  -- Ваш код можете писать тут
  -- CODE --

  -- Проверим структуру таблицы после изменений
  PRAGMA table_info(books);
  ```

  :::

@tab Решение

```sql
ALTER TABLE books ADD COLUMN language TEXT DEFAULT 'ru';
```

:::

### Задание 2. Переименование столбца

::: tabs

@tab Условие

Переименуйте столбец `pages` в `page_count`.

  ::: play sandbox=sqlite editor=basic template="#show_null_and_enable_foreign_keys" depends-on=library_books_extended.sql

  ```sql
  -- Проверим текущую структуру таблицы
  PRAGMA table_info(books);

  -- Ваш код можете писать тут
  -- CODE --

  -- Проверим структуру таблицы после изменений
  PRAGMA table_info(books);
  ```

  :::

@tab Решение

```sql
ALTER TABLE books RENAME COLUMN pages TO page_count;
```

:::

### Задание 3. Добавление столбца с ограничениями

::: tabs

@tab Условие

Добавьте в таблицу `authors` столбец `awards_count` типа `INTEGER` со значением по умолчанию `0` и ограничением, что число наград не может быть отрицательным.

  ::: play sandbox=sqlite editor=basic template="#show_null_and_enable_foreign_keys" depends-on=library_books_extended.sql

  ```sql
  -- Проверим текущую структуру таблицы
  .schema authors

  -- Ваш код можете писать тут
  -- CODE --

  -- Проверим структуру таблицы после изменений
  .schema authors
  ```

  :::

@tab Решение

```sql
ALTER TABLE authors ADD COLUMN awards_count INTEGER DEFAULT 0 CHECK (awards_count >= 0);
```

:::

### Задание 4. Переименование таблицы

::: tabs

@tab Условие

Переименуйте таблицу `authors` в `writers`.

После переименования `PRAGMA foreign_key_list('books')` должен показать таблицу `writers` во втором столбце `table`, что подтверждает корректную работу внешнего ключа.

  ::: play sandbox=sqlite editor=basic template="#show_null_and_enable_foreign_keys" depends-on=library_books_extended.sql

  ```sql
  -- Проверим список таблиц до изменений
  .tables

  -- Убедимся, что книги ссылаются на authors
  PRAGMA foreign_key_list('books');

  -- Ваш код можете писать тут
  -- CODE --

  -- Проверим список таблиц после изменений
  .tables

  -- Убедимся, что внешний ключ теперь указывает на writers
  PRAGMA foreign_key_list('books');
  ```

  :::

@tab Решение

```sql
ALTER TABLE authors RENAME TO writers;
```

:::

### Задание 5. Удаление столбца

::: tabs

@tab Условие

Удалите из таблицы `books` столбец `pages`. После операции столбца быть не должно.

  ::: play sandbox=sqlite editor=basic template="#show_null_and_enable_foreign_keys" depends-on=library_books_extended.sql

  ```sql
  -- Проверим структуру таблицы до изменений
  PRAGMA table_info(books);

  -- Ваш код можете писать тут
  -- CODE --

  -- Проверим, что столбца больше нет
  PRAGMA table_info(books);
  ```

  :::

@tab Решение

```sql
ALTER TABLE books DROP COLUMN pages;
```

:::

### Задание 6. Пересоздание таблицы с новым типом столбца

::: tabs

@tab Условие

Переведите столбец `available_copies` в текстовый формат и переименуйте его в `stock_note`, чтобы можно было хранить пометки вроде «нет на складе» или «ожидаем поставку».

  ::: play sandbox=sqlite editor=basic template="#show_null_and_enable_foreign_keys" depends-on=library_books_extended.sql

  ```sql
  -- Зафиксируем текущую структуру
  PRAGMA table_info(books);

  -- Ваш код можете писать тут
  -- CODE --

  -- Добавим пометку к одной книге
  INSERT INTO books (id, title, publication_year, isbn, genre, author_id, pages, stock_note)
  VALUES (20, 'Новая поставка', 2024, '978-5-17-012345-6', 'Современная проза', 3, 320, 'ожидаем поставку');

  -- Проверим обновлённую схему
  PRAGMA table_info(books);
  SELECT title, stock_note FROM books;
  ```

  :::

@tab Решение

```sql
CREATE TABLE books_new (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  publication_year INTEGER,
  isbn TEXT UNIQUE,
  genre TEXT,
  author_id INTEGER NOT NULL,
  pages INTEGER,
  stock_note TEXT,
  FOREIGN KEY (author_id) REFERENCES authors(id)
);

INSERT INTO books_new SELECT
  id, title, publication_year, isbn, genre,
  author_id, pages, CAST(available_copies AS TEXT)
FROM books;

DROP TABLE books;
ALTER TABLE books_new RENAME TO books;
```

:::

### Задание 7. Изменение поведения внешнего ключа

::: tabs

@tab Условие

Пересоздайте таблицу `books`, чтобы внешний ключ `author_id` использовал `ON DELETE SET NULL ON UPDATE CASCADE` (придётся временно разрешить `NULL` в столбце).

  ::: play sandbox=sqlite editor=basic template="#show_null_and_enable_foreign_keys" depends-on=library_books_extended.sql

  ```sql
  -- Посмотрим текущее поведение
  PRAGMA foreign_key_list('books');

  -- Ваш код можете писать тут
  -- CODE --

  -- Проверим, что каскад добавлен
  PRAGMA foreign_key_list('books');

  -- Добавьте временного автора и книгу, чтобы проверить ON DELETE SET NULL
  -- CODE (INSERT INTO authors ...)
  -- CODE (INSERT INTO books ...)

  -- Удалите автора и убедитесь, что ссылка обнулилась
  -- CODE (DELETE FROM authors ...)
  SELECT id, title, author_id FROM books WHERE id = <id_вашей_книги>;
  ```

  :::

@tab Решение

```sql
CREATE TABLE books_backup AS SELECT * FROM books;
DROP TABLE books;

CREATE TABLE books (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  publication_year INTEGER,
  isbn TEXT UNIQUE,
  genre TEXT,
  author_id INTEGER,
  pages INTEGER,
  available_copies INTEGER DEFAULT 1,
  FOREIGN KEY (author_id) REFERENCES authors(id)
    ON DELETE SET NULL
    ON UPDATE CASCADE
);

INSERT INTO books SELECT * FROM books_backup;
DROP TABLE books_backup;

-- Проверим поведение: создадим временного автора и книгу
INSERT INTO authors (id, first_name, last_name, birth_year)
VALUES (99, 'Тестовый', 'Автор', 1900);

INSERT INTO books (id, title, publication_year, isbn, genre, author_id, pages, available_copies)
VALUES (99, 'Тестовая книга', 2023, '978-5-17-012346-3', 'Эксперимент', 99, 200, 1);

-- Удаляем автора и смотрим, как `author_id` обнуляется
DELETE FROM authors WHERE id = 99;
SELECT id, title, author_id FROM books WHERE id = 99;

-- Убираем тестовую запись, чтобы не засорять данные
DELETE FROM books WHERE id = 99;
```

:::

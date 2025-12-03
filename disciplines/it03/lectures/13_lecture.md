# ИТ.03 - 13 - Изменение структуры таблиц. Операция `ALTER TABLE`

## Введение

В предыдущих темах мы научились создавать таблицы в базе данных с помощью оператора `CREATE TABLE`. Однако на практике структура таблиц часто нуждается в изменении по мере развития проекта. Например, может потребоваться добавить новые поля, изменить типы существующих данных или удалить ненужные столбцы.

В этой теме мы рассмотрим, как изменять структуру уже существующих таблиц в SQLite с помощью команды `ALTER TABLE`. Мы изучим основные операции, которые можно выполнять с таблицами, и рассмотрим практические примеры на основе созданной нами учебной базы данных.

## Как запускать примеры

Все интерактивные блоки в лекции используют единый шаблон. Он включает две обязательные настройки:

- `.nullvalue 'NULL'` — делает вывод `NULL` явным, чтобы отличать его от пустой строки;
- `PRAGMA foreign_keys = ON` — включает проверку внешних ключей для текущего подключения.

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

## Как смотреть список таблиц

Команда `.tables` в консоли SQLite выводит все таблицы и представления текущей базы. Её удобно запускать перед и после операций `ALTER TABLE` или `DROP TABLE`, чтобы быстро увидеть, как изменилась структура.

::: play sandbox=sqlite editor=basic template="#show_null_and_enable_foreign_keys" depends-on=library_books_extended.sql
```sql
-- Посмотрим, какие таблицы есть в учебной базе
.tables
```
:::

::: tip
Полноценное удаление таблиц мы разбираем в лекции **ИТ.03-09**. В интерактивных примерах ниже мы тоже используем `.tables`, чтобы визуально отслеживать, какие объекты остались в базе.
:::

## Учебная база данных «Библиотека»

::: tabs

@tab Таблицы

  ::: tabs

  @tab books
  <!-- @include: ./includes/library_books_db/books_table.md -->

  @tab authors
  <!-- @include: ./includes/library_books_db/authors_table.md -->

  @tab book_authors
  <!-- @include: ./includes/library_books_db/book_authors_table.md -->

  :::

@tab Описание

  Учебная база данных библиотеки, содержащая информацию о книгах, авторах и связях между ними.

  **Особенности:**

  - содержит разнотипные данные (текстовые, числовые, даты)
  - имеет ограничения целостности (первичные ключи, внешние ключи)
  - демонстрирует связи многие-ко-многим
  - подходит для демонстрации различных операций `ALTER TABLE`

@tab Поля и ограничения

  **Поля**

  - **`books`**
    - `id` — целочисленный первичный ключ
    - `title` — название книги (текст)
    - `publication_year` — год издания (целое число)
    - `isbn` — ISBN книги (текст, уникальный)
    - `genre` — жанр книги (текст)
    - `pages` — количество страниц (целое число)
    - `available_copies` — количество доступных экземпляров (целое число, по умолчанию 1)

  - **`authors`**
    - `id` — целочисленный первичный ключ
    - `first_name` — имя автора (текст)
    - `last_name` — фамилия автора (текст)
    - `birth_year` — год рождения (целое число)
    - `nationality` — национальность (текст)

  - **`book_authors`**
    - `book_id` — внешний ключ к таблице books
    - `author_id` — внешний ключ к таблице authors

  **Ограничения**

  - `books.id`, `authors.id` — первичные ключи
  - `books.isbn` — уникальное значение
  - `books.available_copies` — значение по умолчанию 1
  - `book_authors.book_id` — внешний ключ к `books.id`
  - `book_authors.author_id` — внешний ключ к `authors.id`

@tab Структура

  @[code mermaid](./includes/library_books_db/library_books.mermaid)

@tab SQL-код

  Скачать в виде файла: [library_books_extended.sql](./includes/library_books_db/library_books_extended.sql)

  ::: play sandbox=sqlite editor=basic id=library_books_extended.sql
  @[code sql:collapsed-lines=10](./includes/library_books_db/library_books_extended.sql)
  :::

:::

## Команда `ALTER TABLE`

`ALTER TABLE` — это команда SQL, которая позволяет изменять структуру существующей таблицы в базе данных. С её помощью можно:

- добавлять новые столбцы
- удалять существующие столбцы
- изменять типы данных столбцов
- переименовывать столбцы
- переименовывать таблицу

Важно помнить, что изменение структуры таблицы может повлиять на целостность данных, поэтому необходимо тщательно продумывать каждое изменение.

::: info Фактоид
Впервые команда `ALTER TABLE` появилась в языке SQL в 1992 году как часть стандарта SQL-92. До этого разработчики должны были удалять таблицы и создавать их заново с новой структурой, что было неудобно и опасно для данных.
:::

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

После выполнения этой команды в таблице появится новый столбец `description` типа `TEXT`. Все существующие записи в таблице получат значение `NULL` для этого нового столбца.

::: tip
При добавлении нового столбца в существующую таблицу, все существующие строки получают значение `NULL` для этого столбца (если не указано другое значение по умолчанию). Это может повлиять на работу приложения, если оно ожидает наличие значения в этом столбце.
:::

### Пример: добавление столбца с ограничениями

Можно также добавлять столбцы с ограничениями. Например, добавим столбец для хранения рейтинга книги (от 1 до 5):

::: play sandbox=sqlite editor=basic template="#show_null_and_enable_foreign_keys" depends-on=library_books_extended.sql
```sql
-- Сравним структуру до изменения
PRAGMA table_info(books);

-- Добавим столбец с ограничением
ALTER TABLE books ADD COLUMN rating INTEGER CHECK (rating >= 1 AND rating <= 5);

-- Проверим актуальную схему
PRAGMA table_info(books);
```
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

В SQLite удаление столбцов поддерживается только начиная с версии 3.35.0. Если ваша версия SQLite поддерживает эту функцию, используется следующий синтаксис:

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

Обратите внимание, что удаление столбца приведет к безвозвратной потере всех данных из этого столбца.

::: danger
Удаление столбца необратимо! Все данные в этом столбце будут безвозвратно потеряны. Перед выполнением такой операции рекомендуется создать резервную копию базы данных.
:::

## Ограничения SQLite при работе с ALTER TABLE

SQLite имеет некоторые ограничения при работе с командой `ALTER TABLE` по сравнению с другими СУБД:

1. **Невозможно изменить тип данных существующего столбца** напрямую
2. **Невозможно удалить столбец** в более старых версиях SQLite
3. **Невозможно добавить ограничения** к существующим столбцам
4. **Невозможно удалить ограничения** из существующих столбцов

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
5. При необходимости пересоздать зависимости (например, таблицы-связки или индексы), которые ссылались на исходную таблицу

В демонстрации ниже появятся два новых приёма:

- `INSERT INTO ... SELECT ...` — позволяет массово перенести данные из одной таблицы в другую без дополнительного кода;
- `CAST(<выражение> AS TEXT)` — временно меняет тип значения, чтобы вставить его в столбец другого типа.

Мы используем их только в рамках примера. Обратите внимание на комментарии в коде: каждый шаг расписан отдельно, чтобы вы могли повторить процедуру вручную.

### Пример: изменение типа данных

Если мы хотим изменить тип столбца `pages` с `INTEGER` на `TEXT`:

::: play sandbox=sqlite editor=basic template="#show_null_and_enable_foreign_keys" depends-on=library_books_extended.sql
```sql
-- Базовая структура исходной таблицы
PRAGMA table_info(books);

-- 1. Сохраняем данные таблицы-связки и удаляем её (иначе DROP TABLE books вызовет ошибку)
CREATE TABLE book_authors_backup AS SELECT * FROM book_authors;
DROP TABLE book_authors;

-- 2. Создаем новую таблицу с нужной структурой
CREATE TABLE books_new (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  publication_year INTEGER,
  isbn TEXT UNIQUE,
  genre TEXT,
  pages TEXT,
  available_copies INTEGER DEFAULT 1
);

-- 3. Копируем данные, преобразуя тип
INSERT INTO books_new SELECT
  id, title, publication_year, isbn, genre,
  CAST(pages AS TEXT), available_copies
FROM books;

-- 4. Удаляем старую таблицу
DROP TABLE books;

-- 5. Переименовываем новую таблицу
ALTER TABLE books_new RENAME TO books;

-- 6. Пересоздаем таблицу-связку и возвращаем данные
CREATE TABLE book_authors (
  book_id INTEGER,
  author_id INTEGER,
  FOREIGN KEY (book_id) REFERENCES books(id),
  FOREIGN KEY (author_id) REFERENCES authors(id)
);

INSERT INTO book_authors SELECT * FROM book_authors_backup;
DROP TABLE book_authors_backup;

-- Подтверждаем структуру обновленной таблицы
PRAGMA table_info(books);
```
:::

::: tip
При использовании обходных путей для изменения структуры таблицы важно учитывать все зависимости (индексы, триггеры, представления), которые могут ссылаться на изменяемую таблицу.
:::

## Реальные примеры использования ALTER TABLE

В реальных проектах команда `ALTER TABLE` используется довольно часто. Рассмотрим несколько примеров из практики:

### Пример 1: Добавление нового поля в интернет-магазине

Когда интернет-магазин решает начать отслеживать рейтинг товаров, необходимо добавить соответствующее поле:

::: play sandbox=sqlite editor=basic template="#show_null_and_enable_foreign_keys" depends-on=library_books_extended.sql
```sql
-- Снимем структуру до изменения
PRAGMA table_info(books);

-- Добавим новый столбец
ALTER TABLE books ADD COLUMN rating REAL DEFAULT 0.0;

-- Посмотрим на схему после изменения
PRAGMA table_info(books);
```
:::

### Пример 2: Переименование поля при рефакторинге

При рефакторинге кода может потребоваться изменить названия полей для лучшей читаемости:

::: play sandbox=sqlite editor=basic template="#show_null_and_enable_foreign_keys" depends-on=library_books_extended.sql
```sql
-- Проверим схему таблицы
PRAGMA table_info(books);

-- Изменим название столбца
ALTER TABLE books RENAME COLUMN title TO book_title;

-- Убедимся, что название обновилось
PRAGMA table_info(books);
```
:::

### Пример 3: Удаление устаревшего поля

Когда какая-то функциональность устаревает, соответствующие поля можно удалить:

::: play sandbox=sqlite editor=basic template="#show_null_and_enable_foreign_keys" depends-on=library_books_extended.sql
```sql
-- Текущее состояние таблицы
PRAGMA table_info(books);

-- Удалим столбец
ALTER TABLE books DROP COLUMN publication_year;

-- Проверим, что столбец пропал
PRAGMA table_info(books);
```
:::

### Пример 4: Проверка структуры таблицы

Перед и после изменения структуры таблицы полезно проверять её структуру с помощью команды `PRAGMA table_info`:

::: play sandbox=sqlite editor=basic template="#show_null_and_enable_foreign_keys" depends-on=library_books_extended.sql
```sql
-- Проверим структуру таблицы books до изменений
PRAGMA table_info(books);

-- Добавим новый столбец
ALTER TABLE books ADD COLUMN publisher TEXT;

-- Проверим структуру таблицы books после изменений
PRAGMA table_info(books);
```

:::

::: note
Важно помнить, что изменения структуры таблиц могут повлиять на производительность базы данных, особенно при работе с большими объемами данных. Поэтому такие операции лучше выполнять в периоды минимальной нагрузки на систему.
:::

## Практические задания

### Задание 1. Добавление нового столбца

::: tabs

@tab Условие

Добавьте в таблицу `books` столбец `publisher` типа `TEXT` для хранения названия издательства.

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
ALTER TABLE books ADD COLUMN publisher TEXT;
```

:::

:::

### Задание 2. Переименование столбца

::: tabs

@tab Условие

Переименуйте столбец `available_copies` в `stock_quantity`.

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
ALTER TABLE books RENAME COLUMN available_copies TO stock_quantity;
```

:::

### Задание 3. Добавление столбца с ограничениями

::: tabs

@tab Условие

Добавьте в таблицу `books` столбец `price` типа `REAL` с ограничением, что цена должна быть больше 0.

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
ALTER TABLE books ADD COLUMN price REAL CHECK (price > 0);
```

:::


### Задание 4. Переименование таблицы

::: tabs

@tab Условие

Переименуйте таблицу `books` в `library_collection`.

  ::: play sandbox=sqlite editor=basic template="#show_null_and_enable_foreign_keys" depends-on=library_books_extended.sql

  ```sql
  -- Проверим список таблиц до изменений
  .tables

  -- Ваш код можете писать тут
  -- CODE --

  -- Проверим список таблиц после изменений
  .tables
  ```

  :::

@tab Решение

```sql
ALTER TABLE books RENAME TO library_collection;
```

:::

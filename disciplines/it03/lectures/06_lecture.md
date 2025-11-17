# ИТ.03 - 06 - Особый тип данных NULL. Операторы LIKE, ORDER BY, LIMIT

## Введение

В предыдущих темах мы научились выбирать и фильтровать данные при помощи SQL-запросов.

Сегодня разберём **ещё несколько важных инструментов**, которые позволяют гибко управлять выборкой: поиск по шаблону (`LIKE`), сортировку (`ORDER BY`), ограничение количества строк (`LIMIT`), а также познакомимся с особым значением — `NULL`.

## Учебная база данных «Digital Agency Employees»

::: tabs

@tab Таблицы

  ::: tabs

  @tab employees
  <!-- @include: ./includes/digital_agency_employees_db/employees_table.md -->

  :::

@tab Описание

  Учебный справочник сотрудников цифрового агентства: помогает исследовать `NULL`, текстовые фильтры и сортировки.

  **Особенности:**

  - многие записи имеют отсутствующие e-mail или бонусы;
  - сочетание разных регистров и отделов подчёркивает работу `LIKE`;
  - подходит для демонстрации `ORDER BY`, `LIMIT` и настройки `.nullvalue`.

@tab Поля и ограничения

  **Поля**

  - **`employees`**
    - `id` — целочисленный первичный ключ;
    - `first_name`, `last_name` — имя и фамилия сотрудника;
    - `salary` — оклад в рублях;
    - `job_title` — должность;
    - `email` — рабочий адрес;
    - `bonus` — доплаты или комментарии по премии;
    - `gender` — обозначение пола;
    - `department` — название отдела.

  **Ограничения**

  - Гарантированно заполнены только `id`, `first_name`, `last_name` и `job_title`;
  - поля `email`, `bonus`, `gender`, `department` позволяют демонстрировать `NULL`.

@tab Структура

  @[code mermaid](./includes/digital_agency_employees_db/digital_agency_employees.mermaid)

@tab SQL-код

  Скачать в виде файла: [digital_agency_employees_sqlite.sql](./includes/digital_agency_employees_db/digital_agency_employees_sqlite.sql)

  ::: play sandbox=sqlite editor=basic id=digital_agency_employees_sqlite.sql
  @[code sql:collapsed-lines=10](./includes/digital_agency_employees_db/digital_agency_employees_sqlite.sql)
  :::

:::

## Что такое NULL

В SQL значение `NULL` означает **отсутствие данных**.

Это не ноль, не пустая строка и не пробел — это именно **неизвестное значение**.

Чтобы работать с `NULL`, используются **специальные операторы**:

| Оператор      | Назначение                           |
| ------------- | ------------------------------------ |
| `IS NULL`     | Проверяет, что значение отсутствует  |
| `IS NOT NULL` | Проверяет, что значение присутствует |

::: warning

Обратите внимание, что сравнение `column = NULL` **не работает**, потому что `NULL` не считается ни равным, ни неравным чему-либо.

:::

::: note

В стандарте SQL существует также оператор **эквивалентности** `<=>`, который сравнивает значения с учётом `NULL`. В отличие от обычного оператора `=`, он возвращает `1` (`TRUE`), если **оба операнда `NULL`**, и `0` (`FALSE`) — если только один из них `NULL`.

Пример:

```sql
SELECT NULL = NULL;    -- Результат: NULL
SELECT NULL <=> NULL;  -- Результат: 1 (TRUE)
```

Оператор `<=>` чаще встречается в MySQL и используется там, где нужно точно учитывать случаи отсутствия значения.

В SQLite такого оператора нет, поэтому там можно использовать `IS` / `IS NOT`:

  ::: play sandbox=sqlite editor=basic template="#show_null"

  ```sql
  SELECT NULL IS NULL;      -- Результат: 1 (TRUE)
  SELECT NULL IS NOT NULL;  -- Результат: 0 (FALSE)
  ```

  :::

В SQLite выражения `IS NULL` и `IS NOT NULL` надёжно определяют, является ли поле пустым (`NULL`) или нет, в отличие от обычного `=`/`!=`.

:::

## Работа с NULL

::: warning

По умолчанию в консоли SQLite **`NULL` отображается как пустая ячейка**, из-за чего его легко спутать с пустой строкой (`''`).

Чтобы явно видеть `NULL` в результатах, в интерактивной среде укажите маркер для вывода:

```sql {#show_null}
-- в интерактивной консоли:
.nullvalue 'NULL'

-- дальше может идти ваш код:
##CODE##
```

После этого `NULL` будет печататься именно словом `NULL`, а пустые строки останутся пустыми — их станет легко различить визуально.

**В наших интерактивных блоках лекций эта настройка уже включена.**

:::

Выведем всех сотрудников, у которых не указана электронная почта:

::: play sandbox=sqlite editor=basic template="#show_null" depends-on=digital_agency_employees_sqlite.sql

```sql
SELECT first_name, last_name, email
FROM employees
WHERE email IS NULL;
```

:::

**Результат:**
Показаны только те сотрудники, у которых значение `email` отсутствует.

А теперь наоборот — сотрудники, у которых почта **указана**:

::: play sandbox=sqlite editor=basic template="#show_null" depends-on=digital_agency_employees_sqlite.sql

```sql
SELECT first_name, last_name, email
FROM employees
WHERE email IS NOT NULL;
```

:::

**Результат:**
Показаны только сотрудники с заполненным полем `email`.

## Поиск по шаблону (оператор LIKE)

Оператор **`LIKE`** используется для поиска строк, которые **соответствуют заданному шаблону**.

| Символ | Значение                          |
| ------ | --------------------------------- |
| `%`    | Любая последовательность символов |
| `_`    | Один любой символ                 |

Например, у нас есть таблица `employees`, в которой у каждого сотрудника есть поле `email`. Допустим, мы хотим найти всех пользователей, чьи почтовые ящики находятся на домене компании `company`. Т.е. нужно отобрать только те записи, что отвечают условию:

- после символа `@` следует `company`
- после `company` следует символ «.» и далее любая последовательность символов (т.к. есть и другие доменные зоны кроме `ru`)

Для таких нетривиальных поисков по строковым полям и нужен оператор `LIKE`.

::: play sandbox=sqlite editor=basic depends-on=digital_agency_employees_sqlite.sql

```sql
SELECT first_name, last_name, email
FROM employees
WHERE email LIKE '%@company.%';
```

:::

**Результат:**
Все пользователи, чьи почтовые ящики находятся на домене компании `company`.

::: info

В **MySQL** оператор `LIKE` **не чувствителен к регистру** (запрос `'а%'` найдёт и `Анна`, и `анна`), но в **SQLite** — оператор `LIKE` **чувствителен к регистру**, поэтому запрос:

  ::: play sandbox=sqlite editor=basic depends-on=digital_agency_employees_sqlite.sql

  ```sql
  SELECT first_name
  FROM employees
  WHERE first_name LIKE 'а%';
  ```

  :::

найдёт только имена, начинающиеся с маленькой буквы «а», например «алина» но не найдёт «Александр» или «Алена».

Если нужно найти значения и с прописной, и со строчной буквы, можно сразу указать оба варианта через `OR`:

  ::: play sandbox=sqlite editor=basic depends-on=digital_agency_employees_sqlite.sql

  ```sql
  SELECT first_name
  FROM employees
  WHERE
    first_name LIKE 'А%'
      OR
    first_name LIKE 'а%'
  ;
  ```

  :::

Таким образом найдутся все имена, начинающиеся как с маленькой буквы «а», так и с большой «А»: «алина», «Александр» и «Алена».

:::

Вывести сотрудников, чьи имена **содержат букву «а»**:

::: play sandbox=sqlite editor=basic depends-on=digital_agency_employees_sqlite.sql

```sql
SELECT first_name
FROM employees
WHERE first_name LIKE '%а%';
```

:::

**Результат:**
Выводятся сотрудники, в имени которых встречается буква `а`.

Вывести сотрудников, чьи адреса электронной почты находятся в зоне **.ru**:

::: play sandbox=sqlite editor=basic depends-on=digital_agency_employees_sqlite.sql

```sql
SELECT first_name, last_name, email
FROM employees
WHERE email LIKE '%.ru';
```

:::

**Результат:**
Выводятся сотрудники, адреса электронной почты которых находятся в зоне **.ru**.

Вывести сотрудников, получающих шестизначную зарплату:

::: play sandbox=sqlite editor=basic depends-on=digital_agency_employees_sqlite.sql

```sql
SELECT first_name, last_name, job_title, salary
FROM employees
WHERE salary LIKE '______';
```

:::

**Результат:**
Выводятся сотрудники, в цифре зарплаты которых **ровно 6 знаков**.

### ESCAPE-символ

`ESCAPE`-символ используется для экранирования специальных символов (`%`, `_`, `/`). В случае если вам нужно найти строки, содержащие их, вы можете использовать `ESCAPE`-символ.

Например, вы хотите получить информацию по бонусам к окладу в процентах:

::: play sandbox=sqlite editor=basic depends-on=digital_agency_employees_sqlite.sql

```sql
SELECT first_name, last_name, bonus
FROM employees
WHERE bonus LIKE '%!%%' ESCAPE '!';
```

:::

**Результат:**
Выводятся сотрудники, в условиях бонуса которых содержится символ `%`. Если бы мы не экранировали трафаретный символ, то в выборку попало бы всё.

## Сортировка результатов (ORDER BY)

При выполнении запроса `SELECT`, строки по умолчанию возвращаются в неопределенном порядке. Фактический порядок строк в этом случае зависит от того порядка в котором данные попадали в базу. Для упорядочивания записей используется конструкция `ORDER BY`.

Например, выведем всех сотрудников, отсортировав их по зарплате от наименьшей к наибольшей:

::: play sandbox=sqlite editor=basic depends-on=digital_agency_employees_sqlite.sql

```sql
SELECT first_name, last_name, salary
FROM employees
ORDER BY salary;
```

:::

**Результат:**
Сотрудники, отсортированные по зарплате — от самой низкой к самой высокой.

::: tip

По умолчанию используется сортировка по возрастанию (`ASC`), для сортировки по убыванию добавляется ключевое слово `DESC`.

Направление сортировки:

- `ASC` - сортировка по возрастанию (по умолчанию, можно не указывать)
- `DESC` - сортировка по убыванию

**Даже если направление сортировки `ASC` очевидно, хорошей практикой является его явное указание во всех запросах.**

:::

Для сортировки результатов по двум или более столбцам их следует указывать через запятую.

```sql
...ORDER BY столбец_1 [ASC | DESC], столбец_2 [ASC | DESC];
```

Данные будут сортироваться по первому столбцу, но в случае если попадаются несколько записей с совпадающими значениями в первом столбце, то они сортируются по второму столбцу. Количество столбцов, по которым можно отсортировать не ограничено.

При этом стоит учесть что правило сортировки применяется только к тому столбцу, за которым оно следует.

```sql
ORDER BY столбец_1, столбец_2 DESC
```

не то же самое, что

```sql
ORDER BY столбец_1 DESC, столбец_2 DESC
```

Например, выведем всех сотрудников, отсортировав по алфавиту их сначала по фамилии а потом по имени:

::: play sandbox=sqlite editor=basic depends-on=digital_agency_employees_sqlite.sql

```sql
SELECT last_name, first_name
FROM employees
ORDER BY last_name ASC, first_name ASC;
```

:::

**Результат:**
Сотрудники упорядочены по алфавиту сначала по фамилии, а потом — по имени.

Также порядок сортировки каждого столбца может различаться, например если мы хотим вывести сотрудников, упорядочив их сначала по должности, а внутри должностей — по убыванию зарплаты:

::: play sandbox=sqlite editor=basic depends-on=digital_agency_employees_sqlite.sql

```sql
SELECT first_name, last_name, job_title, salary
FROM employees
ORDER BY job_title ASC, salary DESC;
```

:::

**Результат:**
Сотрудники упорядочены сначала по должности, а внутри должностей — по убыванию зарплаты.

## Ограничение количества строк (LIMIT)

Оператор **`LIMIT`** ограничивает количество строк, возвращаемых запросом.

::: play sandbox=sqlite editor=basic depends-on=digital_agency_employees_sqlite.sql

```sql
SELECT first_name, last_name, salary
FROM employees
ORDER BY salary DESC
LIMIT 3;
```

:::

**Результат:**
Выводятся только **три сотрудника с самыми высокими зарплатами**.

## Комбинация условий

Можно комбинировать `WHERE`, `LIKE`, `ORDER BY` и `LIMIT` для более точных выборок:

::: play sandbox=sqlite editor=basic template="#show_null" depends-on=digital_agency_employees_sqlite.sql

```sql
SELECT salary, last_name, first_name, department, job_title, email
FROM employees
WHERE
  department = 'IT'
    AND
  job_title LIKE '%программист%'
    AND
  (email LIKE '%@company.ru' OR email IS NULL)
ORDER BY salary DESC, last_name ASC
LIMIT 3;
```

:::

**Результат:**
Три сотрудника из отдела `IT` с должностями, содержащими «программист», у кого либо есть корпоративная почта на домене `@company.ru`, либо её нет; отсортированы по убыванию зарплаты (при равенстве — по фамилии)

---

## Практические задания

### Задание 1. `IS NULL` — фильтр по незаполненным значениям

::: tabs

@tab Условие

Выведите всех сотрудников, у которых **нет электронной почты**.

  ::: play sandbox=sqlite editor=basic template="#show_null" depends-on=digital_agency_employees_sqlite.sql

  ```sql
  -- Ваш код можете писать тут


  ```

  :::

@tab Решение

```sql
SELECT *
FROM employees
WHERE email IS NULL;
```

:::

### Задание 2. `LIKE` с префиксом — поиск по первой букве

::: tabs

@tab Условие

Найдите сотрудников, чьи **фамилии начинаются на «П»**.

  ::: play sandbox=sqlite editor=basic template="#show_null" depends-on=digital_agency_employees_sqlite.sql

  ```sql
  -- Ваш код можете писать тут


  ```

  :::

@tab Решение

```sql
SELECT *
FROM employees
WHERE last_name LIKE 'П%';
```

:::

### Задание 3. `LIKE` + `ORDER BY` — выборка по домену почты

::: tabs

@tab Условие

Выведите сотрудников, чьи **адреса электронной почты находятся в домене `@company.ru`**, отсортировав их по зарплате **по убыванию**.

  ::: play sandbox=sqlite editor=basic template="#show_null" depends-on=digital_agency_employees_sqlite.sql

  ```sql
  -- Ваш код можете писать тут


  ```

  :::

@tab Решение

```sql
SELECT *
FROM employees
WHERE email LIKE '%@company.ru'
ORDER BY salary DESC;
```

:::

### Задание 4. `ORDER BY + LIMIT` — выборка N записей

::: tabs

@tab Условие

Выведите **троих сотрудников с самыми низкими зарплатами**, результаты отсортируйте **по возрастанию зарплаты**.

  ::: play sandbox=sqlite editor=basic template="#show_null" depends-on=digital_agency_employees_sqlite.sql

  ```sql
  -- Ваш код можете писать тут


  ```

  :::

@tab Решение

```sql
SELECT *
FROM employees
ORDER BY salary ASC
LIMIT 3;
```

:::

### Задание 5. `LIKE` + `ORDER BY` — фильтр по шаблону в должности

::: tabs

@tab Условие

Найдите всех сотрудников, у которых в должности встречается слово **«программист»**, и выведите их **в порядке возрастания зарплаты**.

  ::: play sandbox=sqlite editor=basic template="#show_null" depends-on=digital_agency_employees_sqlite.sql

  ```sql
  -- Ваш код можете писать тут


  ```

  :::

@tab Решение

```sql
SELECT *
FROM employees
WHERE job_title LIKE '%программист%'
ORDER BY salary ASC;
```

:::

### Задание 6. `LIKE`/`NOT LIKE` + сортировка по алфавиту

::: tabs

@tab Условие

Выведите сотрудников, у которых **зарплата пятизначная**, но при этом в должности не встречается слово **«программист»**. Отсортируйте их по **фамилии в алфавитном порядке**.

  ::: play sandbox=sqlite editor=basic template="#show_null" depends-on=digital_agency_employees_sqlite.sql

  ```sql
  -- Ваш код можете писать тут


  ```

  :::

@tab Решение

```sql
SELECT *
FROM employees
WHERE
  salary LIKE "_____"
    AND
  job_title NOT LIKE '%программист%'
ORDER BY last_name ASC;
```

:::

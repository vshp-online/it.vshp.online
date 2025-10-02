# Интеграция codapi

https://codapi.org/

## JavaScript в браузере

### Вывод в консоль

::: preview Посмотреть код

  ::: play sandbox=javascript editor=basic engine=browser

  ```js
  const msg = "Hello, World!"
  console.log(msg)
  ```

  :::

:::

### Fetch API

::: preview Посмотреть код

  ::: play sandbox=fetch editor=basic engine=browser

  ```http
  POST https://httpbingo.org/dump/request HTTP/1.1
  content-type: application/json

  {
      "message": "hello"
  }
  ```

  :::

:::

## Python в браузере

### С отображением line-numbers (по-умолчанию)

::: preview Посмотреть код

  ::: play sandbox=python editor=basic

  ```python
  # Комментарий
  print("Hello from Python!")
  ```

  :::

:::

### Без отображения line-numbers

::: preview Посмотреть код

  ::: play sandbox=python editor=basic

  ```python :no-line-numbers
  # Комментарий
  print("Hello from Python!")
  ```

  :::

:::

## SQLite в браузере

### В едином блоке

::: preview Посмотреть код

  ::: play sandbox=sqlite editor=basic

  ```sql
  CREATE TABLE tmp(message text);
  INSERT INTO tmp VALUES ('Hello, World!');
  SELECT * FROM tmp;
  ```

  :::

:::

### Код подстановки из внешнего файла через `template`

::: warning

Файлы шаблонов должны лежать в `/public/` чтобы не потерялись при сборке.

:::

::: preview Посмотреть код

  ::: play sandbox=sqlite editor=basic template="/includes/test_table_template.sql"

  ```sql
  SELECT *
  FROM students;
  ```

  :::

:::

### Код подстановки из блока страницы через `template`

::: preview Посмотреть код

  Блок для подстановки с `id`=`#template.sql`

  ```sql {#template.sql}
  CREATE TABLE tmp(message text);
  INSERT INTO tmp VALUES ('Hello, World!');

  ##CODE##
  ```

  Блок, оборачиваемый в шаблон `template`=`#template.sql`

  ::: play sandbox=sqlite editor=basic template="#template.sql"

  ```sql
  SELECT * FROM tmp;
  ```

  :::

:::

### Созависимость блоков

::: preview Посмотреть код

  **1. Первый `create.sql`, самостоятельный**

  ::: play sandbox=sqlite editor=basic id=create.sql

  ```sql
  CREATE TABLE employees (
    id INTEGER PRIMARY KEY,
    name VARCHAR(50),
    department VARCHAR(10),
    salary INTEGER
  );
  ```

  :::

  **2. Второй `insert.sql`, зависит от `create.sql`**

  ::: play sandbox=sqlite editor=basic id=insert.sql depends-on=create.sql

  ```sql
  INSERT INTO employees
  (id, name, department, salary)
  VALUES
  (11, 'Оксана', 'Бухгалтерия', 70),
  (12, 'Дмитрий', 'АХО', 78),
  (21, 'Павел', 'IT', 84);
  ```

  :::

  **2. Третий `select.sql`, зависит от `insert.sql`**

  ::: play sandbox=sqlite editor=basic id=select.sql depends-on=insert.sql

  ```sql
  SELECT * FROM employees;
  ```

  :::

:::

# ИТ.03 - 19 - Ограничения и целостность данных в MySQL

## Введение

На прошлой лекции мы разобрали, как выбирать типы данных. Но одних типов недостаточно: нужно ещё гарантировать, что данные в таблицах **логически корректны**.

Именно для этого в MySQL используются ограничения (constraints): они запрещают некорректные значения и не дают «сломать» связи между таблицами.

В этой лекции рассмотрим ключевые ограничения:

- `PRIMARY KEY`
- `UNIQUE`
- `FOREIGN KEY`
- `CHECK`
- `NOT NULL`
- `DEFAULT`

Все примеры выполняются вручную в MySQL Workbench.

---

## Зачем нужны ограничения

Тип данных отвечает на вопрос «какого формата значение можно записать», а ограничения — «какие значения **допустимы по смыслу**».

Например:

- тип `INT` не запрещает отрицательный возраст;
- тип `VARCHAR(255)` не запрещает дубликаты email;
- тип `INT` не гарантирует, что `student_id` реально существует в таблице студентов.

Ограничения решают именно эти задачи.

---

## Что такое целостность данных

В реляционных БД обычно выделяют три практических уровня целостности:

- **Целостность сущности** — каждая строка таблицы должна однозначно определяться (обычно через `PRIMARY KEY`).
- **Ссылочная целостность** — ссылки между таблицами должны быть корректными (`FOREIGN KEY`).
- **Доменная целостность** — значение должно попадать в допустимые правила (`CHECK`, `UNIQUE`, `NOT NULL`).

::: tip
Ограничения лучше задавать в самой БД, а не только в коде приложения. Тогда правила будут работать для любых клиентов (GUI, CLI, API, скриптов).
:::

---

## Основные ограничения MySQL

| Ограничение | Для чего нужно |
| --- | --- |
| `PRIMARY KEY` | Уникальный идентификатор строки |
| `UNIQUE` | Запрет дубликатов в столбце/наборе столбцов |
| `FOREIGN KEY` | Контроль связей между таблицами |
| `CHECK` | Проверка логического условия для значения |
| `NOT NULL` | Запрет пустого (`NULL`) значения |
| `DEFAULT` | Значение по умолчанию, если поле не задано явно |

---

## PRIMARY KEY

`PRIMARY KEY` (первичный ключ) — это столбец или набор столбцов, который однозначно идентифицирует строку.

Свойства первичного ключа:

- не может быть `NULL`;
- значения не повторяются;
- в таблице только один `PRIMARY KEY` (но он может быть составным).

### Простой первичный ключ

```sql
CREATE TABLE students (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL
);
```

### Составной первичный ключ

```sql
CREATE TABLE enrollment (
  student_id INT NOT NULL,
  course_id INT NOT NULL,
  PRIMARY KEY (student_id, course_id)
);
```

Составной ключ полезен, когда уникальность определяется комбинацией полей.

---

## UNIQUE

`UNIQUE` запрещает дублирующиеся значения.

```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE
);
```

Если попробовать вставить одинаковые `email`, MySQL вернёт ошибку.

### Отличие `UNIQUE` от `PRIMARY KEY`

- `PRIMARY KEY` — один на таблицу, `NULL` запрещён всегда.
- `UNIQUE` — может быть несколько в одной таблице.

::: info
В MySQL и SQLite несколько строк с `NULL` в `UNIQUE` обычно допускаются, потому что `NULL` трактуется как «неизвестно», а не как обычное конкретное значение.
:::

---

## FOREIGN KEY

`FOREIGN KEY` (внешний ключ) связывает столбец дочерней таблицы с ключом родительской таблицы.

```sql
CREATE TABLE groups_tbl (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(20) UNIQUE NOT NULL
);

CREATE TABLE students (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  group_id INT,
  FOREIGN KEY (group_id) REFERENCES groups_tbl(id)
);
```

Это означает:

- в `students.group_id` нельзя записать несуществующий `groups_tbl.id`;
- удаление/изменение родительской строки контролируется правилами внешнего ключа.

### ON DELETE / ON UPDATE

Можно настроить поведение при изменении или удалении родительской записи:

- `RESTRICT` / `NO ACTION` — запретить операцию;
- `CASCADE` — автоматически изменить/удалить связанные строки;
- `SET NULL` — установить `NULL` в дочернем столбце.

Пример:

```sql
FOREIGN KEY (group_id)
  REFERENCES groups_tbl(id)
  ON DELETE SET NULL
  ON UPDATE CASCADE
```

::: warning
В MySQL внешние ключи работают в основном с движком `InnoDB`. Если таблица не InnoDB, поведение может отличаться.
:::

---

## CHECK

`CHECK` задаёт логическое условие, которое должно быть истинным для каждой строки.

```sql
CREATE TABLE marks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  value INT NOT NULL,
  CHECK (value BETWEEN 1 AND 5)
);
```

Теперь значения `0` или `7` вставить нельзя.

::: note
В MySQL старых версий `CHECK` мог парситься, но фактически не применяться. В MySQL 8 он реально работает, и в учебной среде мы исходим именно из этого.
:::

---

## NOT NULL

`NOT NULL` делает поле обязательным: строка не может быть добавлена, если в это поле не передано значение.

```sql
CREATE TABLE teachers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE
);
```

::: tip
`NOT NULL` проверяет именно отсутствие значения (`NULL`). Пустая строка `''` — это уже значение, и она не равна `NULL`.
:::

---

## DEFAULT

`DEFAULT` задаёт значение по умолчанию, если при `INSERT` поле не указано.

```sql
CREATE TABLE tasks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'new',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

Если поле пропущено в `INSERT`, MySQL подставит значение из `DEFAULT`.

::: note
`DEFAULT` часто используют вместе с `NOT NULL`: поле обязательно, но значение может автоматически выставляться самой БД.
:::

---

## Именованные ограничения и `CONSTRAINT`

В реальных проектах ограничения часто задают с именами через `CONSTRAINT`.
Это особенно удобно в MySQL Workbench: он обычно генерирует имена ограничений, чтобы их потом было легко изменять или удалять.

```sql
CREATE TABLE students_constraints (
  id INT AUTO_INCREMENT,
  email VARCHAR(255) NOT NULL,
  birth_year INT NOT NULL,
  group_id INT,
  PRIMARY KEY (id),
  CONSTRAINT uq_students_constraints_email UNIQUE (email),
  CONSTRAINT chk_students_constraints_birth_year CHECK (birth_year BETWEEN 1980 AND 2015),
  CONSTRAINT fk_students_constraints_group
    FOREIGN KEY (group_id) REFERENCES groups_tbl(id)
    ON DELETE SET NULL
    ON UPDATE CASCADE
);
```

Как посмотреть имена ограничений:

```sql
SHOW CREATE TABLE students_constraints;
```

Как удалять ограничения по имени:

```sql
ALTER TABLE students_constraints
  DROP FOREIGN KEY fk_students_constraints_group;

ALTER TABLE students_constraints
  DROP CHECK chk_students_constraints_birth_year;

ALTER TABLE students_constraints
  DROP INDEX uq_students_constraints_email;
```

::: note
Для `PRIMARY KEY` в MySQL используется специальное имя `PRIMARY`, поэтому его удаляют командой `ALTER TABLE ... DROP PRIMARY KEY`, а не через произвольное имя.
:::

---

## Сквозной пример: ограничения в одной схеме

Ниже таблица, где сразу используются разные ограничения:

```sql
CREATE TABLE students (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  full_name VARCHAR(255) NOT NULL,
  birth_year INT,
  CHECK (birth_year BETWEEN 1980 AND 2015)
);

CREATE TABLE courses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL UNIQUE,
  credits INT NOT NULL,
  CHECK (credits BETWEEN 1 AND 10)
);

CREATE TABLE enrollments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  course_id INT NOT NULL,
  final_mark INT,
  UNIQUE (student_id, course_id),
  CHECK (final_mark BETWEEN 1 AND 5),
  FOREIGN KEY (student_id) REFERENCES students(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
);
```

---

## Как БД реагирует на нарушения

Примеры типичных ошибок:

```sql
-- Дубликат UNIQUE
INSERT INTO students (email, full_name, birth_year)
VALUES ('anna@example.com', 'Анна Иванова', 2004);

INSERT INTO students (email, full_name, birth_year)
VALUES ('anna@example.com', 'Анна Петрова', 2003);
-- Ошибка: duplicate entry

-- Нарушение CHECK
INSERT INTO courses (title, credits)
VALUES ('Теория графов', 20);
-- Ошибка: check constraint violated

-- Нарушение FOREIGN KEY
INSERT INTO enrollments (student_id, course_id, final_mark)
VALUES (999, 1, 5);
-- Ошибка: cannot add or update child row
```

Такие ошибки полезны: они показывают, что БД защищает данные от некорректных записей.

---

## MySQL и SQLite: важные отличия по ограничениям

| Тип | MySQL | SQLite |
| --- | --- | --- |
| `PRIMARY KEY` | стандартно используется, часто с `AUTO_INCREMENT` | `INTEGER PRIMARY KEY` тесно связан с `rowid` |
| `UNIQUE` | работает как ограничение и индекс | работает аналогично |
| `FOREIGN KEY` | обычно активно при InnoDB | нужно явно включать `PRAGMA foreign_keys = ON` |
| `CHECK` | в MySQL 8 реально применяется | поддерживается и применяется |
| `NOT NULL` | работает стандартно | работает стандартно |
| `DEFAULT` | подставляет значение по умолчанию | работает аналогично |

::: tip
Если переносите SQL между SQLite и MySQL, всегда проверяйте внешние ключи и поведение автоинкремента.
:::

---

## Практические рекомендации

- Ставьте `PRIMARY KEY` в каждой таблице.
- Для естественно уникальных данных (email, номер документа) задавайте `UNIQUE`.
- Для связей между таблицами всегда используйте `FOREIGN KEY`.
- Для бизнес-правил диапазонов и допустимых значений добавляйте `CHECK`.
- Обязательные поля явно помечайте `NOT NULL`.
- Для типовых стартовых значений используйте `DEFAULT`.
- В учебных и рабочих схемах давайте ограничениям понятные имена через `CONSTRAINT` — так проще сопровождать и удалять их.
- Сначала продумывайте ограничения, потом пишите `INSERT` — это экономит время на исправления.

---

## Самопроверка

::: quiz source=./includes/quiz-19.yaml
:::

## Практические задания

### Задание 1. Уникальность и проверка диапазона

::: tabs

@tab Условие

Создайте таблицу `products_constraints` для каталога товаров:

- каждый товар должен иметь уникальный `sku`;
- цена должна быть больше 0;
- остаток на складе не может быть отрицательным.

После создания попробуйте вставить 3 корректные записи и 1 некорректную (с отрицательным остатком).

Используйте именованные ограничения через `CONSTRAINT`.

Данные для вставки:

```sql
INSERT INTO products_constraints (sku, title, price, quantity) VALUES
('NB-001', 'Ноутбук', 79990.00, 5),
('KB-010', 'Клавиатура', 3490.00, 15),
('MS-020', 'Мышь', 1990.00, 25);

-- Некорректная запись
INSERT INTO products_constraints (sku, title, price, quantity)
VALUES ('MN-030', 'Монитор', 24990.00, -2);
```

@tab Решение

```sql
CREATE TABLE products_constraints (
  id INT AUTO_INCREMENT,
  sku VARCHAR(30) NOT NULL,
  title VARCHAR(255) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  quantity INT NOT NULL,
  CONSTRAINT pk_products_constraints PRIMARY KEY (id),
  CONSTRAINT uq_products_constraints_sku UNIQUE (sku),
  CONSTRAINT chk_products_constraints_price CHECK (price > 0),
  CONSTRAINT chk_products_constraints_quantity CHECK (quantity >= 0)
);

INSERT INTO products_constraints (sku, title, price, quantity) VALUES
('NB-001', 'Ноутбук', 79990.00, 5),
('KB-010', 'Клавиатура', 3490.00, 15),
('MS-020', 'Мышь', 1990.00, 25);

-- Некорректная запись
INSERT INTO products_constraints (sku, title, price, quantity)
VALUES ('MN-030', 'Монитор', 24990.00, -2);
```

:::

### Задание 2. Связь таблиц через FOREIGN KEY

::: tabs

@tab Условие

Создайте две таблицы:

- `departments` (справочник отделений)
- `students_fk` (студенты, привязанные к отделению)

Требования:

- при удалении отделения поле ссылки у студентов должно становиться `NULL`;
- у каждого отделения код должен быть уникальным.

Добавьте 3 отделения и 3 студентов.

Используйте именованные ограничения через `CONSTRAINT`.

Данные для вставки:

```sql
INSERT INTO departments (dept_code, title) VALUES
('IT', 'Информационные технологии'),
('DS', 'Data Science'),
('WEB', 'Веб-разработка');

INSERT INTO students_fk (full_name, department_id) VALUES
('Иванов Иван', 1),
('Петров Петр', 2),
('Сидорова Анна', 1);
```

@tab Решение

```sql
CREATE TABLE departments (
  id INT AUTO_INCREMENT,
  dept_code VARCHAR(20) NOT NULL,
  title VARCHAR(255) NOT NULL,
  CONSTRAINT pk_departments PRIMARY KEY (id),
  CONSTRAINT uq_departments_dept_code UNIQUE (dept_code)
);

CREATE TABLE students_fk (
  id INT AUTO_INCREMENT,
  full_name VARCHAR(255) NOT NULL,
  department_id INT,
  CONSTRAINT pk_students_fk PRIMARY KEY (id),
  CONSTRAINT fk_students_fk_department
    FOREIGN KEY (department_id)
    REFERENCES departments(id)
    ON DELETE SET NULL
    ON UPDATE CASCADE
);

INSERT INTO departments (dept_code, title) VALUES
('IT', 'Информационные технологии'),
('DS', 'Data Science'),
('WEB', 'Веб-разработка');

INSERT INTO students_fk (full_name, department_id) VALUES
('Иванов Иван', 1),
('Петров Петр', 2),
('Сидорова Анна', 1);
```

:::

### Задание 3. Составная уникальность

::: tabs

@tab Условие

Создайте таблицу `enrollments_unique`, где один и тот же студент не может быть записан на один и тот же курс дважды.

Поля:

- `id` — PK
- `student_id`
- `course_id`
- `enrolled_at` — дата и время записи

Добавьте 3 корректные записи и 1 дубликат пары (`student_id`, `course_id`).

Используйте именованные ограничения через `CONSTRAINT`.

Данные для вставки:

```sql
INSERT INTO enrollments_unique (student_id, course_id, enrolled_at) VALUES
(1, 1, '2025-09-10 10:00:00'),
(1, 2, '2025-09-10 10:05:00'),
(2, 1, '2025-09-10 10:10:00');

-- Некорректная запись-дубликат
INSERT INTO enrollments_unique (student_id, course_id, enrolled_at)
VALUES (1, 1, '2025-09-10 10:20:00');
```

@tab Решение

```sql
CREATE TABLE enrollments_unique (
  id INT AUTO_INCREMENT,
  student_id INT NOT NULL,
  course_id INT NOT NULL,
  enrolled_at DATETIME NOT NULL,
  CONSTRAINT pk_enrollments_unique PRIMARY KEY (id),
  CONSTRAINT uq_enrollments_unique_student_course UNIQUE (student_id, course_id)
);

INSERT INTO enrollments_unique (student_id, course_id, enrolled_at) VALUES
(1, 1, '2025-09-10 10:00:00'),
(1, 2, '2025-09-10 10:05:00'),
(2, 1, '2025-09-10 10:10:00');

-- Некорректная запись-дубликат
INSERT INTO enrollments_unique (student_id, course_id, enrolled_at)
VALUES (1, 1, '2025-09-10 10:20:00');
```

:::

### Задание 4. Полный набор ограничений

::: tabs

@tab Условие

Создайте таблицу `exam_results` для результатов экзамена.

Требования:

- один студент имеет только одну итоговую запись по дисциплине;
- оценка только от 2 до 5;
- дата экзамена не может быть пустой.

Добавьте 3 корректные записи.

Используйте именованные ограничения через `CONSTRAINT`.

Данные для вставки:

```sql
INSERT INTO exam_results (student_id, discipline_code, exam_date, final_mark) VALUES
(1, 'IT03', '2025-12-20', 5),
(2, 'IT03', '2025-12-20', 4),
(3, 'IT03', '2025-12-20', 3);
```

@tab Решение

```sql
CREATE TABLE exam_results (
  id INT AUTO_INCREMENT,
  student_id INT NOT NULL,
  discipline_code VARCHAR(30) NOT NULL,
  exam_date DATE NOT NULL,
  final_mark INT NOT NULL,
  CONSTRAINT pk_exam_results PRIMARY KEY (id),
  CONSTRAINT uq_exam_results_student_discipline UNIQUE (student_id, discipline_code),
  CONSTRAINT chk_exam_results_final_mark CHECK (final_mark BETWEEN 2 AND 5)
);

INSERT INTO exam_results (student_id, discipline_code, exam_date, final_mark) VALUES
(1, 'IT03', '2025-12-20', 5),
(2, 'IT03', '2025-12-20', 4),
(3, 'IT03', '2025-12-20', 3);
```

:::

---

## Полезные ссылки

- [MySQL 8.4 Reference Manual](https://dev.mysql.com/doc/refman/8.4/en/)
- [MySQL: CREATE TABLE Syntax](https://dev.mysql.com/doc/refman/8.4/en/create-table.html)
- [MySQL: FOREIGN KEY Constraints](https://dev.mysql.com/doc/refman/8.4/en/create-table-foreign-keys.html)
- [MySQL: CHECK Constraints](https://dev.mysql.com/doc/refman/8.4/en/create-table-check-constraints.html)

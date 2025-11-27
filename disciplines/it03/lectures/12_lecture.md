# ИТ.03 - 12 - Создание связанных таблиц. Операции `JOIN` и `UNION`

## Введение

В предыдущей теме мы проектировали модель на ER-диаграммах. Теперь делаем следующий шаг: переносим концептуальную схему в SQL, создаём таблицы со связями и учимся читать данные сразу из нескольких таблиц. По ходу лекции обсудим проверку внешних ключей и потренируемся в соединениях (`JOIN`) и объединениях (`UNION`).

В этой лекции:

- разбираем синтаксис `CREATE TABLE` и варианты объявления внешних ключей;
- включаем и проверяем ограничения целостности в SQLite;
- создаём учебный набор таблиц «преподаватели — курсы — студенты»;
- изучаем базовые `JOIN` и операции `UNION`, чтобы объединять выборки из разных таблиц.

## Базовый синтаксис создания таблиц со связями

```sql
CREATE TABLE дочерняя_таблица (
  имя_столбца1 тип_данных [ограничения],
  имя_столбца2 тип_данных [ограничения],
  ...
  внешний_ключ ТИП REFERENCES родительская_таблица(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
);
```

Ключевые моменты:

1. **Совпадение типов.** Поле, на которое ссылается внешний ключ, и сам внешний ключ должны быть одного типа (например, `INTEGER`).
2. **Именование.** Часто используют шаблон `<таблица>_id`, чтобы по названию поля было понятно, на что идёт ссылка.
3. **Директивы ON DELETE / ON UPDATE.** описывают, что случится с дочерними записями, если удалить или изменить родительскую. Подробнее эти директивы мы рассмотрим дальше.
4. **UNIQUE/PRIMARY KEY.** Внешний ключ всегда ссылается на уникальное поле родительской таблицы (обычно на `PRIMARY KEY`).

::: note
Родительской называют таблицу, на чьё поле ссылается внешний ключ (`teachers`, `departments` и т.п.). Дочерняя таблица содержит сам внешний ключ (`courses.teacher_id`, `employees.department_id`) и «зависит» от родителя: удаление или изменение родительской строки может затронуть дочерние записи.
:::

::: info
Есть альтернативный синтаксис, когда внешние и первичные ключи задаются **после** описания всех столбцов, в секции ограничений таблицы:

```sql
CREATE TABLE дочерняя_таблица (
  id INTEGER,
  parent_id INTEGER,
  ...
  PRIMARY KEY (id),
  FOREIGN KEY (parent_id) REFERENCES родительская_таблица(id)
);
```

Такой подход удобен, когда нужно объявить составные ключи или дать имя ограничению (`CONSTRAINT fk_parent ...`). В этой лекции мы используем оба варианта, чтобы вы привыкли читать оба вида схем.
:::

## Директивы `ON DELETE` / `ON UPDATE`

Каждый внешний ключ может задавать поведение при обновлении или удалении родительской строки. Директивы `ON DELETE` и `ON UPDATE` отвечают на вопросы:

- что делать с дочерними записями, если родитель удалён;
- нужно ли автоматически менять внешние ключи, если родительский ключ обновился.

По умолчанию SQLite просто запрещает операцию, но иногда полезно «цеплять» каскад или очищать ссылку.

Основные варианты:

| Опция        | Поведение                                                                 |
| ------------ | ------------------------------------------------------------------------- |
| `NO ACTION`  | (значение по умолчанию) Проверка выполняется после операции; при нарушении внешнего ключа выдаётся ошибка. |
| `RESTRICT`   | Похоже на `NO ACTION`, но проверка выполняется сразу; операция блокируется, если есть дочерние записи. |
| `CASCADE`    | Автоматически удаляет/обновляет дочерние записи вслед за родительской.    |
| `SET NULL`   | Устанавливает `NULL` в дочернем поле. Работает только если поле допускает `NULL`. |
| `SET DEFAULT`| Подставляет значение по умолчанию из определения столбца.                 |

SQLite поддерживает все перечисленные варианты. Выбор зависит от бизнес-логики: где-то важно сохранить историю (`RESTRICT`), где-то безопаснее «очищать» ссылку (`SET NULL`), а в демонстрационных базах часто используют `CASCADE`.

## Контроль внешних ключей в SQLite

По историческим причинам SQLite не проверяет внешние ключи, пока вы явно не включите этот режим. В предыдущих лекциях мы уже настраивали `.nullvalue`, поэтому ниже приводим шаблон, который объединяет обе настройки:

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

- `PRAGMA foreign_keys = ON` действует только в текущем подключении, поэтому её выполняют при запуске консоли или в начале каждого SQL-скрипта перед `CREATE TABLE` / `INSERT`;
- если забыть включить проверку, SQLite молча пропустит нарушение (`CASCADE`, `SET NULL` и т.п. работать не будут);
- `.nullvalue 'NULL'` помогает отличать «настоящий» `NULL` от пустой строки — настройка автоматически подставляется во всех интерактивных блоках;
- в учебных примерах шаблон уже используется, но в собственных проектах команды нужно добавлять вручную.

## Создание таблиц со связями по шагам

1. **Определяем основу.** Сначала создаём родительские таблицы (например, `teachers`) и задаём первичные ключи.
2. **Добавляем зависимые сущности.** В дочерней таблице (`courses`) заводим внешний ключ `teacher_id INTEGER REFERENCES teachers(id)`, чтобы связать курс с преподавателем.
3. **Обрабатываем связи `M — N`.** Для множественных отношений создаём промежуточную таблицу `enrollments` с двумя внешними ключами (`student_id`, `course_id`) и дополнительными атрибутами (`enrolled_at`).
4. **Убеждаемся, что проверка внешних ключей включена.** Команда `PRAGMA foreign_keys = ON` должна быть активна в текущей сессии, иначе ограничения просто не будут применяться.
5. **Настраиваем реакцию на изменения.** Ещё до наполнения данными выбираем поведение `ON DELETE / ON UPDATE` (в примере используем `ON DELETE CASCADE`, чтобы не оставались «висящие» записи).

## Учебная база данных «Learning Portal»

::: tabs

@tab Таблицы

  ::: tabs

  @tab teachers
  <!-- @include: ./includes/learning_portal_db/teachers_table.md -->

  @tab courses
  <!-- @include: ./includes/learning_portal_db/courses_table.md -->

  @tab students
  <!-- @include: ./includes/learning_portal_db/students_table.md -->

  @tab enrollments
  <!-- @include: ./includes/learning_portal_db/enrollments_table.md -->

  :::

@tab Описание

  Учебный портал, связывающий преподавателей, курсы и студентов: показывает, как работают внешние ключи и таблицы-связки.

  **Особенности:**

  - демонстрирует каскадные связи «преподаватель → курс → запись»;
  - часть данных содержит `NULL` (отсутствующий e-mail, группа, записи);
  - есть курс без студентов и преподавателя, студент без записей и преподаватель без курсов — такие комбинации помогают показать `LEFT/RIGHT JOIN`.

  ::: note
  Поле `courses.teacher_id` в примере допускает `NULL`, чтобы демонстрировать внешние соединения. В реальных проектах обычно ставят `NOT NULL` и не оставляют курс без ответственного.
  :::

@tab Поля и ограничения

  **Поля**

  - **`teachers`**
    - `id` — первичный ключ;
    - `full_name` — ФИО преподавателя;
    - `email` — адрес (может отсутствовать).

  - **`courses`**
    - `id` — первичный ключ;
    - `title` — название курса;
    - `hours` — длительность в академических часах;
    - `teacher_id` — ссылка на `teachers(id)`; допускает `NULL` (только для учебных примеров).

  - **`students`**
    - `id` — первичный ключ;
    - `full_name` — ФИО студента;
    - `group_code` — учебная группа (может отсутствовать).

  - **`enrollments`**
    - `student_id` — ссылка на `students(id)`;
    - `course_id` — ссылка на `courses(id)`;
    - `enrolled_at` — дата записи (по умолчанию `date('now')`);
    - `student_id` и `course_id` образуют составной первичный ключ.

  **Ограничения**

  - `teachers.email` допускает `NULL`, остальные столбцы обязательны;
  - `courses.teacher_id` допускает `NULL` (только в учебном наборе) и ссылается на `teachers(id)`;
  - таблица `enrollments` ссылается на обе родительские таблицы и использует составной первичный ключ `PRIMARY KEY(student_id, course_id)`;
  - для обоих внешних ключей в `enrollments` включено `ON DELETE CASCADE`;
  - `students.group_code` может быть пустым, что демонстрирует работу c `NULL`.

@tab Структура

  @[code mermaid](./includes/learning_portal_db/learning_portal.mermaid)

@tab SQL-код

  Скачать в виде файла: [learning_portal_sqlite.sql](./includes/learning_portal_db/learning_portal_sqlite.sql)

  ::: play sandbox=sqlite editor=basic id=learning_portal_sqlite.sql
  @[code sql:collapsed-lines=10](./includes/learning_portal_db/learning_portal_sqlite.sql)
  :::

:::

### Проверяем структуру

Выводим информацию о таблицах:

::: play sandbox=sqlite editor=basic template="#show_null_and_enable_foreign_keys" depends-on=learning_portal_sqlite.sql

```sql
PRAGMA table_info('teachers');
PRAGMA table_info('courses');
PRAGMA table_info('students');
PRAGMA table_info('enrollments');
```

:::

`PRAGMA table_info` показывает столбцы и их ограничения.

Выводим информацию о внешних ключах:

::: play sandbox=sqlite editor=basic template="#show_null_and_enable_foreign_keys" depends-on=learning_portal_sqlite.sql

```sql
PRAGMA foreign_key_list('teachers');
PRAGMA foreign_key_list('courses');
PRAGMA foreign_key_list('students');
PRAGMA foreign_key_list('enrollments');
```

:::

`foreign_key_list` показывает только внешние ключи самой таблицы. Если текущая таблица ни на кого не ссылается, то `PRAGMA foreign_key_list` ничего не покажет — это ожидаемое поведение.

Ну и наконец выведем данные из таблиц:

::: play sandbox=sqlite editor=basic template="#show_null_and_enable_foreign_keys" depends-on=learning_portal_sqlite.sql

```sql
SELECT * FROM teachers;
SELECT * FROM courses;
SELECT * FROM students;
SELECT * FROM enrollments;
```

:::

## Виды `JOIN` на практике

`JOIN` объединяет строки двух и более таблиц согласно условию `ON`. Конкретный тип соединения задаёт, какие строки остаются в результате, если парных записей не найдено.

Во всех примерах ниже используем учебную базу «Learning Portal»: у нас есть курсы (некоторые без слушателей), студенты (есть те, кто никуда не записан) и таблица `enrollments`, связывающая их. Поэтому в результатах легко заметить строки с `NULL`, где нет соответствий.

### Обзор

![Типы JOIN](../img/SQL_JOIN_TYPES.png)

### `INNER JOIN`

![INNER JOIN](../img/SQL_INNER_JOIN.png)

Возвращает строки, для которых условие связи выполняется в обеих таблицах. Если ключевое слово `JOIN` указано без уточнения типа, подразумевается именно `INNER JOIN`.

::: play sandbox=sqlite editor=basic template="#show_null_and_enable_foreign_keys" depends-on=learning_portal_sqlite.sql

```sql
SELECT
  students.full_name AS student,
  courses.title AS course
FROM enrollments
INNER JOIN students ON students.id = enrollments.student_id
INNER JOIN courses ON courses.id = enrollments.course_id
ORDER BY student;
```

:::

Результат включает только тех студентов, у кого есть записи в `enrollments`, а также названия курсов. Студенты без записей (например, Мария Жукова) не попадут в выборку.

### `LEFT JOIN`

![LEFT JOIN](../img/SQL_LEFT_JOIN.png)

Возвращает все строки из левой таблицы и совпадающие строки из правой. Если совпадений нет, значения правой таблицы будут `NULL`.

::: play sandbox=sqlite editor=basic template="#show_null_and_enable_foreign_keys" depends-on=learning_portal_sqlite.sql

```sql
SELECT
  teachers.full_name AS teacher,
  courses.title AS course
FROM teachers
LEFT JOIN courses ON courses.teacher_id = teachers.id
ORDER BY teacher;
```

:::

В выборке будут все преподаватели. Если преподаватель пока не ведёт курс (например, Дмитрий Лебедев), столбец `course` станет `NULL`.

### `RIGHT JOIN`

![RIGHT JOIN](../img/SQL_RIGHT_JOIN.png)

Возвращает все строки из правой таблицы и совпадающие строки из левой. Если совпадений нет, значения левой таблицы будут `NULL`.

SQLite не поддерживает `RIGHT JOIN`, но его легко получить, «повернув» запрос с `LEFT JOIN`. Если нам нужны **все преподаватели** даже без курсов (аналог `courses RIGHT JOIN teachers`), просто ставим `teachers` слева:

::: play sandbox=sqlite editor=basic template="#show_null_and_enable_foreign_keys" depends-on=learning_portal_sqlite.sql

```sql
SELECT
  courses.title AS course,
  teachers.full_name AS teacher
FROM courses
LEFT JOIN teachers ON teachers.id = courses.teacher_id
ORDER BY course;
```

:::

Такой запрос эквивалентен `RIGHT JOIN` в направлении «преподаватели → курсы»: курсы выводятся всегда, а имя преподавателя может стать `NULL`, если за курсом никто не закреплён (в учебных данных есть тестовый курс, чтобы показать этот случай).

### `FULL OUTER JOIN`

![FULL OUTER JOIN](../img/SQL_FULL_OUTER_JOIN.png)

Возвращает все строки из обеих таблиц, совпадающие и несовпадающие. Если совпадений нет, значения одной из таблиц будут `NULL`.

По сути это комбинация `LEFT JOIN` и `RIGHT JOIN`: сначала берём все строки слева, затем добавляем недостающие справа.

SQLite не поддерживает `FULL OUTER JOIN` напрямую, поэтому ниже, в разделе про `UNION`, покажем, как собрать аналогичный результат из двух запросов.

### `CROSS JOIN`

![CROSS JOIN](../img/SQL_CROSS_JOIN.png)

Формирует **декартово произведение**.

::: info

Декартово произведение перечисляет каждую возможную комбинацию строк из двух таблиц. Если в первой таблице три записи, а во второй пять, `CROSS JOIN` сформирует 3 x 5 = 15 строк. Такой подход используют, когда нужно построить сетку всех возможных комбинаций. Например, потенциальное расписание или подбор «каждый с каждым».

:::

::: play sandbox=sqlite editor=basic template="#show_null_and_enable_foreign_keys" depends-on=learning_portal_sqlite.sql

```sql
SELECT
  teachers.full_name AS teacher,
  courses.title AS course
FROM teachers
CROSS JOIN courses;
```

:::

Так можно мгновенно получить все пары «преподаватель × курс».

Чтобы показать практическую пользу, ограничим результат только свободными строками — преподавателями и курсами без назначений:

::: play sandbox=sqlite editor=basic template="#show_null_and_enable_foreign_keys" depends-on=learning_portal_sqlite.sql

```sql
SELECT
  teachers.full_name AS candidate_teacher,
  courses.title AS unassigned_course
FROM teachers
CROSS JOIN courses
WHERE
  teachers.id = 4 -- Дмитрий Лебедев пока не ведёт курсы
    AND
  courses.teacher_id IS NULL;
```

:::

Такой фильтр оставляет пары «конкретный свободный преподаватель ↔ курс без преподавателя». В примере используем Дмитрия Лебедева, но по аналогии можно выбрать любого свободного преподавателя или нескольких.

## Объединение выборок: `UNION` и `UNION ALL`

`UNION` объединяет несколько запросов `SELECT` в одну выборку. Это удобно, когда два разных запроса возвращают схожие по структуре данные, но вы хотите показать их подряд (например, курсы с учениками и курсы без них). Требования:

- одинаковое количество столбцов в каждом запросе;
- совместимые типы данных по позициям;
- итоговые имена столбцов берутся из первого `SELECT`.

`UNION` по умолчанию убирает дубликаты. Если дубликаты нужны, используйте `UNION ALL`.

### Пример: курсы со слушателями и без них

::: play sandbox=sqlite editor=basic template="#show_null_and_enable_foreign_keys" depends-on=learning_portal_sqlite.sql

```sql
SELECT
  courses.title AS course,
  'Есть слушатели' AS status
FROM courses
JOIN enrollments ON enrollments.course_id = courses.id
UNION
SELECT
  courses.title,
  'Свободно' AS status
FROM courses
LEFT JOIN enrollments ON enrollments.course_id = courses.id
WHERE
  enrollments.student_id IS NULL
    AND
  enrollments.course_id IS NULL
ORDER BY status;
```

:::

В первой части берём курсы с действующими записями (`JOIN enrollments`). Во второй — курсы без слушателей: у таких строк `student_id` и `course_id` остаются `NULL`. Благодаря `UNION` каждая комбинация «курс + статус» появляется один раз, что удобно для сводных отчётов.

### Когда нужен `UNION ALL`

Если разные запросы могут возвращать одни и те же строки и вы хотите сохранить повторы (например, ради подсчётов), используйте `UNION ALL`. Ниже показано, как собрать выборку «студент ↔ курс» и дополнительно добавить курсы без студентов — аналог поведения `FULL OUTER JOIN`.

::: play sandbox=sqlite editor=basic template="#show_null_and_enable_foreign_keys" depends-on=learning_portal_sqlite.sql

```sql
SELECT
  students.full_name AS student,
  courses.title AS course
FROM students
LEFT JOIN enrollments ON enrollments.student_id = students.id
LEFT JOIN courses ON courses.id = enrollments.course_id
UNION ALL
SELECT
  students.full_name,
  courses.title
FROM courses
LEFT JOIN enrollments ON enrollments.course_id = courses.id
LEFT JOIN students ON students.id = enrollments.student_id
WHERE students.id IS NULL
ORDER BY course;
```

:::

Первая часть запроса выводит студентов и их курсы (если они есть). Вторая часть добавляет курсы без студентов. `UNION ALL` нужен, чтобы не потерять совпадения: если бы мы использовали `UNION`, а в обеих частях встречалась одна и та же пара «студент + курс», она слилась бы в одну строку.

## Практические задания

### Задание 1. Отделы и сотрудники — создание схемы

::: tabs

@tab Условие

Для учебной CRM нужно хранить отделы и сотрудников. Создайте таблицы `departments` и `employees`, где сотрудники относятся к отделам через внешний ключ `department_id`. После создания схемы убедитесь, что связь действительно настроена: выведите структуру таблиц (`PRAGMA table_info('employees')`) и список внешних ключей (`PRAGMA foreign_key_list('employees')`).

  ::: play sandbox=sqlite editor=basic template="#show_null_and_enable_foreign_keys"

  ```sql
  -- Ваш код можете писать тут


  ```

  :::

@tab Решение

```sql
CREATE TABLE departments (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL
);

CREATE TABLE employees (
  id INTEGER PRIMARY KEY,
  full_name TEXT NOT NULL,
  department_id INTEGER NOT NULL REFERENCES departments(id)
);

PRAGMA table_info('employees');
PRAGMA foreign_key_list('employees');
```

:::

### Задание 2. Отделы и сотрудники — `ON UPDATE` / `ON DELETE`

::: tabs

@tab Условие

Продолжите работу с таблицами из задания 1. Настройте `ON UPDATE CASCADE` и `ON DELETE SET NULL` для колонки `employees.department_id`, добавьте тестовые записи и сделайте два шага:

1. Измените `id` одного отдела, убедитесь, что `employees.department_id` изменился автоматически.
2. Удалите отдел и проверьте, что `department_id` стал `NULL`.

  ::: play sandbox=sqlite editor=basic template="#show_null_and_enable_foreign_keys"

  ```sql
  -- Ваш код можете писать тут


  ```

  :::

@tab Решение

```sql
CREATE TABLE departments (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL
);

CREATE TABLE employees (
  id INTEGER PRIMARY KEY,
  full_name TEXT NOT NULL,
  department_id INTEGER REFERENCES departments(id)
    ON UPDATE CASCADE
    ON DELETE SET NULL
);

INSERT INTO departments
VALUES
  (1, 'Отдел аналитики'),
  (2, 'Отдел разработки');

INSERT INTO employees
VALUES
  (1, 'Иван Иванов', 1),
  (2, 'Петр Петров', 2);

SELECT *
FROM employees
LEFT JOIN departments ON departments.id = employees.department_id;

UPDATE departments
SET id = 10
WHERE id = 1;

SELECT *
FROM employees
LEFT JOIN departments ON departments.id = employees.department_id;

DELETE FROM departments
WHERE id = 10;

SELECT *
FROM employees
LEFT JOIN departments ON departments.id = employees.department_id;
```

:::

### Задание 3. `INNER JOIN` по учебной базе

::: tabs

@tab Условие

Используя базу «Learning Portal», выведите студентов, названия курсов и преподавателей. Используйте `INNER JOIN`, чтобы в выборку попадали только реальные записи из `enrollments`.

  ::: play sandbox=sqlite editor=basic template="#show_null_and_enable_foreign_keys" depends-on=learning_portal_sqlite.sql

  ```sql
  -- Ваш код можете писать тут


  ```

  :::

@tab Решение

```sql
SELECT
  students.full_name AS student,
  courses.title AS course,
  teachers.full_name AS teacher
FROM enrollments
INNER JOIN students ON students.id = enrollments.student_id
INNER JOIN courses ON courses.id = enrollments.course_id
INNER JOIN teachers ON teachers.id = courses.teacher_id
ORDER BY student;
```

:::

### Задание 4. `LEFT JOIN` — курсы со статусом записи

::: tabs

@tab Условие

Получите список всех курсов и имена слушателей (если записей нет — `NULL`). Используйте `LEFT JOIN`, чтобы курсы без студентов тоже попали в выборку.

  ::: play sandbox=sqlite editor=basic template="#show_null_and_enable_foreign_keys" depends-on=learning_portal_sqlite.sql

  ```sql
  -- Ваш код можете писать тут


  ```

  :::

@tab Решение

```sql
SELECT
  courses.title AS course,
  students.full_name AS student
FROM courses
LEFT JOIN enrollments ON enrollments.course_id = courses.id
LEFT JOIN students ON students.id = enrollments.student_id
ORDER BY course, student;
```

:::

### Задание 5. `CROSS JOIN` — комбинации преподаватель × курс

::: tabs

@tab Условие

Сформируйте все возможные пары «преподаватель — курс» с помощью `CROSS JOIN`. Для сокращения вывода можно отфильтровать только преподавателей с `id IN (1, 2)`.

  ::: play sandbox=sqlite editor=basic template="#show_null_and_enable_foreign_keys" depends-on=learning_portal_sqlite.sql

  ```sql
  -- Ваш код можете писать тут


  ```

  :::

@tab Решение

```sql
SELECT
  teachers.full_name AS teacher,
  courses.title AS course
FROM teachers
CROSS JOIN courses
WHERE teachers.id IN (1, 2)
ORDER BY teacher, course;
```

:::

### Задание 6. `UNION` — курсы со статусом занятости

::: tabs

@tab Условие

Сформируйте общий список курсов, где у каждого курса указан статус: «Есть слушатели» (если запись найдена) или «Свободно» (если записей нет). Используйте `UNION`, чтобы объединить два запроса.

  ::: play sandbox=sqlite editor=basic template="#show_null_and_enable_foreign_keys" depends-on=learning_portal_sqlite.sql

  ```sql
  -- Ваш код можете писать тут


  ```

  :::

@tab Решение

```sql
SELECT
  courses.title AS course,
  'Есть слушатели' AS status
FROM courses
JOIN enrollments ON enrollments.course_id = courses.id
UNION
SELECT
  courses.title,
  'Свободно' AS status
FROM courses
LEFT JOIN enrollments ON enrollments.course_id = courses.id
WHERE
  enrollments.student_id IS NULL
    AND
  enrollments.course_id IS NULL
ORDER BY status;
```

:::

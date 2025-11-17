# ИТ.03 - 12 - Создание связанных таблиц. Операции `JOIN` и `UNION`

## Введение

В предыдущей теме мы научились описывать модель данных на уровне ER-диаграмм. Теперь переходим к её реализации в SQL: создадим несколько таблиц, настроим связи и посмотрим, как извлекать данные сразу из нескольких таблиц с помощью `JOIN`.

В этой лекции:

- разбираем синтаксис `CREATE TABLE` с внешними ключами;
- включаем поддержку ограничений целостности в SQLite;
- создаём учебный набор таблиц «преподаватели — курсы — студенты»;
- изучаем базовые варианты `JOIN` и операции `UNION`, показывая как объединять выборки.

::: warning
В SQLite внешние ключи работают только если перед созданием/использованием таблиц выполнить `PRAGMA foreign_keys = ON;`. Не забывайте включать его в скриптах и интерактивных сессиях.
:::

## Базовый синтаксис `CREATE TABLE ... FOREIGN KEY`

```sql
CREATE TABLE дочерняя_таблица (
  поле1 ТИП NOT NULL,
  ...
  внешний_ключ ТИП REFERENCES родительская_таблица(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
);
```

Ключевые моменты:

1. **Совпадение типов.** Поле, на которое ссылается внешний ключ, и сам внешний ключ должны быть одного типа (например, `INTEGER`).
2. **Именование.** Часто используют шаблон `<таблица>_id`, чтобы по названию поля было понятно, на что идёт ссылка.
3. **ON DELETE / ON UPDATE.** Эти предложения описывают, что случится с дочерними записями, если удалить или изменить родительскую. Для учебных баз удобно использовать `CASCADE`, чтобы записи автоматически удалялись вместе с родителем.
4. **UNIQUE/PRIMARY KEY.** Внешний ключ всегда ссылается на уникальное поле родительской таблицы (обычно на `PRIMARY KEY`).

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
  - есть курс без студентов и студент без записей для примеров `LEFT JOIN`.

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
    - `teacher_id` — ссылка на `teachers(id)`.

  - **`students`**
    - `id` — первичный ключ;
    - `full_name` — ФИО студента;
    - `group_code` — учебная группа (может отсутствовать).

  - **`enrollments`**
    - `id` — первичный ключ;
    - `student_id` — ссылка на `students(id)`;
    - `course_id` — ссылка на `courses(id)`;
    - `enrolled_at` — дата записи (по умолчанию `date('now')`).

  **Ограничения**

  - `teachers.email` допускает `NULL`, остальные столбцы обязательны;
  - `courses.teacher_id` и `enrollments` ссылаются на родительские таблицы, для `enrollments` включено `ON DELETE CASCADE`;
  - таблица `enrollments` запрещает повторные записи одной пары студент+курс через `UNIQUE(student_id, course_id)`;
  - `students.group_code` может быть пустым, что демонстрирует работу c `NULL`.

@tab Структура

  @[code mermaid](./includes/learning_portal_db/learning_portal.mermaid)

@tab SQL-код

  Скачать в виде файла: [learning_portal_sqlite.sql](./includes/learning_portal_db/learning_portal_sqlite.sql)

  ::: play sandbox=sqlite editor=basic id=learning_portal_sqlite.sql
  @[code sql:collapsed-lines=10](./includes/learning_portal_db/learning_portal_sqlite.sql)
  :::

:::

::: warning

Напомним, что в SQLite `NULL` отображается как пустая ячейка, из-за чего его легко спутать с пустой строкой (`''`).

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

### Проверяем структуру

Выводим информацию о таблицах:

::: play sandbox=sqlite editor=basic template="#show_null" depends-on=learning_portal_sqlite.sql

```sql
PRAGMA table_info('teachers');
PRAGMA table_info('courses');
PRAGMA table_info('students');
PRAGMA table_info('enrollments');
```

:::

Выводим информацию о внешних ключах:

::: play sandbox=sqlite editor=basic template="#show_null" depends-on=learning_portal_sqlite.sql

```sql
PRAGMA foreign_key_list('teachers');
PRAGMA foreign_key_list('courses');
PRAGMA foreign_key_list('students');
PRAGMA foreign_key_list('enrollments');
```

:::

`PRAGMA table_info` показывает столбцы и их ограничения, а `foreign_key_list` — таблицы, на которые ссылается выбранная таблица. Обратите внимание, что `PRAGMA foreign_key_list` показывает только таблицы, на которые ссылается выбранная таблица. Если выбранная таблица не ссылается на другие таблицы, то `foreign_key_list` ничего не показывает.

Ну и наконец выведем данные из таблиц:

::: play sandbox=sqlite editor=basic template="#show_null" depends-on=learning_portal_sqlite.sql

```sql
SELECT * FROM teachers;
SELECT * FROM courses;
SELECT * FROM students;
SELECT * FROM enrollments;
```

:::

## Создание таблиц со связями по шагам

1. **Создаём родительскую таблицу.** Например, `teachers` с `id` как первичным ключом.
2. **Создаём дочернюю таблицу и добавляем внешний ключ.** `courses` получает поле `teacher_id INTEGER REFERENCES teachers(id)`.
3. **Настраиваем таблицу-связку для `M — N`.** Таблица `enrollments` содержит два внешних ключа (`student_id`, `course_id`) и хранит дополнительные атрибуты (`enrolled_at`).
4. **Включаем `PRAGMA foreign_keys`.** Без этого SQLite проигнорирует ограничения.
5. **Заранее продумываем поведение при удалении/обновлении.** В учебном примере использованы `ON DELETE CASCADE`, чтобы не оставались «висящие» записи.

::: info
Даже если в модели нет связи `M — N`, полезно выносить дополнительные атрибуты (например, оценки, статусы) в отдельную таблицу, а не дублировать их напрямую в `students`.
:::

## Варианты `ON DELETE` / `ON UPDATE`

| Опция        | Поведение                                                                 |
| ------------ | ------------------------------------------------------------------------- |
| `NO ACTION`  | (значение по умолчанию) Проверка выполняется после операции; при нарушении внешнего ключа выдаётся ошибка. |
| `RESTRICT`   | Похоже на `NO ACTION`, но проверка выполняется сразу; операция блокируется, если есть дочерние записи. |
| `CASCADE`    | Автоматически удаляет/обновляет дочерние записи вслед за родительской.    |
| `SET NULL`   | Устанавливает `NULL` в дочернем поле. Работает только если поле допускает `NULL`. |
| `SET DEFAULT`| Подставляет значение по умолчанию из определения столбца.                 |

SQLite поддерживает все перечисленные варианты. Выбор зависит от бизнес-правил: где-то важно сохранить историю (`RESTRICT`), где-то безопаснее «очищать» ссылку (`SET NULL`), а в демонстрационных базах часто используют `CASCADE`.

## Виды `JOIN` на практике

`JOIN` — операция, которая объединяет строки двух и более таблиц по условию соответствия пары строк по условию `ON`. Тип `JOIN` определяет, какие строки попадут в результат, если совпадений нет.

### Обзор

![Типы JOIN](../img/SQL_JOIN_TYPES.png)

### `INNER JOIN`

![INNER JOIN](../img/SQL_INNER_JOIN.png)

Возвращает строки, для которых условие связи выполняется в обеих таблицах. Если ключевое слово `JOIN` указано без уточнения типа, подразумевается именно `INNER JOIN`.

::: play sandbox=sqlite editor=basic template="#show_null" depends-on=learning_portal_sqlite.sql

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

### `LEFT JOIN`

![LEFT JOIN](../img/SQL_LEFT_JOIN.png)

Возвращает все строки из левой таблицы и совпадающие строки из правой. Если совпадений нет, значения правой таблицы будут `NULL`.

::: play sandbox=sqlite editor=basic template="#show_null" depends-on=learning_portal_sqlite.sql

```sql
SELECT
  courses.title,
  students.full_name AS student
FROM courses
LEFT JOIN enrollments ON enrollments.course_id = courses.id
LEFT JOIN students ON students.id = enrollments.student_id
ORDER BY courses.title, student;
```

:::

Такой запрос позволяет увидеть курсы без слушателей — у них будет `NULL` в столбце `student`.

### `RIGHT JOIN`

![RIGHT JOIN](../img/SQL_RIGHT_JOIN.png)

SQLite не поддерживает `RIGHT JOIN`. Если нужно получить аналогичный результат, обычно перестраивают запрос (например, меняют местами таблицы в `LEFT JOIN` или используют `UNION`). Пример объединения рассмотрим в блоке про `UNION`.

### `FULL OUTER JOIN`

![FULL OUTER JOIN](../img/SQL_FULL_OUTER_JOIN.png)

Возвращает все строки из обеих таблиц, совпадающие и несовпадающие. Если совпадений нет, значения обеих таблиц будут `NULL`. SQLite не поддерживает `FULL OUTER JOIN`, но его можно реализовать с помощью `LEFT JOIN` и `RIGHT JOIN`. Пример объединения рассмотрим в блоке про `UNION`.

### `CROSS JOIN`

![CROSS JOIN](../img/SQL_CROSS_JOIN.png)

Формирует декартово произведение. В SQLite используется ключевое слово `CROSS JOIN` или просто перечисление таблиц через запятую (но лучше явно).

::: play sandbox=sqlite editor=basic template="#show_null" depends-on=learning_portal_sqlite.sql

```sql
SELECT teachers.full_name, courses.title
FROM teachers
CROSS JOIN courses
WHERE teachers.id = 1;
```

:::

В реальности редко используют `CROSS JOIN` напрямую, но он помогает, например, при генерации расписаний или комбинаций «всех со всеми».

::: tip

SQLite не поддерживает `RIGHT JOIN` и `FULL OUTER JOIN`, но их можно эмулировать комбинацией `LEFT JOIN` и `UNION`. Пример объединения рассмотрим в блоке про `UNION`.

:::

## Объединение выборок: `UNION` и `UNION ALL`

`UNION` объединяет несколько запросов `SELECT` в одну выборку. Требования:

- одинаковое количество столбцов в каждом запросе;
- совместимые типы данных по позициям;
- итоговые имена столбцов берутся из первого `SELECT`.

`UNION` по умолчанию убирает дубликаты. Если дубликаты нужны, используйте `UNION ALL`.

### Пример: курсы со слушателями и без них

::: play sandbox=sqlite editor=basic template="#show_null" depends-on=learning_portal_sqlite.sql

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
WHERE enrollments.id IS NULL
ORDER BY course, status;
```

:::

### Эмуляция `RIGHT JOIN` через `UNION ALL`

::: play sandbox=sqlite editor=basic template="#show_null" depends-on=learning_portal_sqlite.sql

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
WHERE students.id IS NULL;
```

:::

Первая часть запроса выводит студентов и их курсы (если они есть). Вторая часть добавляет курсы без студентов. Итоговая выборка покрывает обе ситуации — аналогичную поведению `RIGHT JOIN`.

## Практические задания

### Задание 1. `CREATE TABLE` + внешний ключ `ON DELETE CASCADE`

::: tabs

@tab Условие

В учебную базу нужно добавить таблицу `classrooms` (аудитории) с полями `id`, `title`, `capacity`, `course_id`. Напишите команду `CREATE TABLE`, которая связывает аудитории с таблицей `courses` и удаляет запись автоматически, если курс удалён.

@tab Решение

```sql
CREATE TABLE classrooms (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  capacity INTEGER NOT NULL,
  course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE
);
```

:::

### Задание 2. `INNER JOIN` таблицы-связки и справочников

::: tabs

@tab Условие

Сформируйте запрос, который выводит список студентов и названия курсов, на которые они записаны. Используйте `INNER JOIN`.

@tab Решение

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

### Задание 3. Проверка структуры через `PRAGMA table_info` и `foreign_key_list`

::: tabs

@tab Условие

После добавления таблицы `classrooms` убедитесь, что внешний ключ действительно создан. Напишите команды `PRAGMA`, которые нужно выполнить.

@tab Решение

```sql
PRAGMA table_info('classrooms');
PRAGMA foreign_key_list('classrooms');
```

`table_info` выводит список столбцов, а `foreign_key_list` показывает, что поле `course_id` ссылается на `courses(id)`.

:::

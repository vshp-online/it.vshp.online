# ИТ.03 - 25 - Практикум: проектирование схемы БД в MySQL Workbench

## Введение

На предыдущей лекции мы изучили основы создания ER‑диаграмм (Entity‑Relationship Diagrams) в MySQL Workbench, познакомились с элементами ERD (сущности, атрибуты, связи) и научились генерировать SQL‑скрипты из визуальной схемы. Этот практикум закрепит полученные знания через выполнение серии заданий по проектированию реальных баз данных.

**Цель практикума:** научиться создавать, редактировать и оптимизировать ER‑диаграммы в MySQL Workbench, правильно определять типы связей, настраивать ограничения целостности и преобразовывать графическую модель в работающий SQL‑код.

## Подготовка среды

1. Убедитесь, что у вас установлен **MySQL Workbench** (версия 8.0 или выше).
2. Запустите MySQL Workbench и перейдите в раздел **Modeling** (Моделирование).
3. Создайте новую модель (**File → New Model**) или откройте существующую.

Все задания выполняются в рамках одной модели, но вы можете создавать отдельные схемы (diagrams) для каждого задания или использовать одну общую диаграмму.

## Задания

Ниже приведены 7 практических заданий. Каждое задание состоит из условия и шаблона для решения. Рекомендуется выполнять задания последовательно, проверяя результат после каждого шага.

### Задание 1. Создание простой ERD для системы учета студентов

**Условие:**  
Спроектируйте ER‑диаграмму для базы данных «Учёт студентов». Требуется создать две сущности (таблицы):

- **students** – содержит информацию о студентах: уникальный идентификатор, фамилия, имя, дата рождения, номер зачётной книжки (уникальный).
- **departments** – содержит информацию о факультетах/кафедрах: идентификатор, название, код факультета (уникальный).

Определите подходящие типы данных для каждого атрибута, укажите первичные ключи. Связь между сущностями пока не устанавливайте.

**Решение:**  
```sql
CREATE TABLE departments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(150) NOT NULL,
    code VARCHAR(10) UNIQUE NOT NULL
);

CREATE TABLE students (
    id INT PRIMARY KEY AUTO_INCREMENT,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    birth_date DATE,
    record_book VARCHAR(20) UNIQUE NOT NULL,
    department_id INT
);
```

### Задание 2. Добавление связи «один‑ко‑многим» (1:N)

**Условие:**  
Дополните диаграмму из задания 1 связью между **departments** и **students**. Один факультет может иметь много студентов, каждый студент принадлежит ровно одному факультету (допускается NULL, если студент ещё не зачислен). Добавьте внешний ключ `department_id` в таблицу `students` и настройте связь в MySQL Workbench с визуальным представлением (линия с «вороньей лапкой» со стороны departments).

**Решение:**  
В MySQL Workbench:
1. Выберите инструмент **Place a New Relationship**.
2. Щёлкните сначала на таблице `departments`, затем на `students`.
3. В диалоге свойств связи укажите:
   - **Foreign Key**: `students(department_id)` ссылается на `departments(id)`
   - **Cardinality**: One‑to‑Many (1:n)
   - **Mandatory**: No (студент может быть без факультета)

SQL‑код внешнего ключа:
```sql
ALTER TABLE students
ADD CONSTRAINT fk_student_department
FOREIGN KEY (department_id) REFERENCES departments(id)
ON DELETE SET NULL ON UPDATE CASCADE;
```

### Задание 3. Связь «многие‑ко‑многим» (M:N) через промежуточную таблицу

**Условие:**  
Расширьте модель системы учёта студентов, добавив сущность **courses** (курсы) и связь «многие‑ко‑многим» между студентами и курсами. Студент может записаться на несколько курсов, курс может посещать много студентов. Создайте промежуточную таблицу **student_courses** с необходимыми внешними ключами. На диаграмме изобразите обе связи (students ↔ student_courses и courses ↔ student_courses).

**Решение:**  
```sql
CREATE TABLE courses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    credits INT DEFAULT 3
);

CREATE TABLE student_courses (
    student_id INT NOT NULL,
    course_id INT NOT NULL,
    enrollment_date DATE DEFAULT (CURDATE()),
    PRIMARY KEY (student_id, course_id),
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);
```

В MySQL Workbench добавьте таблицу `courses` и две связи 1:N от `students` к `student_courses` и от `courses` к `student_courses`.

### Задание 4. Настройка действий внешних ключей (CASCADE, SET NULL, RESTRICT)

**Условие:**  
Для всех созданных внешних ключей задайте осмысленные правила обновления и удаления:
- При удалении факультета (`departments`) у студентов этого факультета поле `department_id` должно устанавливаться в NULL.
- При удалении студента (`students`) все его записи в `student_courses` должны удаляться автоматически.
- При удалении курса (`courses`) все записи в `student_courses` для этого курса также должны удаляться.
- При обновлении `id` факультета изменения должны каскадно распространяться на `students.department_id`.

Настройте эти правила в MySQL Workbench через свойства связей (Foreign Key Options).

**Решение:**  
SQL‑код с указанными действиями:
```sql
-- Для связи departments ↔ students (уже настроено в задании 2)
ALTER TABLE students
DROP FOREIGN KEY fk_student_department;

ALTER TABLE students
ADD CONSTRAINT fk_student_department
FOREIGN KEY (department_id) REFERENCES departments(id)
ON DELETE SET NULL ON UPDATE CASCADE;

-- Для связи students ↔ student_courses
ALTER TABLE student_courses
DROP FOREIGN KEY student_courses_ibfk_1;

ALTER TABLE student_courses
ADD CONSTRAINT fk_student_courses_student
FOREIGN KEY (student_id) REFERENCES students(id)
ON DELETE CASCADE ON UPDATE CASCADE;

-- Для связи courses ↔ student_courses
ALTER TABLE student_courses
DROP FOREIGN KEY student_courses_ibfk_2;

ALTER TABLE student_courses
ADD CONSTRAINT fk_student_courses_course
FOREIGN KEY (course_id) REFERENCES courses(id)
ON DELETE CASCADE ON UPDATE CASCADE;
```

### Задание 5. Генерация SQL‑скрипта из ERD

**Условие:**  
Используя готовую ER‑диаграмму (объединяющую все таблицы из предыдущих заданий), сгенерируйте полный SQL‑скрипт создания базы данных. Скрипт должен включать:
- Создание всех таблиц с первичными ключами, уникальными ограничениями, типами данных.
- Все внешние ключи с заданными правилами.
- Комментарии к таблицам (опционально).

Экспортируйте скрипт в файл `university_schema.sql` и проверьте его выполнение в MySQL Server.

**Решение:**  
В MySQL Workbench:
1. Выберите **File → Export → Forward Engineer SQL CREATE Script**.
2. В мастере укажите:
   - **Export Options**: Generate DROP statements, Generate INSERT statements (по желанию)
   - **Object Types**: Tables, Foreign Keys
   - **Output**: Save to file `university_schema.sql`
3. Нажмите **Finish**.

Пример сгенерированного фрагмента:
```sql
-- -----------------------------------------------------
-- Table `departments`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `departments` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(150) NOT NULL,
  `code` VARCHAR(10) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `code_UNIQUE` (`code` ASC) VISIBLE)
ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `students`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `students` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `first_name` VARCHAR(100) NOT NULL,
  `last_name` VARCHAR(100) NOT NULL,
  `birth_date` DATE NULL,
  `record_book` VARCHAR(20) NOT NULL,
  `department_id` INT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `record_book_UNIQUE` (`record_book` ASC) VISIBLE,
  INDEX `fk_students_departments_idx` (`department_id` ASC) VISIBLE,
  CONSTRAINT `fk_students_departments`
    FOREIGN KEY (`department_id`)
    REFERENCES `departments` (`id`)
    ON DELETE SET NULL
    ON UPDATE CASCADE)
ENGINE = InnoDB;
```

### Задание 6. Реверс‑инжиниринг существующей БД в Workbench

**Условие:**  
Скачайте или создайте простую базу данных (например, `sakila` или `world`), подключитесь к ней через MySQL Workbench и выполните реверс‑инжиниринг (Reverse Engineer) для получения её ER‑диаграммы. Изучите автоматически созданную схему: таблицы, связи, типы данных. Сохраните диаграмму в своей модели.

**Решение:**  
Пошаговая инструкция:
1. В MySQL Workbench выберите **Database → Reverse Engineer**.
2. Подключитесь к вашему MySQL‑серверу.
3. Выберите базу данных (например, `sakila`).
4. В мастере отметьте все объекты (таблицы, представления, процедуры), которые нужно импортировать.
5. Завершите процесс – Workbench создаст новую диаграмму со всеми таблицами и связями.

После импорта вы увидите готовую ERD, которую можно анализировать и редактировать.

### Задание 7. Оптимизация схемы: нормализация и индексы

**Условие:**  
В полученной из задания 6 схеме найдите потенциальные проблемы нормализации (например, избыточные столбцы, возможность выделения отдельной сущности). Предложите изменения:
- Выделите новую сущность, если обнаружена повторяющаяся группа данных.
- Добавьте индексы для столбцов, которые часто используются в условиях WHERE и JOIN.
- Убедитесь, что все связи имеют соответствующие внешние ключи.

Внесите изменения прямо в диаграмме и сгенерируйте скрипт миграции (ALTER TABLE).

**Решение:**  
Пример оптимизации для таблицы `address` из `sakila`:
```sql
-- Предположим, в таблице address есть столбцы city_id и postal_code.
-- Добавим индекс для ускорения поиска по postal_code:
CREATE INDEX idx_address_postal_code ON address(postal_code);

-- Если бы в таблице хранились и название города, и страна в одном столбце,
-- можно было бы нормализовать, выделив отдельную таблицу cities:
CREATE TABLE cities (
    city_id INT PRIMARY KEY AUTO_INCREMENT,
    city_name VARCHAR(100) NOT NULL,
    country_id INT,
    FOREIGN KEY (country_id) REFERENCES country(country_id)
);

-- Затем из address убрать city_name и оставить city_id.
```

В MySQL Workbench индексы добавляются через вкладку **Indexes** в свойствах таблицы.

## Заключение

Выполнив эти задания, вы закрепили навыки проектирования ER‑диаграмм в MySQL Workbench: от создания простых сущностей до настройки сложных связей, генерации SQL‑кода и реверс‑инжиниринга. Умение визуально проектировать базы данных значительно ускоряет разработку и уменьшает количество ошибок на этапе реализации.

**Дополнительные рекомендации:**
- Регулярно сохраняйте модель (`.mwb` файл) для возможности вернуться к предыдущим версиям.
- Используйте слои (layers) для организации больших диаграмм.
- Экспортируйте диаграмму в изображение (PNG/PDF) для документации.

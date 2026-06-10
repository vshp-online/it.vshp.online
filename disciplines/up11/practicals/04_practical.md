# УП.11 - 04 - Анализ структуры базы данных `employee`

## Цель работы

Ознакомиться со структурой базы данных `employee`, изучить таблицы, связи между ними, типы данных, первичные и внешние ключи. Приобрести навыки анализа существующей схемы базы данных, содержащей иерархические связи (самоссылающиеся внешние ключи) и связи «многие-ко-многим».

## Теоретическая часть

База данных `employee` является учебной базой данных, моделирующей структуру управления персоналом в компании. Она содержит информацию о сотрудниках, их должностях, отделах, проектах и участии сотрудников в проектах. База состоит из пяти таблиц:

1. **`department`** – содержит данные об отделах компании.
2. **`position`** – содержит справочник должностей с вилками зарплат.
3. **`employee`** – содержит данные о сотрудниках.
4. **`project`** – содержит данные о проектах компании.
5. **`employee_project`** – связующая таблица для отношения «многие-ко-многим» между сотрудниками и проектами.

### Схема базы данных

```
┌──────────────┐     ┌──────────────┐     ┌──────────────────┐
│  department  │     │   position   │     │    employee      │
├──────────────┤     ├──────────────┤     ├──────────────────┤
│ ID (PK)      │◄────┤ ID (PK)      │     │ ID (PK)          │
│ Name         │     │ Title        │     │ FirstName        │
│ Location     │     │ MinSalary    │     │ LastName         │
└──────────────┘     │ MaxSalary    │     │ Email            │
                     └──────────────┘     │ Phone            │
                                          │ HireDate         │
┌──────────────┐     ┌──────────────────┐ │ Salary           │
│   project    │     │ employee_project │ │ DepartmentID(FK)─►│──┐
├──────────────┤     ├──────────────────┤ │ PositionID  (FK)─►│──┤
│ ID (PK)      │◄────┤ ProjectID  (FK)  │ │ ManagerID   (FK)─►│──┤
│ Name         │     │ EmployeeID (FK)  │ └──────────────────┘  │
│ StartDate    │     │ Role             │                       │
│ EndDate      │     │ HoursAllocated   │                       │
│ Budget       │     └──────────────────┘                       │
│ DepartmentID─►──┐                                            │
└────────────────┘│                                            │
                  └─────────────────────────────────────────────┘
```

### Структура таблиц

#### Таблица `department`

| Поле | Тип данных | Описание | Ограничения |
|------|------------|----------|-------------|
| `ID` | int | Уникальный идентификатор отдела | Первичный ключ, AUTO_INCREMENT |
| `Name` | varchar(100) | Название отдела | NOT NULL |
| `Location` | varchar(100) | Местоположение отдела | NOT NULL |

#### Таблица `position`

| Поле | Тип данных | Описание | Ограничения |
|------|------------|----------|-------------|
| `ID` | int | Уникальный идентификатор должности | Первичный ключ, AUTO_INCREMENT |
| `Title` | varchar(100) | Название должности | NOT NULL |
| `MinSalary` | decimal(10,2) | Минимальная зарплата для должности | NOT NULL |
| `MaxSalary` | decimal(10,2) | Максимальная зарплата для должности | NOT NULL |

#### Таблица `employee`

| Поле | Тип данных | Описание | Ограничения |
|------|------------|----------|-------------|
| `ID` | int | Уникальный идентификатор сотрудника | Первичный ключ, AUTO_INCREMENT |
| `FirstName` | varchar(50) | Имя сотрудника | NOT NULL |
| `LastName` | varchar(50) | Фамилия сотрудника | NOT NULL |
| `Email` | varchar(100) | Адрес электронной почты | NOT NULL |
| `Phone` | varchar(20) | Номер телефона | NOT NULL |
| `HireDate` | date | Дата приёма на работу | NOT NULL |
| `Salary` | decimal(10,2) | Заработная плата | NOT NULL |
| `DepartmentID` | int | Ссылка на отдел | Внешний ключ на `department.ID` |
| `PositionID` | int | Ссылка на должность | Внешний ключ на `position.ID` |
| `ManagerID` | int | Ссылка на руководителя (сотрудника) | Внешний ключ на `employee.ID`, может быть NULL |

#### Таблица `project`

| Поле | Тип данных | Описание | Ограничения |
|------|------------|----------|-------------|
| `ID` | int | Уникальный идентификатор проекта | Первичный ключ, AUTO_INCREMENT |
| `Name` | varchar(150) | Название проекта | NOT NULL |
| `StartDate` | date | Дата начала проекта | NOT NULL |
| `EndDate` | date | Дата завершения проекта | Может быть NULL |
| `Budget` | decimal(12,2) | Бюджет проекта | NOT NULL |
| `DepartmentID` | int | Ссылка на ответственный отдел | Внешний ключ на `department.ID` |

#### Таблица `employee_project`

| Поле | Тип данных | Описание | Ограничения |
|------|------------|----------|-------------|
| `EmployeeID` | int | Ссылка на сотрудника | Внешний ключ на `employee.ID`, часть составного первичного ключа |
| `ProjectID` | int | Ссылка на проект | Внешний ключ на `project.ID`, часть составного первичного ключа |
| `Role` | varchar(100) | Роль сотрудника в проекте | NOT NULL |
| `HoursAllocated` | int | Выделенное количество часов | NOT NULL |

### Связи между таблицами

- **`employee.DepartmentID`** → **`department.ID`** (многие-к-одному, сотрудник работает в одном отделе)
- **`employee.PositionID`** → **`position.ID`** (многие-к-одному, сотрудник занимает одну должность)
- **`employee.ManagerID`** → **`employee.ID`** (многие-к-одному, самоссылающийся внешний ключ; сотрудник имеет одного руководителя, который также является сотрудником)
- **`project.DepartmentID`** → **`department.ID`** (многие-к-одному, проект выполняется одним отделом)
- **`employee_project.EmployeeID`** → **`employee.ID`** (многие-ко-многим, сотрудник может участвовать в нескольких проектах)
- **`employee_project.ProjectID`** → **`project.ID`** (многие-ко-многим, в проекте может участвовать несколько сотрудников)

## Практические задания

### 1. Изучение схемы базы данных

1. Установите соединение с сервером MySQL и загрузите базу данных `employee` из файла [`employee.sql`](../../material/employee.sql).
2. Выполните запрос для отображения списка таблиц в базе `employee`:

   ```sql
   SHOW TABLES FROM employee;
   ```

3. Для каждой таблицы просмотрите её структуру с помощью команды `DESCRIBE`:

   ```sql
   DESCRIBE employee.department;
   DESCRIBE employee.position;
   DESCRIBE employee.employee;
   DESCRIBE employee.project;
   DESCRIBE employee.employee_project;
   ```

**Решение**

1. После загрузки базы данных выполним `SHOW TABLES FROM employee;`. Результат:
   ```
   +--------------------+
   | Tables_in_employee |
   +--------------------+
   | department         |
   | employee           |
   | employee_project   |
   | position           |
   | project            |
   +--------------------+
   ```
   Видим пять таблиц: `department`, `employee`, `employee_project`, `position`, `project`.

2. Структура таблиц, полученная через `DESCRIBE`:

   **Таблица `department`:**
   ```
   +----------+--------------+------+-----+---------+----------------+
   | Field    | Type         | Null | Key | Default | Extra          |
   +----------+--------------+------+-----+---------+----------------+
   | ID       | int          | NO   | PRI | NULL    | auto_increment |
   | Name     | varchar(100) | NO   |     |         |                |
   | Location | varchar(100) | NO   |     |         |                |
   +----------+--------------+------+-----+---------+----------------+
   ```

   **Таблица `position`:**
   ```
   +-----------+---------------+------+-----+---------+----------------+
   | Field     | Type          | Null | Key | Default | Extra          |
   +-----------+---------------+------+-----+---------+----------------+
   | ID        | int           | NO   | PRI | NULL    | auto_increment |
   | Title     | varchar(100)  | NO   |     |         |                |
   | MinSalary | decimal(10,2) | NO   |     | 0.00    |                |
   | MaxSalary | decimal(10,2) | NO   |     | 0.00    |                |
   +-----------+---------------+------+-----+---------+----------------+
   ```

   **Таблица `employee`:**
   ```
   +--------------+---------------+------+-----+---------+----------------+
   | Field        | Type          | Null | Key | Default | Extra          |
   +--------------+---------------+------+-----+---------+----------------+
   | ID           | int           | NO   | PRI | NULL    | auto_increment |
   | FirstName    | varchar(50)   | NO   |     |         |                |
   | LastName     | varchar(50)   | NO   |     |         |                |
   | Email        | varchar(100)  | NO   |     |         |                |
   | Phone        | varchar(20)   | NO   |     |         |                |
   | HireDate     | date          | NO   |     |         |                |
   | Salary       | decimal(10,2) | NO   |     | 0.00    |                |
   | DepartmentID | int           | NO   | MUL | 0       |                |
   | PositionID   | int           | NO   | MUL | 0       |                |
   | ManagerID    | int           | YES  | MUL | NULL    |                |
   +--------------+---------------+------+-----+---------+----------------+
   ```

   **Таблица `project`:**
   ```
   +--------------+---------------+------+-----+---------+----------------+
   | Field        | Type          | Null | Key | Default | Extra          |
   +--------------+---------------+------+-----+---------+----------------+
   | ID           | int           | NO   | PRI | NULL    | auto_increment |
   | Name         | varchar(150)  | NO   |     |         |                |
   | StartDate    | date          | NO   |     |         |                |
   | EndDate      | date          | YES  |     | NULL    |                |
   | Budget       | decimal(12,2) | NO   |     | 0.00    |                |
   | DepartmentID | int           | NO   | MUL | 0       |                |
   +--------------+---------------+------+-----+---------+----------------+
   ```

   **Таблица `employee_project`:**
   ```
   +-----------------+--------------+------+-----+---------+-------+
   | Field           | Type         | Null | Key | Default | Extra |
   +-----------------+--------------+------+-----+---------+-------+
   | EmployeeID      | int          | NO   | PRI | 0       |       |
   | ProjectID       | int          | NO   | PRI | 0       |       |
   | Role            | varchar(100) | NO   |     |         |       |
   | HoursAllocated  | int          | NO   |     | 0       |       |
   +-----------------+--------------+------+-----+---------+-------+
   ```

   Таким образом, мы видим все столбцы, их типы, признаки NULL, ключи и значения по умолчанию.

### 2. Анализ первичных и внешних ключей

1. Определите, какие поля являются первичными ключами в каждой таблице.
2. Найдите все внешние ключи и укажите, какие таблицы они связывают.
3. Проверьте ограничения внешних ключей с помощью запроса:

   ```sql
   SELECT 
     TABLE_NAME,
     COLUMN_NAME,
     CONSTRAINT_NAME,
     REFERENCED_TABLE_NAME,
     REFERENCED_COLUMN_NAME
   FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
   WHERE TABLE_SCHEMA = 'employee' AND REFERENCED_TABLE_NAME IS NOT NULL;
   ```

**Решение**

1. **Первичные ключи:**
   - Таблица `department`: поле `ID` (int, auto_increment).
   - Таблица `position`: поле `ID` (int, auto_increment).
   - Таблица `employee`: поле `ID` (int, auto_increment).
   - Таблица `project`: поле `ID` (int, auto_increment).
   - Таблица `employee_project`: составной первичный ключ (`EmployeeID`, `ProjectID`).

2. **Внешние ключи:**
   - В таблице `employee`: столбец `DepartmentID` ссылается на `department.ID`.
   - В таблице `employee`: столбец `PositionID` ссылается на `position.ID`.
   - В таблице `employee`: столбец `ManagerID` ссылается на `employee.ID` (самоссылающийся внешний ключ).
   - В таблице `project`: столбец `DepartmentID` ссылается на `department.ID`.
   - В таблице `employee_project`: столбец `EmployeeID` ссылается на `employee.ID`.
   - В таблице `employee_project`: столбец `ProjectID` ссылается на `project.ID`.

3. **Проверка ограничений внешних ключей через `INFORMATION_SCHEMA`:**
   Выполним предложенный запрос. Пример результата:
   ```
   +------------------+--------------+------------------------+-----------------------+------------------------+
   | TABLE_NAME       | COLUMN_NAME  | CONSTRAINT_NAME        | REFERENCED_TABLE_NAME | REFERENCED_COLUMN_NAME |
   +------------------+--------------+------------------------+-----------------------+------------------------+
   | employee         | DepartmentID | employee_ibfk_1        | department            | ID                     |
   | employee         | PositionID   | employee_ibfk_2        | position              | ID                     |
   | employee         | ManagerID    | employee_ibfk_3        | employee              | ID                     |
   | project          | DepartmentID | project_ibfk_1         | department            | ID                     |
   | employee_project | EmployeeID   | employee_project_ibfk_1| employee              | ID                     |
   | employee_project | ProjectID    | employee_project_ibfk_2| project               | ID                     |
   +------------------+--------------+------------------------+-----------------------+------------------------+
   ```
   Видим шесть внешних ключей, соответствующих описанным выше связям. Обратите внимание на самоссылающийся внешний ключ `employee_ibfk_3`, который связывает `employee.ManagerID` с `employee.ID`.

### 3. Анализ типов данных

1. Для каждой таблицы выпишите типы данных всех столбцов и их размерность.
2. Объясните, почему для поля `Salary` в таблице `employee` выбран тип `DECIMAL(10,2)`, а для `Budget` в таблице `project` – `DECIMAL(12,2)`.
3. Почему для поля `HireDate` используется тип `DATE`, а не `DATETIME` или `TIMESTAMP`?
4. Объясните, почему в таблице `employee_project` используется составной первичный ключ.

**Решение**

1. **Типы данных и размерность** (уже приведены в решении задания 1):
   - **`department`**: `ID` (int), `Name` (varchar(100)), `Location` (varchar(100)).
   - **`position`**: `ID` (int), `Title` (varchar(100)), `MinSalary` (decimal(10,2)), `MaxSalary` (decimal(10,2)).
   - **`employee`**: `ID` (int), `FirstName` (varchar(50)), `LastName` (varchar(50)), `Email` (varchar(100)), `Phone` (varchar(20)), `HireDate` (date), `Salary` (decimal(10,2)), `DepartmentID` (int), `PositionID` (int), `ManagerID` (int, NULL).
   - **`project`**: `ID` (int), `Name` (varchar(150)), `StartDate` (date), `EndDate` (date, NULL), `Budget` (decimal(12,2)), `DepartmentID` (int).
   - **`employee_project`**: `EmployeeID` (int), `ProjectID` (int), `Role` (varchar(100)), `HoursAllocated` (int).

2. **Выбор `DECIMAL` для зарплаты и бюджета:**
   - `Salary` хранится как `DECIMAL(10,2)`. Это позволяет хранить значения до 99 999 999.99 с точностью до двух знаков после запятой. Для заработной платы сотрудников такой точности (копейки/центы) достаточно, а максимальное значение покрывает любые realistic зарплаты.
   - `Budget` хранится как `DECIMAL(12,2)`. Это позволяет хранить значения до 9 999 999 999.99 – на два порядка больше, чем `DECIMAL(10,2)`. Бюджеты проектов могут быть значительно больше индивидуальных зарплат (миллионы долларов), поэтому требуется большая разрядность.

3. **Использование типа `DATE` для `HireDate`:**
   Поле `HireDate` хранит только дату приёма на работу (год, месяц, число). Время приёма (часы, минуты, секунды) не имеет значения для бизнес-логики, поэтому тип `DATE` является оптимальным: он занимает меньше места (3 байта против 8 для `DATETIME`), и при этом полностью покрывает потребность в хранении календарной даты.

4. **Составной первичный ключ в `employee_project`:**
   Таблица `employee_project` реализует связь «многие-ко-многим» (N:M) между сотрудниками и проектами. Один сотрудник может участвовать в нескольких проектах, и в одном проекте может быть несколько сотрудников. Первичный ключ `(EmployeeID, ProjectID)` гарантирует уникальность пары «сотрудник–проект», то есть один сотрудник не может быть назначен на один и тот же проект дважды с разными ролями. Это стандартный подход для реализации связей N:M в реляционных базах данных.

### 4. Проверка целостности данных

1. Выполните запрос, который покажет, есть ли в таблице `employee` сотрудники, ссылающиеся на несуществующий отдел (нарушение внешнего ключа `employee_ibfk_1`):

   ```sql
   SELECT e.*
   FROM employee.employee e
   LEFT JOIN employee.department d ON e.DepartmentID = d.ID
   WHERE d.ID IS NULL;
   ```

2. Проверьте, есть ли в таблице `employee` сотрудники, у которых `ManagerID` ссылается на несуществующего сотрудника:

   ```sql
   SELECT e.*
   FROM employee.employee e
   LEFT JOIN employee.employee m ON e.ManagerID = m.ID
   WHERE m.ID IS NULL AND e.ManagerID IS NOT NULL;
   ```

3. Проверьте, есть ли в таблице `employee_project` записи, ссылающиеся на несуществующих сотрудников или проекты:

   ```sql
   SELECT ep.*
   FROM employee.employee_project ep
   LEFT JOIN employee.employee e ON ep.EmployeeID = e.ID
   LEFT JOIN employee.project p ON ep.ProjectID = p.ID
   WHERE e.ID IS NULL OR p.ID IS NULL;
   ```

**Решение**

1. **Проверка ссылок `employee.DepartmentID` → `department.ID`:**
   Выполним первый запрос. Результат будет пустым (0 строк), так как в корректной базе все сотрудники привязаны к существующим отделам. Пример вывода:
   ```
   Empty set (0.00 sec)
   ```
   Это подтверждает, что внешний ключ `employee_ibfk_1` обеспечивает целостность данных.

2. **Проверка ссылок `employee.ManagerID` → `employee.ID`:**
   Выполним второй запрос. Результат также будет пустым, так как все руководители указаны корректно. Пример:
   ```
   Empty set (0.00 sec)
   ```
   Обратите внимание: у сотрудников верхнего уровня (например, руководителей отделов) `ManagerID` может быть `NULL`, но такие строки исключены условием `e.ManagerID IS NOT NULL`. Таким образом, нарушений целостности не обнаружено.

3. **Проверка ссылок `employee_project` → `employee` и `project`:**
   Выполним третий запрос. Результат будет пустым, подтверждая, что все записи в связующей таблице ссылаются на существующих сотрудников и проекты:
   ```
   Empty set (0.00 sec)
   ```

   *Примечание:* Если бы в базе были ошибки (например, удалён сотрудник или проект, на который есть ссылки в `employee_project`), запрос вывел бы соответствующие строки.

### 5. Исследование данных

1. Подсчитайте количество записей в каждой таблице.
2. Определите, сколько сотрудников работает в каждом отделе. Отсортируйте результат по убыванию количества сотрудников.
3. Найдите самого высокооплачиваемого сотрудника и его должность.
4. Определите, у каких проектов бюджет превышает 200 000, и какие отделы их выполняют.

**Решение**

1. **Количество записей в каждой таблице:**
   ```sql
   SELECT 'department' AS table_name, COUNT(*) AS record_count FROM employee.department
   UNION ALL
   SELECT 'position', COUNT(*) FROM employee.position
   UNION ALL
   SELECT 'employee', COUNT(*) FROM employee.employee
   UNION ALL
   SELECT 'project', COUNT(*) FROM employee.project
   UNION ALL
   SELECT 'employee_project', COUNT(*) FROM employee.employee_project;
   ```
   Результат:
   ```
   +------------------+--------------+
   | table_name       | record_count |
   +------------------+--------------+
   | department       |           10 |
   | position         |           20 |
   | employee         |           25 |
   | project          |            8 |
   | employee_project |           24 |
   +------------------+--------------+
   ```

2. **Количество сотрудников по отделам:**
   ```sql
   SELECT d.Name AS department_name, COUNT(e.ID) AS employee_count
   FROM employee.employee e
   JOIN employee.department d ON e.DepartmentID = d.ID
   GROUP BY d.Name
   ORDER BY employee_count DESC;
   ```
   Результат:
   ```
   +------------------------+----------------+
   | department_name        | employee_count |
   +------------------------+----------------+
   | Engineering            |              5 |
   | Marketing              |              3 |
   | Human Resources        |              3 |
   | Finance                |              2 |
   | Sales                  |              3 |
   | IT Support             |              2 |
   | Research & Development |              2 |
   | Legal                  |              1 |
   | Operations             |              2 |
   | Customer Service       |              2 |
   +------------------------+----------------+
   ```
   Больше всего сотрудников работает в отделе Engineering (5 человек), что отражает фокус компании на разработке.

3. **Самый высокооплачиваемый сотрудник и его должность:**
   ```sql
   SELECT e.FirstName, e.LastName, e.Salary, p.Title AS position_title
   FROM employee.employee e
   JOIN employee.position p ON e.PositionID = p.ID
   ORDER BY e.Salary DESC
   LIMIT 1;
   ```
   Результат:
   ```
   +-----------+----------+---------+----------------+
   | FirstName | LastName | Salary  | position_title |
   +-----------+----------+---------+----------------+
   | John      | Smith    | 145000.00 | Team Lead     |
   +-----------+----------+---------+----------------+
   ```
   Самым высокооплачиваемым сотрудником является John Smith с зарплатой 145 000.00, занимающий должность Team Lead.

4. **Проекты с бюджетом более 200 000 и ответственные отделы:**
   ```sql
   SELECT p.Name AS project_name, p.Budget, d.Name AS department_name
   FROM employee.project p
   JOIN employee.department d ON p.DepartmentID = d.ID
   WHERE p.Budget > 200000
   ORDER BY p.Budget DESC;
   ```
   Результат:
   ```
   +---------------------------+-------------+------------------------+
   | project_name              | Budget      | department_name        |
   +---------------------------+-------------+------------------------+
   | European Market Expansion | 750000.00   | Sales                  |
   | Cloud Migration           | 500000.00   | Engineering            |
   | Data Analytics Platform   | 450000.00   | Research & Development |
   | Mobile App v2             | 350000.00   | Engineering            |
   | Office Relocation         | 200000.00   | Operations             |
   +---------------------------+-------------+------------------------+
   ```
   Самый крупный проект – «European Market Expansion» с бюджетом 750 000, выполняемый отделом Sales.
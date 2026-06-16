# УП.11 - 6 - Модификация данных в базе `employee`

## Цель работы

Освоить операции модификации данных в реляционной базе данных: добавление новых записей (INSERT), обновление существующих (UPDATE), удаление записей (DELETE). Научиться применять эти операции с учётом ограничений целостности (первичные и внешние ключи). Получить практический опыт изменения данных в демонстрационной базе `employee`.

## Теоретическая часть

В предыдущих работах вы изучали структуру базы данных `employee` и выполняли запросы SELECT для извлечения информации. Теперь мы переходим к операциям, которые изменяют состояние базы данных:

1. **INSERT** – добавление новых строк в таблицу.
2. **UPDATE** – изменение значений в существующих строках.
3. **DELETE** – удаление строк из таблицы.

### Структура базы данных `employee`

База данных `employee` моделирует управление персоналом компании и состоит из пяти таблиц:

- **`department`** – отделы компании (`ID`, `Name`, `Location`)
- **`position`** – должности с вилками зарплат (`ID`, `Title`, `MinSalary`, `MaxSalary`)
- **`employee`** – сотрудники (`ID`, `FirstName`, `LastName`, `Email`, `Phone`, `HireDate`, `Salary`, `DepartmentID`, `PositionID`, `ManagerID`)
- **`project`** – проекты (`ID`, `Name`, `StartDate`, `EndDate`, `Budget`, `DepartmentID`)
- **`employee_project`** – назначение сотрудников на проекты (`EmployeeID`, `ProjectID`, `Role`, `HoursAllocated`)

### Ограничения целостности

При выполнении операций модификации необходимо учитывать следующие ограничения:

- **Первичные ключи** – гарантируют уникальность записей. При INSERT нельзя дублировать значения первичного ключа.
- **Внешние ключи** – обеспечивают ссылочную целостность:
  - `employee.DepartmentID` ссылается на `department.ID`
  - `employee.PositionID` ссылается на `position.ID`
  - `employee.ManagerID` ссылается на `employee.ID`
  - `project.DepartmentID` ссылается на `department.ID`
  - `employee_project.EmployeeID` ссылается на `employee.ID`
  - `employee_project.ProjectID` ссылается на `project.ID`
- **Ограничения NOT NULL** – некоторые поля обязательны для заполнения.
- **Типы данных** – значения должны соответствовать объявленным типам (например, `Salary` имеет тип `DECIMAL(10,2)`).

### Безопасность операций модификации

Перед выполнением операций UPDATE и DELETE рекомендуется:
1. Сначала выполнить SELECT с теми же условиями, чтобы убедиться, что будут затронуты нужные строки.
2. Использовать транзакции (START TRANSACTION, COMMIT, ROLLBACK), чтобы иметь возможность отката изменений в случае ошибки.
3. Делать резервные копии данных перед массовыми изменениями.

## Практические задания

### 1. Добавление нового отдела

Добавьте в таблицу `department` новый отдел с названием "Research & Development" и расположением "Austin". Обратите внимание, что поле `ID` является автоинкрементным, поэтому его указывать не нужно.

**Решение**

```sql
INSERT INTO employee.department (Name, Location)
VALUES ('Research & Development', 'Austin');
```

**Проверка добавления**

```sql
SELECT * FROM employee.department ORDER BY ID;
```

**Пример результата:**

```
+----+---------------------------+---------------+
| ID | Name                      | Location      |
+----+---------------------------+---------------+
|  1 | Engineering               | New York      |
|  2 | Marketing                 | San Francisco |
|  3 | Human Resources           | Chicago       |
|  4 | Finance                   | Boston        |
|  5 | Sales                     | Los Angeles   |
|  6 | IT Support                | Seattle       |
|  7 | Research & Development    | Austin        |
|  8 | Legal                     | Washington DC |
|  9 | Operations                | Denver        |
| 10 | Customer Service          | Miami         |
| 11 | Research & Development    | Austin        |
+----+---------------------------+---------------+
```

### 2. Добавление новой должности

Добавьте в таблицу `position` новую должность "Data Scientist" с минимальной зарплатой 90000.00 и максимальной 140000.00.

**Решение**

```sql
INSERT INTO employee.position (Title, MinSalary, MaxSalary)
VALUES ('Data Scientist', 90000.00, 140000.00);
```

**Проверка добавления**

```sql
SELECT * FROM employee.position ORDER BY ID;
```

**Пример результата:**

```
+----+------------------------+-----------+-----------+
| ID | Title                  | MinSalary | MaxSalary |
+----+------------------------+-----------+-----------+
|  1 | Junior Developer       |  40000.00 |  65000.00 |
|  2 | Senior Developer       |  70000.00 | 120000.00 |
|  3 | Team Lead              | 100000.00 | 150000.00 |
| ...| ...                    | ...       | ...       |
| 19 | Product Manager        |  90000.00 | 140000.00 |
| 20 | UX Designer            |  60000.00 |  95000.00 |
| 21 | Data Scientist         |  90000.00 | 140000.00 |
+----+------------------------+-----------+-----------+
```

### 3. Добавление нового сотрудника

Добавьте в таблицу `employee` нового сотрудника:
- Имя: "Alex", Фамилия: "Turner"
- Email: "alex.turner@company.com"
- Телефон: "+1-512-555-0703"
- Дата найма: "2023-03-01"
- Зарплата: 95000.00
- Отдел: Research & Development (ID = 7)
- Должность: Data Scientist (ID = 14)
- Руководитель: John Smith (ID = 1)

**Решение**

```sql
INSERT INTO employee.employee (
    FirstName, LastName, Email, Phone,
    HireDate, Salary, DepartmentID, PositionID, ManagerID
) VALUES (
    'Alex', 'Turner', 'alex.turner@company.com',
    '+1-512-555-0703', '2023-03-01', 95000.00,
    7, 14, 1
);
```

**Проверка добавления**

```sql
SELECT * FROM employee.employee WHERE Email = 'alex.turner@company.com';
```

**Пример результата:**

```
+----+-----------+----------+---------------------------+----------------+------------+----------+--------------+------------+-----------+
| ID | FirstName | LastName | Email                     | Phone          | HireDate   | Salary   | DepartmentID | PositionID | ManagerID |
+----+-----------+----------+---------------------------+----------------+------------+----------+--------------+------------+-----------+
| 26 | Alex      | Turner   | alex.turner@company.com   | +1-512-555-0703| 2023-03-01 | 95000.00 |            7 |         14 |         1 |
+----+-----------+----------+---------------------------+----------------+------------+----------+--------------+------------+-----------+
```

### 4. Добавление нового проекта

Добавьте в таблицу `project` новый проект:
- Название: "AI Research Initiative"
- Дата начала: "2023-07-01"
- Дата окончания: NULL (проект ещё не завершён)
- Бюджет: 600000.00
- Отдел: Research & Development (ID = 7)

**Решение**

```sql
INSERT INTO employee.project (Name, StartDate, EndDate, Budget, DepartmentID)
VALUES ('AI Research Initiative', '2023-07-01', NULL, 600000.00, 7);
```

**Проверка добавления**

```sql
SELECT * FROM employee.project WHERE Name = 'AI Research Initiative';
```

**Пример результата:**

```
+----+----------------------+------------+---------+-----------+--------------+
| ID | Name                 | StartDate  | EndDate | Budget    | DepartmentID |
+----+----------------------+------------+---------+-----------+--------------+
|  9 | AI Research Initiative| 2023-07-01 | NULL    | 600000.00 |            7 |
+----+----------------------+------------+---------+-----------+--------------+
```

### 5. Назначение сотрудника на проект

Назначьте сотрудника Alex Turner (ID = 26) на проект "AI Research Initiative" (ID = 9) в роли "Lead Researcher" с выделенными часами 160.

**Решение**

```sql
INSERT INTO employee.employee_project (EmployeeID, ProjectID, Role, HoursAllocated)
VALUES (26, 9, 'Lead Researcher', 160);
```

**Проверка добавления**

```sql
SELECT 
    ep.EmployeeID,
    CONCAT(e.FirstName, ' ', e.LastName) AS EmployeeName,
    ep.ProjectID,
    p.Name AS ProjectName,
    ep.Role,
    ep.HoursAllocated
FROM employee.employee_project ep
JOIN employee.employee e ON ep.EmployeeID = e.ID
JOIN employee.project p ON ep.ProjectID = p.ID
WHERE ep.EmployeeID = 26;
```

### 6. Обновление зарплаты сотрудника

Увеличьте зарплату сотрудника "Michael Williams" (ID = 3) на 15%. Текущая зарплата — 82000.00.

**Решение**

```sql
UPDATE employee.employee
SET Salary = Salary * 1.15
WHERE ID = 3;
```

**Проверка обновления**

```sql
SELECT ID, FirstName, LastName, Salary
FROM employee.employee
WHERE ID = 3;
```

**Пример результата:**

```
+----+-----------+----------+----------+
| ID | FirstName | LastName | Salary   |
+----+-----------+----------+----------+
|  3 | Michael   | Williams | 94300.00 |
+----+-----------+----------+----------+
```

### 7. Обновление данных с использованием JOIN

Переведите всех сотрудников отдела "Engineering" (ID = 1) на должность "Senior Developer" (ID = 2), если их зарплата превышает 70000.00. Используйте UPDATE с JOIN.

**Решение**

```sql
UPDATE employee.employee e
JOIN employee.department d ON e.DepartmentID = d.ID
SET e.PositionID = 2
WHERE d.Name = 'Engineering' AND e.Salary > 70000.00;
```

**Проверка обновления**

```sql
SELECT 
    e.ID,
    e.FirstName,
    e.LastName,
    e.Salary,
    p.Title AS Position
FROM employee.employee e
JOIN employee.department d ON e.DepartmentID = d.ID
JOIN employee.position p ON e.PositionID = p.ID
WHERE d.Name = 'Engineering'
ORDER BY e.Salary DESC;
```

**Пример результата:**

```
+----+-----------+----------+-----------+-----------------+
| ID | FirstName | LastName | Salary    | Position        |
+----+-----------+----------+-----------+-----------------+
|  1 | John      | Smith    | 145000.00 | Senior Developer|
|  2 | Emily     | Johnson  |  95000.00 | Senior Developer|
|  3 | Michael   | Williams |  94300.00 | Senior Developer|
|  4 | Sarah     | Brown    |  55000.00 | Junior Developer|
|  5 | David     | Jones    |  48000.00 | Junior Developer|
+----+-----------+----------+-----------+-----------------+
```

### 8. Обновление бюджета проекта с использованием подзапроса

Увеличьте бюджет всех проектов отдела "Sales" (ID = 5) на 10%. Используйте подзапрос для определения проектов отдела Sales.

**Решение**

```sql
UPDATE employee.project
SET Budget = Budget * 1.10
WHERE DepartmentID = (
    SELECT ID FROM employee.department WHERE Name = 'Sales'
);
```

**Проверка обновления**

```sql
SELECT 
    p.ID,
    p.Name,
    p.Budget,
    d.Name AS Department
FROM employee.project p
JOIN employee.department d ON p.DepartmentID = d.ID
WHERE d.Name = 'Sales';
```

**Пример результата:**

```
+----+----------------------------+-----------+------------+
| ID | Name                       | Budget    | Department |
+----+----------------------------+-----------+------------+
|  6 | European Market Expansion  | 825000.00 | Sales      |
+----+----------------------------+-----------+------------+
```

### 9. Массовое обновление с условием CASE

Обновите зарплату сотрудников в зависимости от отдела:
- Для отдела "Engineering" (ID = 1) — увеличьте на 10%
- Для отдела "Marketing" (ID = 2) — увеличьте на 8%
- Для отдела "Sales" (ID = 5) — увеличьте на 12%
- Для всех остальных отделов — увеличьте на 5%

**Решение**

```sql
UPDATE employee.employee
SET Salary = 
    CASE DepartmentID
        WHEN 1 THEN Salary * 1.10
        WHEN 2 THEN Salary * 1.08
        WHEN 5 THEN Salary * 1.12
        ELSE Salary * 1.05
    END;
```

**Проверка обновления**

```sql
SELECT 
    d.Name AS Department,
    COUNT(*) AS EmployeeCount,
    MIN(e.Salary) AS MinSalary,
    MAX(e.Salary) AS MaxSalary,
    AVG(e.Salary) AS AvgSalary
FROM employee.employee e
JOIN employee.department d ON e.DepartmentID = d.ID
GROUP BY d.Name
ORDER BY AvgSalary DESC;
```

### 10. Удаление записей с проверкой ограничений

Попробуйте удалить отдел "Research & Development" (ID = 7) из таблицы `department`. Объясните, что произойдёт и почему.

**Решение**

```sql
DELETE FROM employee.department WHERE ID = 7;
```

**Результат:** Операция завершится ошибкой из-за нарушения ограничения внешнего ключа. В таблицах `employee` и `project` есть записи, ссылающиеся на отдел с ID = 7. Чтобы удалить отдел, нужно сначала удалить или переназначить зависимые записи.

### 11. Каскадное удаление (теоретическое задание)

Предположим, что внешние ключи в базе `employee` были созданы с опцией `ON DELETE CASCADE`. Опишите, что произойдёт при удалении отдела с ID = 7 в этом случае.

**Решение**

При наличии `ON DELETE CASCADE` удаление записи в таблице `department` автоматически приведёт к удалению всех связанных записей в таблицах `employee` и `project`, где `DepartmentID = 7`. В свою очередь, удаление сотрудников из таблицы `employee` также каскадно удалит связанные записи из таблицы `employee_project`. Это позволяет поддерживать целостность базы данных без необходимости явного удаления зависимых записей, но требует осторожности, так как можно потерять большой объём данных одной операцией.

### 12. Удаление зависимых записей

Удалите назначения на проекты для сотрудника Alex Turner (ID = 26), затем самого сотрудника, проект "AI Research Initiative" (ID = 9), а затем отдел "Research & Development" (ID = 7).

**Решение**

```sql
-- Удаляем назначения на проекты
DELETE FROM employee.employee_project WHERE EmployeeID = 26;

-- Удаляем сотрудника
DELETE FROM employee.employee WHERE ID = 26;

-- Удаляем проект
DELETE FROM employee.project WHERE ID = 9;

-- Теперь можно удалить отдел
DELETE FROM employee.department WHERE ID = 7;
```

**Проверка удаления**

```sql
SELECT COUNT(*) AS dept_count FROM employee.department WHERE ID = 7;
SELECT COUNT(*) AS emp_count FROM employee.employee WHERE ID = 26;
SELECT COUNT(*) AS proj_count FROM employee.project WHERE ID = 9;
SELECT COUNT(*) AS assign_count FROM employee.employee_project WHERE EmployeeID = 26;
```

### 13. Обновление руководителя отдела

Назначьте сотрудника "Emily Johnson" (ID = 2) руководителем для всех сотрудников отдела "Engineering" (ID = 1), у которых в данный момент нет руководителя (ManagerID IS NULL). Предварительно проверьте, есть ли такие сотрудники.

**Проверка перед обновлением**

```sql
SELECT ID, FirstName, LastName
FROM employee.employee
WHERE DepartmentID = 1 AND ManagerID IS NULL;
```

**Решение**

```sql
UPDATE employee.employee
SET ManagerID = 2
WHERE DepartmentID = 1 AND ManagerID IS NULL;
```

**Проверка обновления**

```sql
SELECT 
    e.ID,
    e.FirstName AS EmployeeName,
    m.FirstName AS ManagerName
FROM employee.employee e
LEFT JOIN employee.employee m ON e.ManagerID = m.ID
WHERE e.DepartmentID = 1
ORDER BY e.ID;
```

### 14. Использование транзакций

Выполните несколько операций модификации в рамках одной транзакции:
1. Добавьте новый временный отдел "Temp Department".
2. Добавьте нового сотрудника в этот отдел.
3. Обновите зарплату сотрудника.
4. Выполните ROLLBACK, чтобы отменить все изменения.

**Решение**

```sql
-- Начало транзакции
START TRANSACTION;

-- 1. Добавление временного отдела
INSERT INTO employee.department (Name, Location)
VALUES ('Temp Department', 'Temporary Location');

-- Сохраняем ID добавленного отдела
SET @temp_dept_id = LAST_INSERT_ID();

-- 2. Добавление сотрудника
INSERT INTO employee.employee (
    FirstName, LastName, Email, Phone,
    HireDate, Salary, DepartmentID, PositionID
) VALUES (
    'Temp', 'Employee', 'temp@company.com',
    '+1-000-000-0000', '2023-12-01', 50000.00,
    @temp_dept_id, 1
);

-- Сохраняем ID добавленного сотрудника
SET @temp_emp_id = LAST_INSERT_ID();

-- 3. Обновление зарплаты
UPDATE employee.employee
SET Salary = 55000.00
WHERE ID = @temp_emp_id;

-- Проверяем добавленные данные
SELECT * FROM employee.department WHERE ID = @temp_dept_id;
SELECT * FROM employee.employee WHERE ID = @temp_emp_id;

-- Откат транзакции (чтобы не сохранять изменения)
ROLLBACK;

-- Проверка, что данные не остались в базе
SELECT * FROM employee.department WHERE Name = 'Temp Department';
SELECT * FROM employee.employee WHERE Email = 'temp@company.com';
```

### 15. Обновление с использованием нескольких таблиц

Увеличьте количество выделенных часов (HoursAllocated) на 20% для всех сотрудников, работающих над проектами с бюджетом более 300000.00.

**Решение**

```sql
UPDATE employee.employee_project ep
JOIN employee.project p ON ep.ProjectID = p.ID
SET ep.HoursAllocated = ep.HoursAllocated * 1.20
WHERE p.Budget > 300000.00;
```

**Проверка обновления**

```sql
SELECT 
    CONCAT(e.FirstName, ' ', e.LastName) AS Employee,
    p.Name AS Project,
    p.Budget,
    ep.Role,
    ep.HoursAllocated
FROM employee.employee_project ep
JOIN employee.employee e ON ep.EmployeeID = e.ID
JOIN employee.project p ON ep.ProjectID = p.ID
WHERE p.Budget > 300000.00
ORDER BY p.Budget DESC;
```

### 16. Обновление даты окончания проекта

Для всех проектов, у которых дата окончания (EndDate) равна NULL, установите дату окончания как текущую дату плюс 6 месяцев. Используйте функцию DATE_ADD.

**Решение**

```sql
UPDATE employee.project
SET EndDate = DATE_ADD(CURDATE(), INTERVAL 6 MONTH)
WHERE EndDate IS NULL;
```

**Проверка обновления**

```sql
SELECT ID, Name, StartDate, EndDate, Budget
FROM employee.project
WHERE EndDate >= CURDATE()
ORDER BY EndDate;
```

## Заключение

В ходе выполнения данной практики вы освоили основные операции модификации данных в SQL: INSERT, UPDATE и DELETE на примере базы данных `employee`, моделирующей управление персоналом компании. Вы научились учитывать ограничения целостности (первичные и внешние ключи), использовать транзакции для безопасного выполнения изменений, а также применять подзапросы, JOIN и конструкцию CASE в операциях обновления.

**Рекомендации для самостоятельной работы:**

1. Попробуйте создать резервную копию базы данных перед выполнением операций модификации.
2. Экспериментируйте с оператором `REPLACE` (если поддерживается вашей СУБД) для сценариев "вставки или замены".
3. Изучите работу с триггерами, которые автоматически выполняют действия при модификации данных.
4. Попрактикуйтесь в написании скриптов миграции данных, которые преобразуют структуру и содержимое базы данных.

**Важное замечание:** В реальных проектах операции модификации данных должны выполняться с особой осторожностью, всегда с проверкой влияния на бизнес-логику и с обязательным тестированием на копии базы данных.
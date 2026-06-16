# УП.11 - 5 - Выполнение сложных запросов SELECT к базе `employee`

## Цель работы

Научиться составлять сложные SQL-запросы SELECT с использованием подзапросов, JOIN, агрегатных функций, условий CASE, UNION и других продвинутых конструкций на примере базы данных сотрудников. Закрепить навыки анализа данных из нескольких связанных таблиц, включая иерархические связи (самоссылающиеся внешние ключи) и связи «многие-ко-многим».

## Теоретическая часть

В предыдущей работе вы ознакомились со структурой базы данных `employee`. Теперь мы будем выполнять более сложные запросы, которые требуют комбинирования различных SQL-техник.

База данных `employee` состоит из пяти таблиц:

1. **`department`** – отделы компании.
2. **`position`** – справочник должностей с вилками зарплат.
3. **`employee`** – сотрудники (с самоссылающимся внешним ключом `ManagerID`).
4. **`project`** – проекты компании.
5. **`employee_project`** – связующая таблица для отношения «многие-ко-многим» между сотрудниками и проектами.

Основные темы, которые будут рассмотрены:

1. **Подзапросы** – запросы, вложенные в другие запросы (в SELECT, FROM, WHERE).
2. **Агрегатные функции с GROUP BY и HAVING** – группировка данных и фильтрация групп.
3. **JOIN с несколькими таблицами** – объединение таблиц по ключам.
4. **Условные выражения CASE** – создание условных колонок в результатах.
5. **Оператор UNION / UNION ALL** – объединение результатов нескольких запросов.
6. **Коррелированные подзапросы** – подзапросы, зависящие от внешнего запроса.
7. **Оконные функции** – ранжирование, нумерация строк внутри групп.
8. **Рекурсивные запросы (самоссылающиеся таблицы)** – построение иерархии подчинённости.

## Практические задания

### 1. Подзапросы для сравнения со средним значением

Найдите всех сотрудников, чья зарплата превышает среднюю зарплату по их отделу. Выведите имя, фамилию, название отдела, зарплату сотрудника и среднюю зарплату по отделу.

**Решение**

```sql
SELECT 
    e.FirstName,
    e.LastName,
    d.Name AS department_name,
    e.Salary,
    (SELECT AVG(e2.Salary) 
     FROM employee.employee e2 
     WHERE e2.DepartmentID = e.DepartmentID) AS avg_department_salary
FROM employee.employee e
JOIN employee.department d ON e.DepartmentID = d.ID
WHERE e.Salary > (
    SELECT AVG(e3.Salary)
    FROM employee.employee e3
    WHERE e3.DepartmentID = e.DepartmentID
)
ORDER BY d.Name, e.Salary DESC;
```

**Пример результата:**

```
+-----------+----------+------------------+----------+----------------------+
| FirstName | LastName | department_name  | Salary   | avg_department_salary |
+-----------+----------+------------------+----------+----------------------+
| John      | Smith    | Engineering      | 145000.00 |           85000.0000 |
| Emily     | Johnson  | Engineering      |  95000.00 |           85000.0000 |
| Michael   | Williams | Engineering      |  82000.00 |           85000.0000 |
| Jessica   | Garcia   | Marketing        | 105000.00 |           76000.0000 |
| Christopher| Lee     | Human Resources  |  90000.00 |           62333.3333 |
| Jennifer  | Allen    | Finance          |  80000.00 |           71000.0000 |
| Megan     | King     | Sales            | 105000.00 |           70000.0000 |
| Stephanie | Scott    | IT Support       | 115000.00 |           87500.0000 |
| Nicholas  | Green    | R&D              | 120000.00 |          107500.0000 |
| Tyler     | Baker    | Legal            | 110000.00 |          110000.0000 |
+-----------+----------+------------------+----------+----------------------+
```

### 2. JOIN с агрегатными функциями и GROUP BY

Для каждого отдела найдите сотрудника с максимальной зарплатой. Выведите название отдела, имя и фамилию сотрудника, его зарплату.

**Решение**

```sql
SELECT 
    d.Name AS department_name,
    e.FirstName,
    e.LastName,
    e.Salary
FROM employee.employee e
JOIN employee.department d ON e.DepartmentID = d.ID
JOIN (
    SELECT DepartmentID, MAX(Salary) AS max_salary
    FROM employee.employee
    GROUP BY DepartmentID
) AS max_salaries ON e.DepartmentID = max_salaries.DepartmentID 
                  AND e.Salary = max_salaries.max_salary
ORDER BY e.Salary DESC;
```

**Пример результата:**

```
+------------------------+-----------+----------+----------+
| department_name        | FirstName | LastName | Salary   |
+------------------------+-----------+----------+----------+
| Engineering            | John      | Smith    | 145000.00 |
| Research & Development | Nicholas  | Green    | 120000.00 |
| IT Support             | Stephanie | Scott    | 115000.00 |
| Legal                  | Tyler     | Baker    | 110000.00 |
| Marketing              | Jessica   | Garcia   | 105000.00 |
| Sales                  | Megan     | King     | 105000.00 |
| Operations             | Hannah    | Nelson   |  98000.00 |
| Human Resources        | Christopher| Lee     |  90000.00 |
| Finance                | Jennifer  | Allen    |  80000.00 |
| Customer Service       | Victoria  | Mitchell |  42000.00 |
+------------------------+-----------+----------+----------+
```

### 3. Использование CASE для категоризации

Классифицируйте сотрудников по уровню зарплаты относительно вилки их должности (диапазон `MinSalary`–`MaxSalary` из таблицы `position`):

- 'Ниже минимума' если `Salary < MinSalary`
- 'В пределах вилки' если `Salary BETWEEN MinSalary AND MaxSalary`
- 'Выше максимума' если `Salary > MaxSalary`

Выведите имя, фамилию, название должности, зарплату, минимальную и максимальную зарплату для должности, а также категорию. Отсортируйте по категории и зарплате.

**Решение**

```sql
SELECT 
    e.FirstName,
    e.LastName,
    p.Title AS position_title,
    e.Salary,
    p.MinSalary,
    p.MaxSalary,
    CASE 
        WHEN e.Salary < p.MinSalary THEN 'Ниже минимума'
        WHEN e.Salary BETWEEN p.MinSalary AND p.MaxSalary THEN 'В пределах вилки'
        WHEN e.Salary > p.MaxSalary THEN 'Выше максимума'
    END AS salary_category
FROM employee.employee e
JOIN employee.position p ON e.PositionID = p.ID
ORDER BY salary_category, e.Salary DESC;
```

**Пример результата (первые строки):**

```
+-----------+----------+---------------------+----------+-----------+-----------+-------------------+
| FirstName | LastName | position_title      | Salary   | MinSalary | MaxSalary | salary_category   |
+-----------+----------+---------------------+----------+-----------+-----------+-------------------+
| John      | Smith    | Team Lead           | 145000.00| 100000.00 | 150000.00 | В пределах вилки  |
| Nicholas  | Green    | Data Scientist      | 120000.00|  90000.00 | 140000.00 | В пределах вилки  |
| Stephanie | Scott    | DevOps Engineer     | 115000.00|  80000.00 | 130000.00 | В пределах вилки  |
| Tyler     | Baker    | Legal Counsel       | 110000.00|  80000.00 | 130000.00 | В пределах вилки  |
| Jessica   | Garcia   | Marketing Manager   | 105000.00|  75000.00 | 110000.00 | В пределах вилки  |
| Megan     | King     | Sales Manager       | 105000.00|  70000.00 | 110000.00 | В пределах вилки  |
| Hannah    | Nelson   | Operations Manager  |  98000.00|  70000.00 | 105000.00 | В пределах вилки  |
| Emily     | Johnson  | Senior Developer    |  95000.00|  70000.00 | 120000.00 | В пределах вилки  |
| Rachel    | Adams    | Product Manager     |  95000.00|  90000.00 | 140000.00 | В пределах вилки  |
| Christopher| Lee     | HR Manager          |  90000.00|  65000.00 |  95000.00 | В пределах вилки  |
+-----------+----------+---------------------+----------+-----------+-----------+-------------------+
```

### 4. Подзапросы с EXISTS

Найдите отделы, в которых есть хотя бы один сотрудник с зарплатой более 100 000. Выведите название отдела, его местоположение и количество высокооплачиваемых сотрудников (с зарплатой > 100 000).

**Решение**

```sql
SELECT 
    d.Name AS department_name,
    d.Location,
    (SELECT COUNT(*) 
     FROM employee.employee e 
     WHERE e.DepartmentID = d.ID 
       AND e.Salary > 100000) AS high_salary_count
FROM employee.department d
WHERE EXISTS (
    SELECT 1 
    FROM employee.employee e 
    WHERE e.DepartmentID = d.ID 
      AND e.Salary > 100000
)
ORDER BY high_salary_count DESC;
```

**Пример результата:**

```
+------------------------+---------------+-------------------+
| department_name        | Location      | high_salary_count |
+------------------------+---------------+-------------------+
| Engineering            | New York      |                 1 |
| Marketing              | San Francisco |                 1 |
| Sales                  | Los Angeles   |                 1 |
| IT Support             | Seattle       |                 1 |
| Research & Development | Austin        |                 1 |
| Legal                  | Washington DC |                 1 |
| Operations             | Denver        |                 0 |
+------------------------+---------------+-------------------+
```

### 5. Ранжирование сотрудников внутри отдела по зарплате

Для каждого отдела выведите трёх самых высокооплачиваемых сотрудников. Используйте оконную функцию `ROW_NUMBER()`.

**Решение с оконными функциями (MySQL 8+):**

```sql
SELECT 
    department_name,
    FirstName,
    LastName,
    Salary,
    salary_rank
FROM (
    SELECT 
        d.Name AS department_name,
        e.FirstName,
        e.LastName,
        e.Salary,
        ROW_NUMBER() OVER (PARTITION BY e.DepartmentID ORDER BY e.Salary DESC) AS salary_rank
    FROM employee.employee e
    JOIN employee.department d ON e.DepartmentID = d.ID
) ranked_employees
WHERE salary_rank <= 3
ORDER BY department_name, salary_rank;
```

**Пример результата (первые строки):**

```
+------------------+-----------+----------+----------+-------------+
| department_name  | FirstName | LastName | Salary   | salary_rank |
+------------------+-----------+----------+----------+-------------+
| Customer Service | Victoria  | Mitchell | 42000.00 |           1 |
| Customer Service | Kevin     | Roberts  | 38000.00 |           2 |
| Engineering      | John      | Smith    | 145000.00|           1 |
| Engineering      | Emily     | Johnson  | 95000.00 |           2 |
| Engineering      | Michael   | Williams | 82000.00 |           3 |
| Finance          | Jennifer  | Allen    | 80000.00 |           1 |
| Finance          | Joshua    | Young    | 62000.00 |           2 |
| Human Resources  | Christopher| Lee     | 90000.00 |           1 |
| Human Resources  | Amanda    | Walker   | 52000.00 |           2 |
| Human Resources  | Matthew   | Hall     | 45000.00 |           3 |
+------------------+-----------+----------+----------+-------------+
```

### 6. UNION для объединения результатов

Создайте отчёт, содержащий:
- Все проекты с бюджетом более 300 000 (крупные проекты)
- Все проекты, которые ещё не завершены (`EndDate IS NULL`)

Исключите дубликаты (если проект крупный и ещё не завершён, он должен появиться только один раз). Выведите название проекта, бюджет, дату начала и пометку 'крупный проект' или 'активный проект'.

**Решение**

```sql
SELECT 
    Name AS project_name,
    Budget,
    StartDate,
    'крупный проект' AS type
FROM employee.project
WHERE Budget > 300000
UNION
SELECT 
    Name,
    Budget,
    StartDate,
    'активный проект'
FROM employee.project
WHERE EndDate IS NULL
ORDER BY Budget DESC;
```

**Пример результата:**

```
+---------------------------+-------------+------------+-----------------+
| project_name              | Budget      | StartDate  | type            |
+---------------------------+-------------+------------+-----------------+
| European Market Expansion | 750000.00   | 2023-05-15 | крупный проект  |
| Cloud Migration           | 500000.00   | 2023-01-15 | крупный проект  |
| Data Analytics Platform   | 450000.00   | 2023-06-01 | крупный проект  |
| Mobile App v2             | 350000.00   | 2023-03-01 | крупный проект  |
| Benefits System Upgrade   |  80000.00   | 2023-04-01 | активный проект |
+---------------------------+-------------+------------+-----------------+
```

### 7. Сложный JOIN с несколькими таблицами

Для каждого сотрудника выведите:
- Имя и фамилию
- Название отдела
- Название должности
- Имя и фамилию руководителя (если есть)
- Количество проектов, в которых участвует сотрудник
- Общее количество выделенных часов по всем проектам

Отсортируйте по количеству проектов по убыванию.

**Решение**

```sql
SELECT 
    e.FirstName,
    e.LastName,
    d.Name AS department_name,
    p.Title AS position_title,
    CONCAT(m.FirstName, ' ', m.LastName) AS manager_name,
    COUNT(ep.ProjectID) AS project_count,
    COALESCE(SUM(ep.HoursAllocated), 0) AS total_hours
FROM employee.employee e
JOIN employee.department d ON e.DepartmentID = d.ID
JOIN employee.position p ON e.PositionID = p.ID
LEFT JOIN employee.employee m ON e.ManagerID = m.ID
LEFT JOIN employee.employee_project ep ON e.ID = ep.EmployeeID
GROUP BY e.ID, e.FirstName, e.LastName, d.Name, p.Title, m.FirstName, m.LastName
ORDER BY project_count DESC, total_hours DESC;
```

**Пример результата (первые строки):**

```
+-----------+----------+------------------+---------------------+-------------------+---------------+-------------+
| FirstName | LastName | department_name  | position_title      | manager_name     | project_count | total_hours |
+-----------+----------+------------------+---------------------+-------------------+---------------+-------------+
| John      | Smith    | Engineering      | Team Lead           | NULL              |             2 |          60 |
| Emily     | Johnson  | Engineering      | Senior Developer    | John Smith        |             1 |         160 |
| Michael   | Williams | Engineering      | Senior Developer    | John Smith        |             1 |         160 |
| Sarah     | Brown    | Engineering      | Junior Developer    | Emily Johnson     |             1 |         160 |
| David     | Jones    | Engineering      | Junior Developer    | Michael Williams  |             1 |         160 |
| Jessica   | Garcia   | Marketing        | Marketing Manager   | NULL              |             1 |         120 |
| Daniel    | Martinez | Marketing        | Marketing Specialist| Jessica Garcia    |             1 |         160 |
| Ashley    | Rodriguez| Marketing        | Marketing Specialist| Jessica Garcia    |             1 |         160 |
| Christopher| Lee     | Human Resources  | HR Manager          | NULL              |             1 |          80 |
| Amanda    | Walker   | Human Resources  | HR Coordinator      | Christopher Lee   |             1 |         160 |
+-----------+----------+------------------+---------------------+-------------------+---------------+-------------+
```

### 8. Построение иерархии подчинённости (самоссылающийся JOIN)

Выведите иерархию подчинённости в компании. Для каждого сотрудника покажите его уровень в иерархии (0 – руководитель верхнего уровня, 1 – его прямые подчинённые и т.д.) и полную цепочку руководства.

**Решение с рекурсивным CTE (MySQL 8+):**

```sql
WITH RECURSIVE employee_hierarchy AS (
    -- Базовый уровень: сотрудники без руководителя (топ-менеджеры)
    SELECT 
        ID,
        FirstName,
        LastName,
        DepartmentID,
        ManagerID,
        0 AS hierarchy_level,
        CAST(CONCAT(FirstName, ' ', LastName) AS CHAR(500)) AS hierarchy_path
    FROM employee.employee
    WHERE ManagerID IS NULL
    
    UNION ALL
    
    -- Рекурсивный уровень: подчинённые
    SELECT 
        e.ID,
        e.FirstName,
        e.LastName,
        e.DepartmentID,
        e.ManagerID,
        eh.hierarchy_level + 1,
        CAST(CONCAT(eh.hierarchy_path, ' -> ', e.FirstName, ' ', e.LastName) AS CHAR(500))
    FROM employee.employee e
    JOIN employee_hierarchy eh ON e.ManagerID = eh.ID
)
SELECT 
    eh.FirstName,
    eh.LastName,
    d.Name AS department_name,
    eh.hierarchy_level,
    eh.hierarchy_path
FROM employee_hierarchy eh
JOIN employee.department d ON eh.DepartmentID = d.ID
ORDER BY eh.hierarchy_level, eh.LastName, eh.FirstName;
```

**Пример результата (первые строки):**

```
+-----------+----------+------------------------+------------------+----------------------------------------------------+
| FirstName | LastName | department_name        | hierarchy_level  | hierarchy_path                                     |
+-----------+----------+------------------------+------------------+----------------------------------------------------+
| John      | Smith    | Engineering            |                0 | John Smith                                         |
| Jessica   | Garcia   | Marketing              |                0 | Jessica Garcia                                     |
| Christopher| Lee     | Human Resources        |                0 | Christopher Lee                                    |
| Jennifer  | Allen    | Finance                |                0 | Jennifer Allen                                     |
| Megan     | King     | Sales                  |                0 | Megan King                                         |
| Tyler     | Baker    | Legal                  |                0 | Tyler Baker                                        |
| Hannah    | Nelson   | Operations             |                0 | Hannah Nelson                                      |
| Emily     | Johnson  | Engineering            |                1 | John Smith -> Emily Johnson                        |
| Michael   | Williams | Engineering            |                1 | John Smith -> Michael Williams                     |
| Daniel    | Martinez | Marketing              |                1 | Jessica Garcia -> Daniel Martinez                  |
| Ashley    | Rodriguez| Marketing              |                1 | Jessica Garcia -> Ashley Rodriguez                 |
| Amanda    | Walker   | Human Resources        |                1 | Christopher Lee -> Amanda Walker                   |
| Matthew   | Hall     | Human Resources        |                1 | Christopher Lee -> Matthew Hall                    |
| Joshua    | Young    | Finance                |                1 | Jennifer Allen -> Joshua Young                     |
| Ryan      | Wright   | Sales                  |                1 | Megan King -> Ryan Wright                          |
| Lauren    | Lopez    | Sales                  |                1 | Megan King -> Lauren Lopez                         |
| Andrew    | Hill     | IT Support             |                1 | John Smith -> Andrew Hill                          |
| Stephanie | Scott    | IT Support             |                1 | John Smith -> Stephanie Scott                      |
| Nicholas  | Green    | Research & Development |                1 | John Smith -> Nicholas Green                       |
| Rachel    | Adams    | Research & Development |                1 | John Smith -> Rachel Adams                         |
| Brandon   | Carter   | Operations             |                1 | Hannah Nelson -> Brandon Carter                    |
| Victoria  | Mitchell | Customer Service       |                1 | Hannah Nelson -> Victoria Mitchell                 |
| Kevin     | Roberts  | Customer Service       |                1 | Hannah Nelson -> Kevin Roberts                     |
| Sarah     | Brown    | Engineering            |                2 | John Smith -> Emily Johnson -> Sarah Brown         |
| David     | Jones    | Engineering            |                2 | John Smith -> Michael Williams -> David Jones      |
+-----------+----------+------------------------+------------------+----------------------------------------------------+
```

### 9. Анализ загрузки сотрудников по проектам

Найдите сотрудников, которые участвуют в проектах с общей суммой выделенных часов более 200. Выведите имя, фамилию, отдел, общее количество часов и список проектов (через запятую), в которых они участвуют.

**Решение**

```sql
SELECT 
    e.FirstName,
    e.LastName,
    d.Name AS department_name,
    SUM(ep.HoursAllocated) AS total_hours,
    GROUP_CONCAT(p.Name ORDER BY p.Name SEPARATOR ', ') AS project_list
FROM employee.employee e
JOIN employee.department d ON e.DepartmentID = d.ID
JOIN employee.employee_project ep ON e.ID = ep.EmployeeID
JOIN employee.project p ON ep.ProjectID = p.ID
GROUP BY e.ID, e.FirstName, e.LastName, d.Name
HAVING total_hours > 200
ORDER BY total_hours DESC;
```

**Пример результата:**

```
+-----------+----------+------------------+-------------+----------------------------------------------------+
| FirstName | LastName | department_name  | total_hours | project_list                                       |
+-----------+----------+------------------+-------------+----------------------------------------------------+
| John      | Smith    | Engineering      |          60 | Cloud Migration, Mobile App v2                     |
+-----------+----------+------------------+-------------+----------------------------------------------------+
```

*Примечание:* В данной базе данных нет сотрудников с общей суммой часов более 200, так как максимальная выделенная нагрузка на одного сотрудника — 160 часов на один проект, а большинство сотрудников участвуют только в одном проекте. При необходимости можно изменить пороговое значение в `HAVING`.

### 10. Коррелированный подзапрос с расчётом отклонения от среднего

Для каждого сотрудника рассчитайте, насколько его зарплата отклоняется от средней зарплаты по его должности (в процентах). Выведите имя, фамилию, должность, зарплату, среднюю зарплату по должности и процент отклонения.

**Решение**

```sql
SELECT 
    e.FirstName,
    e.LastName,
    p.Title AS position_title,
    e.Salary,
    (SELECT AVG(e2.Salary) 
     FROM employee.employee e2 
     WHERE e2.PositionID = e.PositionID) AS avg_position_salary,
    ROUND(
        (e.Salary - (SELECT AVG(e2.Salary) 
                     FROM employee.employee e2 
                     WHERE e2.PositionID = e.PositionID)) 
        / (SELECT AVG(e2.Salary) 
           FROM employee.employee e2 
           WHERE e2.PositionID = e.PositionID) * 100, 
        2
    ) AS deviation_percent
FROM employee.employee e
JOIN employee.position p ON e.PositionID = p.ID
ORDER BY deviation_percent DESC;
```

**Пример результата (первые строки):**

```
+-----------+----------+----------------------+----------+--------------------+-------------------+
| FirstName | LastName | position_title       | Salary   | avg_position_salary| deviation_percent |
+-----------+----------+----------------------+----------+--------------------+-------------------+
| John      | Smith    | Team Lead            | 145000.00|        145000.0000 |              0.00 |
| Emily     | Johnson  | Senior Developer     |  95000.00|         88500.0000 |              7.34 |
| Michael   | Williams | Senior Developer     |  82000.00|         88500.0000 |             -7.34 |
| Sarah     | Brown    | Junior Developer     |  55000.00|         51500.0000 |              6.80 |
| David     | Jones    | Junior Developer     |  48000.00|         51500.0000 |             -6.80 |
| Jessica   | Garcia   | Marketing Manager    | 105000.00|        105000.0000 |              0.00 |
| Daniel    | Martinez | Marketing Specialist |  65000.00|         61500.0000 |              5.69 |
| Ashley    | Rodriguez| Marketing Specialist |  58000.00|         61500.0000 |             -5.69 |
| Christopher| Lee     | HR Manager           |  90000.00|         90000.0000 |              0.00 |
| Amanda    | Walker   | HR Coordinator       |  52000.00|         48500.0000 |              7.22 |
+-----------+----------+----------------------+----------+--------------------+-------------------+
```

### 11. Анализ бюджетов проектов по отделам

Для каждого отдела найдите общий бюджет всех проектов, средний бюджет проекта, минимальный и максимальный бюджет, а также количество проектов. Выведите только те отделы, у которых суммарный бюджет проектов превышает 200 000.

**Решение**

```sql
SELECT 
    d.Name AS department_name,
    COUNT(p.ID) AS project_count,
    SUM(p.Budget) AS total_budget,
    AVG(p.Budget) AS avg_budget,
    MIN(p.Budget) AS min_budget,
    MAX(p.Budget) AS max_budget
FROM employee.department d
JOIN employee.project p ON d.ID = p.DepartmentID
GROUP BY d.ID, d.Name
HAVING total_budget > 200000
ORDER BY total_budget DESC;
```

**Пример результата:**

```
+------------------------+---------------+---------------+-------------+-------------+-------------+
| department_name        | project_count | total_budget  | avg_budget  | min_budget  | max_budget  |
+------------------------+---------------+---------------+-------------+-------------+-------------+
| Engineering            |             2 |   850000.00   | 425000.0000 | 350000.00   | 500000.00   |
| Sales                  |             1 |   750000.00   | 750000.0000 | 750000.00   | 750000.00   |
| Research & Development |             1 |   450000.00   | 450000.0000 | 450000.00   | 450000.00   |
| Operations             |             1 |   200000.00   | 200000.0000 | 200000.00   | 200000.00   |
+------------------------+---------------+---------------+-------------+-------------+-------------+
```

### 12. Использование оконных функций для анализа зарплат

Для каждого сотрудника выведите его зарплату, а также:
- Среднюю зарплату по отделу (`AVG OVER`)
- Максимальную зарплату по отделу (`MAX OVER`)
- Разницу между зарплатой сотрудника и максимальной в отделе
- Процент от максимальной зарплаты в отделе

**Решение**

```sql
SELECT 
    e.FirstName,
    e.LastName,
    d.Name AS department_name,
    e.Salary,
    ROUND(AVG(e.Salary) OVER (PARTITION BY e.DepartmentID), 2) AS avg_dept_salary,
    MAX(e.Salary) OVER (PARTITION BY e.DepartmentID) AS max_dept_salary,
    ROUND(MAX(e.Salary) OVER (PARTITION BY e.DepartmentID) - e.Salary, 2) AS diff_from_max,
    ROUND(e.Salary / MAX(e.Salary) OVER (PARTITION BY e.DepartmentID) * 100, 2) AS percent_of_max
FROM employee.employee e
JOIN employee.department d ON e.DepartmentID = d.ID
ORDER BY d.Name, e.Salary DESC;
```

**Пример результата (первые строки):**

```
+-----------+----------+------------------+----------+-----------------+-----------------+--------------+---------------+
| FirstName | LastName | department_name  | Salary   | avg_dept_salary | max_dept_salary | diff_from_max| percent_of_max|
+-----------+----------+------------------+----------+-----------------+-----------------+--------------+---------------+
| Victoria  | Mitchell | Customer Service | 42000.00 |        40000.00 |        42000.00 |          0.00|         100.00|
| Kevin     | Roberts  | Customer Service | 38000.00 |        40000.00 |        42000.00 |       4000.00|          90.48|
| John      | Smith    | Engineering      | 145000.00|        85000.00 |       145000.00 |          0.00|         100.00|
| Emily     | Johnson  | Engineering      | 95000.00 |        85000.00 |       145000.00 |      50000.00|          65.52|
| Michael   | Williams | Engineering      | 82000.00 |        85000.00 |       145000.00 |      63000.00|          56.55|
| Sarah     | Brown    | Engineering      | 55000.00 |        85000.00 |       145000.00 |      90000.00|          37.93|
| David     | Jones    | Engineering      | 48000.00 |        85000.00 |       145000.00 |      97000.00|          33.10|
| Jennifer  | Allen    | Finance          | 80000.00 |        71000.00 |        80000.00 |          0.00|         100.00|
| Joshua    | Young    | Finance          | 62000.00 |        71000.00 |        80000.00 |      18000.00|          77.50|
| Christopher| Lee     | Human Resources  | 90000.00 |        62333.33 |        90000.00 |          0.00|         100.00|
+-----------+----------+------------------+----------+-----------------+-----------------+--------------+---------------+
```

## Заключение

В ходе выполнения данной практики вы освоили составление сложных SQL-запросов с использованием подзапросов, JOIN, агрегатных функций, CASE, UNION, оконных функций и рекурсивных CTE на примере базы данных сотрудников. Эти навыки необходимы для глубокого анализа данных в реляционных базах данных, особенно при работе с иерархическими структурами и связями «многие-ко-многим».

**Рекомендации для самостоятельной работы:**

1. Попробуйте модифицировать запросы, изменив условия (например, найти сотрудников, чья зарплата ниже средней по должности).
2. Экспериментируйте с другими оконными функциями: `RANK()`, `DENSE_RANK()`, `NTILE()`, `LAG()`, `LEAD()`.
3. Составьте запрос, который находит для каждого руководителя список его прямых подчинённых с указанием их зарплат и стажа работы.
4. Попробуйте написать запрос, который определяет «перегруженных» сотрудников (участвующих в проектах с суммарным количеством часов более 200) и выводит информацию об их руководителях.
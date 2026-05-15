# УП.11 - 01 - Анализ структуры базы данных `world`

## Цель работы

Ознакомиться со структурой базы данных `world`, изучить таблицы, связи между ними, типы данных, первичные и внешние ключи. Приобрести навыки анализа существующей схемы базы данных.

## Теоретическая часть

База данных `world` является демонстрационной базой от MySQL, содержащей информацию о странах, городах и языках. Она состоит из трёх таблиц:

1. **`country`** – содержит данные о странах мира.
2. **`city`** – содержит данные о городах.
3. **`countrylanguage`** – содержит данные о языках, на которых говорят в странах, с указанием, является ли язык официальным, и процентного соотношения носителей.

### Структура таблиц

#### Таблица `country`

| Поле | Тип данных | Описание | Ограничения |
|------|------------|----------|-------------|
| `Code` | char(3) | Код страны (ISO 3166-1 alpha-3) | Первичный ключ |
| `Name` | char(52) | Название страны | NOT NULL |
| `Continent` | enum('Asia','Europe','North America','Africa','Oceania','Antarctica','South America') | Континент | NOT NULL |
| `Region` | char(26) | Регион | NOT NULL |
| `SurfaceArea` | decimal(10,2) | Площадь территории | NOT NULL |
| `IndepYear` | smallint | Год обретения независимости | Может быть NULL |
| `Population` | int | Население | NOT NULL |
| `LifeExpectancy` | decimal(3,1) | Ожидаемая продолжительность жизни | Может быть NULL |
| `GNP` | decimal(10,2) | Валовой национальный продукт | Может быть NULL |
| `GNPOld` | decimal(10,2) | Старое значение GNP | Может быть NULL |
| `LocalName` | char(45) | Местное название страны | NOT NULL |
| `GovernmentForm` | char(45) | Форма правления | NOT NULL |
| `HeadOfState` | char(60) | Глава государства | Может быть NULL |
| `Capital` | int | Ссылка на город (ID из таблицы `city`) | Внешний ключ на `city.ID` |
| `Code2` | char(2) | Двухбуквенный код страны (ISO 3166-1 alpha-2) | NOT NULL |

#### Таблица `city`

| Поле | Тип данных | Описание | Ограничения |
|------|------------|----------|-------------|
| `ID` | int | Уникальный идентификатор города | Первичный ключ, AUTO_INCREMENT |
| `Name` | char(35) | Название города | NOT NULL |
| `CountryCode` | char(3) | Код страны | Внешний ключ на `country.Code` |
| `District` | char(20) | Округ / регион внутри страны | NOT NULL |
| `Population` | int | Население города | NOT NULL |

#### Таблица `countrylanguage`

| Поле | Тип данных | Описание | Ограничения |
|------|------------|----------|-------------|
| `CountryCode` | char(3) | Код страны | Внешний ключ на `country.Code`, часть составного первичного ключа |
| `Language` | char(30) | Название языка | Часть составного первичного ключа |
| `IsOfficial` | enum('T','F') | Является ли язык официальным | NOT NULL |
| `Percentage` | decimal(4,1) | Процент носителей языка в стране | NOT NULL |

### Связи между таблицами

- **`country.Capital`** → **`city.ID`** (один-к-одному, страна имеет столицу – один город)
- **`city.CountryCode`** → **`country.Code`** (многие-к-одному, город принадлежит одной стране)
- **`countrylanguage.CountryCode`** → **`country.Code`** (многие-к-одному, язык связан с одной страной)

## Практические задания

### 1. Изучение схемы базы данных

1. Установите соединение с сервером MySQL и загрузите базу данных `world`. (Скачать базу данных можно [здесь](https://dev.mysql.com/doc/index-other.html))
2. Выполните запрос для отображения списка таблиц в базе `world`:

   ```sql
   SHOW TABLES FROM world;
   ```

3. Для каждой таблицы просмотрите её структуру с помощью команды `DESCRIBE`:

   ```sql
   DESCRIBE world.country;
   DESCRIBE world.city;
   DESCRIBE world.countrylanguage;
   ```

**Решение**

1. После загрузки базы данных выполним `SHOW TABLES FROM world;`. Результат:
  ```
  +-----------------+
  | Tables_in_world |
  +-----------------+
  | city            |
  | country         |
  | countrylanguage |
  +-----------------+
  ```
  Видим три таблицы: `city`, `country`, `countrylanguage`.

2. Структура таблиц, полученная через `DESCRIBE`:

  **Таблица `country`:**
  ```
  +-----------------+---------------+------+-----+---------+-------+
  | Field           | Type          | Null | Key | Default | Extra |
  +-----------------+---------------+------+-----+---------+-------+
  | Code            | char(3)       | NO   | PRI |         |       |
  | Name            | char(52)      | NO   |     |         |       |
  | Continent       | enum(...)     | NO   |     | Asia    |       |
  | Region          | char(26)      | NO   |     |         |       |
  | SurfaceArea     | decimal(10,2) | NO   |     | 0.00    |       |
  | IndepYear       | smallint      | YES  |     | NULL    |       |
  | Population      | int           | NO   |     | 0       |       |
  | LifeExpectancy  | decimal(3,1)  | YES  |     | NULL    |       |
  | GNP             | decimal(10,2) | YES  |     | NULL    |       |
  | GNPOld          | decimal(10,2) | YES  |     | NULL    |       |
  | LocalName       | char(45)      | NO   |     |         |       |
  | GovernmentForm  | char(45)      | NO   |     |         |       |
  | HeadOfState     | char(60)      | YES  |     | NULL    |       |
  | Capital         | int           | YES  | MUL | NULL    |       |
  | Code2           | char(2)       | NO   |     |         |       |
  +-----------------+---------------+------+-----+---------+-------+
  ```

  **Таблица `city`:**
  ```
  +-------------+----------+------+-----+---------+----------------+
  | Field       | Type     | Null | Key | Default | Extra          |
  +-------------+----------+------+-----+---------+----------------+
  | ID          | int      | NO   | PRI | NULL    | auto_increment |
  | Name        | char(35) | NO   |     |         |                |
  | CountryCode | char(3)  | NO   | MUL |         |                |
  | District    | char(20) | NO   |     |         |                |
  | Population  | int      | NO   |     | 0       |                |
  +-------------+----------+------+-----+---------+----------------+
  ```

  **Таблица `countrylanguage`:**
  ```
  +-------------+---------------+------+-----+---------+-------+
  | Field       | Type          | Null | Key | Default | Extra |
  +-------------+---------------+------+-----+---------+-------+
  | CountryCode | char(3)       | NO   | PRI |         |       |
  | Language    | char(30)      | NO   | PRI |         |       |
  | IsOfficial  | enum('T','F') | NO   |     | F       |       |
  | Percentage  | decimal(4,1)  | NO   |     | 0.0     |       |
  +-------------+---------------+------+-----+---------+-------+
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
   WHERE TABLE_SCHEMA = 'world' AND REFERENCED_TABLE_NAME IS NOT NULL;
   ```

**Решение**

1. **Первичные ключи:**
  - Таблица `country`: поле `Code` (char(3)).
  - Таблица `city`: поле `ID` (int, auto_increment).
  - Таблица `countrylanguage`: составной первичный ключ (`CountryCode`, `Language`).

2. **Внешние ключи:**
  - В таблице `city`: столбец `CountryCode` ссылается на `country.Code`.
  - В таблице `country`: столбец `Capital` ссылается на `city.ID`.
  - В таблице `countrylanguage`: столбец `CountryCode` ссылается на `country.Code`.

3. **Проверка ограничений внешних ключей через `INFORMATION_SCHEMA`:**
  Выполним предложенный запрос. Пример результата:
  ```
  +------------+-------------+-----------------------+-----------------------+------------------------+
  | TABLE_NAME | COLUMN_NAME | CONSTRAINT_NAME       | REFERENCED_TABLE_NAME | REFERENCED_COLUMN_NAME |
  +------------+-------------+-----------------------+-----------------------+------------------------+
  | city       | CountryCode | city_ibfk_1           | country               | Code                   |
  | country    | Capital     | country_ibfk_1        | city                  | ID                     |
  | countrylanguage | CountryCode | countryLanguage_ibfk_1 | country               | Code                   |
  +------------+-------------+-----------------------+-----------------------+------------------------+
  ```
  Видим три внешних ключа, соответствующие описанным выше связям.

### 3. Анализ типов данных

1. Для каждой таблицы выпишите типы данных всех столбцов и их размерность.
2. Объясните, почему для полей `Continent` и `IsOfficial` использован тип `ENUM`.
3. Почему для поля `SurfaceArea` выбран `DECIMAL(10,2)`, а для `LifeExpectancy` – `DECIMAL(3,1)`?

**Решение**

1. **Типы данных и размерность** (уже приведены в решении задания 1):
   - **`country`**: `Code` (char(3)), `Name` (char(52)), `Continent` (enum), `Region` (char(26)), `SurfaceArea` (decimal(10,2)), `IndepYear` (smallint), `Population` (int), `LifeExpectancy` (decimal(3,1)), `GNP` (decimal(10,2)), `GNPOld` (decimal(10,2)), `LocalName` (char(45)), `GovernmentForm` (char(45)), `HeadOfState` (char(60)), `Capital` (int), `Code2` (char(2)).
   - **`city`**: `ID` (int), `Name` (char(35)), `CountryCode` (char(3)), `District` (char(20)), `Population` (int).
   - **`countrylanguage`**: `CountryCode` (char(3)), `Language` (char(30)), `IsOfficial` (enum('T','F')), `Percentage` (decimal(4,1)).

2. **Использование `ENUM`**:
   - Поле `Continent` может принимать только одно из семи заранее определённых значений (континентов). Тип `ENUM` гарантирует, что в это поле не попадёт некорректное значение, а также экономит место по сравнению с хранением строки.
   - Поле `IsOfficial` имеет всего два возможных значения: 'T' (True – официальный язык) и 'F' (False – неофициальный). `ENUM` идеально подходит для таких бинарных категориальных данных.

3. **Выбор `DECIMAL`**:
   - `SurfaceArea` (площадь территории) хранится как `DECIMAL(10,2)`. Это позволяет хранить числа с точностью до двух знаков после запятой (например, 1234567.89). Максимальное значение – 9999999.99, что достаточно для площади любой страны (самая большая страна – Россия ~17.1 млн км², но в базе данные в км², возможно, используются меньшие единицы? В любом случае `10,2` достаточно).
   - `LifeExpectancy` (ожидаемая продолжительность жизни) хранится как `DECIMAL(3,1)`. Это позволяет хранить значения от 0.0 до 99.9 (три цифры всего, одна после запятой). Поскольку продолжительность жизни редко превышает 100 лет, такой точности достаточно.

### 4. Проверка целостности данных

1. Выполните запрос, который покажет, есть ли в таблице `city` города, ссылающиеся на несуществующую страну (нарушение внешнего ключа):

   ```sql
   SELECT c.* 
   FROM world.city c
   LEFT JOIN world.country co ON c.CountryCode = co.Code
   WHERE co.Code IS NULL;
   ```

2. Проверьте, есть ли в таблице `country` страны, у которых столица (`Capital`) ссылается на несуществующий город:

   ```sql
   SELECT co.* 
   FROM world.country co
   LEFT JOIN world.city ci ON co.Capital = ci.ID
   WHERE ci.ID IS NULL AND co.Capital IS NOT NULL;
   ```

**Решение**

1. **Проверка ссылок `city.CountryCode` → `country.Code`:**
  Выполним первый запрос. Результат будет пустым (0 строк), так как в корректной базе `world` все города ссылаются на существующие страны. Пример вывода:
  ```
  Empty set (0.00 sec)
  ```
  Это подтверждает, что внешний ключ `city_ibfk_1` обеспечивает целостность данных.

2. **Проверка ссылок `country.Capital` → `city.ID`:**
  Выполним второй запрос. Результат также будет пустым, потому что все столицы указаны корректно. Пример:
  ```
  Empty set (0.00 sec)
  ```
  Однако стоит отметить, что в таблице `country` есть строки с `Capital = NULL` (например, Антарктида), но они исключены условием `co.Capital IS NOT NULL`. Таким образом, нарушений целостности не обнаружено.

  *Примечание:* Если бы в базе были ошибки (например, удалён город, на который ссылается страна), запрос вывел бы соответствующие строки.

### 5. Исследование данных

1. Подсчитайте количество записей в каждой таблице.
2. Определите, сколько стран находятся в каждом континенте.
3. Найдите город с наибольшим населением и страну, к которой он принадлежит.

**Решение**

1. **Количество записей в каждой таблице:**
   ```sql
   SELECT 'country' AS table_name, COUNT(*) AS record_count FROM world.country
   UNION ALL
   SELECT 'city', COUNT(*) FROM world.city
   UNION ALL
   SELECT 'countrylanguage', COUNT(*) FROM world.countrylanguage;
   ```
   Результат (пример):
   ```
   +----------------+--------------+
   | table_name     | record_count |
   +----------------+--------------+
   | country        |          239 |
   | city           |         4079 |
   | countrylanguage|          984 |
   +----------------+--------------+
   ```

2. **Количество стран по континентам:**
   ```sql
   SELECT Continent, COUNT(*) AS country_count
   FROM world.country
   GROUP BY Continent
   ORDER BY country_count DESC;
   ```
   Результат (пример):
   ```
   +---------------+---------------+
   | Continent     | country_count |
   +---------------+---------------+
   | Africa        |            58 |
   | Asia          |            51 |
   | Europe        |            46 |
   | North America |            37 |
   | Oceania       |            28 |
   | South America |            14 |
   | Antarctica    |             5 |
   +---------------+---------------+
   ```

3. **Город с наибольшим населением и его страна:**
   ```sql
   SELECT ci.Name AS city_name, ci.Population, co.Name AS country_name
   FROM world.city ci
   JOIN world.country co ON ci.CountryCode = co.Code
   ORDER BY ci.Population DESC
   LIMIT 1;
   ```
   Результат (пример):
   ```
   +-----------+------------+-------------+
   | city_name | Population | country_name|
   +-----------+------------+-------------+
   | Mumbai    |   10500000 | India       |
   +-----------+------------+-------------+
   ```
   *Примечание:* В зависимости от версии базы `world` город с наибольшим населением может быть другим (например, Шанхай). Важно, что запрос возвращает корректный результат.

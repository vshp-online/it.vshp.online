# УП.11 - 2 - Выполнение сложных запросов SELECT к базе `world`

## Цель работы

Научиться составлять сложные SQL-запросы SELECT с использованием подзапросов, JOIN, агрегатных функций, условий CASE, UNION и других продвинутых конструкций. Закрепить навыки анализа данных из нескольких связанных таблиц.

## Теоретическая часть

В предыдущей работе вы ознакомились со структурой базы данных `world`. Теперь мы будем выполнять более сложные запросы, которые требуют комбинирования различных SQL-техник.

Основные темы, которые будут рассмотрены:

1. **Подзапросы** – запросы, вложенные в другие запросы (в SELECT, FROM, WHERE).
2. **Агрегатные функции с GROUP BY и HAVING** – группировка данных и фильтрация групп.
3. **JOIN с несколькими таблицами** – объединение таблиц по ключам.
4. **Условные выражения CASE** – создание условных колонок в результатах.
5. **Оператор UNION / UNION ALL** – объединение результатов нескольких запросов.
6. **Коррелированные подзапросы** – подзапросы, зависящие от внешнего запроса.
7. **Оконные функции (если поддерживается)** – ранжирование, нумерация строк внутри групп.

## Практические задания

### 1. Подзапросы для сравнения со средним значением

Найдите все страны, население которых превышает среднее население стран на том же континенте. Выведите название страны, континент, население и среднее население по континенту.

**Решение**

```sql
SELECT 
    c1.Name AS country_name,
    c1.Continent,
    c1.Population,
    (SELECT AVG(c2.Population) 
     FROM world.country c2 
     WHERE c2.Continent = c1.Continent) AS avg_population_continent
FROM world.country c1
WHERE c1.Population > (
    SELECT AVG(c3.Population)
    FROM world.country c3
    WHERE c3.Continent = c1.Continent
)
ORDER BY c1.Continent, c1.Population DESC;
```

**Пример результата (первые строки):**

```
+----------------+-----------+------------+------------------------+
| country_name   | Continent | Population | avg_population_continent |
+----------------+-----------+------------+------------------------+
| China          | Asia      | 1277558000 |              72647562.5 |
| India          | Asia      | 1013662000 |              72647562.5 |
| United States  | North America | 278357000 |              13553778.6 |
| Indonesia      | Asia      |  212107000 |              72647562.5 |
| Brazil         | South America | 170115000 |              18569742.9 |
| Pakistan       | Asia      |  156483000 |              72647562.5 |
| Russia         | Europe    |  146934000 |              15871176.1 |
| Bangladesh     | Asia      |  129155000 |              72647562.5 |
| Japan          | Asia      |  126714000 |              72647562.5 |
| Nigeria        | Africa    |  111506000 |              13525531.0 |
+----------------+-----------+------------+------------------------+
```

### 2. JOIN с агрегатными функциями и GROUP BY

Для каждого континента найдите страну с максимальной площадью территории. Выведите континент, название страны, площадь.

**Решение**

```sql
SELECT 
    c.Continent,
    c.Name AS country_name,
    c.SurfaceArea
FROM world.country c
JOIN (
    SELECT Continent, MAX(SurfaceArea) AS max_area
    FROM world.country
    GROUP BY Continent
) AS max_areas ON c.Continent = max_areas.Continent 
               AND c.SurfaceArea = max_areas.max_area
ORDER BY c.SurfaceArea DESC;
```

**Пример результата:**

```
+---------------+-------------------------+-------------+
| Continent     | country_name            | SurfaceArea |
+---------------+-------------------------+-------------+
| Asia          | China                   |  9572900.00 |
| North America | Canada                  |  9970610.00 |
| Africa        | Sudan                   |  2505813.00 |
| South America | Brazil                  |  8547403.00 |
| Europe        | Russian Federation      | 17075400.00 |
| Oceania       | Australia               |  7741220.00 |
| Antarctica    | Antarctica              | 13120000.00 |
+---------------+-------------------------+-------------+
```

### 3. Использование CASE для категоризации

Классифицируйте страны по уровню валового национального продукта (GNP) на три категории:
- 'Высокий' если GNP >= 100000
- 'Средний' если GNP между 10000 и 99999
- 'Низкий' если GNP < 10000 или GNP IS NULL

Выведите название страны, GNP и категорию. Отсортируйте по убыванию GNP.

**Решение**

```sql
SELECT 
    Name,
    GNP,
    CASE 
        WHEN GNP >= 100000 THEN 'Высокий'
        WHEN GNP >= 10000 THEN 'Средний'
        ELSE 'Низкий'
    END AS gnp_category
FROM world.country
ORDER BY GNP DESC;
```

**Пример результата (первые строки):**

```
+-------------------------+-----------+--------------+
| Name                    | GNP       | gnp_category |
+-------------------------+-----------+--------------+
| United States           | 8510700.00| Высокий      |
| Japan                   | 3787042.00| Высокий      |
| Germany                 | 2133367.00| Высокий      |
| France                  | 1424285.00| Высокий      |
| United Kingdom          | 1378330.00| Высокий      |
| Italy                   | 1161755.00| Высокий      |
| China                   |  982268.00| Высокий      |
| Brazil                  |  776739.00| Высокий      |
| Canada                  |  598862.00| Средний      |
| Spain                   |  553233.00| Средний      |
+-------------------------+-----------+--------------+
```

### 4. Подзапросы с EXISTS

Найдите страны, в которых есть хотя бы один город с населением более 5 миллионов человек. Выведите код страны, название страны и количество таких городов.

**Решение**

```sql
SELECT 
    co.Code,
    co.Name,
    (SELECT COUNT(*) 
     FROM world.city ci 
     WHERE ci.CountryCode = co.Code 
       AND ci.Population > 5000000) AS big_cities_count
FROM world.country co
WHERE EXISTS (
    SELECT 1 
    FROM world.city ci 
    WHERE ci.CountryCode = co.Code 
      AND ci.Population > 5000000
)
ORDER BY big_cities_count DESC;
```

**Пример результата (первые строки):**

```
+------+-------------------+-------------------+
| Code | Name              | big_cities_count |
+------+-------------------+-------------------+
| CHN  | China             |                 6 |
| IND  | India             |                 5 |
| USA  | United States     |                 4 |
| JPN  | Japan             |                 2 |
| PAK  | Pakistan          |                 2 |
| BRA  | Brazil            |                 2 |
| IDN  | Indonesia         |                 1 |
| RUS  | Russian Federation|                 1 |
| MEX  | Mexico            |                 1 |
| KOR  | South Korea       |                 1 |
+------+-------------------+-------------------+
```

### 5. Ранжирование городов внутри страны

Для каждой страны выведите три самых населённых города. Используйте оконную функцию `ROW_NUMBER()` (если ваша версия MySQL поддерживает оконные функции) или альтернативный метод с переменными.

**Решение с оконными функциями (MySQL 8+):**

```sql
SELECT 
    country_name,
    city_name,
    population,
    city_rank
FROM (
    SELECT 
        co.Name AS country_name,
        ci.Name AS city_name,
        ci.Population AS population,
        ROW_NUMBER() OVER (PARTITION BY ci.CountryCode ORDER BY ci.Population DESC) AS city_rank
    FROM world.city ci
    JOIN world.country co ON ci.CountryCode = co.Code
) ranked_cities
WHERE city_rank <= 3
ORDER BY country_name, city_rank;
```

**Альтернативное решение без оконных функций (MySQL 5.x):**

```sql
SELECT 
    co.Name AS country_name,
    ci.Name AS city_name,
    ci.Population
FROM world.city ci
JOIN world.country co ON ci.CountryCode = co.Code
WHERE (
    SELECT COUNT(*) 
    FROM world.city ci2 
    WHERE ci2.CountryCode = ci.CountryCode 
      AND ci2.Population >= ci.Population
) <= 3
ORDER BY co.Name, ci.Population DESC;
```

**Пример результата (первые строки):**

```
+----------------+-------------------+------------+
| country_name   | city_name         | population |
+----------------+-------------------+------------+
| Afghanistan    | Kabul             |    1780000 |
| Afghanistan    | Qandahar          |     237500 |
| Afghanistan    | Herat             |     186800 |
| Albania        | Tirana            |     270000 |
| Albania        | Durrës            |     113100 |
| Albania        | Elbasan           |     100903 |
| Algeria        | Alger             |    2168000 |
| Algeria        | Oran              |     609823 |
| Algeria        | Constantine       |     443727 |
+----------------+-------------------+------------+
```

### 6. UNION для объединения результатов

Создайте отчёт, содержащий:
- Все столицы стран (города, которые указаны в поле `Capital` таблицы `country`)
- Все города с населением более 1 миллиона человек

Исключите дубликаты (если город является столицей и имеет население > 1 млн, он должен появиться только один раз). Выведите название города, страну, население и пометку 'столица' или 'крупный город'.

**Решение**

```sql
SELECT 
    ci.Name AS city_name,
    co.Name AS country_name,
    ci.Population,
    'столица' AS type
FROM world.country co
JOIN world.city ci ON co.Capital = ci.ID
UNION
SELECT 
    ci.Name,
    co.Name,
    ci.Population,
    'крупный город'
FROM world.city ci
JOIN world.country co ON ci.CountryCode = co.Code
WHERE ci.Population > 1000000
ORDER BY Population DESC;
```

**Пример результата (первые строки):**

```
+-------------------+----------------------+------------+-----------------+
| city_name         | country_name         | Population | type            |
+-------------------+----------------------+------------+-----------------+
| Mumbai            | India                |   10500000 | крупный город   |
| Seoul             | South Korea          |    9981619 | столица         |
| São Paulo         | Brazil               |    9968485 | крупный город   |
| Shanghai          | China                |    9696300 | крупный город   |
| Jakarta           | Indonesia            |    9604900 | столица         |
| Karachi           | Pakistan             |    9269265 | крупный город   |
| Istanbul          | Turkey               |    8787958 | крупный город   |
| Ciudad de México  | Mexico               |    8591309 | столица         |
| Moscow            | Russian Federation   |    8389200 | столица         |
| New York          | United States        |    8008278 | крупный город   |
+-------------------+----------------------+------------+-----------------+
```

### 7. Сложный JOIN с несколькими таблицами

Для каждой страны выведите:
- Название страны
- Количество городов
- Список официальных языков (через запятую)
- Общее население страны

Отсортируйте по количеству городов по убыванию.

**Решение**

```sql
SELECT 
    co.Name AS country_name,
    COUNT(ci.ID) AS city_count,
    GROUP_CONCAT(
        DISTINCT cl.Language 
        WHERE cl.IsOfficial = 'T' 
        ORDER BY cl.Language SEPARATOR ', '
    ) AS official_languages,
    co.Population
FROM world.country co
LEFT JOIN world.city ci ON co.Code = ci.CountryCode
LEFT JOIN world.countrylanguage cl ON co.Code = cl.CountryCode AND cl.IsOfficial = 'T'
GROUP BY co.Code, co.Name, co.Population
ORDER BY city_count DESC;
```

**Пример результата (первые строки):**

```
+----------------------+------------+---------------------------+------------+
| country_name         | city_count | official_languages        | Population |
+----------------------+------------+---------------------------+------------+
| China                |        363 | Chinese                   | 1277558000 |
| India                |        341 | Hindi,English             | 1013662000 |
| United States        |        274 | English                   |  278357000 |
| Brazil               |        250 | Portuguese                |  170115000 |
| Japan                |        248 | Japanese                  |  126714000 |
| Russian Federation   |        189 | Russian                   |  146934000 |
| Mexico               |        173 | Spanish                   |   98881000 |
| Germany              |         93 | German                    |   82164700 |
| Philippines          |         85 | Filipino,English          |   75967000 |
| Turkey               |         78 | Turkish                   |   66591000 |
+----------------------+------------+---------------------------+------------+
```

## Заключение

В ходе выполнения данной практики вы освоили составление сложных SQL-запросов с использованием подзапросов, JOIN, агрегатных функций, CASE, UNION и других конструкций. Эти навыки необходимы для глубокого анализа данных в реляционных базах данных.

**Рекомендации для самостоятельной работы:**
1. Попробуйте модифицировать запросы, изменив условия (например, найти страны, где плотность населения выше средней).
2. Экспериментируйте с другими оконными функциями: `RANK()`, `DENSE_RANK()`, `NTILE()`.
3. Составьте запрос, который находит для каждого языка страны, где он является официальным, и процент носителей больше 50%.

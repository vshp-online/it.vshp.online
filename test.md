# Страница тестирования возможностей

## Контейнеры

::: tip
Текст совета
:::

::: warning
Текст примечания
:::

::: danger
Текст предупреждения
:::

::: info
Текст инфо
:::

::: important
Текст важно
:::

::: note
Текст заметки
:::

::: details
Текст подробнее
:::

::: danger Произвольный заголовок 1
Текст произвольного заголовка 1
:::

::: details Произвольный заголовок 2

```ts
console.log('Hello, VuePress!')
```

:::

## Табы для кода

::: code-tabs

@tab JavaScript

```js
const name = 'VuePress'

console.log(`Hello, ${name}!`)
```

@tab TypeScript

```ts
const name: string = 'VuePress'

console.log(`Hello, ${name}!`)
```

:::

## Табы с контентом

::: tabs

@tab Таб 1

Контент первого таба.

```js
console.log('Hello, VuePress!')
```

@tab Таб 2

Контент второго таба.

- Пункт списка 1
- Пункт списка 2
- Пункт списка 3

:::

## Математические формулы

### Инлайновые

Euler's identity $e^{i\pi}+1=0$ is a beautiful formula in $\mathbb{R}^2$.

### Мультистрочные

$$
\frac {\partial^r} {\partial \omega^r} \left(\frac {y^{\omega}} {\omega}\right)
= \left(\frac {y^{\omega}} {\omega}\right) \left\{(\log y)^r + \sum_{i=1}^r \frac {(-1)^ Ir \cdots (r-i+1) (\log y)^{ri}} {\omega^i} \right\}
$$

## Химические выражения

### Инлайновые

$\ce{CO2 + C -> 2 CO}$

### Мультистрочные

$$
\ce{Zn^2+  <=>[+ 2OH-][+ 2H+]  $\underset{\text{amphoteres Hydroxid}}{\ce{Zn(OH)2 v}}$  <=>[+ 2OH-][+ 2H+]  $\underset{\text{Hydroxozikat}}{\ce{[Zn(OH)4]^2-}}$}
$$

## Диаграммы Mermaid

### Структура кафедры

```mermaid
flowchart TD
  %% Руководство кафедрой
  IT_dept["Кафедра информационных технологий<br/><i>Заведующий кафедрой: Ткачев П.С.</i>"]

  %% Учебно-методические группы
  subgraph UMGs ["Учебно-методические группы"]
    direction LR
    UMG_Math["Математических дисциплин<br/><i>Руководитель: Зубов Н.Н.</i>"]
    UMG_Prog["Теории и практики программирования<br/><i>Руководитель: Бакланов А.А.</i>"]
    UMG_DB["Информационных систем и баз данных<br/><i>Руководитель: Ткачев П.С.</i>"]
    UMG_Arch["Аппаратной архитектуры, операционных систем и сетей<br/><i>Руководитель: Пашков А.Е.</i>"]
  end

  %% Технический отдел
  Tech_dept["Отдел технического обеспечения<br/><i>Руководитель: Честных В.В.</i>"]

  %% Связи
  IT_dept --> UMGs
  IT_dept --> Tech_dept
```

### Структура ВШП

```mermaid
flowchart TD

%% Высшее руководство
Founders["Учредители"] --> Rector["Ректор"]

%% Подчинённые ректору
Rector --> Vice_Rector_IT["Проректор по информатизации"]
Rector --> Technical_Director["Технический директор"]
Rector --> Head_IT_Department["Заведующий кафедрой информационных технологий<br/><i>Ткачев П.С.</i>"]

%% Подразделения технического директора
Technical_Director --> Head_Tech_Support["Руководитель отдела технического обеспечения<br/><i>Честных В.В.</i>"]
Head_Tech_Support --> Lab_Assistant["Лаборант"]

%% Структура кафедры ИТ
Head_IT_Department --> Senior_IT_Lecturer["Старший преподаватель кафедры ИТ"]
Senior_IT_Lecturer --> Practice_Specialist["Специалист по организации практической подготовки студентов"]

subgraph IT_Department["Кафедра информационных технологий"]
  direction TB
  Head_IT_Department

  subgraph Methodological_Groups["Учебно-методические группы"]
    direction LR
    Math_Group["Математических дисциплин<br/><i>Зубов Н.Н.</i>"]
    Programming_Group["Теории и практики программирования<br/><i>Бакланов А.А.</i>"]
    DB_Group["Информационных систем и баз данных<br/><i>Ткачев П.С.</i>"]
    Hardware_Group["Аппаратной архитектуры, ОС и сетей<br/><i>Пашков А.Е.</i>"]
  end

  Head_IT_Department --> Methodological_Groups
end
```

# Квизы (Markdown-плагин)

`::: quiz` — кастомный контейнер для вопросов с вариантами ответов.

| Опция | Значение по умолчанию | Описание |
| --- | --- | --- |
| `randomize-questions` | `false` | Перемешать порядок вопросов. |
| `randomize-answers` | `false` | Перемешать ответы внутри каждого вопроса. |
| `hide-correct-answers` | `false` | Не подсвечивать правильные варианты после проверки. |
| `disable-reset` | `false` | Скрыть кнопку сброса (повторное прохождение будет недоступно). |
| `questions-limit=<n>` | (все вопросы) | Ограничить число вопросов, выбранных из базы. |
| `source=<path>` | (не задано) | Загрузить вопросы из внешнего JSON/YAML файла. Можно указать несколько `source`. |
| `lectures=01,02` | (все) | Для файлов с блоками `lectures` позволяет выбрать нужные разделы. |
| `show-question-codes` | `false` | Показывать идентификатор вопроса рядом с заголовком. |

Если используется `source`, путь считается относительно текущего Markdown-файла (можно также указывать абсолютные или `@/` пути). В файле достаточно перечислить массив объектов с полями `question` (или `prompt`), `type` (`single` / `multiple`) и `answers` (строка или объект с `text`/`content` и `correct`/`isCorrect`). Вместо массива можно передать объект `{ "questions": [...] }` или развернутую структуру вида:

```yaml
lectures:
  - lecture_id: '01'
    questions:
      - id: IT03-01-Q01
        question: ...
        answers:
          - text: Вариант
            correct: true
```

В этом случае можно использовать опцию `lectures=...`, чтобы собрать квиз только из нужных лекций.

Служебные директивы внутри контейнера:

- `@question` — начало формулировки вопроса;
- `@answer` — дальше идёт список с радиокнопками (один правильный вариант);
- `@answers` — список с чекбоксами (несколько правильных вариантов).

## Встроенный (Markdown) вариант

Классический случай: все вопросы задаём прямо в Markdown, в нужных местах оставляем `@question`, `@answer` или `@answers`. Для демонстрации добавлен лимит в три вопроса, чтобы показать, что даже при большой «базе» можно отдать пользователю только часть.

::: preview Посмотреть код

  ::: quiz randomize-questions randomize-answers hide-correct-answers questions-limit=3

    @question

    Это вопрос на который есть один верный вариант.

    @answer

    - [ ] неверный
    - [x] верный
    - [ ] еще неверный
    - [ ] и еще неверный

    @question

    На этот вопрос есть несколько верных вариантов.

    @answers

    - [ ] неверный
    - [x] верный
    - [ ] еще неверный
    - [x] и еще верный

    @question

    Здесь дополнительный одиночный вопрос без перемешивания внутри текста.

    @answer

    - [x] Единственный верный вариант
    - [ ] Вариант без галочки считается неверным

    @question

    Выберите лишнее число.

    @answer

    - [ ] 1
    - [x] 0
    - [ ] 2
    - [ ] 4

    @question

    Вопрос с множественными вариантами без описания.

    @answers

    - [x] Первый ответ
    - [ ] Второй ответ
    - [x] Третий ответ

  :::

:::

## Квиз из JSON-файла (внешний источник)

Банк вопросов хранится в JSON (`./includes/quiz-bank.json`). Плагин сам подгружает его и перемешивает вопросы/ответы:

::: preview Посмотреть код

  ::: quiz source=./includes/quiz-bank.json randomize-questions randomize-answers hide-correct-answers questions-limit=3
  :::

:::

## Квиз из YAML-файла (внешний источник)

Пример с YAML (`./includes/quiz-bank.yaml`) ничем не отличается от JSON — достаточно указать путь в `source=`:

::: preview Посмотреть код

  ::: quiz source=./includes/quiz-bank.yaml randomize-questions randomize-answers hide-correct-answers questions-limit=3
  :::

:::

## Квиз из лекционных файлов

### Комбинация нескольких `source`

- Для каждой лекции есть собственный файл `disciplines/it03/lectures/includes/quiz-XX.yaml`. Именно их редактируем, если нужно обновить вопросы.
- Если нужно использовать сразу несколько лекций, достаточно перечислить несколько `source`:

::: preview Посмотреть код
  ::: quiz source=./includes/quiz-01.yaml source=./includes/quiz-02.yaml randomize-questions randomize-answers show-question-codes hide-correct-answers questions-limit=3
  :::
:::

- Вариант с агрегированным файлом тоже возможен: можно собрать общий YAML вручную (см. `./includes/it03-midterm.yaml`, где объединены лекции 01 и 02) и затем указать `source` на него, добавив `lectures=...`, если требуется.

### Агрегированный банк (промежуточный тест)

::: preview Посмотреть код

  ::: quiz source=./includes/it03-midterm.yaml lectures=01,02 randomize-questions randomize-answers show-question-codes hide-correct-answers questions-limit=3
  :::

:::

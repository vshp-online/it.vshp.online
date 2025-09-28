# Расширенные возможности Markdown

https://ecosystem.vuejs.press/plugins/markdown/markdown-ext.html

## Сноски

::: preview Посмотреть код

Контент с первой сноской[^first].

Контент со второй сноской[^second].

Сноска внутри^[Описание сноски] текстового блока.

Ещё одна вторая сноска[^second].

[^first]: Описание **первой сноски**
  и даже многострочное.

[^second]: Описание второй сноски.

:::

## Чеклисты

::: preview Посмотреть код

- [ ] Пункт А
- [x] Пункт Б

:::

## Отключение интерполяции в блоке

::: preview Посмотреть код
  ::: v-pre

  {{ abc }}

  :::
:::

## Вызов компонента с параметрами

### Встроенный компонент темы

::: preview Посмотреть код

  ```component Badge
  text: Текст бейджа
  type: tip
  ```

:::

### Кастомный компонент

::: warning

Компонент должен находиться в `.vuepress/components` и быть зарегистрированным в `client.js`

:::

Доступные типы: `tip` | `info` | `warning` | `danger`

::: preview Посмотреть код

  ```component Pill
    text: "Тип: 'tip'"
    type: tip
  ```

  ```component Pill
    text: "Тип: 'info'"
    type: info
  ```

  ```component Pill
    text: "Тип: 'warning'"
    type: warning
  ```

  ```component Pill
    text: "Тип: 'danger'"
    type: danger
  ```

:::

Альтернатива — прямой тег в Markdown:

::: preview Посмотреть код

<Pill text="Тип: 'tip'" type="tip" />

<Pill text="Тип: 'info'" type="info" />

<Pill text="Тип: 'warning'" type="warning" />

<Pill text="Тип: 'danger'" type="danger" />

:::

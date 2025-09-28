# Проверка превью блоков кода

https://ecosystem.vuejs.press/plugins/markdown/markdown-preview.html

## Импорт блоков кода

https://vuepress.vuejs.org/guide/markdown.html#import-code-blocks

::: preview Посмотреть код

@[code{10-17} js{13,15}:no-line-numbers](./includes/greetings.js)

:::

## Несколько блоков подряд

::: preview HTML / CSS / JS

```html
<div class="card">Hello</div>
```

```css
.card { color: #333; }
```

```js
console.log('hi')
```

:::

## Один конкретный блок кода

::: preview JS

```js
console.log('hi')
```

:::

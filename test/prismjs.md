# Подсветка синтаксиса Prism

https://ecosystem.vuejs.press/plugins/markdown/prismjs.html

## Базовые возможности

### Обычный блок кода JS

::: preview Посмотреть код

```js
import { defaultTheme } from '@vuepress/theme-default'
import { defineUserConfig } from 'vuepress'

export default defineUserConfig({
  title: 'Hello, VuePress',

  theme: defaultTheme({
    logo: 'https://vuepress.vuejs.org/images/hero.png',
  }),
})
```

:::

### Блок кода JS без номеров строк

::: preview Посмотреть код

```js :no-line-numbers
import { defaultTheme } from '@vuepress/theme-default'
import { defineUserConfig } from 'vuepress'

export default defineUserConfig({
  title: 'Hello, VuePress',

  theme: defaultTheme({
    logo: 'https://vuepress.vuejs.org/images/hero.png',
  }),
})
```

:::

### Выделение конкретных строк (2,7-9)

::: preview Посмотреть код

```js {2,7-9}
import { defaultTheme } from '@vuepress/theme-default'
import { defineUserConfig } from 'vuepress'

export default defineUserConfig({
  title: 'Hello, VuePress',

  theme: defaultTheme({
    logo: 'https://vuepress.vuejs.org/images/hero.png',
  }),
})
```

:::

### Сворачивание кода после N строки (3)

::: preview Посмотреть код

```js :collapsed-lines=3
import { defaultTheme } from '@vuepress/theme-default'
import { defineUserConfig } from 'vuepress'

export default defineUserConfig({
  title: 'Hello, VuePress',

  theme: defaultTheme({
    logo: 'https://vuepress.vuejs.org/images/hero.png',
  }),
})
```

:::

### Блок кода с произвольным заголовком

::: preview Посмотреть код

```js title=".vuepress/config.js"
import { defaultTheme } from '@vuepress/theme-default'
import { defineUserConfig } from 'vuepress'

export default defineUserConfig({
  title: 'Hello, VuePress',

  theme: defaultTheme({
    logo: 'https://vuepress.vuejs.org/images/hero.png',
  }),
})
```

:::

### Выделение отдельных слов в кода

Чувствительно к регистру! Используются регулярные выражения.

::: preview Посмотреть код

```js /Hello World/ /msg/
const msg = 'Hello World'
console.log(msg) // prints Hello World
```

:::

## Расширенные возможности

### Отображение добавленных и удаленных строк кода

Лучше всего отключать номера строк при помощи `:no-line-numbers`!

<VPPreview title="Посмотреть код">
<template #code>

````md
```js :no-line-numbers
// Обычный комментарий в коде
console.log('hi') // [\!code --]
console.log('hello') // [\!code ++]
console.log('goodbye')
```
````

</template>
<template #content>

```js :no-line-numbers
// Обычный комментарий в коде
console.log('hi') // [!code --]
console.log('hello') // [!code ++]
console.log('goodbye')
```

</template>
</VPPreview>

### Отображение фокуса и выделения на строках кода

Лучше всего отключать номера строк при помощи `:no-line-numbers`!

<VPPreview title="Посмотреть код">
<template #code>

````md
```js :no-line-numbers
// Обычный комментарий в коде
console.log('Not focused')
console.log('Focused') // [\!code focus]
console.log('Not focused')
```
````

</template>
<template #content>

```js :no-line-numbers
// Обычный комментарий в коде
console.log('Not focused')
console.log('Focused') // [!code focus]
console.log('Not focused')
```

</template>
</VPPreview>

<VPPreview title="Посмотреть код">
<template #code>

````md
```js :no-line-numbers
// Обычный комментарий в коде
console.log('Not highlighted')
console.log('Highlighted') // [\!code highlight]
console.log('Not highlighted')
```
````

</template>
<template #content>

```js :no-line-numbers
// Обычный комментарий в коде
console.log('Not highlighted')
console.log('Highlighted') // [!code highlight]
console.log('Not highlighted')
```

</template>
</VPPreview>

### Отображение уровней ошибок в коде

Лучше всего отключать номера строк при помощи `:no-line-numbers`!

<VPPreview title="Посмотреть код">
<template #code>

````md
```js :no-line-numbers
// Обычный комментарий в коде
console.log('No errors or warnings')
console.warn('Warning') // [\!code warning]
console.error('Error') // [\!code error]
```
````

</template>
<template #content>

```js :no-line-numbers
// Обычный комментарий в коде
console.log('No errors or warnings')
console.warn('Warning') // [!code warning]
console.error('Error') // [!code error]
```

</template>
</VPPreview>

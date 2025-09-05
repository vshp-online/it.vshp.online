# VSHP-EMLicense

Каноничный репозиторий лицензии **VSHP Educational Materials License** (файл `LICENSE.md`).
Актуальный текст — в ветке **main**; конкретные редакции доступны по **тегам**, причём *имя тега соответствует версии лицензии*.

## Как использовать

### 1. Ссылаться на текст лицензии

Укажите ссылку на файл по нужному тегу:

```txt
https://github.com/vshp-online/VSHP-EMLicense/blob/<TAG>/LICENSE.md
```

> `<TAG>` — тег версии (например `1.0.0`). Если версия не критична, можно ссылаться на `main`, тогда будет открываться последняя доступная.

Пример:

- для последней доступной версии:

  ```txt
  https://github.com/vshp-online/VSHP-EMLicense/blob/main/LICENSE.md
  ```

- для конкретной версии (например для 1.0.0):

  ```txt
  https://github.com/vshp-online/VSHP-EMLicense/blob/1.0.0/LICENSE.md
  ```


### 2. Скопировать вручную

Скачайте `LICENSE.md` из нужного тега и добавьте в свой проект (например, в корень или в каталог публикуемых материалов).

### 3. Автоматически подтягивать в CI

Пример (GitHub Actions / shell):

```bash
# сохранит файл в нужное место вашего проекта
curl -sSfL https://raw.githubusercontent.com/vshp-online/VSHP-EMLicense/<TAG>/LICENSE.md \
  -o <TARGET_PATH>/LICENSE.md
```

Где `<TAG>` — нужная версия, `<TARGET_PATH>` — целевая папка проекта (например, `public`).

### 4. Подключить через git subtree

Файл будет присутствовать в дереве вашего репозитория без субмодулей.

```bash
# одноразовое добавление по тегу
git subtree add --prefix licenses/VSHP-EMLicense \
  https://github.com/vshp-online/VSHP-EMLicense.git <TAG> --squash

# обновление на новый тег
git subtree pull --prefix licenses/VSHP-EMLicense \
  https://github.com/vshp-online/VSHP-EMLicense.git <TAG> --squash
```

## Бейдж лицензии

Для отображения используемой версии лицензии для README репозиториев проектов можно воспользоваться вставкой блока ссылки Markdown:

- для последней доступной версии:

  ```md
  [![Лицензия](https://flat.badgen.net/static/Лицензия/VSHP-EMLicense/781F18)](https://github.com/vshp-online/VSHP-EMLicense/blob/main/LICENSE.md)
  ```

  В результате отобразится бейдж со ссылкой на последнюю доступную версию:

  [![Лицензия](https://flat.badgen.net/static/Лицензия/VSHP-EMLicense/781F18)](https://github.com/vshp-online/VSHP-EMLicense/blob/main/LICENSE.md)

- для конкретной версии (например для 1.0.0):

  ```md
  [![Лицензия](https://flat.badgen.net/static/Лицензия/VSHP-EMLicense-1.0.0/781F18)](https://github.com/vshp-online/VSHP-EMLicense/blob/1.0.0/LICENSE.md)
  ```

  В результате отобразится бейдж со ссылкой на конкретную указанную версию:

  [![Лицензия](https://flat.badgen.net/static/Лицензия/VSHP-EMLicense-1.0.0/781F18)](https://github.com/vshp-online/VSHP-EMLicense/blob/1.0.0/LICENSE.md)

## Как выпускать версии (релизы) с тегами

> **Только для сотрудников кафедры, работающих с данным репозиторием!**

**Семантика версий:** `X.Y.Z`

- `X` — несовместимые изменения.
- `Y` — совместимые уточнения/дополнения.
- `Z` — редакционные правки без изменения смысла.

**Правила:**

- Теги строго в формате **`X.Y.Z`** и **не переписываются** (immutable).
- Ветка `main` всегда содержит актуальный текст лицензии.
- Даты — в формате **YYYY-MM-DD**.

### Шаги релиза

1. Внесите в `LICENSE.md` необходимые изменение, обязательно обновите шапку: **Версия**, **Дата**, **Идентификатор**, **SPDX** а также укажите версию в файле `VERSION`
2. Добавьте запись в блок «История изменений» с кратким но ёмким описанием внесенных изменений.
3. Закоммитьте изменения:

   ```bash
   git add LICENSE.md VERSION
   git commit -m "release: VSHP-EMLicense 1.1.1"
   git push origin main
   ```

4. Создайте аннотированный тег и отправьте его:

   ```bash
   git tag -a 1.1.1 -m "VSHP-EMLicense 1.1.1"
   git push origin 1.1.1
   ```

5. (Опционально) создайте GitHub Release для тега:

   - Title: `VSHP-EMLicense 1.1.1`
   - Notes: краткий список изменений

## Контакты

Вопросы по лицензии и правам: **[it@vshp.online](mailto:it@vshp.online)**

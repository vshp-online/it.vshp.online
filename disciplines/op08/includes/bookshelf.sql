CREATE TABLE IF NOT EXISTS `shelves` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`id`)
);

CREATE TABLE IF NOT EXISTS `friends` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `contacts` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`id`)
);

CREATE TABLE IF NOT EXISTS `books` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(255) NOT NULL,
  `year` INT NULL,
  `shelves_id` INT UNSIGNED NULL,
  `friends_id` INT UNSIGNED NULL,
  PRIMARY KEY (`id`),
  INDEX `fk_books_shelves_idx` (`shelves_id` ASC) VISIBLE,
  INDEX `fk_books_friends_idx` (`friends_id` ASC) VISIBLE,
  CONSTRAINT `fk_books_shelves`
    FOREIGN KEY (`shelves_id`)
    REFERENCES `shelves` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_books_friends`
    FOREIGN KEY (`friends_id`)
    REFERENCES `friends` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
);

CREATE TABLE IF NOT EXISTS `authors` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`id`)
);

CREATE TABLE IF NOT EXISTS `authors_books` (
  `books_id` INT UNSIGNED NOT NULL,
  `authors_id` INT UNSIGNED NOT NULL,
  PRIMARY KEY (`books_id`,`authors_id`),
  INDEX `fk_authors_books_books_idx` (`books_id` ASC) VISIBLE,
  INDEX `fk_authors_books_authors_idx` (`authors_id` ASC) VISIBLE,
  CONSTRAINT `fk_authors_books_books`
    FOREIGN KEY (`books_id`)
    REFERENCES `books` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_authors_books_authors`
    FOREIGN KEY (`authors_id`)
    REFERENCES `authors` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
);

INSERT INTO `friends` (`name`, `contacts`)
VALUES ('Иванов Иван', 'Телефон: +79001234567');
SELECT LAST_INSERT_ID() INTO @first_friend_id;
INSERT INTO `friends` (`name`, `contacts`)
VALUES ('Петров Петр', 'Сосед из 262 квартиры');
SELECT LAST_INSERT_ID() INTO @second_friend_id;

INSERT INTO `shelves` (`title`)
VALUES ('Полка в кабинете');
SELECT LAST_INSERT_ID() INTO @cabinet_bookshelf_id;
INSERT INTO `shelves` (`title`)
VALUES
    ('Верхняя полка в гостиной'),
    ('Нижняя полка в гостиной'),
    ('Полка в спальне')
;

INSERT INTO `books` (`title`, `year`, `shelves_id`)
VALUES
('1984', '1949', FLOOR(RAND()*(SELECT COUNT(id) FROM `shelves`)+1))
;
SELECT LAST_INSERT_ID() INTO @a_first_duplicate_id;

INSERT INTO `books` (`title`, `year`, `shelves_id`)
VALUES
('Анна Каренина', '1877', FLOOR(RAND()*(SELECT COUNT(id) FROM `shelves`)+1))
;
SELECT LAST_INSERT_ID() INTO @b_first_duplicate_id;

INSERT INTO `books` (`title`, `year`, `shelves_id`)
VALUES
('Лолита', '1955', FLOOR(RAND()*(SELECT COUNT(id) FROM `shelves`)+1))
;
SELECT LAST_INSERT_ID() INTO @c_first_duplicate_id;

INSERT INTO `books` (`title`, `year`, `shelves_id`)
VALUES
('Война и мир', '1869', @cabinet_bookshelf_id)
;
SELECT LAST_INSERT_ID() INTO @d_first_duplicate_id;

INSERT INTO `books` (`title`, `year`, `shelves_id`)
VALUES
('Рассказы', '1890', FLOOR(RAND()*(SELECT COUNT(id) FROM `shelves`)+1))
;
SELECT LAST_INSERT_ID() INTO @tales_a_id;

INSERT INTO `books` (`title`, `year`, `shelves_id`)
VALUES
('Рассказы', '1912', FLOOR(RAND()*(SELECT COUNT(id) FROM `shelves`)+1))
;
SELECT LAST_INSERT_ID() INTO @tales_b_id;

INSERT INTO `books` (`title`, `year`, `shelves_id`)
VALUES
('Рассказы', '1836', FLOOR(RAND()*(SELECT COUNT(id) FROM `shelves`)+1))
;
SELECT LAST_INSERT_ID() INTO @tales_c_id;

INSERT INTO `books` (`title`, `year`, `shelves_id`)
VALUES
('Тысяча и одна ночь', NULL, FLOOR(RAND()*(SELECT COUNT(id) FROM `shelves`)+1)),
('Божественная комедия', NULL, FLOOR(RAND()*(SELECT COUNT(id) FROM `shelves`)+1)),
('Сказки', NULL, FLOOR(RAND()*(SELECT COUNT(id) FROM `shelves`)+1)),
('И пришло разрушение', '1958', FLOOR(RAND()*(SELECT COUNT(id) FROM `shelves`)+1)),
('Отец Горио', '1835', FLOOR(RAND()*(SELECT COUNT(id) FROM `shelves`)+1)),
('Трилогия', NULL, FLOOR(RAND()*(SELECT COUNT(id) FROM `shelves`)+1)),
('Декамерон', NULL, FLOOR(RAND()*(SELECT COUNT(id) FROM `shelves`)+1)),
('Вымыслы', NULL, FLOOR(RAND()*(SELECT COUNT(id) FROM `shelves`)+1)),
('Грозовой перевал', '1847', FLOOR(RAND()*(SELECT COUNT(id) FROM `shelves`)+1)),
('Рамаяна', NULL, FLOOR(RAND()*(SELECT COUNT(id) FROM `shelves`)+1)),
('Энеида', NULL, FLOOR(RAND()*(SELECT COUNT(id) FROM `shelves`)+1)),
('Миссис Дэллоуэй', '1925', FLOOR(RAND()*(SELECT COUNT(id) FROM `shelves`)+1)),
('На маяк', '1927', FLOOR(RAND()*(SELECT COUNT(id) FROM `shelves`)+1)),
('Махабхарата', NULL, FLOOR(RAND()*(SELECT COUNT(id) FROM `shelves`)+1)),
('Голод', '1890', FLOOR(RAND()*(SELECT COUNT(id) FROM `shelves`)+1)),
('Цыганское романсеро', '1928', FLOOR(RAND()*(SELECT COUNT(id) FROM `shelves`)+1)),
('Сто лет одиночества', '1967', FLOOR(RAND()*(SELECT COUNT(id) FROM `shelves`)+1)),
('Любовь во время чумы', '1985', FLOOR(RAND()*(SELECT COUNT(id) FROM `shelves`)+1)),
('Фауст', '1832', FLOOR(RAND()*(SELECT COUNT(id) FROM `shelves`)+1)),
('Тропы по большому сертану', '1956', FLOOR(RAND()*(SELECT COUNT(id) FROM `shelves`)+1)),
('Мёртвые души', '1842', FLOOR(RAND()*(SELECT COUNT(id) FROM `shelves`)+1)),
('Жестяной барабан', '1959', FLOOR(RAND()*(SELECT COUNT(id) FROM `shelves`)+1)),
('Берлин Александрплац', '1929', FLOOR(RAND()*(SELECT COUNT(id) FROM `shelves`)+1)),
('Улисс', '1922', FLOOR(RAND()*(SELECT COUNT(id) FROM `shelves`)+1)),
('Жак-фаталист и его хозяин', '1796', FLOOR(RAND()*(SELECT COUNT(id) FROM `shelves`)+1)),
('Большие надежды', '1861', FLOOR(RAND()*(SELECT COUNT(id) FROM `shelves`)+1)),
('Преступление и наказание', '1866', FLOOR(RAND()*(SELECT COUNT(id) FROM `shelves`)+1)),
('Идиот', '1869', FLOOR(RAND()*(SELECT COUNT(id) FROM `shelves`)+1)),
('Бесы', '1872', FLOOR(RAND()*(SELECT COUNT(id) FROM `shelves`)+1)),
('Братья Карамазовы', '1880', FLOOR(RAND()*(SELECT COUNT(id) FROM `shelves`)+1)),
('Медея', NULL, FLOOR(RAND()*(SELECT COUNT(id) FROM `shelves`)+1)),
('Самопознание Дзено', '1923', FLOOR(RAND()*(SELECT COUNT(id) FROM `shelves`)+1)),
('Кукольный дом', '1879', FLOOR(RAND()*(SELECT COUNT(id) FROM `shelves`)+1)),
('Стон горы', '1954', FLOOR(RAND()*(SELECT COUNT(id) FROM `shelves`)+1)),
('Невероятные похождения Алексиса Зорбаса', '1946', FLOOR(RAND()*(SELECT COUNT(id) FROM `shelves`)+1)),
('Шакунтала', NULL, FLOOR(RAND()*(SELECT COUNT(id) FROM `shelves`)+1)),
('Посторонний', '1942', FLOOR(RAND()*(SELECT COUNT(id) FROM `shelves`)+1)),
('Процесс', '1925', FLOOR(RAND()*(SELECT COUNT(id) FROM `shelves`)+1)),
('Замок', '1926', FLOOR(RAND()*(SELECT COUNT(id) FROM `shelves`)+1)),
('Ностромо', '1904', FLOOR(RAND()*(SELECT COUNT(id) FROM `shelves`)+1)),
('Самостоятельные люди', NULL, FLOOR(RAND()*(SELECT COUNT(id) FROM `shelves`)+1)),
('Стихи', '1818', FLOOR(RAND()*(SELECT COUNT(id) FROM `shelves`)+1)),
('Золотая тетрадь', '1962', FLOOR(RAND()*(SELECT COUNT(id) FROM `shelves`)+1)),
('Пеппи Длинныйчулок', '1945', FLOOR(RAND()*(SELECT COUNT(id) FROM `shelves`)+1)),
('Сыновья и любовники', '1913', FLOOR(RAND()*(SELECT COUNT(id) FROM `shelves`)+1)),
('Записки сумасшедшего', '1918', FLOOR(RAND()*(SELECT COUNT(id) FROM `shelves`)+1)),
('Будденброки', '1901', FLOOR(RAND()*(SELECT COUNT(id) FROM `shelves`)+1)),
('Волшебная гора', '1924', FLOOR(RAND()*(SELECT COUNT(id) FROM `shelves`)+1)),
('Предания нашей улицы', '1959', FLOOR(RAND()*(SELECT COUNT(id) FROM `shelves`)+1)),
('Моби Дик', '1851', FLOOR(RAND()*(SELECT COUNT(id) FROM `shelves`)+1)),
('Опыты', '1595', FLOOR(RAND()*(SELECT COUNT(id) FROM `shelves`)+1)),
('История', '1974', FLOOR(RAND()*(SELECT COUNT(id) FROM `shelves`)+1)),
('Возлюбленная', '1987', FLOOR(RAND()*(SELECT COUNT(id) FROM `shelves`)+1)),
('Человек без свойств', NULL, FLOOR(RAND()*(SELECT COUNT(id) FROM `shelves`)+1)),
('Метаморфозы', NULL, FLOOR(RAND()*(SELECT COUNT(id) FROM `shelves`)+1)),
('Книга непокоя', NULL, FLOOR(RAND()*(SELECT COUNT(id) FROM `shelves`)+1)),
('В поисках утраченного времени', NULL, FLOOR(RAND()*(SELECT COUNT(id) FROM `shelves`)+1)),
('Гаргантюа и Пантагрюэль', NULL, FLOOR(RAND()*(SELECT COUNT(id) FROM `shelves`)+1)),
('Педро Парамо', '1955', FLOOR(RAND()*(SELECT COUNT(id) FROM `shelves`)+1)),
('Маснави', NULL, FLOOR(RAND()*(SELECT COUNT(id) FROM `shelves`)+1)),
('Дети полуночи', '1981', FLOOR(RAND()*(SELECT COUNT(id) FROM `shelves`)+1)),
('Гордость и предубеждение', '1813', FLOOR(RAND()*(SELECT COUNT(id) FROM `shelves`)+1)),
('Бустан', '1257', FLOOR(RAND()*(SELECT COUNT(id) FROM `shelves`)+1)),
('Сезон паломничества на Север', '1966', FLOOR(RAND()*(SELECT COUNT(id) FROM `shelves`)+1)),
('Слепота', '1995', FLOOR(RAND()*(SELECT COUNT(id) FROM `shelves`)+1)),
('Путешествия Гулливера', '1726', FLOOR(RAND()*(SELECT COUNT(id) FROM `shelves`)+1)),
('Путешествие на край ночи', '1932', FLOOR(RAND()*(SELECT COUNT(id) FROM `shelves`)+1)),
('Хитроумный идальго Дон Кихот Ламанчский', NULL, FLOOR(RAND()*(SELECT COUNT(id) FROM `shelves`)+1)),
('Повесть о блистательном принце Гэндзи', NULL, FLOOR(RAND()*(SELECT COUNT(id) FROM `shelves`)+1)),
('Эдип-царь', NULL, FLOOR(RAND()*(SELECT COUNT(id) FROM `shelves`)+1)),
('Красное и чёрное', '1830', FLOOR(RAND()*(SELECT COUNT(id) FROM `shelves`)+1)),
('Жизнь и мнения джентльмена Тристрама Шенди', '1760', FLOOR(RAND()*(SELECT COUNT(id) FROM `shelves`)+1)),
('Приключения Гекльберри Финна', '1884', FLOOR(RAND()*(SELECT COUNT(id) FROM `shelves`)+1)),
('Смерть Ивана Ильича', '1886', FLOOR(RAND()*(SELECT COUNT(id) FROM `shelves`)+1)),
('Листья травы', '1855', FLOOR(RAND()*(SELECT COUNT(id) FROM `shelves`)+1)),
('Госпожа Бовари', '1857', FLOOR(RAND()*(SELECT COUNT(id) FROM `shelves`)+1)),
('Воспитание чувств', '1869', FLOOR(RAND()*(SELECT COUNT(id) FROM `shelves`)+1)),
('Авессалом-Авессалом!', '1936', FLOOR(RAND()*(SELECT COUNT(id) FROM `shelves`)+1)),
('Шум и ярость', '1929', FLOOR(RAND()*(SELECT COUNT(id) FROM `shelves`)+1)),
('Старик и море', '1952', FLOOR(RAND()*(SELECT COUNT(id) FROM `shelves`)+1)),
('Стихотворения', '1952', FLOOR(RAND()*(SELECT COUNT(id) FROM `shelves`)+1)),
('Кентерберийские рассказы', NULL, FLOOR(RAND()*(SELECT COUNT(id) FROM `shelves`)+1)),
('Гамлет', '1603', FLOOR(RAND()*(SELECT COUNT(id) FROM `shelves`)+1)),
('Король Лир', '1608', FLOOR(RAND()*(SELECT COUNT(id) FROM `shelves`)+1)),
('Отелло', '1609', FLOOR(RAND()*(SELECT COUNT(id) FROM `shelves`)+1)),
('Мидлмарч', '1871', FLOOR(RAND()*(SELECT COUNT(id) FROM `shelves`)+1)),
('Человек-невидимка', '1952', FLOOR(RAND()*(SELECT COUNT(id) FROM `shelves`)+1)),
('Воспоминания Адриана', '1951', FLOOR(RAND()*(SELECT COUNT(id) FROM `shelves`)+1)),
('Невидимка', '1952', FLOOR(RAND()*(SELECT COUNT(id) FROM `shelves`)+1)),
('К маяку', '1927', FLOOR(RAND()*(SELECT COUNT(id) FROM `shelves`)+1)),
('Иллиада и Одиссея', NULL, FLOOR(RAND()*(SELECT COUNT(id) FROM `shelves`)+1)),
('Божественная комедия', '1321', FLOOR(RAND()*(SELECT COUNT(id) FROM `shelves`)+1)),
('Миддлмарч', '1874', FLOOR(RAND()*(SELECT COUNT(id) FROM `shelves`)+1)),
('Распад', '1958', FLOOR(RAND()*(SELECT COUNT(id) FROM `shelves`)+1)),
('Над пропастью во ржи', '1951', FLOOR(RAND()*(SELECT COUNT(id) FROM `shelves`)+1)),
('Унесённые ветром', '1936', FLOOR(RAND()*(SELECT COUNT(id) FROM `shelves`)+1)),
('Великий Гэтсби', '1925', FLOOR(RAND()*(SELECT COUNT(id) FROM `shelves`)+1)),
('Уловка 22', '1961', FLOOR(RAND()*(SELECT COUNT(id) FROM `shelves`)+1)),
('Гроздья гнева', '1939', FLOOR(RAND()*(SELECT COUNT(id) FROM `shelves`)+1)),
('Дивный новый мир', '1932', FLOOR(RAND()*(SELECT COUNT(id) FROM `shelves`)+1)),
('Сын Америки', '1940', FLOOR(RAND()*(SELECT COUNT(id) FROM `shelves`)+1)),
('Демократия в Америке', '1835', FLOOR(RAND()*(SELECT COUNT(id) FROM `shelves`)+1)),
('Происхождение видов', '1859', FLOOR(RAND()*(SELECT COUNT(id) FROM `shelves`)+1)),
('Общественный договор', '1762', FLOOR(RAND()*(SELECT COUNT(id) FROM `shelves`)+1)),
('Капитал', '1867', FLOOR(RAND()*(SELECT COUNT(id) FROM `shelves`)+1)),
('Государь', '1532', FLOOR(RAND()*(SELECT COUNT(id) FROM `shelves`)+1)),
('Левиафан', '1651', FLOOR(RAND()*(SELECT COUNT(id) FROM `shelves`)+1)),
('Властелин колец', '1954', FLOOR(RAND()*(SELECT COUNT(id) FROM `shelves`)+1)),
('Винни-Пух', '1926', FLOOR(RAND()*(SELECT COUNT(id) FROM `shelves`)+1)),
('Лев, колдунья и платяной шкаф', '1950', FLOOR(RAND()*(SELECT COUNT(id) FROM `shelves`)+1)),
('Поездка в Индию', '1924', FLOOR(RAND()*(SELECT COUNT(id) FROM `shelves`)+1)),
('В дороге', '1957', FLOOR(RAND()*(SELECT COUNT(id) FROM `shelves`)+1)),
('Убить пересмешника', '1960', FLOOR(RAND()*(SELECT COUNT(id) FROM `shelves`)+1)),
('Заводной апельсин', '1962', FLOOR(RAND()*(SELECT COUNT(id) FROM `shelves`)+1)),
('Свет в августе', '1932', FLOOR(RAND()*(SELECT COUNT(id) FROM `shelves`)+1)),
('Души чёрного народа', '1903', FLOOR(RAND()*(SELECT COUNT(id) FROM `shelves`)+1)),
('Безбрежное Саргассово море', '1966', FLOOR(RAND()*(SELECT COUNT(id) FROM `shelves`)+1)),
('Мадам Бовари', '1857', FLOOR(RAND()*(SELECT COUNT(id) FROM `shelves`)+1)),
('Потерянный рай', '1667', FLOOR(RAND()*(SELECT COUNT(id) FROM `shelves`)+1)),
('Сонеты', '1609', FLOOR(RAND()*(SELECT COUNT(id) FROM `shelves`)+1)),
('Ким', '1901', FLOOR(RAND()*(SELECT COUNT(id) FROM `shelves`)+1)),
('Франкенштейн', '1818', FLOOR(RAND()*(SELECT COUNT(id) FROM `shelves`)+1)),
('Песнь Соломона', '1977', FLOOR(RAND()*(SELECT COUNT(id) FROM `shelves`)+1)),
('Пролетая над гнездом кукушки', '1962', FLOOR(RAND()*(SELECT COUNT(id) FROM `shelves`)+1)),
('По ком звонит колокол', '1940', FLOOR(RAND()*(SELECT COUNT(id) FROM `shelves`)+1)),
('Бойня номер пять', '1969', FLOOR(RAND()*(SELECT COUNT(id) FROM `shelves`)+1)),
('Скотный двор', '1945', FLOOR(RAND()*(SELECT COUNT(id) FROM `shelves`)+1)),
('Повелитель мух', '1954', FLOOR(RAND()*(SELECT COUNT(id) FROM `shelves`)+1)),
('Хладнокровное убийство', '1965', FLOOR(RAND()*(SELECT COUNT(id) FROM `shelves`)+1)),
('В поисках потерянного времени', '1913', FLOOR(RAND()*(SELECT COUNT(id) FROM `shelves`)+1)),
('Большой сон', '1939', FLOOR(RAND()*(SELECT COUNT(id) FROM `shelves`)+1)),
('Когда я умирала', '1930', FLOOR(RAND()*(SELECT COUNT(id) FROM `shelves`)+1)),
('Фиеста', '1926', FLOOR(RAND()*(SELECT COUNT(id) FROM `shelves`)+1)),
('Я, Клавдий', '1934', FLOOR(RAND()*(SELECT COUNT(id) FROM `shelves`)+1)),
('Сердце — одинокий охотник', '1940', FLOOR(RAND()*(SELECT COUNT(id) FROM `shelves`)+1)),
('И вся королевская рать', '1946', FLOOR(RAND()*(SELECT COUNT(id) FROM `shelves`)+1)),
('Иди, вещай с горы', '1953', FLOOR(RAND()*(SELECT COUNT(id) FROM `shelves`)+1)),
('Паутина Шарлотты', '1952', FLOOR(RAND()*(SELECT COUNT(id) FROM `shelves`)+1)),
('Сердце тьмы', '1902', FLOOR(RAND()*(SELECT COUNT(id) FROM `shelves`)+1)),
('Ночь', '1958', FLOOR(RAND()*(SELECT COUNT(id) FROM `shelves`)+1)),
('Кролик, беги', '1960', FLOOR(RAND()*(SELECT COUNT(id) FROM `shelves`)+1)),
('Эпоха невинности', '1920', FLOOR(RAND()*(SELECT COUNT(id) FROM `shelves`)+1)),
('Случай портного', '1969', FLOOR(RAND()*(SELECT COUNT(id) FROM `shelves`)+1)),
('Американская трагедия', '1925', FLOOR(RAND()*(SELECT COUNT(id) FROM `shelves`)+1)),
('День саранчи', '1939', FLOOR(RAND()*(SELECT COUNT(id) FROM `shelves`)+1)),
('Тропик рака', '1934', FLOOR(RAND()*(SELECT COUNT(id) FROM `shelves`)+1)),
('Мальтийский сокол', '1930', FLOOR(RAND()*(SELECT COUNT(id) FROM `shelves`)+1)),
('Тёмные начала', '1995', FLOOR(RAND()*(SELECT COUNT(id) FROM `shelves`)+1)),
('Смерть пришла архиепископу', '1927', FLOOR(RAND()*(SELECT COUNT(id) FROM `shelves`)+1)),
('Толкования снов', '1900', FLOOR(RAND()*(SELECT COUNT(id) FROM `shelves`)+1)),
('Воспитание Генри Адамса', '1918', FLOOR(RAND()*(SELECT COUNT(id) FROM `shelves`)+1)),
('Цитатник', '1964', FLOOR(RAND()*(SELECT COUNT(id) FROM `shelves`)+1)),
('Многообразие религиозного опыта', '1902', FLOOR(RAND()*(SELECT COUNT(id) FROM `shelves`)+1)),
('Возвращение в Брайдсхед', '1945', FLOOR(RAND()*(SELECT COUNT(id) FROM `shelves`)+1)),
('Безмолвная весна', '1962', FLOOR(RAND()*(SELECT COUNT(id) FROM `shelves`)+1)),
('Общая теория занятости, процента и денег', '1936', FLOOR(RAND()*(SELECT COUNT(id) FROM `shelves`)+1)),
('Лорд Джим', '1900', FLOOR(RAND()*(SELECT COUNT(id) FROM `shelves`)+1)),
('Простимся со всем этим', '1929', FLOOR(RAND()*(SELECT COUNT(id) FROM `shelves`)+1)),
('Общество изобилия', '1958', FLOOR(RAND()*(SELECT COUNT(id) FROM `shelves`)+1)),
('Ветер в ивах', '1908', FLOOR(RAND()*(SELECT COUNT(id) FROM `shelves`)+1)),
('Автобиография Малколма Икс', '1965', FLOOR(RAND()*(SELECT COUNT(id) FROM `shelves`)+1)),
('Выдающиеся викторианцы', '1918', FLOOR(RAND()*(SELECT COUNT(id) FROM `shelves`)+1)),
('Цвет пурпурный', '1982', FLOOR(RAND()*(SELECT COUNT(id) FROM `shelves`)+1)),
('Вторая мировая война', '1948', FLOOR(RAND()*(SELECT COUNT(id) FROM `shelves`)+1))
;

INSERT INTO `books` (`title`, `year`, `shelves_id`)
VALUES
('1984', '1949', FLOOR(RAND()*(SELECT COUNT(id) FROM `shelves`)+1))
;
SELECT LAST_INSERT_ID() INTO @a_second_duplicate_id;

INSERT INTO `books` (`title`, `year`, `shelves_id`)
VALUES
('Анна Каренина', '1877', FLOOR(RAND()*(SELECT COUNT(id) FROM `shelves`)+1))
;
SELECT LAST_INSERT_ID() INTO @b_second_duplicate_id;

INSERT INTO `books` (`title`, `year`, `shelves_id`)
VALUES
('Лолита', '1957', FLOOR(RAND()*(SELECT COUNT(id) FROM `shelves`)+1))
;
SELECT LAST_INSERT_ID() INTO @c_second_duplicate_id;

INSERT INTO `books` (`title`, `year`, `shelves_id`)
VALUES
('Война и мир', '1950', @cabinet_bookshelf_id)
;
SELECT LAST_INSERT_ID() INTO @d_second_duplicate_id;

INSERT INTO `authors` (`name`)
VALUES
('Лев Толстой');
SELECT LAST_INSERT_ID() INTO @author_tolstoi_id;
INSERT INTO `authors` (`name`)
VALUES
('Алан Александр Милн'),
('Алексис де Токвиль'),
('Алекс Хейли и Малколм Икс'),
('Альбер Камю'),
('Альфред Дёблин'),
('Антон Чехов'),
('Астрид Линдгрен'),
('Вальмики'),
('Вергилий'),
('Вирджиния Вульф'),
('Вирджиния Вулф'),
('Владимир Набоков'),
('Вьяса'),
('Габриэль Гарсия Маркес'),
('Габриэль Гарсиа Маркес'),
('Генри Адамс'),
('Генри Миллер'),
('Генрик Ибсен'),
('Герман Мелвилл'),
('Гомер'),
('Гюнтер Грасс'),
('Гюстав Флобер'),
('Данте Алигьери'),
('Дени Дидро'),
('Джакомо Леопарди'),
('Джалаладдин Руми'),
('Джером Д. Сэлинджер'),
('Джеймс Болдуин'),
('Джеймс Джойс'),
('Джейн Остин'),
('Джеффри Чосер'),
('Джин Рис'),
('Джозеф Хеллер'),
('Джованни Боккаччо'),
('Джозеф Конрад'),
('Джон Апдайк'),
('Джон Кейнс'),
('Джон Кеннет Гэлбрейт'),
('Джон Керуак'),
('Джон Милтон'),
('Джон Стейнбек'),
('Джон Толкиен'),
('Джонатан Свифт'),
('Джордж Оруэлл'),
('Джордж Элиот'),
('Джоффри Чосер'),
('Дорис Лессинг'),
('Дэвид Герберт Лоуренс'),
('Дэвид Лоуренс'),
('Дэшиел Хэммет'),
('Еврипид'),
('Жан-Жак Руссо'),
('Жозе Сарамаго'),
('Жуан Гимарайнс Роза'),
('Зигмунд Фрейд'),
('Ивлин Во'),
('Иоганн Вольфганг фон Гёте'),
('Итало Звево'),
('Калидаса'),
('Карсон Маккаллерс'),
('Карл Маркс'),
('Кен Кизи'),
('Кеннет Грэм'),
('Клайв Льюис'),
('Кнут Гамсун'),
('Курт Воннегут'),
('Литтон Стречи'),
('Лоренс Стерн'),
('Лу Синь'),
('Луи-Фердинанд Селин'),
('Мао Цзедун'),
('Маргарет Митчелл'),
('Маргерит Юрсенар'),
('Марк Твен'),
('Марсель Пруст'),
('Мигель де Сервантес'),
('Мишель де Монтень'),
('Мурасаки Сикибу'),
('Мэри Шелли'),
('Нагиб Махфуз'),
('Натаниэль Уэст'),
('Неизвестный автор'),
('Никколо Макиавелли'),
('Николай Васильевич Гоголь'),
('Никос Казандзакис'),
('Олдос Хаксли'),
('Оноре де Бальзак'),
('Пауль Целан'),
('Публий Овидий Назон'),
('Ральф Эллисон'),
('Редьярд Киплинг'),
('Реймонд Чандлер'),
('Рейчел Карсон'),
('Ричард Райт'),
('Роберт Грейвз'),
('Роберт Музиль'),
('Роберт Пенн Уоррен'),
('Саади'),
('Салман Рушди'),
('Софокл'),
('Стендаль'),
('Сэмюэл Беккет'),
('Тайиб Салих'),
('Теодор Драйзер'),
('Томас Гоббс'),
('Томас Манн'),
('Тони Моррисон'),
('Труман Капоте'),
('Уилла Кейтер'),
('Уильям Голдинг'),
('Уильям Джемс'),
('Уильям Дю Бойс'),
('Уильям Фолкнер'),
('Уильям Шекспир'),
('Уинстон Черчилль'),
('Уолт Уитмен'),
('Федерико Гарсиа Лорка'),
('Фернанду Пессоа'),
('Филип Пулман'),
('Филип Рот'),
('Франсуа Рабле'),
('Франц Кафка'),
('Фрэнсис Скотт Фитцджеральд'),
('Фёдор Достоевский'),
('Халлдор Кильян Лакснесс'),
('Ханс Кристиан Андерсен'),
('Харпер Ли'),
('Хорхе Луис Борхес'),
('Хуан Рульфо'),
('Чарльз Дарвин'),
('Чарльз Диккенс'),
('Чинуа Ачебе'),
('Эдвин Уайт'),
('Эдгар Аллан По'),
('Эдит Уортон'),
('Эдуард Форстер'),
('Эли Визель'),
('Элис Уокер'),
('Эльза Моранте'),
('Эмили Бронте'),
('Энтони Берджесс'),
('Эрнест Хемингуэй'),
('Ясунари Кавабата')
;

INSERT INTO `authors_books` (`books_id`, `authors_id`)
VALUES
(
    (SELECT `id` FROM `books` WHERE `title` = 'Тысяча и одна ночь' LIMIT 1),
    (SELECT `id` FROM `authors` WHERE `name` = 'Неизвестный автор' LIMIT 1)
),
(
    (SELECT `id` FROM `books` WHERE `title` = 'Божественная комедия' LIMIT 1),
    (SELECT `id` FROM `authors` WHERE `name` = 'Данте Алигьери' LIMIT 1)
),
(
    (SELECT `id` FROM `books` WHERE `title` = 'Сказки' LIMIT 1),
    (SELECT `id` FROM `authors` WHERE `name` = 'Ханс Кристиан Андерсен' LIMIT 1)
),
(
    (SELECT `id` FROM `books` WHERE `title` = 'И пришло разрушение' LIMIT 1),
    (SELECT `id` FROM `authors` WHERE `name` = 'Чинуа Ачебе' LIMIT 1)
),
(
    (SELECT `id` FROM `books` WHERE `title` = 'Отец Горио' LIMIT 1),
    (SELECT `id` FROM `authors` WHERE `name` = 'Оноре де Бальзак' LIMIT 1)
),
(
    (SELECT `id` FROM `books` WHERE `title` = 'Трилогия' LIMIT 1),
    (SELECT `id` FROM `authors` WHERE `name` = 'Сэмюэл Беккет' LIMIT 1)
),
(
    (SELECT `id` FROM `books` WHERE `title` = 'Декамерон' LIMIT 1),
    (SELECT `id` FROM `authors` WHERE `name` = 'Джованни Боккаччо' LIMIT 1)
),
(
    (SELECT `id` FROM `books` WHERE `title` = 'Вымыслы' LIMIT 1),
    (SELECT `id` FROM `authors` WHERE `name` = 'Хорхе Луис Борхес' LIMIT 1)
),
(
    (SELECT `id` FROM `books` WHERE `title` = 'Грозовой перевал' LIMIT 1),
    (SELECT `id` FROM `authors` WHERE `name` = 'Эмили Бронте' LIMIT 1)
),
(
    (SELECT `id` FROM `books` WHERE `title` = 'Рамаяна' LIMIT 1),
    (SELECT `id` FROM `authors` WHERE `name` = 'Вальмики' LIMIT 1)
),
(
    (SELECT `id` FROM `books` WHERE `title` = 'Энеида' LIMIT 1),
    (SELECT `id` FROM `authors` WHERE `name` = 'Вергилий' LIMIT 1)
),
(
    (SELECT `id` FROM `books` WHERE `title` = 'Миссис Дэллоуэй' LIMIT 1),
    (SELECT `id` FROM `authors` WHERE `name` = 'Вирджиния Вулф' LIMIT 1)
),
(
    (SELECT `id` FROM `books` WHERE `title` = 'На маяк' LIMIT 1),
    (SELECT `id` FROM `authors` WHERE `name` = 'Вирджиния Вулф' LIMIT 1)
),
(
    (SELECT `id` FROM `books` WHERE `title` = 'Махабхарата' LIMIT 1),
    (SELECT `id` FROM `authors` WHERE `name` = 'Вьяса' LIMIT 1)
),
(
    (SELECT `id` FROM `books` WHERE `title` = 'Голод' LIMIT 1),
    (SELECT `id` FROM `authors` WHERE `name` = 'Кнут Гамсун' LIMIT 1)
),
(
    (SELECT `id` FROM `books` WHERE `title` = 'Цыганское романсеро' LIMIT 1),
    (SELECT `id` FROM `authors` WHERE `name` = 'Федерико Гарсиа Лорка' LIMIT 1)
),
(
    (SELECT `id` FROM `books` WHERE `title` = 'Сто лет одиночества' LIMIT 1),
    (SELECT `id` FROM `authors` WHERE `name` = 'Габриэль Гарсиа Маркес' LIMIT 1)
),
(
    (SELECT `id` FROM `books` WHERE `title` = 'Любовь во время чумы' LIMIT 1),
    (SELECT `id` FROM `authors` WHERE `name` = 'Габриэль Гарсиа Маркес' LIMIT 1)
),
(
    (SELECT `id` FROM `books` WHERE `title` = 'Фауст' LIMIT 1),
    (SELECT `id` FROM `authors` WHERE `name` = 'Иоганн Вольфганг фон Гёте' LIMIT 1)
),
(
    (SELECT `id` FROM `books` WHERE `title` = 'Тропы по большому сертану' LIMIT 1),
    (SELECT `id` FROM `authors` WHERE `name` = 'Жуан Гимарайнс Роза' LIMIT 1)
),
(
    (SELECT `id` FROM `books` WHERE `title` = 'Мёртвые души' LIMIT 1),
    (SELECT `id` FROM `authors` WHERE `name` = 'Николай Васильевич Гоголь' LIMIT 1)
),
(
    (SELECT `id` FROM `books` WHERE `title` = 'Жестяной барабан' LIMIT 1),
    (SELECT `id` FROM `authors` WHERE `name` = 'Гюнтер Грасс' LIMIT 1)
),
(
    (SELECT `id` FROM `books` WHERE `title` = 'Берлин Александрплац' LIMIT 1),
    (SELECT `id` FROM `authors` WHERE `name` = 'Альфред Дёблин' LIMIT 1)
),
(
    (SELECT `id` FROM `books` WHERE `title` = 'Улисс' LIMIT 1),
    (SELECT `id` FROM `authors` WHERE `name` = 'Джеймс Джойс' LIMIT 1)
),
(
    (SELECT `id` FROM `books` WHERE `title` = 'Жак-фаталист и его хозяин' LIMIT 1),
    (SELECT `id` FROM `authors` WHERE `name` = 'Дени Дидро' LIMIT 1)
),
(
    (SELECT `id` FROM `books` WHERE `title` = 'Большие надежды' LIMIT 1),
    (SELECT `id` FROM `authors` WHERE `name` = 'Чарльз Диккенс' LIMIT 1)
),
(
    (SELECT `id` FROM `books` WHERE `title` = 'Преступление и наказание' LIMIT 1),
    (SELECT `id` FROM `authors` WHERE `name` = 'Фёдор Достоевский' LIMIT 1)
),
(
    (SELECT `id` FROM `books` WHERE `title` = 'Идиот' LIMIT 1),
    (SELECT `id` FROM `authors` WHERE `name` = 'Фёдор Достоевский' LIMIT 1)
),
(
    (SELECT `id` FROM `books` WHERE `title` = 'Бесы' LIMIT 1),
    (SELECT `id` FROM `authors` WHERE `name` = 'Фёдор Достоевский' LIMIT 1)
),
(
    (SELECT `id` FROM `books` WHERE `title` = 'Братья Карамазовы' LIMIT 1),
    (SELECT `id` FROM `authors` WHERE `name` = 'Фёдор Достоевский' LIMIT 1)
),
(
    (SELECT `id` FROM `books` WHERE `title` = 'Медея' LIMIT 1),
    (SELECT `id` FROM `authors` WHERE `name` = 'Еврипид' LIMIT 1)
),
(
    (SELECT `id` FROM `books` WHERE `title` = 'Самопознание Дзено' LIMIT 1),
    (SELECT `id` FROM `authors` WHERE `name` = 'Итало Звево' LIMIT 1)
),
(
    (SELECT `id` FROM `books` WHERE `title` = 'Кукольный дом' LIMIT 1),
    (SELECT `id` FROM `authors` WHERE `name` = 'Генрик Ибсен' LIMIT 1)
),
(
    (SELECT `id` FROM `books` WHERE `title` = 'Стон горы' LIMIT 1),
    (SELECT `id` FROM `authors` WHERE `name` = 'Ясунари Кавабата' LIMIT 1)
),
(
    (SELECT `id` FROM `books` WHERE `title` = 'Невероятные похождения Алексиса Зорбаса' LIMIT 1),
    (SELECT `id` FROM `authors` WHERE `name` = 'Никос Казандзакис' LIMIT 1)
),
(
    (SELECT `id` FROM `books` WHERE `title` = 'Шакунтала' LIMIT 1),
    (SELECT `id` FROM `authors` WHERE `name` = 'Калидаса' LIMIT 1)
),
(
    (SELECT `id` FROM `books` WHERE `title` = 'Посторонний' LIMIT 1),
    (SELECT `id` FROM `authors` WHERE `name` = 'Альбер Камю' LIMIT 1)
),
(
    @tales_b_id,
    (SELECT `id` FROM `authors` WHERE `name` = 'Франц Кафка' LIMIT 1)
),
(
    (SELECT `id` FROM `books` WHERE `title` = 'Процесс' LIMIT 1),
    (SELECT `id` FROM `authors` WHERE `name` = 'Франц Кафка' LIMIT 1)
),
(
    (SELECT `id` FROM `books` WHERE `title` = 'Замок' LIMIT 1),
    (SELECT `id` FROM `authors` WHERE `name` = 'Франц Кафка' LIMIT 1)
),
(
    (SELECT `id` FROM `books` WHERE `title` = 'Ностромо' LIMIT 1),
    (SELECT `id` FROM `authors` WHERE `name` = 'Джозеф Конрад' LIMIT 1)
),
(
    (SELECT `id` FROM `books` WHERE `title` = 'Самостоятельные люди' LIMIT 1),
    (SELECT `id` FROM `authors` WHERE `name` = 'Халлдор Кильян Лакснесс' LIMIT 1)
),
(
    (SELECT `id` FROM `books` WHERE `title` = 'Стихи' LIMIT 1),
    (SELECT `id` FROM `authors` WHERE `name` = 'Джакомо Леопарди' LIMIT 1)
),
(
    (SELECT `id` FROM `books` WHERE `title` = 'Золотая тетрадь' LIMIT 1),
    (SELECT `id` FROM `authors` WHERE `name` = 'Дорис Лессинг' LIMIT 1)
),
(
    (SELECT `id` FROM `books` WHERE `title` = 'Пеппи Длинныйчулок' LIMIT 1),
    (SELECT `id` FROM `authors` WHERE `name` = 'Астрид Линдгрен' LIMIT 1)
),
(
    (SELECT `id` FROM `books` WHERE `title` = 'Сыновья и любовники' LIMIT 1),
    (SELECT `id` FROM `authors` WHERE `name` = 'Дэвид Герберт Лоуренс' LIMIT 1)
),
(
    (SELECT `id` FROM `books` WHERE `title` = 'Записки сумасшедшего' LIMIT 1),
    (SELECT `id` FROM `authors` WHERE `name` = 'Лу Синь' LIMIT 1)
),
(
    (SELECT `id` FROM `books` WHERE `title` = 'Будденброки' LIMIT 1),
    (SELECT `id` FROM `authors` WHERE `name` = 'Томас Манн' LIMIT 1)
),
(
    (SELECT `id` FROM `books` WHERE `title` = 'Волшебная гора' LIMIT 1),
    (SELECT `id` FROM `authors` WHERE `name` = 'Томас Манн' LIMIT 1)
),
(
    (SELECT `id` FROM `books` WHERE `title` = 'Предания нашей улицы' LIMIT 1),
    (SELECT `id` FROM `authors` WHERE `name` = 'Нагиб Махфуз' LIMIT 1)
),
(
    (SELECT `id` FROM `books` WHERE `title` = 'Моби Дик' LIMIT 1),
    (SELECT `id` FROM `authors` WHERE `name` = 'Герман Мелвилл' LIMIT 1)
),
(
    (SELECT `id` FROM `books` WHERE `title` = 'Опыты' LIMIT 1),
    (SELECT `id` FROM `authors` WHERE `name` = 'Мишель де Монтень' LIMIT 1)
),
(
    (SELECT `id` FROM `books` WHERE `title` = 'История' LIMIT 1),
    (SELECT `id` FROM `authors` WHERE `name` = 'Эльза Моранте' LIMIT 1)
),
(
    (SELECT `id` FROM `books` WHERE `title` = 'Возлюбленная' LIMIT 1),
    (SELECT `id` FROM `authors` WHERE `name` = 'Тони Моррисон' LIMIT 1)
),
(
    (SELECT `id` FROM `books` WHERE `title` = 'Человек без свойств' LIMIT 1),
    (SELECT `id` FROM `authors` WHERE `name` = 'Роберт Музиль' LIMIT 1)
),
(
    @c_first_duplicate_id,
    (SELECT `id` FROM `authors` WHERE `name` = 'Владимир Набоков' LIMIT 1)
),
(
    (SELECT `id` FROM `books` WHERE `title` = 'Метаморфозы' LIMIT 1),
    (SELECT `id` FROM `authors` WHERE `name` = 'Публий Овидий Назон' LIMIT 1)
),
(
    @a_first_duplicate_id,
    (SELECT `id` FROM `authors` WHERE `name` = 'Джордж Оруэлл' LIMIT 1)
),
(
    (SELECT `id` FROM `books` WHERE `title` = 'Книга непокоя' LIMIT 1),
    (SELECT `id` FROM `authors` WHERE `name` = 'Фернанду Пессоа' LIMIT 1)
),
(
    @tales_c_id,
    (SELECT `id` FROM `authors` WHERE `name` = 'Эдгар Аллан По' LIMIT 1)
),
(
    (SELECT `id` FROM `books` WHERE `title` = 'В поисках утраченного времени' LIMIT 1),
    (SELECT `id` FROM `authors` WHERE `name` = 'Марсель Пруст' LIMIT 1)
),
(
    (SELECT `id` FROM `books` WHERE `title` = 'Гаргантюа и Пантагрюэль' LIMIT 1),
    (SELECT `id` FROM `authors` WHERE `name` = 'Франсуа Рабле' LIMIT 1)
),
(
    (SELECT `id` FROM `books` WHERE `title` = 'Педро Парамо' LIMIT 1),
    (SELECT `id` FROM `authors` WHERE `name` = 'Хуан Рульфо' LIMIT 1)
),
(
    (SELECT `id` FROM `books` WHERE `title` = 'Маснави' LIMIT 1),
    (SELECT `id` FROM `authors` WHERE `name` = 'Джалаладдин Руми' LIMIT 1)
),
(
    (SELECT `id` FROM `books` WHERE `title` = 'Дети полуночи' LIMIT 1),
    (SELECT `id` FROM `authors` WHERE `name` = 'Салман Рушди' LIMIT 1)
),
(
    (SELECT `id` FROM `books` WHERE `title` = 'Гордость и предубеждение' LIMIT 1),
    (SELECT `id` FROM `authors` WHERE `name` = 'Джейн Остин' LIMIT 1)
),
(
    (SELECT `id` FROM `books` WHERE `title` = 'Бустан' LIMIT 1),
    (SELECT `id` FROM `authors` WHERE `name` = 'Саади' LIMIT 1)
),
(
    (SELECT `id` FROM `books` WHERE `title` = 'Сезон паломничества на Север' LIMIT 1),
    (SELECT `id` FROM `authors` WHERE `name` = 'Тайиб Салих' LIMIT 1)
),
(
    (SELECT `id` FROM `books` WHERE `title` = 'Слепота' LIMIT 1),
    (SELECT `id` FROM `authors` WHERE `name` = 'Жозе Сарамаго' LIMIT 1)
),
(
    (SELECT `id` FROM `books` WHERE `title` = 'Путешествие на край ночи' LIMIT 1),
    (SELECT `id` FROM `authors` WHERE `name` = 'Луи-Фердинанд Селин' LIMIT 1)
),
(
    (SELECT `id` FROM `books` WHERE `title` = 'Хитроумный идальго Дон Кихот Ламанчский' LIMIT 1),
    (SELECT `id` FROM `authors` WHERE `name` = 'Мигель де Сервантес' LIMIT 1)
),
(
    (SELECT `id` FROM `books` WHERE `title` = 'Повесть о блистательном принце Гэндзи' LIMIT 1),
    (SELECT `id` FROM `authors` WHERE `name` = 'Мурасаки Сикибу' LIMIT 1)
),
(
    (SELECT `id` FROM `books` WHERE `title` = 'Эдип-царь' LIMIT 1),
    (SELECT `id` FROM `authors` WHERE `name` = 'Софокл' LIMIT 1)
),
(
    (SELECT `id` FROM `books` WHERE `title` = 'Красное и чёрное' LIMIT 1),
    (SELECT `id` FROM `authors` WHERE `name` = 'Стендаль' LIMIT 1)
),
(
    (SELECT `id` FROM `books` WHERE `title` = 'Жизнь и мнения джентльмена Тристрама Шенди' LIMIT 1),
    (SELECT `id` FROM `authors` WHERE `name` = 'Лоренс Стерн' LIMIT 1)
),
(
    (SELECT `id` FROM `books` WHERE `title` = 'Приключения Гекльберри Финна' LIMIT 1),
    (SELECT `id` FROM `authors` WHERE `name` = 'Марк Твен' LIMIT 1)
),
(
    @d_first_duplicate_id,
    @author_tolstoi_id
),
(
    @b_first_duplicate_id,
    @author_tolstoi_id
),
(
    (SELECT `id` FROM `books` WHERE `title` = 'Смерть Ивана Ильича' LIMIT 1),
    @author_tolstoi_id
),
(
    (SELECT `id` FROM `books` WHERE `title` = 'Листья травы' LIMIT 1),
    (SELECT `id` FROM `authors` WHERE `name` = 'Уолт Уитмен' LIMIT 1)
),
(
    (SELECT `id` FROM `books` WHERE `title` = 'Госпожа Бовари' LIMIT 1),
    (SELECT `id` FROM `authors` WHERE `name` = 'Гюстав Флобер' LIMIT 1)
),
(
    (SELECT `id` FROM `books` WHERE `title` = 'Воспитание чувств' LIMIT 1),
    (SELECT `id` FROM `authors` WHERE `name` = 'Гюстав Флобер' LIMIT 1)
),
(
    (SELECT `id` FROM `books` WHERE `title` = 'Авессалом-Авессалом!' LIMIT 1),
    (SELECT `id` FROM `authors` WHERE `name` = 'Уильям Фолкнер' LIMIT 1)
),
(
    (SELECT `id` FROM `books` WHERE `title` = 'Шум и ярость' LIMIT 1),
    (SELECT `id` FROM `authors` WHERE `name` = 'Уильям Фолкнер' LIMIT 1)
),
(
    (SELECT `id` FROM `books` WHERE `title` = 'Старик и море' LIMIT 1),
    (SELECT `id` FROM `authors` WHERE `name` = 'Эрнест Хемингуэй' LIMIT 1)
),
(
    (SELECT `id` FROM `books` WHERE `title` = 'Стихотворения' LIMIT 1),
    (SELECT `id` FROM `authors` WHERE `name` = 'Пауль Целан' LIMIT 1)
),
(
    @tales_a_id,
    (SELECT `id` FROM `authors` WHERE `name` = 'Антон Чехов' LIMIT 1)
),
(
    (SELECT `id` FROM `books` WHERE `title` = 'Кентерберийские рассказы' LIMIT 1),
    (SELECT `id` FROM `authors` WHERE `name` = 'Джеффри Чосер' LIMIT 1)
),
(
    (SELECT `id` FROM `books` WHERE `title` = 'Гамлет' LIMIT 1),
    (SELECT `id` FROM `authors` WHERE `name` = 'Уильям Шекспир' LIMIT 1)
),
(
    (SELECT `id` FROM `books` WHERE `title` = 'Король Лир' LIMIT 1),
    (SELECT `id` FROM `authors` WHERE `name` = 'Уильям Шекспир' LIMIT 1)
),
(
    (SELECT `id` FROM `books` WHERE `title` = 'Отелло' LIMIT 1),
    (SELECT `id` FROM `authors` WHERE `name` = 'Уильям Шекспир' LIMIT 1)
),
(
    (SELECT `id` FROM `books` WHERE `title` = 'Мидлмарч' LIMIT 1),
    (SELECT `id` FROM `authors` WHERE `name` = 'Джордж Элиот' LIMIT 1)
),
(
    (SELECT `id` FROM `books` WHERE `title` = 'Человек-невидимка' LIMIT 1),
    (SELECT `id` FROM `authors` WHERE `name` = 'Ральф Эллисон' LIMIT 1)
),
(
    (SELECT `id` FROM `books` WHERE `title` = 'Воспоминания Адриана' LIMIT 1),
    (SELECT `id` FROM `authors` WHERE `name` = 'Маргерит Юрсенар' LIMIT 1)
),
(
    @d_second_duplicate_id,
    @author_tolstoi_id
),
(
    @a_second_duplicate_id,
    (SELECT `id` FROM `authors` WHERE `name` = 'Джордж Оруэлл' LIMIT 1)
),
(
    @c_second_duplicate_id,
    (SELECT `id` FROM `authors` WHERE `name` = 'Владимир Набоков' LIMIT 1)
),
(
    (SELECT `id` FROM `books` WHERE `title` = 'Невидимка' LIMIT 1),
    (SELECT `id` FROM `authors` WHERE `name` = 'Ральф Эллисон' LIMIT 1)
),
(
    (SELECT `id` FROM `books` WHERE `title` = 'К маяку' LIMIT 1),
    (SELECT `id` FROM `authors` WHERE `name` = 'Вирджиния Вульф' LIMIT 1)
),
(
    (SELECT `id` FROM `books` WHERE `title` = 'Иллиада и Одиссея' LIMIT 1),
    (SELECT `id` FROM `authors` WHERE `name` = 'Гомер' LIMIT 1)
),
(
    (SELECT `id` FROM `books` WHERE `title` = 'Путешествия Гулливера' LIMIT 1),
    (SELECT `id` FROM `authors` WHERE `name` = 'Джонатан Свифт' LIMIT 1)
),
(
    (SELECT `id` FROM `books` WHERE `title` = 'Миддлмарч' LIMIT 1),
    (SELECT `id` FROM `authors` WHERE `name` = 'Джордж Элиот' LIMIT 1)
),
(
    (SELECT `id` FROM `books` WHERE `title` = 'Распад' LIMIT 1),
    (SELECT `id` FROM `authors` WHERE `name` = 'Чинуа Ачебе' LIMIT 1)
),
(
    (SELECT `id` FROM `books` WHERE `title` = 'Над пропастью во ржи' LIMIT 1),
    (SELECT `id` FROM `authors` WHERE `name` = 'Джером Д. Сэлинджер' LIMIT 1)
),
(
    (SELECT `id` FROM `books` WHERE `title` = 'Унесённые ветром' LIMIT 1),
    (SELECT `id` FROM `authors` WHERE `name` = 'Маргарет Митчелл' LIMIT 1)
),
(
    (SELECT `id` FROM `books` WHERE `title` = 'Великий Гэтсби' LIMIT 1),
    (SELECT `id` FROM `authors` WHERE `name` = 'Фрэнсис Скотт Фитцджеральд' LIMIT 1)
),
(
    (SELECT `id` FROM `books` WHERE `title` = 'Уловка 22' LIMIT 1),
    (SELECT `id` FROM `authors` WHERE `name` = 'Джозеф Хеллер' LIMIT 1)
),
(
    (SELECT `id` FROM `books` WHERE `title` = 'Гроздья гнева' LIMIT 1),
    (SELECT `id` FROM `authors` WHERE `name` = 'Джон Стейнбек' LIMIT 1)
),
(
    (SELECT `id` FROM `books` WHERE `title` = 'Дивный новый мир' LIMIT 1),
    (SELECT `id` FROM `authors` WHERE `name` = 'Олдос Хаксли' LIMIT 1)
),
(
    (SELECT `id` FROM `books` WHERE `title` = 'Сын Америки' LIMIT 1),
    (SELECT `id` FROM `authors` WHERE `name` = 'Ричард Райт' LIMIT 1)
),
(
    (SELECT `id` FROM `books` WHERE `title` = 'Демократия в Америке' LIMIT 1),
    (SELECT `id` FROM `authors` WHERE `name` = 'Алексис де Токвиль' LIMIT 1)
),
(
    (SELECT `id` FROM `books` WHERE `title` = 'Происхождение видов' LIMIT 1),
    (SELECT `id` FROM `authors` WHERE `name` = 'Чарльз Дарвин' LIMIT 1)
),
(
    (SELECT `id` FROM `books` WHERE `title` = 'Общественный договор' LIMIT 1),
    (SELECT `id` FROM `authors` WHERE `name` = 'Жан-Жак Руссо' LIMIT 1)
),
(
    (SELECT `id` FROM `books` WHERE `title` = 'Капитал' LIMIT 1),
    (SELECT `id` FROM `authors` WHERE `name` = 'Карл Маркс' LIMIT 1)
),
(
    (SELECT `id` FROM `books` WHERE `title` = 'Государь' LIMIT 1),
    (SELECT `id` FROM `authors` WHERE `name` = 'Никколо Макиавелли' LIMIT 1)
),
(
    (SELECT `id` FROM `books` WHERE `title` = 'Левиафан' LIMIT 1),
    (SELECT `id` FROM `authors` WHERE `name` = 'Томас Гоббс' LIMIT 1)
),
(
    (SELECT `id` FROM `books` WHERE `title` = 'Властелин колец' LIMIT 1),
    (SELECT `id` FROM `authors` WHERE `name` = 'Джон Толкиен' LIMIT 1)
),
(
    (SELECT `id` FROM `books` WHERE `title` = 'Винни-Пух' LIMIT 1),
    (SELECT `id` FROM `authors` WHERE `name` = 'Алан Александр Милн' LIMIT 1)
),
(
    (SELECT `id` FROM `books` WHERE `title` = 'Лев, колдунья и платяной шкаф' LIMIT 1),
    (SELECT `id` FROM `authors` WHERE `name` = 'Клайв Льюис' LIMIT 1)
),
(
    (SELECT `id` FROM `books` WHERE `title` = 'Поездка в Индию' LIMIT 1),
    (SELECT `id` FROM `authors` WHERE `name` = 'Эдуард Форстер' LIMIT 1)
),
(
    (SELECT `id` FROM `books` WHERE `title` = 'В дороге' LIMIT 1),
    (SELECT `id` FROM `authors` WHERE `name` = 'Джон Керуак' LIMIT 1)
),
(
    (SELECT `id` FROM `books` WHERE `title` = 'Убить пересмешника' LIMIT 1),
    (SELECT `id` FROM `authors` WHERE `name` = 'Харпер Ли' LIMIT 1)
),
(
    (SELECT `id` FROM `books` WHERE `title` = 'Заводной апельсин' LIMIT 1),
    (SELECT `id` FROM `authors` WHERE `name` = 'Энтони Берджесс' LIMIT 1)
),
(
    (SELECT `id` FROM `books` WHERE `title` = 'Свет в августе' LIMIT 1),
    (SELECT `id` FROM `authors` WHERE `name` = 'Уильям Фолкнер' LIMIT 1)
),
(
    (SELECT `id` FROM `books` WHERE `title` = 'Души чёрного народа' LIMIT 1),
    (SELECT `id` FROM `authors` WHERE `name` = 'Уильям Дю Бойс' LIMIT 1)
),
(
    (SELECT `id` FROM `books` WHERE `title` = 'Безбрежное Саргассово море' LIMIT 1),
    (SELECT `id` FROM `authors` WHERE `name` = 'Джин Рис' LIMIT 1)
),
(
    (SELECT `id` FROM `books` WHERE `title` = 'Мадам Бовари' LIMIT 1),
    (SELECT `id` FROM `authors` WHERE `name` = 'Гюстав Флобер' LIMIT 1)
),
(
    (SELECT `id` FROM `books` WHERE `title` = 'Потерянный рай' LIMIT 1),
    (SELECT `id` FROM `authors` WHERE `name` = 'Джон Милтон' LIMIT 1)
),
(
    @b_second_duplicate_id,
    @author_tolstoi_id
),
(
    (SELECT `id` FROM `books` WHERE `title` = 'Сонеты' LIMIT 1),
    (SELECT `id` FROM `authors` WHERE `name` = 'Уильям Шекспир' LIMIT 1)
),
(
    (SELECT `id` FROM `books` WHERE `title` = 'Ким' LIMIT 1),
    (SELECT `id` FROM `authors` WHERE `name` = 'Редьярд Киплинг' LIMIT 1)
),
(
    (SELECT `id` FROM `books` WHERE `title` = 'Франкенштейн' LIMIT 1),
    (SELECT `id` FROM `authors` WHERE `name` = 'Мэри Шелли' LIMIT 1)
),
(
    (SELECT `id` FROM `books` WHERE `title` = 'Песнь Соломона' LIMIT 1),
    (SELECT `id` FROM `authors` WHERE `name` = 'Тони Моррисон' LIMIT 1)
),
(
    (SELECT `id` FROM `books` WHERE `title` = 'Пролетая над гнездом кукушки' LIMIT 1),
    (SELECT `id` FROM `authors` WHERE `name` = 'Кен Кизи' LIMIT 1)
),
(
    (SELECT `id` FROM `books` WHERE `title` = 'По ком звонит колокол' LIMIT 1),
    (SELECT `id` FROM `authors` WHERE `name` = 'Эрнест Хемингуэй' LIMIT 1)
),
(
    (SELECT `id` FROM `books` WHERE `title` = 'Бойня номер пять' LIMIT 1),
    (SELECT `id` FROM `authors` WHERE `name` = 'Курт Воннегут' LIMIT 1)
),
(
    (SELECT `id` FROM `books` WHERE `title` = 'Скотный двор' LIMIT 1),
    (SELECT `id` FROM `authors` WHERE `name` = 'Джордж Оруэлл' LIMIT 1)
),
(
    (SELECT `id` FROM `books` WHERE `title` = 'Повелитель мух' LIMIT 1),
    (SELECT `id` FROM `authors` WHERE `name` = 'Уильям Голдинг' LIMIT 1)
),
(
    (SELECT `id` FROM `books` WHERE `title` = 'Хладнокровное убийство' LIMIT 1),
    (SELECT `id` FROM `authors` WHERE `name` = 'Труман Капоте' LIMIT 1)
),
(
    (SELECT `id` FROM `books` WHERE `title` = 'В поисках потерянного времени' LIMIT 1),
    (SELECT `id` FROM `authors` WHERE `name` = 'Марсель Пруст' LIMIT 1)
),
(
    (SELECT `id` FROM `books` WHERE `title` = 'Большой сон' LIMIT 1),
    (SELECT `id` FROM `authors` WHERE `name` = 'Реймонд Чандлер' LIMIT 1)
),
(
    (SELECT `id` FROM `books` WHERE `title` = 'Когда я умирала' LIMIT 1),
    (SELECT `id` FROM `authors` WHERE `name` = 'Уильям Фолкнер' LIMIT 1)
),
(
    (SELECT `id` FROM `books` WHERE `title` = 'Фиеста' LIMIT 1),
    (SELECT `id` FROM `authors` WHERE `name` = 'Эрнест Хемингуэй' LIMIT 1)
),
(
    (SELECT `id` FROM `books` WHERE `title` = 'Я, Клавдий' LIMIT 1),
    (SELECT `id` FROM `authors` WHERE `name` = 'Роберт Грейвз' LIMIT 1)
),
(
    (SELECT `id` FROM `books` WHERE `title` = 'Сердце — одинокий охотник' LIMIT 1),
    (SELECT `id` FROM `authors` WHERE `name` = 'Карсон Маккаллерс' LIMIT 1)
),
(
    (SELECT `id` FROM `books` WHERE `title` = 'Сыновья и любовники' LIMIT 1),
    (SELECT `id` FROM `authors` WHERE `name` = 'Дэвид Лоуренс' LIMIT 1)
),
(
    (SELECT `id` FROM `books` WHERE `title` = 'И вся королевская рать' LIMIT 1),
    (SELECT `id` FROM `authors` WHERE `name` = 'Роберт Пенн Уоррен' LIMIT 1)
),
(
    (SELECT `id` FROM `books` WHERE `title` = 'Иди, вещай с горы' LIMIT 1),
    (SELECT `id` FROM `authors` WHERE `name` = 'Джеймс Болдуин' LIMIT 1)
),
(
    (SELECT `id` FROM `books` WHERE `title` = 'Паутина Шарлотты' LIMIT 1),
    (SELECT `id` FROM `authors` WHERE `name` = 'Эдвин Уайт' LIMIT 1)
),
(
    (SELECT `id` FROM `books` WHERE `title` = 'Сердце тьмы' LIMIT 1),
    (SELECT `id` FROM `authors` WHERE `name` = 'Джозеф Конрад' LIMIT 1)
),
(
    (SELECT `id` FROM `books` WHERE `title` = 'Ночь' LIMIT 1),
    (SELECT `id` FROM `authors` WHERE `name` = 'Эли Визель' LIMIT 1)
),
(
    (SELECT `id` FROM `books` WHERE `title` = 'Кролик, беги' LIMIT 1),
    (SELECT `id` FROM `authors` WHERE `name` = 'Джон Апдайк' LIMIT 1)
),
(
    (SELECT `id` FROM `books` WHERE `title` = 'Эпоха невинности' LIMIT 1),
    (SELECT `id` FROM `authors` WHERE `name` = 'Эдит Уортон' LIMIT 1)
),
(
    (SELECT `id` FROM `books` WHERE `title` = 'Случай портного' LIMIT 1),
    (SELECT `id` FROM `authors` WHERE `name` = 'Филип Рот' LIMIT 1)
),
(
    (SELECT `id` FROM `books` WHERE `title` = 'Американская трагедия' LIMIT 1),
    (SELECT `id` FROM `authors` WHERE `name` = 'Теодор Драйзер' LIMIT 1)
),
(
    (SELECT `id` FROM `books` WHERE `title` = 'День саранчи' LIMIT 1),
    (SELECT `id` FROM `authors` WHERE `name` = 'Натаниэль Уэст' LIMIT 1)
),
(
    (SELECT `id` FROM `books` WHERE `title` = 'Тропик рака' LIMIT 1),
    (SELECT `id` FROM `authors` WHERE `name` = 'Генри Миллер' LIMIT 1)
),
(
    (SELECT `id` FROM `books` WHERE `title` = 'Мальтийский сокол' LIMIT 1),
    (SELECT `id` FROM `authors` WHERE `name` = 'Дэшиел Хэммет' LIMIT 1)
),
(
    (SELECT `id` FROM `books` WHERE `title` = 'Тёмные начала' LIMIT 1),
    (SELECT `id` FROM `authors` WHERE `name` = 'Филип Пулман' LIMIT 1)
),
(
    (SELECT `id` FROM `books` WHERE `title` = 'Смерть пришла архиепископу' LIMIT 1),
    (SELECT `id` FROM `authors` WHERE `name` = 'Уилла Кейтер' LIMIT 1)
),
(
    (SELECT `id` FROM `books` WHERE `title` = 'Толкования снов' LIMIT 1),
    (SELECT `id` FROM `authors` WHERE `name` = 'Зигмунд Фрейд' LIMIT 1)
),
(
    (SELECT `id` FROM `books` WHERE `title` = 'Воспитание Генри Адамса' LIMIT 1),
    (SELECT `id` FROM `authors` WHERE `name` = 'Генри Адамс' LIMIT 1)
),
(
    (SELECT `id` FROM `books` WHERE `title` = 'Цитатник' LIMIT 1),
    (SELECT `id` FROM `authors` WHERE `name` = 'Мао Цзедун' LIMIT 1)
),
(
    (SELECT `id` FROM `books` WHERE `title` = 'Многообразие религиозного опыта' LIMIT 1),
    (SELECT `id` FROM `authors` WHERE `name` = 'Уильям Джемс' LIMIT 1)
),
(
    (SELECT `id` FROM `books` WHERE `title` = 'Возвращение в Брайдсхед' LIMIT 1),
    (SELECT `id` FROM `authors` WHERE `name` = 'Ивлин Во' LIMIT 1)
),
(
    (SELECT `id` FROM `books` WHERE `title` = 'Безмолвная весна' LIMIT 1),
    (SELECT `id` FROM `authors` WHERE `name` = 'Рейчел Карсон' LIMIT 1)
),
(
    (SELECT `id` FROM `books` WHERE `title` = 'Общая теория занятости, процента и денег' LIMIT 1),
    (SELECT `id` FROM `authors` WHERE `name` = 'Джон Кейнс' LIMIT 1)
),
(
    (SELECT `id` FROM `books` WHERE `title` = 'Лорд Джим' LIMIT 1),
    (SELECT `id` FROM `authors` WHERE `name` = 'Джозеф Конрад' LIMIT 1)
),
(
    (SELECT `id` FROM `books` WHERE `title` = 'Простимся со всем этим' LIMIT 1),
    (SELECT `id` FROM `authors` WHERE `name` = 'Роберт Грейвз' LIMIT 1)
),
(
    (SELECT `id` FROM `books` WHERE `title` = 'Общество изобилия' LIMIT 1),
    (SELECT `id` FROM `authors` WHERE `name` = 'Джон Кеннет Гэлбрейт' LIMIT 1)
),
(
    (SELECT `id` FROM `books` WHERE `title` = 'Ветер в ивах' LIMIT 1),
    (SELECT `id` FROM `authors` WHERE `name` = 'Кеннет Грэм' LIMIT 1)
),
(
    (SELECT `id` FROM `books` WHERE `title` = 'Автобиография Малколма Икс' LIMIT 1),
    (SELECT `id` FROM `authors` WHERE `name` = 'Алекс Хейли и Малколм Икс' LIMIT 1)
),
(
    (SELECT `id` FROM `books` WHERE `title` = 'Выдающиеся викторианцы' LIMIT 1),
    (SELECT `id` FROM `authors` WHERE `name` = 'Литтон Стречи' LIMIT 1)
),
(
    (SELECT `id` FROM `books` WHERE `title` = 'Цвет пурпурный' LIMIT 1),
    (SELECT `id` FROM `authors` WHERE `name` = 'Элис Уокер' LIMIT 1)
),
(
    (SELECT `id` FROM `books` WHERE `title` = 'Вторая мировая война' LIMIT 1),
    (SELECT `id` FROM `authors` WHERE `name` = 'Уинстон Черчилль' LIMIT 1)
)
;

UPDATE `books` SET `friends_id` = @first_friend_id WHERE `id` = @tales_a_id;
UPDATE `books` SET `friends_id` = @second_friend_id WHERE `id` = @a_first_duplicate_id;
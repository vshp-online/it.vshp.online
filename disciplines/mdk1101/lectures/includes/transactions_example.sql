SET foreign_key_checks = 0;

DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS accounts;

CREATE TABLE `users` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`id`)
);

LOCK TABLES `users` WRITE;
INSERT INTO `users` VALUES (1,'Иванов Иван Иванович'),(2,'Петров Петр Петрович'),(3,'Сидоров Сидор Сидорович');
UNLOCK TABLES;

CREATE TABLE `accounts` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(255) DEFAULT NULL,
  `user_id` INT NOT NULL,
  `balance` DECIMAL(10,2) NOT NULL DEFAULT '0.00',
  PRIMARY KEY (`id`),
  KEY `user_id_idx` (`user_id`),
  CONSTRAINT `user_id`
    FOREIGN KEY (`user_id`)
    REFERENCES `users` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
);

LOCK TABLES `accounts` WRITE;
INSERT INTO `accounts` VALUES (1,'Основной',1,10500.00),(2,'Резервный',1,3412.57),(3,'Основной',2,20750.00),(4,'Основной',3,25000.00),(5,'Накопительный',2,5401.75);
UNLOCK TABLES;

SET foreign_key_checks = 1;

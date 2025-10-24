SET foreign_key_checks = 0;

DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS accounts;
DROP TABLE IF EXISTS transactions;

CREATE TABLE `users` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `age` INT NULL,
  PRIMARY KEY (`id`)
);

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

CREATE TABLE `transactions` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `date_time` DATETIME NOT NULL,
  `amount` DECIMAL(10,2) NOT NULL DEFAULT '0.00',
  `transaction_type` ENUM('deposit', 'withdrawal', 'transfer') NOT NULL,
  `user_id` INT NOT NULL,
  `account_id` INT NOT NULL,
  `transfer_to_account_id` INT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id_idx` (`user_id`),
  KEY `account_id_idx` (`account_id`),
  CONSTRAINT `transaction_user_id`
    FOREIGN KEY (`user_id`)
    REFERENCES `users` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `account_id`
    FOREIGN KEY (`account_id`)
    REFERENCES `accounts` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
);

LOCK TABLES `users` WRITE;
INSERT INTO `users` VALUES
(1,'Иванов Иван Иванович', 31),
(2,'Петров Петр Петрович', 27),
(3,'Сидоров Сидор Сидорович', 35);
UNLOCK TABLES;

LOCK TABLES `accounts` WRITE;
INSERT INTO `accounts` VALUES (1,'Основной',1,10500.00),(2,'Резервный',1,3412.57),(3,'Основной',2,20750.00),(4,'Основной',3,25000.00),(5,'Накопительный',2,5401.75);
UNLOCK TABLES;

LOCK TABLES `transactions` WRITE;
INSERT INTO `transactions` (`date_time`, `amount`, `transaction_type`, `user_id`, `account_id`, `transfer_to_account_id`)
VALUES
('2022-01-01 12:00:00', 100.00, 'deposit', 1, 1, NULL),
('2022-01-02 15:30:00', 50.00, 'withdrawal', 1, 1, NULL),
('2022-01-03 09:45:00', 200.00, 'deposit', 2, 3, NULL),
('2022-01-04 14:20:00', 75.00, 'withdrawal', 2, 3, NULL),
('2022-01-05 11:10:00', 150.00, 'transfer', 3, 4, 5);
UNLOCK TABLES;

SET foreign_key_checks = 1;

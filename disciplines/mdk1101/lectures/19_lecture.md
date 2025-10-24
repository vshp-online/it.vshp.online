# МДК.11.01 - 19 - Транзакции и обработка ошибок в хранимых процедурах

Примеры данной темы используют учебную БД:

::: tabs

@tab Структура БД

@[code mermaid](./includes/transactions_example.mermaid)

@tab Дамп

@[code sql:collapsed-lines=10](./includes/transactions_example.sql)

@tab Таблицы

  ::: tabs

  @tab **users**
  <!-- @include: ./includes/transactions_example_table_users.md -->

  @tab **accounts**
  <!-- @include: ./includes/transactions_example_table_accounts.md -->

  :::

:::

## Транзакции в хранимых процедурах

Использование транзакций в хранимых процедурах в MySQL 8 позволяет обеспечить целостность данных и контроль над выполнением операций. Транзакции позволяют выполнять группу операций как единое целое, при этом можно откатить все изменения, если происходит ошибка, или подтвердить изменения, если все операции прошли успешно.

Пример использования транзакций с операторами `ROLLBACK` и `COMMIT` на основе условия `IF`:

```sql
DELIMITER $$
CREATE PROCEDURE TransferMoney(
  IN accountFrom INT,
  IN accountTo INT,
  IN amountMoney DECIMAL(10,2)
)
BEGIN
    -- Объявление переменных
    DECLARE balanceAmount DECIMAL(10,2);
    SELECT balance INTO balanceAmount
    FROM accounts WHERE id = accountFrom;

    -- Начало транзакции
    START TRANSACTION;

    UPDATE accounts
    SET balance = balance - amountMoney
    WHERE id = accountFrom;

    UPDATE accounts
    SET balance = balance + amountMoney
    WHERE id = accountTo;

    IF balanceAmount >= amountMoney THEN
        SELECT balanceAmount, amountMoney, 'Можем перевести, фиксируем транзакцию';
        COMMIT;
    ELSE
        SELECT balanceAmount, amountMoney, 'Не можем перевести, откатываем транзакцию';
        ROLLBACK;
    END IF;

END $$
DELIMITER ;
```

Данная хранимая процедура `TransferMoney` предназначена для перевода денежных средств между двумя счетами в таблице `accounts`. Процедура принимает входные параметры: `accountFrom` (идентификатор счета, с которого нужно списать деньги), `accountTo` (идентификатор счета, на который нужно зачислить деньги) и `amountMoney` (сумма денег для перевода).

Процедура объявляет переменную `balanceAmount` типа `DECIMAL(10,2)`, в которую будет сохранено текущее значение баланса счета `accountFrom`.
Затем она начинает транзакцию с помощью оператора `START TRANSACTION`.

Далее происходят два обновления таблицы `accounts`. С помощью оператора `UPDATE` происходит уменьшение баланса на счету `accountFrom` на указанную сумму `amountMoney` и увеличение баланса на счету `accountTo` на эту же сумму.

После этого происходит проверка условия `IF balanceAmount >= amountMoney`. Если текущий баланс на счете `accountFrom` больше или равен сумме `amountMoney`, то процедура выводит значения `balanceAmount, amountMoney` и сообщение `"Можем перевести, фиксируем транзакцию"` с помощью оператора `SELECT`. Затем транзакция подтверждается с помощью оператора `COMMIT`.

Если же текущий баланс на счете `accountFrom` меньше суммы `amountMoney`, то процедура выводит значения `balanceAmount, amountMoney` и сообщение `"Не можем перевести, откатываем транзакцию"`. Затем транзакция откатывается с помощью оператора `ROLLBACK`.

Как и ранее, вызвать хранимую процедуру можно командой:

```sql
CALL TransferMoney(2,1,1000);
```

Здесь мы переводим со счета с `ID = 2` на счет с `ID = 1` ровно `1000` рублей.

Таким образом, данная хранимая процедура позволяет переводить деньги между счетами с проверкой наличия достаточного баланса на счете `accountFrom` и обеспечивает целостность данных благодаря использованию транзакций.

## Обработка ошибок в хранимых процедурах

В MySQL 8 обработка ошибок осуществляется с помощью определенных конструкций, нацеленных на обработку исключений а также на генерацию специальных ошибок.

Пример кода обработки исключения:

```sql
DELIMITER $$
CREATE PROCEDURE ExceptionTest()
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        GET DIAGNOSTICS CONDITION 1 @p1 = RETURNED_SQLSTATE, @p2 = MESSAGE_TEXT;
        SELECT CONCAT(@p1, ':', @p2);
    END;

    SELECT FAKE_COLUMN FROM MY_TABLE;
END $$
DELIMITER ;
```

В данном коде создается хранимая процедура с названием `ExceptionTest()`. Внутри процедуры определен обработчик исключений для ошибок, возникающих при выполнении SQL-запросов. Если происходит исключение `SQLEXCEPTION`, то внутри обработчика получаются диагностические данные, такие как код ошибки `RETURNED_SQLSTATE` и текст сообщения об ошибке `MESSAGE_TEXT`. Затем происходит вывод этих данных в формате `"код ошибки:текст сообщения"`. В конце процедуры выполняется SQL-запрос, который вызывает ошибку, пытаясь выбрать несуществующую колонку `FAKE_COLUMN` из таблицы `MY_TABLE`.

Комплексный пример генерации специальных ошибок:

```sql
DELIMITER $$
CREATE PROCEDURE ComplexErrorTest(IN exceptionState INT)
BEGIN
  DECLARE specialty CONDITION FOR SQLSTATE '45000';

  IF exceptionState = 0 THEN
    SIGNAL SQLSTATE '01000' SET MESSAGE_TEXT = 'Предупреждение: значение равно нулю';

  ELSEIF exceptionState = 1 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Ошибка: произошла ошибка';

  ELSEIF exceptionState = 2 THEN
    SIGNAL specialty SET MESSAGE_TEXT = 'Ошибка: произошла специальная ошибка';

  ELSE
    -- Не покажется, потому что Warning имеет более низкий приоритет
    SIGNAL SQLSTATE '01000' SET MESSAGE_TEXT = 'Предупреждение: произошла предупреждение', MYSQL_ERRNO = 1000;
    -- Покажется, потому что Error имеет более высокий приоритет
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Ошибка: произошла ошибка', MYSQL_ERRNO = 1001;

  END IF;
END $$
DELIMITER ;
```

Процедура принимает один входной параметр типа `INT`. Внутри процедуры проверяется значение параметра и в зависимости от него генерируются различные предупреждения и ошибки. Если значение параметра равно `0`, генерируется предупреждение с текстом `"Предупреждение: значение равно нулю"`. Если значение параметра равно `1`, генерируется ошибка с текстом `"Ошибка: произошла ошибка"`. Если значение параметра равно `2`, генерируется специальная ошибка с текстом `"Ошибка: произошла специальная ошибка"`. Во всех остальных случаях генерируются предупреждение с текстом `"Предупреждение: произошла предупреждение"` и пользовательским кодом ошибки `1000`, а также ошибка с текстом `"Ошибка: произошла ошибка"` и пользовательским кодом ошибки `1001`.

---

## Задание для самопроверки

Напишите хранимую процедуру перевода денежных средств с одного счета на другой с учётом того хватит ли денег на счету с которого пытаются перевести деньги. Используйте механизм транзакций и обработку ошибок.

::: details Решение задачи - Перевод денежных средств с учетом остатков

```sql
DELIMITER $$
CREATE PROCEDURE TransferMoney(
  IN accountFrom INT,
  IN accountTo INT,
  IN amountMoney DECIMAL(10,2)
)
BEGIN
    -- Объявление переменных
    DECLARE balanceAmount DECIMAL(10,2);
    DECLARE accountID INT;

    SELECT id INTO accountID
    FROM accounts WHERE id = accountTo;
    SELECT balance INTO balanceAmount
    FROM accounts WHERE id = accountFrom;

    -- Начало транзакции
    START TRANSACTION;

    UPDATE accounts
    SET balance = balance - amountMoney
    WHERE id = accountFrom;

    UPDATE accounts
    SET balance = balance + amountMoney
    WHERE id = accountTo;

  IF accountID IS NOT NULL THEN
    IF balanceAmount >= amountMoney THEN
      SELECT balanceAmount, amountMoney, 'Можем перевести, фиксируем транзакцию';
      COMMIT;
    ELSE
      -- SELECT balanceAmount, amountMoney, 'Не можем перевести, откатываем транзакцию';
      ROLLBACK;
      SIGNAL SQLSTATE '01000' SET MESSAGE_TEXT = 'Предупреждение: не хватает денежных средств', MYSQL_ERRNO = 1000;
    END IF;
  ELSE
    ROLLBACK;
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ОШИБКА: ТАКОГО АККАУНТА НЕТ!';
  END IF;

END $$
DELIMITER ;
```

:::

-- ===========================
-- 1. Хранимая процедура place_order
-- ===========================

DELIMITER //
CREATE PROCEDURE place_order(
    IN p_table_id INT,
    IN p_client_id INT,
    IN p_waiter_id INT,
    IN p_total_cost DECIMAL(10,2)
)
BEGIN
    DECLARE table_count INT DEFAULT 0;
    DECLARE client_count INT DEFAULT 0;
    DECLARE waiter_count INT DEFAULT 0;
    DECLARE table_status VARCHAR(20);

    -- Проверяем существование стола
    SELECT COUNT(*) INTO table_count FROM tables WHERE id = p_table_id;
    IF table_count = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Стол не найден';
    END IF;

    -- Проверяем статус стола
    SELECT status INTO table_status FROM tables WHERE id = p_table_id;
    IF table_status = 'occupied' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Стол уже занят';
    END IF;

    -- Проверяем существование клиента
    SELECT COUNT(*) INTO client_count FROM clients WHERE id = p_client_id;
    IF client_count = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Клиент не найден';
    END IF;

    -- Проверяем существование официанта
    SELECT COUNT(*) INTO waiter_count FROM waiters WHERE id = p_waiter_id;
    IF waiter_count = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Официант не найден';
    END IF;

    -- Осуществляем заказ
    INSERT INTO orders (table_id, client_id, waiter_id, order_time, total_cost)
    VALUES (p_table_id, p_client_id, p_waiter_id, NOW(), p_total_cost);

    -- Обновляем статус стола
    UPDATE tables SET status = 'occupied' WHERE id = p_table_id;
END //
DELIMITER ;

-- ===========================
-- 2. Пользовательская функция calculate_waiter_earnings
-- ===========================

DELIMITER //
CREATE FUNCTION calculate_waiter_earnings(p_waiter_id INT) RETURNS DECIMAL(10,2)
DETERMINISTIC
BEGIN
    DECLARE total_earnings DECIMAL(10,2) DEFAULT 0;

    SELECT SUM(o.total_cost * 0.1)  -- 10% чаевых
    INTO total_earnings
    FROM orders o
    WHERE o.waiter_id = p_waiter_id;

    RETURN COALESCE(total_earnings, 0);
END //
DELIMITER ;

-- ===========================
-- 3. Триггер log_table_status_update
-- ===========================

DELIMITER //
CREATE TRIGGER log_table_status_update
AFTER UPDATE ON tables
FOR EACH ROW
BEGIN
    IF OLD.status <> NEW.status THEN
        INSERT INTO change_logs (entity_id, old_value, new_value, change_time)
        VALUES (OLD.id, OLD.status, NEW.status, NOW());
    END IF;
END //
DELIMITER ;

-- ===========================
-- 4. Представление waiter_orders_summary
-- ===========================

CREATE VIEW waiter_orders_summary AS
SELECT
    w.full_name AS waiter_name,
    COUNT(o.id) AS total_orders,
    SUM(o.total_cost) AS total_revenue,
    calculate_waiter_earnings(w.id) AS total_tips
FROM waiters w
LEFT JOIN orders o ON w.id = o.waiter_id
GROUP BY w.id, w.full_name;

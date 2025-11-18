-- ===========================
-- 1. Хранимая процедура sell_car
-- ===========================

DELIMITER //
CREATE PROCEDURE sell_car(
    IN p_car_id INT,
    IN p_client_id INT,
    IN p_manager_id INT
)
BEGIN
    DECLARE car_count INT DEFAULT 0;
    DECLARE car_status VARCHAR(20);
    DECLARE car_price DECIMAL(10,2);
    DECLARE client_count INT DEFAULT 0;
    DECLARE manager_count INT DEFAULT 0;

    -- Проверяем, существует ли автомобиль
    SELECT COUNT(*) INTO car_count FROM cars WHERE id = p_car_id;
    IF car_count = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Автомобиль не найден';
    END IF;

    -- Проверяем статус автомобиля
    SELECT status, price INTO car_status, car_price FROM cars WHERE id = p_car_id;
    IF car_status = 'sold' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Автомобиль уже продан';
    END IF;

    -- Проверяем существование клиента
    SELECT COUNT(*) INTO client_count FROM clients WHERE id = p_client_id;
    IF client_count = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Клиент не найден';
    END IF;

    -- Проверяем существование менеджера
    SELECT COUNT(*) INTO manager_count FROM managers WHERE id = p_manager_id;
    IF manager_count = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Менеджер не найден';
    END IF;

    -- Осуществляем продажу автомобиля
    UPDATE cars SET status = 'sold' WHERE id = p_car_id;

    -- Записываем заказ в таблицу orders
    INSERT INTO orders (client_id, car_id, manager_id, order_date, total)
    VALUES (p_client_id, p_car_id, p_manager_id, NOW(), car_price);
END //
DELIMITER ;

-- ===========================
-- 2. Пользовательская функция calculate_commission
-- ===========================

DELIMITER //
CREATE FUNCTION calculate_commission(p_manager_id INT) RETURNS DECIMAL(10,2)
DETERMINISTIC
BEGIN
    DECLARE total_commission DECIMAL(10,2) DEFAULT 0;

    SELECT SUM(total * (m.commission_rate / 100))
    INTO total_commission
    FROM orders o
    JOIN managers m ON o.manager_id = m.id
    WHERE o.manager_id = p_manager_id;

    RETURN COALESCE(total_commission, 0);
END //
DELIMITER ;

-- ===========================
-- 3. Триггер log_car_status_update
-- ===========================

DELIMITER //
CREATE TRIGGER log_car_status_update
AFTER UPDATE ON cars
FOR EACH ROW
BEGIN
    IF OLD.status <> NEW.status THEN
        INSERT INTO change_logs (entity_id, old_value, new_value, change_time)
        VALUES (OLD.id, OLD.status, NEW.status, NOW());
    END IF;
END //
DELIMITER ;

-- ===========================
-- 4. Представление manager_sales_summary
-- ===========================

CREATE VIEW manager_sales_summary AS
SELECT
    m.full_name AS manager_name,
    COUNT(o.id) AS total_sales,
    SUM(o.total) AS total_revenue,
    calculate_commission(m.id) AS total_commission
FROM managers m
LEFT JOIN orders o ON m.id = o.manager_id
GROUP BY m.id, m.full_name;

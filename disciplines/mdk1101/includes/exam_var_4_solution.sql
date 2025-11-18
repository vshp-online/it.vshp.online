-- ===========================
-- 1. Хранимая процедура book_room
-- ===========================

DELIMITER //
CREATE PROCEDURE book_room(
    IN p_guest_id INT,
    IN p_room_id INT,
    IN p_employee_id INT,
    IN p_check_in_date DATE,
    IN p_check_out_date DATE
)
BEGIN
    DECLARE room_count INT DEFAULT 0;
    DECLARE guest_count INT DEFAULT 0;
    DECLARE employee_count INT DEFAULT 0;
    DECLARE room_status VARCHAR(20);
    DECLARE room_price DECIMAL(10,2);
    DECLARE total_cost DECIMAL(10,2);

    -- Проверяем существование номера
    SELECT COUNT(*) INTO room_count FROM rooms WHERE id = p_room_id;
    IF room_count = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Номер не найден';
    END IF;

    -- Проверяем статус номера
    SELECT status, price_per_day INTO room_status, room_price FROM rooms WHERE id = p_room_id;
    IF room_status = 'booked' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Номер уже забронирован';
    END IF;

    -- Проверяем существование гостя
    SELECT COUNT(*) INTO guest_count FROM guests WHERE id = p_guest_id;
    IF guest_count = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Гость не найден';
    END IF;

    -- Проверяем существование сотрудника
    SELECT COUNT(*) INTO employee_count FROM employees WHERE id = p_employee_id;
    IF employee_count = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Сотрудник не найден';
    END IF;

    -- Рассчитываем стоимость проживания
    SET total_cost = DATEDIFF(p_check_out_date, p_check_in_date) * room_price;

    -- Осуществляем бронирование
    INSERT INTO bookings (guest_id, room_id, employee_id, check_in_date, check_out_date, total_cost)
    VALUES (p_guest_id, p_room_id, p_employee_id, p_check_in_date, p_check_out_date, total_cost);

    -- Обновляем статус номера
    UPDATE rooms SET status = 'booked' WHERE id = p_room_id;
END //
DELIMITER ;

-- ===========================
-- 2. Пользовательская функция calculate_stay_cost
-- ===========================

DELIMITER //
CREATE FUNCTION calculate_stay_cost(p_room_id INT, p_days INT) RETURNS DECIMAL(10,2)
DETERMINISTIC
BEGIN
    DECLARE cost DECIMAL(10,2) DEFAULT 0;

    SELECT price_per_day * p_days
    INTO cost
    FROM rooms
    WHERE id = p_room_id;

    RETURN COALESCE(cost, 0);
END //
DELIMITER ;

-- ===========================
-- 3. Триггер log_room_status_update
-- ===========================

DELIMITER //
CREATE TRIGGER log_room_status_update
AFTER UPDATE ON rooms
FOR EACH ROW
BEGIN
    IF OLD.status <> NEW.status THEN
        INSERT INTO change_logs (entity_id, old_value, new_value, change_time)
        VALUES (OLD.id, OLD.status, NEW.status, NOW());
    END IF;
END //
DELIMITER ;

-- ===========================
-- 4. Представление employee_booking_summary
-- ===========================

CREATE VIEW employee_booking_summary AS
SELECT
    e.full_name AS employee_name,
    COUNT(b.id) AS total_bookings,
    SUM(b.total_cost) AS total_revenue
FROM employees e
LEFT JOIN bookings b ON e.id = b.employee_id
GROUP BY e.id, e.full_name;

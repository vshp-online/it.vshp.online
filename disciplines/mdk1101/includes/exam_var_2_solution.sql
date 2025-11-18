-- ===========================
-- 1. Хранимая процедура sell_book
-- ===========================

DELIMITER //
CREATE PROCEDURE sell_book(
    IN p_book_id INT,
    IN p_quantity INT
)
BEGIN
    DECLARE book_count INT DEFAULT 0;
    DECLARE stock_available INT DEFAULT 0;

    -- Проверяем, существует ли книга
    SELECT COUNT(*) INTO book_count
    FROM books
    WHERE id = p_book_id;

    IF book_count = 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Книга не найдена';
    END IF;

    -- Проверяем доступное количество книг на складе
    SELECT stock INTO stock_available
    FROM books
    WHERE id = p_book_id;

    IF stock_available < p_quantity THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Недостаточно книг на складе';
    END IF;

    -- Осуществляем продажу (уменьшаем количество книг)
    UPDATE books
    SET stock = stock - p_quantity
    WHERE id = p_book_id;

    -- Добавляем запись о продаже
    INSERT INTO sales (book_id, sale_date, quantity, total)
    VALUES (p_book_id, NOW(), p_quantity, (SELECT price * p_quantity FROM books WHERE id = p_book_id));
END //
DELIMITER ;

-- ===========================
-- 2. Пользовательская функция get_books_by_supplier
-- ===========================

DELIMITER //
CREATE FUNCTION get_books_by_supplier(p_supplier_id INT) RETURNS INT
DETERMINISTIC
BEGIN
    DECLARE book_count INT DEFAULT 0;

    SELECT COUNT(*) INTO book_count
    FROM books
    WHERE supplier_id = p_supplier_id;

    RETURN book_count;
END //
DELIMITER ;

-- ===========================
-- 3. Триггер log_stock_update
-- ===========================

DELIMITER //
CREATE TRIGGER log_stock_update
AFTER UPDATE ON books
FOR EACH ROW
BEGIN
    IF OLD.stock <> NEW.stock THEN
        INSERT INTO change_logs (entity_id, old_value, new_value, change_time)
        VALUES (OLD.id, OLD.stock, NEW.stock, NOW());
    END IF;
END //
DELIMITER ;

-- ===========================
-- 4. Представление supplier_sales_summary
-- ===========================

CREATE VIEW supplier_sales_summary AS
SELECT
    s.name AS supplier_name,
    b.title AS book_title,
    SUM(sales.quantity) AS total_sold,
    SUM(sales.total) AS total_revenue
FROM sales
JOIN books b ON sales.book_id = b.id
JOIN suppliers s ON b.supplier_id = s.id
GROUP BY s.name, b.title;

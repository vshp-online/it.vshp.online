-- ===========================
-- 1. Хранимая процедура assign_employee_to_project
-- ===========================

DELIMITER //
CREATE PROCEDURE assign_employee_to_project(
    IN p_employee_id INT,
    IN p_project_id INT,
    IN p_role VARCHAR(100),
    IN p_hours_worked INT
)
BEGIN
    DECLARE employee_count INT DEFAULT 0;
    DECLARE project_count INT DEFAULT 0;
    DECLARE existing_participation INT DEFAULT 0;

    -- Проверяем существование сотрудника
    SELECT COUNT(*) INTO employee_count
    FROM employees
    WHERE id = p_employee_id;

    IF employee_count = 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Сотрудник не найден';
    END IF;

    -- Проверяем существование проекта
    SELECT COUNT(*) INTO project_count
    FROM projects
    WHERE id = p_project_id;

    IF project_count = 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Проект не найден';
    END IF;

    -- Проверяем, не добавлен ли уже сотрудник в этот проект
    SELECT COUNT(*) INTO existing_participation
    FROM employee_projects
    WHERE employee_id = p_employee_id AND project_id = p_project_id;

    IF existing_participation > 0 THEN
        SIGNAL SQLSTATE '01000'
        SET MESSAGE_TEXT = 'Сотрудник уже участвует в проекте';
    END IF;

    -- Добавляем сотрудника в проект
    INSERT INTO employee_projects (employee_id, project_id, role, hours_worked)
    VALUES (p_employee_id, p_project_id, p_role, p_hours_worked);

    -- Логируем изменение
    INSERT INTO project_changes (project_id, operation)
    VALUES (p_project_id, 'Добавлен сотрудник');
END //
DELIMITER ;

-- ===========================
-- 2. Пользовательская функция get_project_count_for_employee
-- ===========================

DELIMITER //
CREATE FUNCTION get_project_count_for_employee(p_employee_id INT) RETURNS INT
DETERMINISTIC
BEGIN
    DECLARE project_count INT DEFAULT 0;

    SELECT COUNT(*) INTO project_count
    FROM employee_projects
    WHERE employee_id = p_employee_id;

    RETURN project_count;
END //
DELIMITER ;

-- ===========================
-- 3. Триггер log_project_update
-- ===========================

DELIMITER //
CREATE TRIGGER log_project_update
AFTER UPDATE ON projects
FOR EACH ROW
BEGIN
    INSERT INTO change_logs (entity_id, old_value, new_value, change_time)
    VALUES (OLD.id, OLD.project_name, NEW.project_name, NOW());
END //
DELIMITER ;

-- ===========================
-- 4. Представление employee_project_summary
-- ===========================

CREATE VIEW employee_project_summary AS
SELECT
    e.full_name AS employee_name,
    p.project_name,
    ep.role,
    ep.hours_worked
FROM employee_projects ep
JOIN employees e ON ep.employee_id = e.id
JOIN projects p ON ep.project_id = p.id;

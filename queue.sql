-- СОЗДАЕМ БД queue

-- Создаем таблицу patients
CREATE TABLE patients (
    id SERIAL PRIMARY KEY,
    name_of_patient VARCHAR(50) NOT NULL,
    surname VARCHAR(50) NOT NULL,
    last_name VARCHAR(50),
    polis VARCHAR(50) NOT NULL UNIQUE,
    birth_date DATE,
    street VARCHAR(100),
    house VARCHAR(10),
    flat VARCHAR(10)
);

-- Создаем таблицу doctors с дополнительными атрибутами email и phone
CREATE TABLE doctors (
    id SERIAL PRIMARY KEY,
    name_of_doctor VARCHAR(50) NOT NULL,
    surname VARCHAR(50) NOT NULL,
    last_name VARCHAR(50),
    profession VARCHAR(100) NOT NULL,
    room INT,
    email VARCHAR(100),
    phone VARCHAR(20)
);

-- Создаем таблицу life_queue
CREATE TABLE life_queue (
    id SERIAL PRIMARY KEY,
    patient_id INT REFERENCES patients(id) NOT NULL UNIQUE,
    doctor_id INT REFERENCES doctors(id) NOT NULL,
		get_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    room INT
);

CREATE TABLE life_queue_log (
    id SERIAL PRIMARY KEY,
    patient_id INT REFERENCES patients(id) NOT NULL,
    doctor_id INT REFERENCES doctors(id) NOT NULL,
    time_log TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создаем таблицу online_queue
CREATE TABLE online_queue (
    id SERIAL PRIMARY KEY,
    patient_id INT REFERENCES patients(id) NOT NULL,
    doctor_id INT REFERENCES doctors(id) NOT NULL,
    room VARCHAR(10),
    time_of_visit TIMESTAMP NOT NULL
);

CREATE TABLE online_queue_log (
    id SERIAL PRIMARY KEY,
    patient_id INT REFERENCES patients(id) NOT NULL,
    doctor_id INT REFERENCES doctors(id) NOT NULL,
    time_log TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создаем функцию для выбора минимального доступного id для life_queue
CREATE OR REPLACE FUNCTION select_min_available_id_life_queue() RETURNS TRIGGER AS $$
DECLARE
    min_id INT;
BEGIN
    -- Находим минимальный доступный id для таблицы life_queue
    SELECT MIN(id) INTO min_id
    FROM generate_series(1, (SELECT MAX(id) + 1 FROM life_queue)) s(id)
    WHERE id NOT IN (SELECT id FROM life_queue);

    -- Если найден, используем его, иначе используем следующий по порядку
    IF min_id IS NOT NULL THEN
        NEW.id := min_id;
    ELSE
        NEW.id := (SELECT COALESCE(MAX(id), 0) + 1 FROM life_queue);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Создаем триггер для таблицы life_queue
CREATE TRIGGER set_min_available_id_life_queue
BEFORE INSERT ON life_queue
FOR EACH ROW
EXECUTE FUNCTION select_min_available_id_life_queue();

-- Создаем функцию для выбора минимального доступного id для online_queue
CREATE OR REPLACE FUNCTION select_min_available_id_online_queue() RETURNS TRIGGER AS $$
DECLARE
    min_id INT;
BEGIN
    -- Находим минимальный доступный id для таблицы online_queue
    SELECT MIN(id) INTO min_id
    FROM generate_series(1, (SELECT MAX(id) + 1 FROM online_queue)) s(id)
    WHERE id NOT IN (SELECT id FROM online_queue);

    -- Если найден, используем его, иначе используем следующий по порядку
    IF min_id IS NOT NULL THEN
        NEW.id := min_id;
    ELSE
        NEW.id := (SELECT COALESCE(MAX(id), 0) + 1 FROM online_queue);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Создаем триггер для таблицы online_queue
CREATE TRIGGER set_min_available_id_online_queue
BEFORE INSERT ON online_queue
FOR EACH ROW
EXECUTE FUNCTION select_min_available_id_online_queue();

-- Создаем функцию для логирования удалений из life_queue
CREATE OR REPLACE FUNCTION log_life_queue_deletion() RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO life_queue_log (patient_id, doctor_id, time_log)
    VALUES (OLD.patient_id, OLD.doctor_id, NOW());
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Создаем триггер для логирования удалений из life_queue
CREATE TRIGGER after_delete_life_queue
AFTER DELETE ON life_queue
FOR EACH ROW
EXECUTE FUNCTION log_life_queue_deletion();

-- Создаем функцию для логирования удалений из online_queue
CREATE OR REPLACE FUNCTION log_online_queue_deletion() RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO online_queue_log (patient_id, doctor_id, time_log)
    VALUES (OLD.patient_id, OLD.doctor_id, NOW());
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Создаем триггер для логирования удалений из online_queue
CREATE TRIGGER after_delete_online_queue
AFTER DELETE ON online_queue
FOR EACH ROW
EXECUTE FUNCTION log_online_queue_deletion();


-- Вставляем данные в таблицу doctors
INSERT INTO doctors (name_of_doctor, surname, last_name, profession, room, email, phone)
VALUES
('John', 'Doe', 'Michael', 'Cardiologist', 101, 'john.doe@example.com', '123-456-7890'),
('Jane', 'Smith', 'Anne', 'Pediatrician', 102, 'jane.smith@example.com', '234-567-8901'),
('Emily', 'Johnson', 'Rose', 'Dermatologist', 103, 'emily.johnson@example.com', '345-678-9012'),
('Michael', 'Williams', 'James', 'Neurologist', 104, 'michael.williams@example.com', '456-789-0123'),
('Sarah', 'Brown', 'Marie', 'General Practitioner', 105, 'sarah.brown@example.com', '567-890-1234');

-- Вставляем данные в таблицу patients
INSERT INTO patients (name_of_patient, surname, last_name, polis, birth_date, street, house, flat)
VALUES
('Alice', 'Johnson', 'Marie', 'P123001', '1980-01-15', '123 Main St', '1', '101'),
('Bob', 'Smith', 'Edward', 'P123002', '1975-05-20', '456 Elm St', '2', '202'),
('Charlie', 'Brown', 'Thomas', 'P123003', '1990-07-25', '789 Maple St', '3', '303'),
('Diana', 'Wilson', 'Grace', 'P123004', '1985-10-30', '321 Oak St', '4', '404'),
('Ethan', 'Davis', 'Alexander', 'P123005', '1995-12-05', '654 Pine St', '5', '505'),
('Fiona', 'Garcia', 'Olivia', 'P123006', '1988-03-15', '987 Cedar St', '6', '606'),
('George', 'Martinez', 'Robert', 'P123007', '1972-08-25', '111 Birch St', '7', '707'),
('Hannah', 'Hernandez', 'Sophia', 'P123008', '1991-11-11', '222 Willow St', '8', '808'),
('Ian', 'Lopez', 'James', 'P123009', '1983-02-20', '333 Spruce St', '9', '909'),
('Julia', 'Gonzalez', 'Mia', 'P123010', '1997-06-30', '444 Maple St', '10', '1010'),
('Kevin', 'Clark', 'William', 'P123011', '1984-04-04', '555 Oak St', '11', '1111'),
('Laura', 'Lewis', 'Ava', 'P123012', '1979-12-24', '666 Pine St', '12', '1212'),
('Mike', 'Walker', 'Liam', 'P123013', '1986-05-15', '777 Birch St', '13', '1313'),
('Nina', 'Hall', 'Ella', 'P123014', '1992-07-07', '888 Cedar St', '14', '1414'),
('Oscar', 'Allen', 'Benjamin', 'P123015', '1981-09-19', '999 Willow St', '15', '1515'),
('Paula', 'Young', 'Emily', 'P123016', '1987-01-30', '111 Elm St', '16', '1616'),
('Quinn', 'Hernandez', 'Lucas', 'P123017', '1978-10-10', '222 Spruce St', '17', '1717'),
('Rita', 'King', 'Isabella', 'P123018', '1993-03-22', '333 Maple St', '18', '1818'),
('Sam', 'Wright', 'Henry', 'P123019', '1989-06-16', '444 Oak St', '19', '1919'),
('Tina', 'Lopez', 'Amelia', 'P123020', '1996-12-01', '555 Pine St', '20', '2020');

-- CREATE TABLE IF NOT EXISTS student_payments (
--     id          SERIAL PRIMARY KEY,
--     student_id  INT  NOT NULL REFERENCES students(id) ON DELETE CASCADE,
--     month       DATE NOT NULL,
--     status      VARCHAR(10) NOT NULL DEFAULT 'unpaid',
--     CONSTRAINT uq_student_month UNIQUE (student_id, month),
--     CONSTRAINT chk_month_first_day CHECK (month = date_trunc('month', month)::date),
--     CONSTRAINT chk_status CHECK (status IN ('paid', 'unpaid'))
-- );

SELECT * FROM students;
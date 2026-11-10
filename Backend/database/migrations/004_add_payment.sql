-- CREATE TABLE IF NOT EXISTS student_payments (
--     id          SERIAL PRIMARY KEY,
--     student_id  INT  NOT NULL REFERENCES students(id) ON DELETE CASCADE,
--     month       DATE NOT NULL,
--     status      VARCHAR(10) NOT NULL DEFAULT 'unpaid',
--     CONSTRAINT uq_student_month UNIQUE (student_id, month),
--     CONSTRAINT chk_month_first_day CHECK (month = date_trunc('month', month)::date),
--     CONSTRAINT chk_status CHECK (status IN ('paid', 'unpaid'))
-- );


-- CREATE OR REPLACE FUNCTION auto_enroll_student()
-- RETURNS trigger AS $$
-- BEGIN
--   INSERT INTO enrollments (student_id, class_id)
--   SELECT NEW.id, c.id
--   FROM classes c
--   WHERE c.exam_year = NEW.exam_year
--     AND NOT EXISTS (
--       SELECT 1 FROM enrollments e
--       WHERE e.student_id = NEW.id AND e.class_id = c.id
--     );
--   RETURN NEW;
-- END;
-- $$ LANGUAGE plpgsql;

-- DROP TRIGGER IF EXISTS trg_auto_enroll ON students;

-- CREATE TRIGGER trg_auto_enroll
-- AFTER INSERT ON students
-- FOR EACH ROW
-- EXECUTE FUNCTION auto_enroll_student();


 ------------------------------------------
-- INSERT INTO enrollments (student_id, class_id)
-- SELECT s.id, c.id
-- FROM students s
-- JOIN classes c ON c.exam_year = s.exam_year
-- WHERE NOT EXISTS (
--     SELECT 1 FROM enrollments e
--     WHERE e.student_id = s.id AND e.class_id = c.id
-- );

-- SELECT * FROM enrollments;

-- INSERT INTO classes (name, exam_year)
-- VALUES 

-- ('2028 A/L Class', 2028),
-- ('2029 A/L Class', 2029),
-- ('2030 A/L Class', 2030);


-- DELETE FROM exams WHERE id IN (3,4,9,10,11);
SELECT * FROM exam_marks;



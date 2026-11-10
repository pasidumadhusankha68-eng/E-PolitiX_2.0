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



-- CREATE TABLE IF NOT EXISTS online_classes (
--     id            SERIAL PRIMARY KEY,
--     class_id      INT          NOT NULL REFERENCES classes(id),
--     title         VARCHAR(150) NOT NULL,
--     starts_at     TIMESTAMPTZ  NOT NULL,
--     duration_min  INT          NOT NULL DEFAULT 90,
--     zoom_url      TEXT         NOT NULL,
--     passcode      VARCHAR(50),
--     notes         TEXT,
--     is_cancelled  BOOLEAN      NOT NULL DEFAULT FALSE,
--     created_by    INT REFERENCES users(id),
--     created_at    TIMESTAMPTZ  NOT NULL DEFAULT now(),
--     CONSTRAINT chk_duration CHECK (duration_min BETWEEN 15 AND 480),
--     CONSTRAINT chk_zoom_url CHECK (zoom_url ~* '^https://([a-z0-9-]+\.)*zoom\.us(/|$)')
-- );

-- CREATE INDEX IF NOT EXISTS idx_online_classes_class_start
--     ON online_classes (class_id, starts_at);

SELECT * FROM students;
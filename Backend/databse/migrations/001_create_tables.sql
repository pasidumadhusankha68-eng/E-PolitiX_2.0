-- DROP TABLE IF EXISTS exam_marks, exams, enrollments, classes,
--                      students, student_counters, institutes, users CASCADE;
-- DROP FUNCTION IF EXISTS set_student_code();

-- CREATE TABLE users (
--     id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
--     full_name VARCHAR(200) NOT NULL,
--     email VARCHAR(100) NOT NULL UNIQUE,
--     password_hash TEXT NOT NULL,
--     role VARCHAR(10) NOT NULL DEFAULT 'student'
--         CHECK (role IN ('student', 'admin', 'superadmin')),
--     created_at TIMESTAMPTZ NOT NULL DEFAULT now()
-- );

-- CREATE TABLE institutes (
--     id SMALLINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
--     code VARCHAR(2) NOT NULL UNIQUE CHECK (code = upper(code)),
--     name VARCHAR(100) NOT NULL
-- );

-- CREATE TABLE student_counters (
--     exam_year SMALLINT NOT NULL,
--     institute_id SMALLINT NOT NULL REFERENCES institutes(id),
--     last_no INTEGER NOT NULL DEFAULT 0,
--     PRIMARY KEY (exam_year, institute_id)
-- );

-- -- only for students (login details stay in users)
-- CREATE TABLE students (
--     id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
--     user_id BIGINT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
--     institute_id SMALLINT NOT NULL REFERENCES institutes(id),
--     exam_year SMALLINT NOT NULL,
--     seq_no INTEGER,
--     student_code VARCHAR(10) NOT NULL UNIQUE,
--     name_with_initials VARCHAR(100) NOT NULL,
--     address VARCHAR(200) NOT NULL,
--     school VARCHAR(200) NOT NULL,
--     gender VARCHAR(20) NOT NULL,
--     nic VARCHAR(12) NOT NULL,
--     mobile_number VARCHAR(15) NOT NULL,
--     created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
--     is_active BOOLEAN NOT NULL DEFAULT TRUE,
--     UNIQUE (exam_year, institute_id, seq_no)
-- );

-- CREATE OR REPLACE FUNCTION set_student_code() RETURNS trigger AS $$
-- DECLARE
--     next_no   INTEGER;
--     inst_code VARCHAR(2);
-- BEGIN
--     SELECT code INTO inst_code FROM institutes WHERE id = NEW.institute_id;

--     INSERT INTO student_counters (exam_year, institute_id, last_no)
--     VALUES (NEW.exam_year, NEW.institute_id, 1)
--     ON CONFLICT (exam_year, institute_id)
--     DO UPDATE SET last_no = student_counters.last_no + 1
--     RETURNING last_no INTO next_no;

--     NEW.seq_no       := next_no;
--     NEW.student_code := NEW.exam_year::text || inst_code || lpad(next_no::text, 4, '0');
--     RETURN NEW;
-- END;
-- $$ LANGUAGE plpgsql;

-- CREATE TRIGGER trg_set_student_code
-- BEFORE INSERT ON students
-- FOR EACH ROW EXECUTE FUNCTION set_student_code();

-- CREATE TABLE classes (
--     id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
--     name VARCHAR(150) NOT NULL,
--     exam_year SMALLINT NOT NULL
-- );

-- CREATE TABLE enrollments (
--     id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
--     student_id BIGINT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
--     class_id BIGINT NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
--     enrolled_at TIMESTAMPTZ NOT NULL DEFAULT now(),
--     UNIQUE (student_id, class_id)
-- );

-- -- store test names
-- CREATE TABLE exams (
--     id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
--     class_id BIGINT NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
--     exam_number INTEGER NOT NULL CHECK (exam_number > 0),
--     exam_name VARCHAR(100) NOT NULL,
--     test_date DATE NOT NULL,
--     UNIQUE (class_id, exam_number)
-- );

-- CREATE TABLE exam_marks (
--     id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
--     exam_id BIGINT NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
--     student_id BIGINT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
--     marks NUMERIC(5,2) NOT NULL CHECK (marks >= 0),
--     UNIQUE (exam_id, student_id)
-- );

-- CREATE INDEX idx_exam_marks_student ON exam_marks(student_id);
-- CREATE INDEX idx_exams_classes       ON exams(class_id);
-- CREATE INDEX idx_enrollments_course ON enrollments(class_id);

ALTER TABLE students ADD CONSTRAINT students_nic_key UNIQUE (nic);
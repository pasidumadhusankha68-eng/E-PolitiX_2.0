-- Admin user creation does not collect NIC/school/gender (those are captured
-- during self-registration), so make them optional on students.
ALTER TABLE students ALTER COLUMN school DROP NOT NULL;
ALTER TABLE students ALTER COLUMN gender DROP NOT NULL;
ALTER TABLE students ALTER COLUMN nic DROP NOT NULL;

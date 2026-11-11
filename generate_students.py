import bcrypt
import csv
import sys
from datetime import datetime

# 50 dummy student data: (full_name, email, last_name)
students = [
    ('Kamal Perera', 'student001@example.com', 'Perera'),
    ('Nimali Silva', 'nimali002@example.com', 'Silva'),
    ('Sunil Rao', 'sunil003@example.com', 'Rao'),
    ('Ayesha Devi', 'ayesha004@example.com', 'Devi'),
    ('Rohan Fernando', 'rohan005@example.com', 'Fernando'),
    ('Geetha Jayawardena', 'geetha006@example.com', 'Jayawardena'),
    ('Priyantha Gamage', 'priyantha007@example.com', 'Gamage'),
    ('Chandrika Wickramasinghe', 'chandrika008@example.com', 'Wickramasinghe'),
    ('Anura Abeygunawardena', 'anura009@example.com', 'Abeygunawardena'),
    ('Samantha Jayasinghe', 'samantha010@example.com', 'Jayasinghe'),
    ('Deepthi Premadasa', 'deepthi011@example.com', 'Premadasa'),
    ('Ranjith Bandara', 'ranjith012@example.com', 'Bandara'),
    ('Sunethra Senanayake', 'sunethra013@example.com', 'Senanayake'),
    ('Lalith Dissanayake', 'lalith014@example.com', 'Dissanayake'),
    ('Manjula Wijesinghe', 'manjula015@example.com', 'Wijesinghe'),
    ('Indira Rathnayake', 'indira016@example.com', 'Rathnayake'),
    ('Sanjana Gunaratne', 'sanjana017@example.com', 'Gunaratne'),
    ('Dinesh Chandrasekera', 'dinesh018@example.com', 'Chandrasekera'),
    ('Chamila Balasuriya', 'chamila019@example.com', 'Balasuriya'),
    ('Hemantha Ekanayake', 'hemantha020@example.com', 'Ekanayake'),
    ('Nimal Herath', 'nimal021@example.com', 'Herath'),
    ('Chandra Ratnayake', 'chandra022@example.com', 'Ratnayake'),
    ('Priyanka Weerasinghe', 'priyanka023@example.com', 'Weerasinghe'),
    ('Vijaya Jayawardena', 'vijaya024@example.com', 'Jayawardena'),
    ('Sunil Fernando', 'sunil025@example.com', 'Fernando'),
    ('Lakshmi Peiris', 'lakshmi026@example.com', 'Peiris'),
    ('Dilshan Mendis', 'dilshan027@example.com', 'Mendis'),
    ('Kumar Perera', 'kumar028@example.com', 'Perera'),
    ('Lakmini Silva', 'lakmini029@example.com', 'Silva'),
    ('Ravi Rao', 'ravi030@example.com', 'Rao'),
    ('Shanti Devi', 'shanti031@example.com', 'Devi'),
    ('Ajith Fernando', 'ajith032@example.com', 'Fernando'),
    ('Rohana Jayawardena', 'rohana033@example.com', 'Jayawardena'),
    ('Sanduni Gamage', 'sanduni034@example.com', 'Gamage'),
    ('Nimal Wickramasinghe', 'nimal035@example.com', 'Wickramasinghe'),
    ('Suranga Abeygunawardena', 'suranga036@example.com', 'Abeygunawardena'),
    ('Deepika Jayasinghe', 'deepika037@example.com', 'Jayasinghe'),
    ('Ranjith Perera', 'ranjith038@example.com', 'Perera'),
    ('Chandrika Silva', 'chandrika039@example.com', 'Silva'),
    ('Sunil K. Rao', 'sunil040@example.com', 'Rao'),
    ('Ayesha M. Devi', 'ayesha041@example.com', 'Devi'),
    ('Rohan N. Fernando', 'rohan042@example.com', 'Fernando'),
    ('Geetha P. Jayawardena', 'geetha043@example.com', 'Jayawardena'),
    ('Priyantha S. Gamage', 'priyantha044@example.com', 'Gamage'),
    ('Chandrika N. Wickramasinghe', 'chandrika045@example.com', 'Wickramasinghe'),
    ('Anura S. Abeygunawardena', 'anura046@example.com', 'Abeygunawardena'),
    ('Samantha P. Jayasinghe', 'samantha047@example.com', 'Jayasinghe'),
    ('Deepthi R. Premadasa', 'deepthi048@example.com', 'Premadasa'),
    ('Ranjith S. Bandara', 'ranjith049@example.com', 'Bandara'),
    ('Sunethra P. Senanayake', 'sunethra050@example.com', 'Senanayake'),
]

EXAM_YEAR = 2030
INSTITUTE_ID = 3
INSTITUTE_CODE = '03'  # Must match institutes.code for id=3


def hash_password(password: str) -> str:
    """Generate bcrypt hash for password."""
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def escape_sql(value: str) -> str:
    """Escape single quotes for SQL."""
    return value.replace("'", "''")


def generate_sql() -> str:
    lines = []
    lines.append("-- ============================================")
    lines.append("-- Generated student data for exam_year=2030, institute_id=3")
    lines.append(f"-- Generated at: {datetime.now().isoformat()}")
    lines.append("-- ============================================\n")

    # ============================================
    # STEP 1: Institute (ensure exists)
    # ============================================
    lines.append("-- ============================================")
    lines.append("-- STEP 1: Ensure institute id=3 exists")
    lines.append("-- ============================================")
    lines.append("INSERT INTO institutes (code, name) VALUES ('03', 'Institute 03') ON CONFLICT (id) DO NOTHING;")
    lines.append("")

    # ============================================
    # STEP 2: Users
    # ============================================
    lines.append("-- ============================================")
    lines.append("-- STEP 2: Insert 50 users")
    lines.append("-- ============================================")
    users_values = []
    for full_name, email, last_name in students:
        password = last_name + '123'  # e.g., Perera123
        password_hash = hash_password(password)
        safe_full_name = escape_sql(full_name)
        lines.append(f"INSERT INTO users (full_name, email, password_hash, role) VALUES ('{safe_full_name}', '{email}', '{password_hash}', 'student');")
    lines.append("")

    # ============================================
    # STEP 3: Students
    # ============================================
    lines.append("-- ============================================")
    lines.append("-- STEP 3: Insert 50 students")
    lines.append("-- ============================================")
    students_values = []
    for i, (full_name, email, last_name) in enumerate(students, start=1):
        seq_no = i
        student_code = f'2030{INSTITUTE_CODE}{seq_no:04d}'  # e.g. 2030030001
        safe_name = escape_sql(full_name)
        address = escape_sql(f'{i} Galle Road, Colombo')
        school = ['Royal College', 'Ananda College', 'Nalanda College', 'St. Thomas College', 'Mahamaya College'][i % 5]
        gender = 'M' if i % 2 == 0 else 'F'
        nic = f'123456{i:06d}V'
        mobile = f'077{i:07d}'
        lines.append(f"INSERT INTO students (user_id, institute_id, exam_year, seq_no, student_code, name_with_initials, address, school, gender, nic, mobile_number, is_active) VALUES ({i}, {INSTITUTE_ID}, {EXAM_YEAR}, {seq_no}, '{student_code}', '{safe_name}', '{address}', '{school}', '{gender}', '{nic}', '{mobile}', TRUE);")
    lines.append("")

    # ============================================
    # STEP 4: student_counters
    # ============================================
    lines.append("-- ============================================")
    lines.append("-- STEP 4: Insert/update student_counters")
    lines.append("-- ============================================")
    lines.append(f"INSERT INTO student_counters (exam_year, institute_id, last_no) VALUES ({EXAM_YEAR}, {INSTITUTE_ID}, 50) ON CONFLICT (exam_year, institute_id) DO UPDATE SET last_no = 50;")
    lines.append("")

    # ============================================
    # STEP 5: Classes
    # ============================================
    lines.append("-- ============================================")
    lines.append("-- STEP 5: Insert classes for 2030")
    lines.append("-- ============================================")
    class_names = [
        '2030 A/L Science Class A',
        '2030 A/L Science Class B',
        '2030 A/L Arts Class',
        '2030 O/L Class',
    ]
    class_ids = []
    for cls_name in class_names:
        safe_name = escape_sql(cls_name)
        lines.append(f"INSERT INTO classes (name, exam_year) VALUES ('{safe_name}', {EXAM_YEAR}) RETURNING id;")
    lines.append("")

    # ============================================
    # STEP 6: Enrollments
    # ============================================
    lines.append("-- ============================================")
    lines.append("-- STEP 6: Enroll students in classes")
    lines.append("-- ============================================")
    lines.append("-- NOTE: Update the class_id values below to match actual class IDs from step 5")
    lines.append("-- Enroll all 50 students into Class ID 1")
    lines.append("INSERT INTO enrollments (student_id, class_id)")
    lines.append("SELECT s.id, 1")
    lines.append("FROM students s")
    lines.append(f"WHERE s.exam_year = {EXAM_YEAR} AND s.institute_id = {INSTITUTE_ID};")
    lines.append("")
    lines.append("-- Enroll students 1-25 into Class ID 2")
    lines.append("INSERT INTO enrollments (student_id, class_id)")
    lines.append("SELECT s.id, 2")
    lines.append("FROM students s")
    lines.append(f"WHERE s.exam_year = {EXAM_YEAR} AND s.institute_id = {INSTITUTE_ID}")
    lines.append("LIMIT 25;")
    lines.append("")
    lines.append("-- Enroll students 26-50 into Class ID 3")
    lines.append("INSERT INTO enrollments (student_id, class_id)")
    lines.append("SELECT s.id, 3")
    lines.append("FROM students s")
    lines.append(f"WHERE s.exam_year = {EXAM_YEAR} AND s.institute_id = {INSTITUTE_ID}")
    lines.append("LIMIT 25 OFFSET 25;")
    lines.append("")

    lines.append("-- ============================================")
    lines.append("-- End of script")
    lines.append("-- ============================================")

    return '\n'.join(lines)


if __name__ == '__main__':
    sql = generate_sql()
    output_file = 'generate_students_output.sql'
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(sql)
    print(f'SQL script written to {output_file}')
    print(f'Total students: {len(students)}')
    print(f'Exam year: {EXAM_YEAR}')
    print(f'Institute ID: {INSTITUTE_ID}')
    print(f'Password format: lastname + "123"')
    print()
    print('Next steps:')
    print('1. Ensure institute id=3 exists in institutes table')
    print('2. Ensure pgcrypto extension is enabled (CREATE EXTENSION IF NOT EXISTS pgcrypto;) - OR generate bcrypt hashes externally')
    print('3. Run the generated SQL file against your PostgreSQL database')
    print('4. Update class IDs in STEP 6 to match actual class IDs from STEP 5')

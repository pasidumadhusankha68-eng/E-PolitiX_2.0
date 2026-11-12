--
-- PostgreSQL database dump
--

\restrict p3yGa3vaC9Lrckj8wbsxmlduY2rWpqEPVToFAhCnpJ39mnd7wLsGLePo5DBmQut

-- Dumped from database version 18.6
-- Dumped by pg_dump version 18.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: auto_enroll_student(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.auto_enroll_student() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  INSERT INTO enrollments (student_id, class_id)
  SELECT NEW.id, c.id
  FROM classes c
  WHERE c.exam_year = NEW.exam_year
    AND NOT EXISTS (
      SELECT 1 FROM enrollments e
      WHERE e.student_id = NEW.id AND e.class_id = c.id
    );
  RETURN NEW;
END;
$$;


--
-- Name: set_student_code(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.set_student_code() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    next_no   INTEGER;
    inst_code VARCHAR(2);
BEGIN
    SELECT code INTO inst_code FROM institutes WHERE id = NEW.institute_id;

    INSERT INTO student_counters (exam_year, institute_id, last_no)
    VALUES (NEW.exam_year, NEW.institute_id, 1)
    ON CONFLICT (exam_year, institute_id)
    DO UPDATE SET last_no = student_counters.last_no + 1
    RETURNING last_no INTO next_no;

    NEW.seq_no       := next_no;
    NEW.student_code := NEW.exam_year::text || inst_code || lpad(next_no::text, 4, '0');
    RETURN NEW;
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: classes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.classes (
    id bigint NOT NULL,
    name character varying(150) NOT NULL,
    exam_year smallint NOT NULL
);


--
-- Name: classes_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.classes ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.classes_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: enrollments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.enrollments (
    id bigint NOT NULL,
    student_id bigint NOT NULL,
    class_id bigint NOT NULL,
    enrolled_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: enrollments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.enrollments ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.enrollments_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: exam_marks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.exam_marks (
    id bigint NOT NULL,
    exam_id bigint NOT NULL,
    student_id bigint NOT NULL,
    mcq_marks numeric(5,2) DEFAULT 0,
    essay_marks numeric(5,2) DEFAULT 0,
    final_marks numeric(5,2) GENERATED ALWAYS AS ((mcq_marks + essay_marks)) STORED
);


--
-- Name: exam_marks_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.exam_marks ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.exam_marks_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: exams; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.exams (
    id bigint NOT NULL,
    class_id bigint NOT NULL,
    exam_number integer NOT NULL,
    exam_name character varying(100) NOT NULL,
    test_date date NOT NULL,
    CONSTRAINT exams_exam_number_check CHECK ((exam_number > 0))
);


--
-- Name: exams_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.exams ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.exams_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: institutes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.institutes (
    id smallint NOT NULL,
    code character varying(2) NOT NULL,
    name character varying(100) NOT NULL,
    CONSTRAINT institutes_code_check CHECK (((code)::text = upper((code)::text)))
);


--
-- Name: institutes_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.institutes ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.institutes_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: online_classes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.online_classes (
    id integer NOT NULL,
    class_id integer NOT NULL,
    title character varying(150) NOT NULL,
    starts_at timestamp with time zone NOT NULL,
    duration_min integer DEFAULT 90 NOT NULL,
    zoom_url text NOT NULL,
    passcode character varying(50),
    notes text,
    is_cancelled boolean DEFAULT false NOT NULL,
    created_by integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT chk_duration CHECK (((duration_min >= 15) AND (duration_min <= 480))),
    CONSTRAINT chk_zoom_url CHECK ((zoom_url ~* '^https://([a-z0-9-]+\.)*zoom\.us(/|$)'::text))
);


--
-- Name: online_classes_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.online_classes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: online_classes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.online_classes_id_seq OWNED BY public.online_classes.id;


--
-- Name: resources; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.resources (
    id integer NOT NULL,
    class_id integer NOT NULL,
    category character varying(12) NOT NULL,
    title character varying(150) NOT NULL,
    description text,
    url text NOT NULL,
    resource_date date DEFAULT CURRENT_DATE NOT NULL,
    is_published boolean DEFAULT true NOT NULL,
    created_by integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT chk_resource_category CHECK (((category)::text = ANY ((ARRAY['note'::character varying, 'paper'::character varying, 'past_paper'::character varying])::text[]))),
    CONSTRAINT chk_resource_url CHECK ((url ~* '^https://(drive|docs)\.google\.com/'::text))
);


--
-- Name: resources_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.resources_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: resources_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.resources_id_seq OWNED BY public.resources.id;


--
-- Name: student_counters; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.student_counters (
    exam_year smallint NOT NULL,
    institute_id smallint NOT NULL,
    last_no integer DEFAULT 0 NOT NULL
);


--
-- Name: student_payments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.student_payments (
    id integer NOT NULL,
    student_id integer NOT NULL,
    month date NOT NULL,
    status character varying(10) DEFAULT 'unpaid'::character varying NOT NULL,
    reference_no character varying(60),
    paid_date date,
    note text,
    recorded_by integer,
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT chk_month_first_day CHECK ((month = (date_trunc('month'::text, (month)::timestamp with time zone))::date)),
    CONSTRAINT chk_status CHECK (((status)::text = ANY ((ARRAY['paid'::character varying, 'unpaid'::character varying])::text[])))
);


--
-- Name: student_payments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.student_payments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: student_payments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.student_payments_id_seq OWNED BY public.student_payments.id;


--
-- Name: students; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.students (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    institute_id smallint NOT NULL,
    exam_year smallint NOT NULL,
    seq_no integer,
    student_code character varying(10) NOT NULL,
    name_with_initials character varying(100) NOT NULL,
    address character varying(200) NOT NULL,
    school character varying(200) NOT NULL,
    gender character varying(20) NOT NULL,
    nic character varying(12) NOT NULL,
    mobile_number character varying(15) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    is_active boolean DEFAULT true NOT NULL
);


--
-- Name: students_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.students ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.students_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id bigint NOT NULL,
    full_name character varying(200) NOT NULL,
    email character varying(100) NOT NULL,
    password_hash text NOT NULL,
    role character varying(10) DEFAULT 'student'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    CONSTRAINT users_role_check CHECK (((role)::text = ANY ((ARRAY['student'::character varying, 'admin'::character varying, 'superadmin'::character varying])::text[])))
);


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.users ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: online_classes id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.online_classes ALTER COLUMN id SET DEFAULT nextval('public.online_classes_id_seq'::regclass);


--
-- Name: resources id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.resources ALTER COLUMN id SET DEFAULT nextval('public.resources_id_seq'::regclass);


--
-- Name: student_payments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_payments ALTER COLUMN id SET DEFAULT nextval('public.student_payments_id_seq'::regclass);


--
-- Name: classes classes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.classes
    ADD CONSTRAINT classes_pkey PRIMARY KEY (id);


--
-- Name: enrollments enrollments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.enrollments
    ADD CONSTRAINT enrollments_pkey PRIMARY KEY (id);


--
-- Name: enrollments enrollments_student_id_class_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.enrollments
    ADD CONSTRAINT enrollments_student_id_class_id_key UNIQUE (student_id, class_id);


--
-- Name: exam_marks exam_marks_exam_id_student_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.exam_marks
    ADD CONSTRAINT exam_marks_exam_id_student_id_key UNIQUE (exam_id, student_id);


--
-- Name: exam_marks exam_marks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.exam_marks
    ADD CONSTRAINT exam_marks_pkey PRIMARY KEY (id);


--
-- Name: exams exams_class_id_exam_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.exams
    ADD CONSTRAINT exams_class_id_exam_number_key UNIQUE (class_id, exam_number);


--
-- Name: exams exams_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.exams
    ADD CONSTRAINT exams_pkey PRIMARY KEY (id);


--
-- Name: institutes institutes_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.institutes
    ADD CONSTRAINT institutes_code_key UNIQUE (code);


--
-- Name: institutes institutes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.institutes
    ADD CONSTRAINT institutes_pkey PRIMARY KEY (id);


--
-- Name: online_classes online_classes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.online_classes
    ADD CONSTRAINT online_classes_pkey PRIMARY KEY (id);


--
-- Name: resources resources_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.resources
    ADD CONSTRAINT resources_pkey PRIMARY KEY (id);


--
-- Name: student_counters student_counters_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_counters
    ADD CONSTRAINT student_counters_pkey PRIMARY KEY (exam_year, institute_id);


--
-- Name: student_payments student_payments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_payments
    ADD CONSTRAINT student_payments_pkey PRIMARY KEY (id);


--
-- Name: students students_exam_year_institute_id_seq_no_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT students_exam_year_institute_id_seq_no_key UNIQUE (exam_year, institute_id, seq_no);


--
-- Name: students students_nic_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT students_nic_key UNIQUE (nic);


--
-- Name: students students_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT students_pkey PRIMARY KEY (id);


--
-- Name: students students_student_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT students_student_code_key UNIQUE (student_code);


--
-- Name: students students_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT students_user_id_key UNIQUE (user_id);


--
-- Name: student_payments uq_student_month; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_payments
    ADD CONSTRAINT uq_student_month UNIQUE (student_id, month);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: idx_enrollments_course; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_enrollments_course ON public.enrollments USING btree (class_id);


--
-- Name: idx_exam_marks_student; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_exam_marks_student ON public.exam_marks USING btree (student_id);


--
-- Name: idx_exams_classes; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_exams_classes ON public.exams USING btree (class_id);


--
-- Name: idx_online_classes_class_start; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_online_classes_class_start ON public.online_classes USING btree (class_id, starts_at);


--
-- Name: idx_resources_class_cat; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_resources_class_cat ON public.resources USING btree (class_id, category, resource_date DESC);


--
-- Name: students trg_auto_enroll; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_auto_enroll AFTER INSERT ON public.students FOR EACH ROW EXECUTE FUNCTION public.auto_enroll_student();


--
-- Name: students trg_set_student_code; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_set_student_code BEFORE INSERT ON public.students FOR EACH ROW EXECUTE FUNCTION public.set_student_code();


--
-- Name: enrollments enrollments_class_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.enrollments
    ADD CONSTRAINT enrollments_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id) ON DELETE CASCADE;


--
-- Name: enrollments enrollments_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.enrollments
    ADD CONSTRAINT enrollments_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE;


--
-- Name: exam_marks exam_marks_exam_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.exam_marks
    ADD CONSTRAINT exam_marks_exam_id_fkey FOREIGN KEY (exam_id) REFERENCES public.exams(id) ON DELETE CASCADE;


--
-- Name: exam_marks exam_marks_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.exam_marks
    ADD CONSTRAINT exam_marks_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE;


--
-- Name: exams exams_class_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.exams
    ADD CONSTRAINT exams_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id) ON DELETE CASCADE;


--
-- Name: online_classes online_classes_class_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.online_classes
    ADD CONSTRAINT online_classes_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id);


--
-- Name: online_classes online_classes_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.online_classes
    ADD CONSTRAINT online_classes_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: resources resources_class_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.resources
    ADD CONSTRAINT resources_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id);


--
-- Name: resources resources_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.resources
    ADD CONSTRAINT resources_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: student_counters student_counters_institute_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_counters
    ADD CONSTRAINT student_counters_institute_id_fkey FOREIGN KEY (institute_id) REFERENCES public.institutes(id);


--
-- Name: student_payments student_payments_recorded_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_payments
    ADD CONSTRAINT student_payments_recorded_by_fkey FOREIGN KEY (recorded_by) REFERENCES public.users(id);


--
-- Name: student_payments student_payments_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_payments
    ADD CONSTRAINT student_payments_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE;


--
-- Name: students students_institute_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT students_institute_id_fkey FOREIGN KEY (institute_id) REFERENCES public.institutes(id);


--
-- Name: students students_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT students_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict p3yGa3vaC9Lrckj8wbsxmlduY2rWpqEPVToFAhCnpJ39mnd7wLsGLePo5DBmQut


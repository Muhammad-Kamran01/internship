-- =========================================================
-- STUDENT ASSISTANT - SUPABASE DATABASE SCHEMA (v1.0)
-- Copy and run this script in your Supabase SQL Editor:
-- https://lgtimlxilrzvgpfmkoin.supabase.co
-- =========================================================

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ---------------------------------------------------------
-- 1. PROFILES TABLE
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  role TEXT NOT NULL CHECK (role IN ('student', 'freelancer', 'admin')) DEFAULT 'student',
  profile_photo TEXT,
  institution TEXT,
  academic_degree TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for profiles search
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- ---------------------------------------------------------
-- 2. PROJECTS TABLE
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  student_name TEXT,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  deadline DATE NOT NULL,
  budget NUMERIC(10, 2),
  status TEXT NOT NULL CHECK (status IN ('Submitted', 'Analyzing', 'Assigned', 'In Progress', 'Review', 'Completed', 'Rejected')) DEFAULT 'Submitted',
  priority TEXT NOT NULL CHECK (priority IN ('Low', 'Medium', 'High', 'Urgent')) DEFAULT 'Medium',
  assigned_agent TEXT,
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_projects_student_id ON public.projects(student_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_category ON public.projects(category);

-- ---------------------------------------------------------
-- 3. PROJECT FILES TABLE
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.project_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size BIGINT,
  file_type TEXT NOT NULL,
  uploaded_by TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_project_files_project_id ON public.project_files(project_id);

-- ---------------------------------------------------------
-- 4. NOTIFICATIONS TABLE
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  type TEXT DEFAULT 'status',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);

-- ---------------------------------------------------------
-- 5. ACTIVITY LOGS TABLE
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  activity TEXT NOT NULL,
  details TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON public.activity_logs(user_id);

-- ---------------------------------------------------------
-- 6. COMMENTS TABLE (AI Agent & User Discussion)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.project_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  user_role TEXT NOT NULL,
  message TEXT NOT NULL,
  is_ai_generated BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_comments_project_id ON public.project_comments(project_id);

-- ---------------------------------------------------------
-- 7. PROPOSALS TABLE (Upwork-style Assistant Proposals)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.proposals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  freelancer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  cover_letter TEXT NOT NULL,
  proposed_price NUMERIC(10, 2) NOT NULL,
  estimated_days INTEGER NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('Pending', 'Accepted', 'Rejected', 'Withdrawn')) DEFAULT 'Pending',
  attachment_url TEXT,
  attachment_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_freelancer_project_proposal UNIQUE (project_id, freelancer_id)
);

CREATE INDEX IF NOT EXISTS idx_proposals_project_id ON public.proposals(project_id);
CREATE INDEX IF NOT EXISTS idx_proposals_freelancer_id ON public.proposals(freelancer_id);
CREATE INDEX IF NOT EXISTS idx_proposals_status ON public.proposals(status);

-- ---------------------------------------------------------
-- 8. DELIVERIES TABLE (Work submissions)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.deliveries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  freelancer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  delivery_message TEXT NOT NULL,
  notes TEXT,
  status TEXT NOT NULL CHECK (status IN ('Submitted for Review', 'Revision Requested', 'Accepted')) DEFAULT 'Submitted for Review',
  revision_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_deliveries_project_id ON public.deliveries(project_id);

-- ---------------------------------------------------------
-- 9. EARNINGS TABLE
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.earnings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  freelancer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount NUMERIC(10, 2) NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('Available', 'Pending', 'Withdrawn')) DEFAULT 'Available',
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_earnings_freelancer_id ON public.earnings(freelancer_id);

-- ---------------------------------------------------------
-- 10. ASSISTANT PROFILES TABLE
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.assistant_profiles (
  id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT,
  bio TEXT,
  skills TEXT[],
  academic_expertise TEXT[],
  categories TEXT[],
  experience_years INTEGER DEFAULT 0,
  education TEXT,
  languages TEXT[],
  rating NUMERIC(3, 2) DEFAULT 5.0,
  reviews_count INTEGER DEFAULT 0,
  completed_projects_count INTEGER DEFAULT 0,
  success_rate INTEGER DEFAULT 100,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS POLICIES FOR NEW TABLES
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assistant_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Manage proposals" ON public.proposals FOR ALL USING (
  freelancer_id = auth.uid() OR
  EXISTS (SELECT 1 FROM public.projects WHERE id = proposals.project_id AND student_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Manage deliveries" ON public.deliveries FOR ALL USING (
  freelancer_id = auth.uid() OR
  EXISTS (SELECT 1 FROM public.projects WHERE id = deliveries.project_id AND student_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Manage earnings" ON public.earnings FOR ALL USING (
  freelancer_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Public read assistant profiles" ON public.assistant_profiles FOR SELECT USING (true);
CREATE POLICY "Manage own assistant profile" ON public.assistant_profiles FOR ALL USING (id = auth.uid());
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_comments ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can view their own profile or admins/freelancers can view profiles
CREATE POLICY "Users can read own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Projects: Students view/manage their own projects; Admins & Freelancers view all
CREATE POLICY "Students manage own projects" ON public.projects FOR ALL USING (
  auth.uid() = student_id OR 
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'freelancer'))
);

-- Project Files RLS
CREATE POLICY "Access project files" ON public.project_files FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.projects 
    WHERE id = project_files.project_id AND (student_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'freelancer')))
  )
);

-- Notifications RLS
CREATE POLICY "Users view own notifications" ON public.notifications FOR ALL USING (user_id = auth.uid());

-- Activity Logs RLS
CREATE POLICY "Users view own activity" ON public.activity_logs FOR ALL USING (user_id = auth.uid());

-- Project Comments RLS
CREATE POLICY "Access project comments" ON public.project_comments FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.projects 
    WHERE id = project_comments.project_id AND (student_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'freelancer')))
  )
);

-- ---------------------------------------------------------
-- TRIGGER FOR AUTOMATIC PROFILE CREATION ON USER SIGNUP
-- ---------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role, phone, institution, academic_degree)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Student User'),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'student'),
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'institution',
    NEW.raw_user_meta_data->>'academic_degree'
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    phone = EXCLUDED.phone,
    institution = EXCLUDED.institution,
    academic_degree = EXCLUDED.academic_degree;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger execution
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ---------------------------------------------------------
-- STORAGE BUCKETS (Run in Supabase Dashboard -> SQL Editor)
-- ---------------------------------------------------------

-- 1. Create 'project-attachments' bucket (if not exists)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('project-attachments', 'project-attachments', true)
ON CONFLICT (id) DO NOTHING;

-- Policies for 'project-attachments'
CREATE POLICY "Public Read Access for project-attachments"
ON storage.objects FOR SELECT
USING (bucket_id = 'project-attachments');

CREATE POLICY "Authenticated Upload Access for project-attachments"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'project-attachments');

CREATE POLICY "Authenticated Update/Delete Access for project-attachments"
ON storage.objects FOR ALL
USING (bucket_id = 'project-attachments');


-- 2. Create 'profile-photos' bucket for user avatars
INSERT INTO storage.buckets (id, name, public) 
VALUES ('profile-photos', 'profile-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Policies for 'profile-photos'
CREATE POLICY "Public Read Access for profile-photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'profile-photos');

CREATE POLICY "Authenticated Upload Access for profile-photos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'profile-photos');

CREATE POLICY "Authenticated Update/Delete Access for profile-photos"
ON storage.objects FOR ALL
USING (bucket_id = 'profile-photos');
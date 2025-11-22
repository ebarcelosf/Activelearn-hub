-- Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  avatar_url TEXT,
  xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Create projects table
CREATE TABLE public.projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  phase TEXT DEFAULT 'engage' CHECK (phase IN ('engage', 'investigate', 'act')),
  engage_completed BOOLEAN DEFAULT FALSE,
  investigate_completed BOOLEAN DEFAULT FALSE,
  act_completed BOOLEAN DEFAULT FALSE,
  big_idea TEXT,
  essential_question TEXT,
  challenge TEXT,
  synthesis JSONB,
  solution JSONB,
  implementation JSONB,
  evaluation JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for projects
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Create policies for projects
CREATE POLICY "Users can view their own projects" 
ON public.projects 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own projects" 
ON public.projects 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects" 
ON public.projects 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects" 
ON public.projects 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create activities table
CREATE TABLE public.activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT,
  status TEXT DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Enable RLS for activities
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

-- Create policies for activities
CREATE POLICY "Users can manage activities of their own projects" 
ON public.activities 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.projects 
    WHERE projects.id = activities.project_id 
    AND projects.user_id = auth.uid()
  )
);

-- Create resources table
CREATE TABLE public.resources (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  url TEXT,
  type TEXT,
  credibility TEXT,
  notes TEXT,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for resources
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;

-- Create policies for resources
CREATE POLICY "Users can manage resources of their own projects" 
ON public.resources 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.projects 
    WHERE projects.id = resources.project_id 
    AND projects.user_id = auth.uid()
  )
);

-- Create prototypes table
CREATE TABLE public.prototypes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  fidelity TEXT,
  test_results TEXT,
  next_steps TEXT,
  files TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for prototypes
ALTER TABLE public.prototypes ENABLE ROW LEVEL SECURITY;

-- Create policies for prototypes
CREATE POLICY "Users can manage prototypes of their own projects" 
ON public.prototypes 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.projects 
    WHERE projects.id = prototypes.project_id 
    AND projects.user_id = auth.uid()
  )
);

-- Create guiding_questions table
CREATE TABLE public.guiding_questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT
);

-- Enable RLS for guiding_questions
ALTER TABLE public.guiding_questions ENABLE ROW LEVEL SECURITY;

-- Create policies for guiding_questions
CREATE POLICY "Users can manage guiding questions of their own projects" 
ON public.guiding_questions 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.projects 
    WHERE projects.id = guiding_questions.project_id 
    AND projects.user_id = auth.uid()
  )
);

-- Create checklist_items table
CREATE TABLE public.checklist_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  phase TEXT NOT NULL CHECK (phase IN ('engage', 'investigate', 'act')),
  text TEXT NOT NULL,
  done BOOLEAN DEFAULT FALSE
);

-- Enable RLS for checklist_items
ALTER TABLE public.checklist_items ENABLE ROW LEVEL SECURITY;

-- Create policies for checklist_items
CREATE POLICY "Users can manage checklist items of their own projects" 
ON public.checklist_items 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.projects 
    WHERE projects.id = checklist_items.project_id 
    AND projects.user_id = auth.uid()
  )
);

-- Create user_badges table
CREATE TABLE public.user_badges (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id TEXT NOT NULL,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

-- Enable RLS for user_badges
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

-- Create policies for user_badges
CREATE POLICY "Users can view their own badges" 
ON public.user_badges 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can earn badges" 
ON public.user_badges 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create trigger function for updating updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', 'User'));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
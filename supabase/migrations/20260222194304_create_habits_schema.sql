/*
  # Smart Habit Tracker Database Schema

  ## Overview
  Creates the complete database structure for the AI-powered Smart Habit Tracker application.
  
  ## New Tables
  
  ### `habits`
  Stores user-defined habits that they want to track.
  - `id` (uuid, primary key) - Unique identifier for each habit
  - `user_id` (uuid, foreign key) - References auth.users(id)
  - `name` (text) - Name of the habit (e.g., "Morning Exercise", "Read for 30 minutes")
  - `created_at` (timestamptz) - When the habit was created
  
  ### `habit_logs`
  Tracks daily completion status for each habit.
  - `id` (uuid, primary key) - Unique identifier for each log entry
  - `habit_id` (uuid, foreign key) - References habits(id)
  - `user_id` (uuid, foreign key) - References auth.users(id)
  - `date` (date) - The date this log entry is for
  - `status` (boolean) - Whether the habit was completed (true) or not (false)
  - `created_at` (timestamptz) - When the log entry was created
  
  ## Security
  
  ### Row Level Security (RLS)
  All tables have RLS enabled to ensure users can only access their own data.
  
  ### Policies
  
  #### habits table:
  - Users can view only their own habits
  - Users can insert only their own habits
  - Users can update only their own habits
  - Users can delete only their own habits
  
  #### habit_logs table:
  - Users can view only their own logs
  - Users can insert only their own logs
  - Users can update only their own logs
  - Users can delete only their own logs
  
  ## Indexes
  - Index on habit_logs(user_id, date) for fast daily queries
  - Index on habit_logs(habit_id, date) for analytics
  
  ## Important Notes
  1. Each user's data is completely isolated through RLS policies
  2. The date field in habit_logs ensures we can track daily progress
  3. Unique constraint on (habit_id, date) prevents duplicate entries for the same day
  4. Foreign key constraints maintain referential integrity
*/

-- Create habits table
CREATE TABLE IF NOT EXISTS habits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Create habit_logs table
CREATE TABLE IF NOT EXISTS habit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id uuid REFERENCES habits(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date date NOT NULL,
  status boolean DEFAULT false NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(habit_id, date)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_habit_logs_user_date ON habit_logs(user_id, date);
CREATE INDEX IF NOT EXISTS idx_habit_logs_habit_date ON habit_logs(habit_id, date);
CREATE INDEX IF NOT EXISTS idx_habits_user ON habits(user_id);

-- Enable Row Level Security
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_logs ENABLE ROW LEVEL SECURITY;

-- Policies for habits table
CREATE POLICY "Users can view own habits"
  ON habits FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own habits"
  ON habits FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own habits"
  ON habits FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own habits"
  ON habits FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Policies for habit_logs table
CREATE POLICY "Users can view own logs"
  ON habit_logs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own logs"
  ON habit_logs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own logs"
  ON habit_logs FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own logs"
  ON habit_logs FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
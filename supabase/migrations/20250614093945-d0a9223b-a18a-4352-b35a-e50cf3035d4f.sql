-- Add credits system to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS credits INTEGER NOT NULL DEFAULT 5;

-- Reset all existing users to 5 credits
UPDATE public.profiles 
SET credits = 5;

-- Create function to handle new user credits
CREATE OR REPLACE FUNCTION public.handle_new_user_credits()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Set default credits for new users
  NEW.credits = 5;
  RETURN NEW;
END;
$$;

-- Create trigger to set credits for new users
DROP TRIGGER IF EXISTS on_new_user_credits ON public.profiles;
CREATE TRIGGER on_new_user_credits
  BEFORE INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_credits();

-- Create function to check and deduct credits
CREATE OR REPLACE FUNCTION public.use_credit(user_id_param UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_credits INTEGER;
BEGIN
  -- Get current credits
  SELECT credits INTO current_credits
  FROM public.profiles
  WHERE id = user_id_param;
  
  -- Check if user has credits
  IF current_credits > 0 THEN
    -- Deduct one credit
    UPDATE public.profiles
    SET credits = credits - 1
    WHERE id = user_id_param;
    RETURN TRUE;
  ELSE
    RETURN FALSE;
  END IF;
END;
$$;
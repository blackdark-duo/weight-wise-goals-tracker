-- Update the existing handle_new_user function to include credits
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, webhook_limit, email, credits)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data->>'name', SPLIT_PART(new.email, '@', 1)),
    10,
    new.email,
    5
  );
  RETURN new;
END;
$$;

-- Ensure the trigger exists for new users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Remove the redundant credits trigger since it's now handled in handle_new_user
DROP TRIGGER IF EXISTS on_new_user_credits ON public.profiles;
DROP FUNCTION IF EXISTS public.handle_new_user_credits();
-- Add missing RLS policies for weight_entries table
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'weight_entries' 
    AND policyname = 'Users can view their own weight entries'
  ) THEN
    CREATE POLICY "Users can view their own weight entries" 
    ON public.weight_entries 
    FOR SELECT 
    USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'weight_entries' 
    AND policyname = 'Users can create their own weight entries'
  ) THEN
    CREATE POLICY "Users can create their own weight entries" 
    ON public.weight_entries 
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'weight_entries' 
    AND policyname = 'Users can update their own weight entries'
  ) THEN
    CREATE POLICY "Users can update their own weight entries" 
    ON public.weight_entries 
    FOR UPDATE 
    USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'weight_entries' 
    AND policyname = 'Users can delete their own weight entries'
  ) THEN
    CREATE POLICY "Users can delete their own weight entries" 
    ON public.weight_entries 
    FOR DELETE 
    USING (auth.uid() = user_id);
  END IF;
END $$;
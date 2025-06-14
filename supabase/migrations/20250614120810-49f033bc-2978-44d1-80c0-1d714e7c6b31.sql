-- Create upgrade_interest table to track user upgrade plan interest
CREATE TABLE public.upgrade_interest (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  email_id TEXT NOT NULL,
  interest_date DATE NOT NULL DEFAULT CURRENT_DATE,
  click_count INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, interest_date)
);

-- Enable Row Level Security
ALTER TABLE public.upgrade_interest ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own upgrade interest" 
ON public.upgrade_interest 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own upgrade interest" 
ON public.upgrade_interest 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own upgrade interest" 
ON public.upgrade_interest 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
NEW.updated_at = now();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_upgrade_interest_updated_at
BEFORE UPDATE ON public.upgrade_interest
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to track upgrade plan interest
CREATE OR REPLACE FUNCTION public.track_upgrade_interest(user_id_param UUID, email_param TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result_record RECORD;
BEGIN
  -- Insert or update upgrade interest for today
  INSERT INTO public.upgrade_interest (user_id, email_id, interest_date, click_count)
  VALUES (user_id_param, email_param, CURRENT_DATE, 1)
  ON CONFLICT (user_id, interest_date) 
  DO UPDATE SET 
    click_count = upgrade_interest.click_count + 1,
    updated_at = now()
  RETURNING * INTO result_record;
  
  -- Return the updated record as JSON
  RETURN row_to_json(result_record);
END;
$$;
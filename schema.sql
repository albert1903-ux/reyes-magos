-- Create children table
CREATE TABLE children (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create gifts table
CREATE TABLE gifts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id UUID REFERENCES children(id) NOT NULL,
  image_url TEXT NOT NULL,
  priority INT DEFAULT 0,
  price NUMERIC,
  assigned_to TEXT,
  is_bought BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create storage bucket for gift images
INSERT INTO storage.buckets (id, name, public) VALUES ('gift-images', 'gift-images', true);

-- Policy to allow public access to view images
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING ( bucket_id = 'gift-images' );

-- Policy to allow authenticated (or anon for now if not using auth) uploads
-- For simplicity in this demo, we'll allow public uploads, but in production use proper RLS
CREATE POLICY "Public Upload" ON storage.objects FOR INSERT WITH CHECK ( bucket_id = 'gift-images' );

-- Insert some dummy children
INSERT INTO children (name) VALUES ('Albert'), ('Maria'), ('Pau');

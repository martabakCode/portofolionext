-- Setup Supabase Storage buckets and policies
-- Run this in your Supabase Dashboard SQL Editor

-- Enable Storage
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values 
    ('projects', 'projects', true, 5242880, array['image/jpeg', 'image/png', 'image/gif', 'image/webp']),
    ('avatars', 'avatars', true, 5242880, array['image/jpeg', 'image/png', 'image/gif', 'image/webp']),
    ('logos', 'logos', true, 5242880, array['image/jpeg', 'image/png', 'image/gif', 'image/webp']),
    ('posts', 'posts', true, 5242880, array['image/jpeg', 'image/png', 'image/gif', 'image/webp'])
on conflict (id) do update set
    public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

-- Create policy to allow public read access
CREATE POLICY "Public Access" ON storage.objects
    FOR SELECT USING (bucket_id IN ('projects', 'avatars', 'logos', 'posts'));

-- Create policy to allow authenticated users to upload
CREATE POLICY "Authenticated Uploads" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (bucket_id IN ('projects', 'avatars', 'logos', 'posts'));

-- Create policy to allow authenticated users to update their own files
CREATE POLICY "Authenticated Updates" ON storage.objects
    FOR UPDATE TO authenticated
    USING (bucket_id IN ('projects', 'avatars', 'logos', 'posts'));

-- Create policy to allow authenticated users to delete
CREATE POLICY "Authenticated Deletes" ON storage.objects
    FOR DELETE TO authenticated
    USING (bucket_id IN ('projects', 'avatars', 'logos', 'posts'));

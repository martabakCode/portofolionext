-- ============================================
-- MIGRATE TECH STACK TABLE
-- Run this in Supabase Dashboard SQL Editor
-- ============================================

-- 1. Tambah kolom icon_class jika belum ada
alter table tech_stacks add column if not exists icon_class text default 'devicon-devicon-plain';

-- 2. Tambah kolom color jika belum ada
alter table tech_stacks add column if not exists color text default '#61DAFB';

-- 3. Copy data dari material_icon_name lama ke icon_class (jika ada data lama)
-- Update icon_class dari material_icon_name untuk data yang ada
do $$
begin
  -- Cek apakah kolom material_icon_name ada
  if exists (select 1 from information_schema.columns 
             where table_name = 'tech_stacks' and column_name = 'material_icon_name') then
    
    -- Update icon_class dengan nilai dari material_icon_name
    update tech_stacks 
    set icon_class = case 
      when material_icon_name = 'code' then 'devicon-devicon-plain'
      when material_icon_name = 'web' then 'devicon-nextjs-plain'
      when material_icon_name = 'javascript' then 'devicon-javascript-plain colored'
      when material_icon_name = 'terminal' then 'devicon-nodejs-plain colored'
      when material_icon_name = 'storage' then 'devicon-postgresql-plain colored'
      when material_icon_name = 'palette' then 'devicon-tailwindcss-original colored'
      else 'devicon-' || material_icon_name || '-plain'
    end
    where icon_class = 'devicon-devicon-plain' or icon_class is null;
    
    -- Drop kolom lama
    alter table tech_stacks drop column if exists material_icon_name;
    
  end if;
end $$;

-- 4. Set default value untuk icon_class
alter table tech_stacks alter column icon_class set default 'devicon-devicon-plain';

-- 5. Set default value untuk color
alter table tech_stacks alter column color set default '#61DAFB';

-- 6. Update color untuk data yang masih null
update tech_stacks set color = '#61DAFB' where color is null;

-- 7. Update icon_class untuk data yang masih default
update tech_stacks set icon_class = 'devicon-devicon-plain' where icon_class is null;

-- 8. Refresh schema cache
notify pgrst, 'reload schema';

-- ============================================
-- ✅ MIGRATION COMPLETE!
-- ============================================

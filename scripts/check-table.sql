-- ============================================
-- CHECK TECH_STACKS TABLE STRUCTURE
-- ============================================

-- Lihat struktur tabel
select column_name, data_type, is_nullable, column_default
from information_schema.columns
where table_name = 'tech_stacks'
order by ordinal_position;

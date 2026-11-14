-- Заглушка схемы auth для проверки вне Supabase (в Supabase не нужна).
create schema auth; create table auth.users(id uuid primary key);
create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true),'')::uuid $$;
create role authenticated;

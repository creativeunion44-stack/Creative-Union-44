-- Локальная проверка RLS и правила «этап закрывается только с причиной».
-- Запуск: psql -f auth_stub.sql -f ../migrations/0001_init.sql -f rls_test.sql
insert into auth.users values ('11111111-1111-1111-1111-111111111111'),('22222222-2222-2222-2222-222222222222');
insert into goals(user_id,title,type) values ('11111111-1111-1111-1111-111111111111','ВНЖ','project'),('22222222-2222-2222-2222-222222222222','Чужая цель','project');
grant usage on schema public, auth to authenticated; grant all on all tables in schema public to authenticated; grant execute on function auth.uid() to authenticated;
set role authenticated; set request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';
select 'visible goals for user 1: ' || count(*) from goals;
do $$ begin
  insert into goals(user_id,title,type) values ('22222222-2222-2222-2222-222222222222','взлом','project');
  raise exception 'RLS FAILED';
exception when insufficient_privilege then raise notice 'RLS blocks foreign insert: ok'; end $$;
reset role;
do $$ begin
  insert into milestones(user_id,goal_id,title,weight,status) select user_id,id,'x',0.1,'cancelled' from goals limit 1;
  raise exception 'CHECK FAILED';
exception when check_violation then raise notice 'closing without reason blocked: ok'; end $$;

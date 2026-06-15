-- Teste transacional de isolamento RLS.
-- Requer pelo menos dois usuarios em auth.users e termina sempre com rollback.

begin;

create temporary table rls_test_context (
    position smallint primary key,
    user_id uuid not null,
    account_id uuid
);

insert into rls_test_context (position, user_id)
select row_number() over (order by created_at)::smallint, id
from auth.users
order by created_at
limit 2;

do $$
begin
    if (select count(*) from rls_test_context) < 2 then
        raise exception 'Crie pelo menos dois usuarios no Supabase Auth antes do teste RLS.';
    end if;
end;
$$;

grant select, update on rls_test_context to authenticated;
set local role authenticated;
select set_config(
    'request.jwt.claim.sub',
    (select user_id::text from rls_test_context where position = 1),
    true
);

with inserted as (
    insert into public.accounts (name, account_type)
    values ('Teste RLS usuario 1', 'checking')
    returning id
)
update rls_test_context
set account_id = inserted.id
from inserted
where position = 1;

select set_config(
    'request.jwt.claim.sub',
    (select user_id::text from rls_test_context where position = 2),
    true
);

with inserted as (
    insert into public.accounts (name, account_type)
    values ('Teste RLS usuario 2', 'checking')
    returning id
)
update rls_test_context
set account_id = inserted.id
from inserted
where position = 2;

do $$
declare
    visible_own integer;
    visible_other integer;
begin
    select count(*) into visible_own
    from public.accounts
    where id = (select account_id from rls_test_context where position = 2);

    select count(*) into visible_other
    from public.accounts
    where id = (select account_id from rls_test_context where position = 1);

    if visible_own <> 1 or visible_other <> 0 then
        raise exception 'Falha de isolamento RLS: own=%, other=%', visible_own, visible_other;
    end if;

    raise notice 'RLS validado: usuario 2 acessa o proprio registro e nao acessa o usuario 1.';
end;
$$;

rollback;

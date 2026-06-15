-- Smoke test transacional dos CRUDs principais.
-- Requer pelo menos um usuario em auth.users e termina sempre com rollback.

begin;

create temporary table crud_test_context (
    key text primary key,
    value uuid not null
);

insert into crud_test_context (key, value)
select 'user', id from auth.users order by created_at limit 1;

do $$
begin
    if not exists (select 1 from crud_test_context where key = 'user') then
        raise exception 'Crie pelo menos um usuario no Supabase Auth antes do teste CRUD.';
    end if;
end;
$$;

grant select, insert, update on crud_test_context to authenticated;
set local role authenticated;
select set_config('request.jwt.claim.sub', (select value::text from crud_test_context where key = 'user'), true);

update public.profiles set locale = 'pt-BR' where user_id = auth.uid();

with row as (
    insert into public.accounts (name, account_type, opening_balance)
    values ('CRUD Conta', 'checking', 1000) returning id
) insert into crud_test_context select 'account', id from row;

with row as (
    insert into public.credit_cards (name, account_id, closing_day, due_day, credit_limit)
    values ('CRUD Cartao', (select value from crud_test_context where key = 'account'), 10, 17, 5000) returning id
) insert into crud_test_context select 'card', id from row;

with row as (
    insert into public.categories (name, kind, color)
    values ('CRUD Despesa', 'expense', '#334155') returning id
) insert into crud_test_context select 'category', id from row;

with row as (
    insert into public.tags (name, color)
    values ('CRUD Tag', '#475569') returning id
) insert into crud_test_context select 'tag', id from row;

with row as (
    insert into public.recurring_transactions (
        account_id, category_id, kind, amount, description, frequency,
        start_date, next_run_date
    ) values (
        (select value from crud_test_context where key = 'account'),
        (select value from crud_test_context where key = 'category'),
        'expense', 80, 'CRUD Recorrencia', 'monthly', current_date, current_date
    ) returning id
) insert into crud_test_context select 'recurring', id from row;

with row as (
    insert into public.transactions (
        account_id, category_id, kind, amount, description, transaction_date,
        status, recurring_transaction_id, recurrence_date
    ) values (
        (select value from crud_test_context where key = 'account'),
        (select value from crud_test_context where key = 'category'),
        'expense', 80, 'CRUD Lancamento', current_date, 'paid',
        (select value from crud_test_context where key = 'recurring'), current_date
    ) returning id
) insert into crud_test_context select 'transaction', id from row;

insert into public.transaction_tags (transaction_id, tag_id)
values (
    (select value from crud_test_context where key = 'transaction'),
    (select value from crud_test_context where key = 'tag')
);

with row as (
    insert into public.budgets (category_id, period_month, amount)
    values (
        (select value from crud_test_context where key = 'category'),
        date_trunc('month', current_date)::date, 500
    ) returning id
) insert into crud_test_context select 'budget', id from row;

with row as (
    insert into public.asset_classes (name, color)
    values ('CRUD Acoes', '#2563eb') returning id
) insert into crud_test_context select 'asset_class', id from row;

with row as (
    insert into public.assets (asset_class_id, ticker, name, current_price)
    values (
        (select value from crud_test_context where key = 'asset_class'),
        'CRUD3', 'CRUD Ativo', 10
    ) returning id
) insert into crud_test_context select 'asset', id from row;

with row as (
    insert into public.investment_operations (asset_id, account_id, kind, operation_date, quantity, unit_price)
    values (
        (select value from crud_test_context where key = 'asset'),
        (select value from crud_test_context where key = 'account'),
        'buy', current_date, 10, 9
    ) returning id
) insert into crud_test_context select 'operation', id from row;

with row as (
    insert into public.investment_income (asset_id, account_id, income_type, payment_date, status, amount)
    values (
        (select value from crud_test_context where key = 'asset'),
        (select value from crud_test_context where key = 'account'),
        'dividend', current_date, 'received', 5
    ) returning id
) insert into crud_test_context select 'income', id from row;

with row as (
    insert into public.investment_targets (asset_class_id, target_percentage)
    values ((select value from crud_test_context where key = 'asset_class'), 50) returning id
) insert into crud_test_context select 'target', id from row;

with row as (
    insert into public.financial_goals (name, target_amount, current_amount)
    values ('CRUD Meta', 10000, 100) returning id
) insert into crud_test_context select 'goal', id from row;

with row as (
    insert into public.net_worth_snapshots (
        snapshot_date, accounts_value, investments_value, liabilities_value
    ) values (current_date, 1000, 100, 80) returning id
) insert into crud_test_context select 'snapshot', id from row;

update public.accounts set institution = 'CRUD Banco' where id = (select value from crud_test_context where key = 'account');
update public.credit_cards set credit_limit = 6000 where id = (select value from crud_test_context where key = 'card');
update public.categories set color = '#0f172a' where id = (select value from crud_test_context where key = 'category');
update public.tags set color = '#1e293b' where id = (select value from crud_test_context where key = 'tag');
update public.transactions set amount = 81 where id = (select value from crud_test_context where key = 'transaction');
update public.recurring_transactions set amount = 81 where id = (select value from crud_test_context where key = 'recurring');
update public.budgets set amount = 600 where id = (select value from crud_test_context where key = 'budget');
update public.asset_classes set color = '#1d4ed8' where id = (select value from crud_test_context where key = 'asset_class');
update public.assets set current_price = 11 where id = (select value from crud_test_context where key = 'asset');
update public.investment_operations set fees = 1 where id = (select value from crud_test_context where key = 'operation');
update public.investment_income set amount = 6 where id = (select value from crud_test_context where key = 'income');
update public.investment_targets set target_percentage = 55 where id = (select value from crud_test_context where key = 'target');
update public.financial_goals set current_amount = 200 where id = (select value from crud_test_context where key = 'goal');

-- Regra de exclusao usada pela aplicacao: preserva o lancamento e remove o vinculo.
update public.transactions
set recurring_transaction_id = null, recurrence_date = null
where recurring_transaction_id = (select value from crud_test_context where key = 'recurring');
delete from public.recurring_transactions where id = (select value from crud_test_context where key = 'recurring');

do $$
begin
    if not exists (
        select 1 from public.transactions
        where id = (select value from crud_test_context where key = 'transaction')
          and recurring_transaction_id is null
    ) then
        raise exception 'Falha ao preservar lancamento apos excluir recorrencia.';
    end if;
end;
$$;

delete from public.transaction_tags where transaction_id = (select value from crud_test_context where key = 'transaction');
delete from public.transactions where id = (select value from crud_test_context where key = 'transaction');
delete from public.budgets where id = (select value from crud_test_context where key = 'budget');
delete from public.investment_income where id = (select value from crud_test_context where key = 'income');
delete from public.investment_operations where id = (select value from crud_test_context where key = 'operation');
delete from public.investment_targets where id = (select value from crud_test_context where key = 'target');
delete from public.assets where id = (select value from crud_test_context where key = 'asset');
delete from public.asset_classes where id = (select value from crud_test_context where key = 'asset_class');
delete from public.net_worth_snapshots where id = (select value from crud_test_context where key = 'snapshot');
delete from public.financial_goals where id = (select value from crud_test_context where key = 'goal');
delete from public.tags where id = (select value from crud_test_context where key = 'tag');
delete from public.categories where id = (select value from crud_test_context where key = 'category');
delete from public.credit_cards where id = (select value from crud_test_context where key = 'card');
delete from public.accounts where id = (select value from crud_test_context where key = 'account');

do $$ begin raise notice 'CRUD smoke test concluido para todas as tabelas de dominio.'; end $$;
rollback;

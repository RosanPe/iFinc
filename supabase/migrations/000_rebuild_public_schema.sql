-- ATENCAO: migration destrutiva para uma instalacao nova do iFin.
-- Ela apaga todo o schema public, incluindo dados e objetos existentes, e recria
-- integralmente o banco da aplicacao. Execute apenas quando quiser zerar o projeto.

drop schema if exists public cascade;
create schema public authorization postgres;

grant usage on schema public to postgres, anon, authenticated, service_role;
grant all on schema public to postgres, service_role;

create type public.transaction_kind as enum ('income', 'expense', 'transfer');
create type public.transaction_status as enum ('pending', 'paid', 'cancelled');
create type public.recurrence_frequency as enum ('weekly', 'monthly', 'yearly');
create type public.entry_source as enum ('manual', 'import', 'ai');
create type public.investment_operation_kind as enum ('buy', 'sell');
create type public.investment_income_kind as enum (
    'dividend', 'jcp', 'interest', 'rent', 'amortization', 'other'
);
create type public.investment_income_status as enum ('expected', 'received', 'cancelled');

create table public.profiles (
    user_id uuid primary key references auth.users(id) on delete cascade,
    display_name text check (
        display_name is null or length(trim(display_name)) between 1 and 120
    ),
    base_currency char(3) not null default 'BRL',
    locale text not null default 'pt-BR',
    time_zone text not null default 'America/Sao_Paulo',
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table public.accounts (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
    name text not null check (length(trim(name)) between 1 and 80),
    account_type text not null check (
        account_type in ('checking', 'savings', 'cash', 'investment', 'other')
    ),
    institution text,
    currency char(3) not null default 'BRL',
    opening_balance numeric(18, 2) not null default 0,
    include_in_net_worth boolean not null default true,
    is_active boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique (user_id, name),
    unique (id, user_id)
);

create table public.credit_cards (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
    account_id uuid,
    name text not null check (length(trim(name)) between 1 and 80),
    brand text,
    closing_day smallint not null check (closing_day between 1 and 31),
    due_day smallint not null check (due_day between 1 and 31),
    credit_limit numeric(18, 2) not null default 0 check (credit_limit >= 0),
    is_active boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique (user_id, name),
    unique (id, user_id),
    foreign key (account_id, user_id)
        references public.accounts(id, user_id) on delete restrict
);

create table public.categories (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
    parent_category_id uuid,
    name text not null check (length(trim(name)) between 1 and 80),
    kind public.transaction_kind not null check (kind <> 'transfer'),
    color text,
    icon text,
    is_active boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique (user_id, name, kind),
    unique (id, user_id),
    unique (id, user_id, kind),
    foreign key (parent_category_id, user_id, kind)
        references public.categories(id, user_id, kind) on delete restrict,
    check (parent_category_id is null or parent_category_id <> id)
);

create table public.tags (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
    name text not null check (length(trim(name)) between 1 and 50),
    color text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique (user_id, name),
    unique (id, user_id)
);

create table public.transactions (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
    account_id uuid,
    destination_account_id uuid,
    credit_card_id uuid,
    category_id uuid,
    kind public.transaction_kind not null,
    amount numeric(18, 2) not null check (amount > 0),
    description text not null default '',
    merchant text,
    transaction_date date not null,
    due_date date,
    statement_month date,
    status public.transaction_status not null default 'paid',
    entry_source public.entry_source not null default 'manual',
    installment_group_id uuid,
    installment_number smallint,
    installment_count smallint,
    recurring_transaction_id uuid,
    recurrence_date date,
    notes text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique (id, user_id),
    foreign key (account_id, user_id)
        references public.accounts(id, user_id) on delete restrict,
    foreign key (destination_account_id, user_id)
        references public.accounts(id, user_id) on delete restrict,
    foreign key (credit_card_id, user_id)
        references public.credit_cards(id, user_id) on delete restrict,
    foreign key (category_id, user_id, kind)
        references public.categories(id, user_id, kind) on delete restrict,
    check (
        (kind = 'income' and account_id is not null and destination_account_id is null
            and credit_card_id is null)
        or
        (kind = 'expense' and num_nonnulls(account_id, credit_card_id) = 1
            and destination_account_id is null)
        or
        (kind = 'transfer' and account_id is not null and destination_account_id is not null
            and account_id <> destination_account_id and credit_card_id is null
            and category_id is null)
    ),
    check (
        (installment_group_id is null and installment_number is null and installment_count is null)
        or
        (installment_group_id is not null and installment_count > 1
            and installment_number between 1 and installment_count)
    ),
    check (statement_month is null or extract(day from statement_month) = 1),
    check (
        (recurring_transaction_id is null and recurrence_date is null)
        or (recurring_transaction_id is not null and recurrence_date is not null)
    )
);

create table public.transaction_tags (
    user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
    transaction_id uuid not null,
    tag_id uuid not null,
    created_at timestamptz not null default now(),
    primary key (transaction_id, tag_id),
    foreign key (transaction_id, user_id)
        references public.transactions(id, user_id) on delete cascade,
    foreign key (tag_id, user_id)
        references public.tags(id, user_id) on delete cascade
);

create table public.recurring_transactions (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
    account_id uuid,
    credit_card_id uuid,
    category_id uuid,
    kind public.transaction_kind not null check (kind in ('income', 'expense')),
    amount numeric(18, 2) not null check (amount > 0),
    description text not null check (length(trim(description)) > 0),
    merchant text,
    frequency public.recurrence_frequency not null,
    start_date date not null,
    end_date date,
    next_run_date date not null,
    is_active boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique (id, user_id),
    foreign key (account_id, user_id)
        references public.accounts(id, user_id) on delete restrict,
    foreign key (credit_card_id, user_id)
        references public.credit_cards(id, user_id) on delete restrict,
    foreign key (category_id, user_id, kind)
        references public.categories(id, user_id, kind) on delete restrict,
    check (end_date is null or end_date >= start_date),
    check (
        (kind = 'income' and account_id is not null and credit_card_id is null)
        or (kind = 'expense' and num_nonnulls(account_id, credit_card_id) = 1)
    )
);

alter table public.transactions
    add constraint transactions_recurring_user_fk
    foreign key (recurring_transaction_id, user_id)
    references public.recurring_transactions(id, user_id) on delete restrict;

create table public.budgets (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
    category_id uuid not null,
    period_month date not null check (extract(day from period_month) = 1),
    amount numeric(18, 2) not null check (amount > 0),
    alert_percentage numeric(5, 2) not null default 80
        check (alert_percentage > 0 and alert_percentage <= 100),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique (user_id, category_id, period_month),
    foreign key (category_id, user_id)
        references public.categories(id, user_id) on delete restrict
);

create table public.asset_classes (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
    name text not null check (length(trim(name)) between 1 and 80),
    color text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique (user_id, name),
    unique (id, user_id)
);

create table public.assets (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
    asset_class_id uuid not null,
    ticker text not null check (length(trim(ticker)) between 1 and 30),
    name text not null check (length(trim(name)) between 1 and 120),
    currency char(3) not null default 'BRL',
    current_price numeric(18, 6) check (current_price is null or current_price >= 0),
    price_updated_at timestamptz,
    is_active boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique (user_id, ticker),
    unique (id, user_id),
    foreign key (asset_class_id, user_id)
        references public.asset_classes(id, user_id) on delete restrict
);

create table public.investment_operations (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
    asset_id uuid not null,
    account_id uuid,
    kind public.investment_operation_kind not null,
    operation_date date not null,
    quantity numeric(24, 8) not null check (quantity > 0),
    unit_price numeric(18, 6) not null check (unit_price >= 0),
    fees numeric(18, 2) not null default 0 check (fees >= 0),
    entry_source public.entry_source not null default 'manual',
    notes text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique (id, user_id),
    foreign key (asset_id, user_id)
        references public.assets(id, user_id) on delete restrict,
    foreign key (account_id, user_id)
        references public.accounts(id, user_id) on delete restrict
);

create table public.investment_income (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
    asset_id uuid not null,
    account_id uuid,
    income_type public.investment_income_kind not null,
    record_date date,
    expected_payment_date date,
    payment_date date,
    status public.investment_income_status not null default 'received',
    amount numeric(18, 2) not null check (amount > 0),
    notes text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique (id, user_id),
    foreign key (asset_id, user_id)
        references public.assets(id, user_id) on delete restrict,
    foreign key (account_id, user_id)
        references public.accounts(id, user_id) on delete restrict,
    check (status <> 'received' or payment_date is not null)
);

create table public.investment_targets (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
    asset_class_id uuid,
    asset_id uuid,
    target_percentage numeric(5, 2) not null
        check (target_percentage >= 0 and target_percentage <= 100),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    check (num_nonnulls(asset_class_id, asset_id) = 1),
    foreign key (asset_class_id, user_id)
        references public.asset_classes(id, user_id) on delete cascade,
    foreign key (asset_id, user_id)
        references public.assets(id, user_id) on delete cascade
);

create table public.financial_goals (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
    name text not null check (length(trim(name)) between 1 and 120),
    target_amount numeric(18, 2) not null check (target_amount > 0),
    current_amount numeric(18, 2) not null default 0 check (current_amount >= 0),
    target_date date,
    monthly_contribution numeric(18, 2) check (
        monthly_contribution is null or monthly_contribution >= 0
    ),
    status text not null default 'active' check (status in ('active', 'completed', 'paused')),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique (id, user_id)
);

create table public.net_worth_snapshots (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
    snapshot_date date not null,
    accounts_value numeric(18, 2) not null default 0,
    investments_value numeric(18, 2) not null default 0,
    liabilities_value numeric(18, 2) not null default 0,
    total_value numeric(18, 2) generated always as
        (accounts_value + investments_value - liabilities_value) stored,
    created_at timestamptz not null default now(),
    unique (user_id, snapshot_date)
);

create unique index transactions_recurring_occurrence_unique
    on public.transactions (recurring_transaction_id, recurrence_date)
    where recurring_transaction_id is not null;
create index transactions_user_date_idx
    on public.transactions (user_id, transaction_date desc);
create index transactions_user_statement_month_idx
    on public.transactions (user_id, statement_month)
    where statement_month is not null;
create index transactions_user_installment_group_idx
    on public.transactions (user_id, installment_group_id)
    where installment_group_id is not null;
create index recurring_transactions_user_next_run_idx
    on public.recurring_transactions (user_id, next_run_date)
    where is_active;
create index budgets_user_period_idx
    on public.budgets (user_id, period_month desc);
create index investment_operations_user_asset_date_idx
    on public.investment_operations (user_id, asset_id, operation_date);
create index investment_income_user_date_idx
    on public.investment_income (user_id, coalesce(payment_date, expected_payment_date) desc);
create unique index investment_targets_class_unique
    on public.investment_targets (user_id, asset_class_id)
    where asset_class_id is not null;
create unique index investment_targets_asset_unique
    on public.investment_targets (user_id, asset_id)
    where asset_id is not null;
create index net_worth_snapshots_user_date_idx
    on public.net_worth_snapshots (user_id, snapshot_date);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
    insert into public.profiles (user_id, display_name)
    values (new.id, nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''));

    insert into public.categories (user_id, name, kind, color)
    values
        (new.id, 'Salário', 'income', '#10b981'),
        (new.id, 'Outras receitas', 'income', '#22c55e'),
        (new.id, 'Alimentação', 'expense', '#f97316'),
        (new.id, 'Moradia', 'expense', '#8b5cf6'),
        (new.id, 'Transporte', 'expense', '#3b82f6'),
        (new.id, 'Saúde', 'expense', '#ef4444'),
        (new.id, 'Lazer', 'expense', '#ec4899'),
        (new.id, 'Compras', 'expense', '#f59e0b'),
        (new.id, 'Outras despesas', 'expense', '#64748b');

    return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- Recria perfil e categorias basicas para contas Auth preservadas pelo reset.
insert into public.profiles (user_id, display_name)
select
    users.id,
    nullif(trim(users.raw_user_meta_data ->> 'display_name'), '')
from auth.users as users
on conflict (user_id) do nothing;

insert into public.categories (user_id, name, kind, color)
select users.id, defaults.name, defaults.kind::public.transaction_kind, defaults.color
from auth.users as users
cross join (
    values
        ('Salário', 'income', '#10b981'),
        ('Outras receitas', 'income', '#22c55e'),
        ('Alimentação', 'expense', '#f97316'),
        ('Moradia', 'expense', '#8b5cf6'),
        ('Transporte', 'expense', '#3b82f6'),
        ('Saúde', 'expense', '#ef4444'),
        ('Lazer', 'expense', '#ec4899'),
        ('Compras', 'expense', '#f59e0b'),
        ('Outras despesas', 'expense', '#64748b')
) as defaults(name, kind, color)
on conflict (user_id, name, kind) do nothing;

do $$
declare
    table_name text;
begin
    foreach table_name in array array[
        'profiles', 'accounts', 'credit_cards', 'categories', 'tags',
        'transactions', 'transaction_tags', 'recurring_transactions', 'budgets',
        'asset_classes', 'assets', 'investment_operations', 'investment_income',
        'investment_targets', 'financial_goals'
    ]
    loop
        execute format(
            'create trigger %I before update on public.%I '
            'for each row execute function public.set_updated_at()',
            table_name || '_set_updated_at',
            table_name
        );
    end loop;
end;
$$;

do $$
declare
    table_name text;
begin
    foreach table_name in array array[
        'profiles', 'accounts', 'credit_cards', 'categories', 'tags',
        'transactions', 'transaction_tags', 'recurring_transactions', 'budgets',
        'asset_classes', 'assets', 'investment_operations', 'investment_income',
        'investment_targets', 'financial_goals', 'net_worth_snapshots'
    ]
    loop
        execute format('alter table public.%I enable row level security', table_name);
        execute format('alter table public.%I force row level security', table_name);
        execute format(
            'create policy "Users manage own rows" on public.%I '
            'for all to authenticated using ((select auth.uid()) = user_id) '
            'with check ((select auth.uid()) = user_id)',
            table_name
        );
    end loop;
end;
$$;

revoke all on all tables in schema public from anon;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant all on all tables in schema public to service_role;
grant execute on function public.set_updated_at() to service_role;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
grant execute on function public.handle_new_user() to service_role;

alter default privileges for role postgres in schema public
    revoke all on tables from anon;
alter default privileges for role postgres in schema public
    grant select, insert, update, delete on tables to authenticated;
alter default privileges for role postgres in schema public
    grant all on tables to service_role;

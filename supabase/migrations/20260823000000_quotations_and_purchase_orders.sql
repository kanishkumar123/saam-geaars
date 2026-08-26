-- Quotation and Purchase Order documents.
-- Standalone from job_cards/projects/companies — these are typed-by-hand
-- documents whose only purpose is to be stored and exported as PDF.

create table public.quotations (
  id uuid primary key default gen_random_uuid(),
  quotation_number text not null,
  quotation_date date not null,
  client_name text not null,
  client_address text,
  staff_name text,
  subject text check (subject in ('Sprockets', 'Gears', 'Shafts', 'Coupling')),
  enquiry_number text,
  delivery_time text,
  created_at timestamptz not null default now(),
  created_by uuid references public.profiles(id)
);

create table public.quotation_items (
  id uuid primary key default gen_random_uuid(),
  quotation_id uuid not null references public.quotations(id) on delete cascade,
  item_description text not null,
  moc text,
  quantity numeric not null default 0,
  unit_rate numeric not null default 0,
  sort_order int not null default 0
);

create table public.purchase_order_documents (
  id uuid primary key default gen_random_uuid(),
  quotation_number text,
  po_date date not null,
  client_name text not null,
  client_address text,
  delivery_date date,
  created_at timestamptz not null default now(),
  created_by uuid references public.profiles(id)
);

create table public.purchase_order_document_items (
  id uuid primary key default gen_random_uuid(),
  po_document_id uuid not null references public.purchase_order_documents(id) on delete cascade,
  item_description text not null,
  quantity numeric not null default 0,
  unit_rate numeric not null default 0,
  sort_order int not null default 0
);

create index quotation_items_quotation_id_idx on public.quotation_items(quotation_id);
create index po_document_items_po_document_id_idx on public.purchase_order_document_items(po_document_id);

alter table public.quotations enable row level security;
alter table public.quotation_items enable row level security;
alter table public.purchase_order_documents enable row level security;
alter table public.purchase_order_document_items enable row level security;

-- quotations: same access shape as job_cards — admin+staff can read, admin writes.
create policy quotations_select on public.quotations for select using (is_admin() or is_staff());
create policy quotations_insert on public.quotations for insert with check (is_admin());
create policy quotations_update on public.quotations for update using (is_admin()) with check (is_admin());
create policy quotations_delete on public.quotations for delete using (is_admin());

create policy quotation_items_select on public.quotation_items for select using (is_admin() or is_staff());
create policy quotation_items_insert on public.quotation_items for insert with check (is_admin());
create policy quotation_items_update on public.quotation_items for update using (is_admin()) with check (is_admin());
create policy quotation_items_delete on public.quotation_items for delete using (is_admin());

create policy po_documents_select on public.purchase_order_documents for select using (is_admin() or is_staff());
create policy po_documents_insert on public.purchase_order_documents for insert with check (is_admin());
create policy po_documents_update on public.purchase_order_documents for update using (is_admin()) with check (is_admin());
create policy po_documents_delete on public.purchase_order_documents for delete using (is_admin());

create policy po_document_items_select on public.purchase_order_document_items for select using (is_admin() or is_staff());
create policy po_document_items_insert on public.purchase_order_document_items for insert with check (is_admin());
create policy po_document_items_update on public.purchase_order_document_items for update using (is_admin()) with check (is_admin());
create policy po_document_items_delete on public.purchase_order_document_items for delete using (is_admin());

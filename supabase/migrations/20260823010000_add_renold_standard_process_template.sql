alter table public.process_templates
  drop constraint process_templates_name_check;

alter table public.process_templates
  add constraint process_templates_name_check
  check (name = any (array['standard'::text, 'non-standard'::text, 'Renold Standard'::text]));

with new_template as (
  insert into public.process_templates (name)
  values ('Renold Standard')
  returning id
)
insert into public.process_template_stages (template_id, stage_order, stage_type)
select new_template.id, s.stage_order, s.stage_type
from new_template,
  (values
    (1, 'raw_material'),
    (2, 'machining'),
    (3, 'teeth_cutting'),
    (4, 'hardening'),
    (5, 'final_inspection'),
    (6, 'packaging_dispatch')
  ) as s(stage_order, stage_type);

-- Reference-only seed data. Production must not contain synthetic ventures or outcomes.
insert into public.plans(id,name,description,indicative_price_min,indicative_price_max) values
('free-founder','Free Founder','Core readiness profile and limited private evidence storage',0,0),
('founder-pro','Founder Pro','Expanded evidence, guided reviews, and collaboration',499,999),
('readiness-sprint','Pitch Readiness Sprint','Separately scoped hands-on readiness engagement',null,null),
('institution-pilot','Institutional Pilot','Cohort workflow and pilot analytics',25000,75000),
('supporter-pilot','Investor and Mentor Pilot','Free access for invited pilot supporters',0,0)
on conflict(id) do nothing;

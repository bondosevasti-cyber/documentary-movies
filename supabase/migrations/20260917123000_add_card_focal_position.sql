-- Independent crop position for the image shown on homepage movie cards.
alter table public.movies
  add column if not exists card_pos_x integer not null default 50,
  add column if not exists card_pos_y integer not null default 50;

alter table public.movies
  add constraint movies_card_pos_x_range check (card_pos_x between 0 and 100),
  add constraint movies_card_pos_y_range check (card_pos_y between 0 and 100);

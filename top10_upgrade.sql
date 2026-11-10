-- Run the entire file in Supabase SQL Editor.
begin;

alter table public.movies
    add column if not exists top_10_position integer;

-- Replace any legacy single-column rank check (including a 1–5 limit).
-- The new constraints validate existing data and roll back the migration
-- if a position is out of range or occupied by more than one title.
do $$
declare
    rank_check record;
begin
    for rank_check in
        select constraint_info.conname
        from pg_catalog.pg_constraint as constraint_info
        join pg_catalog.pg_attribute as rank_column
            on rank_column.attrelid = constraint_info.conrelid
           and rank_column.attname = 'top_10_position'
           and constraint_info.conkey = array[rank_column.attnum]
        where constraint_info.conrelid = 'public.movies'::regclass
          and constraint_info.contype = 'c'
    loop
        execute format('alter table public.movies drop constraint %I', rank_check.conname);
    end loop;
end
$$;

alter table public.movies
    add constraint movies_top10_position_range check (top_10_position between 1 and 10);

create unique index if not exists movies_top10_position_unique
    on public.movies (top_10_position)
    where top_10_position is not null;

create or replace function public.set_movie_top10_position(p_position integer, p_movie_id uuid)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
    if p_position is null or p_position not between 1 and 10 then
        raise exception 'TOP 10 position must be between 1 and 10.' using errcode = '22023';
    end if;

    -- Serialize ranking changes. A failed assignment rolls back the clearing.
    perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('public.movies.top_10_position', 0));

    update public.movies
       set top_10_position = null
     where top_10_position = p_position
       and id is distinct from p_movie_id;

    if p_movie_id is not null then
        update public.movies
           set top_10_position = p_position
         where id = p_movie_id;
        if not found then
            raise exception 'Movie not found or not editable.' using errcode = 'P0002';
        end if;
    end if;
end
$$;

revoke execute on function public.set_movie_top10_position(integer, uuid) from public, anon, authenticated;
grant execute on function public.set_movie_top10_position(integer, uuid) to authenticated;

notify pgrst, 'reload schema';

commit;

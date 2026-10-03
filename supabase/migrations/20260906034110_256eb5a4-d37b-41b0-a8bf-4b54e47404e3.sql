create or replace function public.public_app_stats()
returns json
language sql
stable
security definer
set search_path = public
as $$
  select json_build_object(
    'users', (select count(*) from public.profiles),
    'mood_checkins', (select count(*) from public.mood_checkins),
    'daily_checkins', (select count(*) from public.daily_checkins),
    'haven_messages', (select count(*) from public.haven_chat_messages),
    'haven_memories', (select count(*) from public.haven_memories),
    'rituals_completed', (select count(*) from public.ritual_completions),
    'symptom_sessions', (select count(*) from public.symptom_sessions),
    'reviews', (select count(*) from public.reviews),
    'avg_rating', (select coalesce(round(avg(rating)::numeric, 2), 0) from public.reviews),
    'avg_mood_score', (select coalesce(round(avg(mood_score)::numeric, 2), 0) from public.daily_checkins),
    'avg_anxiety', (select coalesce(round(avg(anxiety_score)::numeric, 2), 0) from public.mood_checkins where anxiety_score is not null),
    'first_week_mood', (select coalesce(round(avg(mood_score)::numeric, 2), 0) from (
        select d.mood_score from public.daily_checkins d
        join (select user_id, min(day) as start_day from public.daily_checkins group by user_id) f
          on f.user_id = d.user_id
        where d.day < f.start_day + 7
      ) a),
    'later_week_mood', (select coalesce(round(avg(mood_score)::numeric, 2), 0) from (
        select d.mood_score from public.daily_checkins d
        join (select user_id, min(day) as start_day from public.daily_checkins group by user_id) f
          on f.user_id = d.user_id
        where d.day >= f.start_day + 7
      ) b),
    'mood_trend', (
      select coalesce(json_agg(t order by t.day), '[]'::json) from (
        select day::text as day, round(avg(mood_score)::numeric, 2) as score, count(*) as checkins
        from public.daily_checkins
        where day >= ((now() at time zone 'utc')::date - 29)
        group by day
      ) t
    )
  );
$$;

revoke all on function public.public_app_stats() from public;
grant execute on function public.public_app_stats() to anon, authenticated, service_role;
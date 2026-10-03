Big batch of adjustments — grouping them so we can ship the high-value ones first and flag the ones that need a bit more setup.

## Group 1 — Quick copy & safety wins (ship first)
1. **Landing page problem statement** — rewrite to match the current app (no wearable/monitor/vitals language anywhere). Sweep the whole landing + meta tags for any leftover wearable words.
2. **Privacy note** — add a soft "Your journal entries stay private 🔒" line on landing, auth, mood, and Haven💫 chat intro.
3. **Haven💫 medical disclaimer** — small persistent footer inside Haven💫 and Symptoms: "Haven💫 is a supportive companion, not a doctor."
4. **Crisis resources** — detect urgent language (self-harm, suicide, "hurt myself", "can't go on", etc.) in Haven💫 and Mood chat. When detected, show a soft pink Crisis Care card with 988 (US), Crisis Text Line (text HOME to 741741), and international link. Also add it as a permanent link at the bottom of Haven💫.
5. **Symptom severity flag** — when the AI response contains red-flag terms (chest pain, trouble breathing, severe bleeding, etc.), show an "This sounds serious — please contact a healthcare provider or call your local emergency number" banner.

## Group 2 — Personalization
6. **Personalized tips & quotes** — pass profile (name, hobbies, activities, gender, routine) into the AI system prompts for Haven💫, Coach, mood tips, and symptom advice. Daily quote picker weights by hobbies (e.g. someone who likes art gets more creative-themed quotes).
7. **Haven💫 memory** — new `haven_memory` table storing short "what helps this user" notes. After each Haven session, a lightweight AI call extracts 1-2 insights ("finds journaling calming", "gets anxious about work meetings"). Loaded into system prompt on next chat.

## Group 3 — Progress & delight
8. **Weekly flower garden** — on Journey page, show all 7 days as a row of mini MoodFlowers (empty pot for days with no check-in).
9. **Achievements/badges** — new panel on dashboard + Journey:
   - 🔥 7-day water goal
   - 🌟 3 great days in a row
   - 💧 5 water logs
   - 🌙 7 nights ≥7h sleep
   - 🌸 First flower bloomed
   - 💬 First Haven chat
   - 📓 10 check-ins logged
10. **Loading blossoms** — replace generic spinners with a small animated pink flower component.

## Group 4 — Auth polish
11. **Forgot password** — "Forgot password?" link on Log in → sends reset email → new public `/reset-password` route where user sets a new password. (Supabase's email reset already sends a secure one-time link, which is the standard "verification" flow; a separate 6-digit code isn't natively supported without custom infra — I'll use the standard secure link and clearly explain it in the UI.)
12. **Remember-me mobile polish** — persist immediately, avoid the beforeunload race on mobile Safari.

## Group 5 — Account
13. **Delete my account** — button in Profile with a two-step confirm modal. Server function that deletes profile + all user rows and calls admin API to remove the auth user, then signs out.

## Group 6 — Friends & sharing (biggest new feature)
14. **Friends system** — new tables `friendships` (user_a, user_b, status: pending/accepted/declined, requested_by). New /friends page: search users by display_name/username, send request, accept/decline incoming, list of friends. Friends can view each other's *streak, badges, and today's flower only* (not journal notes, not chat, not symptom data) — this keeps private stuff private.

## Group 7 — Notifications (needs your call)
15. **Gentle reminders** — three options:
   - (a) **In-app only** — soft banner on dashboard if you haven't logged water / moved / checked in today. Zero setup, never annoying, works everywhere. ← my recommendation
   - (b) **Web Push notifications** — real notifications even when app closed. Requires user permission + PWA install + a small service worker + a scheduled server job. More setup, more friction, doesn't work well on iOS unless installed to home screen.
   - (c) **Email reminders** — daily/weekly digest email. Needs email domain setup.

## What I need from you
- **Notifications**: which of (a), (b), (c) — or a combo? I recommend starting with (a) in-app gentle nudges.
- **Password reset**: OK with the standard secure email link (industry standard, what Gmail/Instagram use), or do you specifically want a 6-digit code typed into the app? The link is simpler and safer; the code needs extra custom email + storage infra.
- **Friends privacy default**: do friends see (streak + badges + today's flower) only, or would you also like to share weekly garden? I'd default to the smaller set for privacy.

## Suggested build order
If you want it all, I'll ship in this order across a few turns so nothing breaks:
1. Groups 1 + 2 + 3 + 4 + 5 (copy, safety, personalization, badges, weekly garden, blossoms, forgot password, delete account) — one batch.
2. Group 6 (friends system) — second batch, since it's a whole new feature with tables and UI.
3. Group 7 (notifications) — third batch, once you've picked the flavor.

Sound good? Want me to just go ahead with my recommendations (in-app nudges, secure reset link, friends see streak+badges+today's flower) so I can start building right away?
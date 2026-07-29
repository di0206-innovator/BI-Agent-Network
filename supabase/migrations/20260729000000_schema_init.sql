-- ═══════════════════════════════════════════════════════════════
--  Stratify — Complete Production Supabase Migration
--  Covers all 16 platform entity tables, RLS security policies,
--  indexes, triggers, and Data API Grants.
-- ═══════════════════════════════════════════════════════════════

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. USERS & PROFILES
CREATE TABLE IF NOT EXISTS users (
    id              TEXT        PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    email           TEXT        UNIQUE NOT NULL,
    name            TEXT        NOT NULL DEFAULT '',
    password_hash   TEXT,
    email_verified  BOOLEAN     NOT NULL DEFAULT false,
    role            TEXT        NOT NULL DEFAULT 'founder', -- 'founder', 'vc', 'institution', 'admin'
    is_firebase     BOOLEAN     NOT NULL DEFAULT false,
    bio             TEXT        DEFAULT '',
    skills          TEXT        DEFAULT '',
    linkedin_url    TEXT        DEFAULT '',
    availability    TEXT        DEFAULT '',
    workspace_profile JSONB     DEFAULT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS users_email_lower_idx ON users (LOWER(email));
CREATE INDEX IF NOT EXISTS users_role_idx        ON users (role);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS users_select_all ON users;
CREATE POLICY users_select_all ON users FOR SELECT TO authenticated, anon USING (true);

DROP POLICY IF EXISTS users_update_self ON users;
CREATE POLICY users_update_self ON users FOR UPDATE TO authenticated USING ((select auth.uid()::text) = id) WITH CHECK ((select auth.uid()::text) = id);

-- 2. STARTUPS GRAPH
CREATE TABLE IF NOT EXISTS startups (
    id                    TEXT        PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    owner_id              TEXT        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name                  TEXT        NOT NULL DEFAULT 'My Startup',
    logo_url              TEXT        DEFAULT '',
    pitch                 TEXT        NOT NULL DEFAULT '',
    problem               TEXT        NOT NULL DEFAULT '',
    solution              TEXT        NOT NULL DEFAULT '',
    stage                 TEXT        NOT NULL DEFAULT 'idea',
    industry              TEXT        NOT NULL DEFAULT '',
    geography             TEXT        NOT NULL DEFAULT '',
    team_status           TEXT        NOT NULL DEFAULT '',
    traction              TEXT        NOT NULL DEFAULT '',
    needs                 TEXT        NOT NULL DEFAULT '',
    tech_stack            TEXT        NOT NULL DEFAULT '',
    score                 INTEGER     NOT NULL DEFAULT 0,
    deck_url              TEXT        DEFAULT '',
    website_url           TEXT        DEFAULT '',
    revenue               TEXT        DEFAULT '',
    funding_raised        TEXT        DEFAULT '',
    validation_score      INTEGER     DEFAULT NULL,
    execution_readiness   INTEGER     DEFAULT NULL,
    fundraising_readiness INTEGER     DEFAULT NULL,
    founder_market_fit    INTEGER     DEFAULT NULL,
    created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS startups_owner_id_idx ON startups (owner_id);
CREATE INDEX IF NOT EXISTS startups_score_idx    ON startups (score DESC);
CREATE INDEX IF NOT EXISTS startups_industry_idx ON startups (LOWER(industry));

ALTER TABLE startups ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS startups_select_all ON startups;
CREATE POLICY startups_select_all ON startups FOR SELECT TO authenticated, anon USING (true);

DROP POLICY IF EXISTS startups_insert_auth ON startups;
CREATE POLICY startups_insert_auth ON startups FOR INSERT TO authenticated WITH CHECK ((select auth.uid()::text) = owner_id);

DROP POLICY IF EXISTS startups_update_owner ON startups;
CREATE POLICY startups_update_owner ON startups FOR UPDATE TO authenticated USING ((select auth.uid()::text) = owner_id) WITH CHECK ((select auth.uid()::text) = owner_id);

-- 3. DECISIONS (Founder Memory & Strategic Rationale)
CREATE TABLE IF NOT EXISTS decisions (
    id              TEXT        PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    startup_id      TEXT        REFERENCES startups(id) ON DELETE CASCADE,
    author_id       TEXT        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title           TEXT        NOT NULL,
    context         TEXT        NOT NULL DEFAULT '',
    outcome         TEXT        NOT NULL DEFAULT '',
    status          TEXT        NOT NULL DEFAULT 'active',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS decisions_startup_id_idx ON decisions (startup_id);
CREATE INDEX IF NOT EXISTS decisions_author_id_idx  ON decisions (author_id);
CREATE INDEX IF NOT EXISTS decisions_created_at_idx ON decisions (created_at DESC);

ALTER TABLE decisions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS decisions_select_auth ON decisions;
CREATE POLICY decisions_select_auth ON decisions FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS decisions_insert_auth ON decisions;
CREATE POLICY decisions_insert_auth ON decisions FOR INSERT TO authenticated WITH CHECK ((select auth.uid()::text) = author_id);

-- 4. TIMELINE EVENTS
CREATE TABLE IF NOT EXISTS timeline_events (
    id              TEXT        PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    startup_id      TEXT        REFERENCES startups(id) ON DELETE CASCADE,
    actor_id        TEXT        REFERENCES users(id) ON DELETE SET NULL,
    event_type      TEXT        NOT NULL,
    title           TEXT        NOT NULL,
    description     TEXT        NOT NULL DEFAULT '',
    metadata        JSONB       NOT NULL DEFAULT '{}'::jsonb,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS timeline_events_startup_id_idx ON timeline_events (startup_id);
CREATE INDEX IF NOT EXISTS timeline_events_created_at_idx ON timeline_events (created_at DESC);

ALTER TABLE timeline_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS timeline_events_select ON timeline_events;
CREATE POLICY timeline_events_select ON timeline_events FOR SELECT TO authenticated, anon USING (true);

-- 5. REPORTS & DILIGENCE BRIEFS
CREATE TABLE IF NOT EXISTS reports (
    id                TEXT        PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    owner_id          TEXT        REFERENCES users(id) ON DELETE SET NULL,
    title             TEXT        NOT NULL,
    mode              TEXT        NOT NULL DEFAULT 'diligence',
    intelligence_mode TEXT        NOT NULL DEFAULT 'live',
    model             TEXT        DEFAULT 'gemini-3.6-flash',
    markdown          TEXT        NOT NULL DEFAULT '',
    sections          JSONB       DEFAULT '{}'::jsonb,
    section_order     JSONB       DEFAULT '[]'::jsonb,
    sources           JSONB       DEFAULT '[]'::jsonb,
    founder_context   JSONB       DEFAULT '{}'::jsonb,
    generated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS reports_owner_id_idx     ON reports (owner_id);
CREATE INDEX IF NOT EXISTS reports_generated_at_idx ON reports (generated_at DESC);

ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS reports_select ON reports;
CREATE POLICY reports_select ON reports FOR SELECT TO authenticated, anon USING (true);

-- 6. PUBLIC PITCH BRIEFS
CREATE TABLE IF NOT EXISTS briefs (
    id              TEXT        PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    startup_id      TEXT        NOT NULL REFERENCES startups(id) ON DELETE CASCADE,
    title           TEXT        NOT NULL,
    content         TEXT        NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS briefs_startup_idx ON briefs (startup_id);

ALTER TABLE briefs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS briefs_select ON briefs;
CREATE POLICY briefs_select ON briefs FOR SELECT TO authenticated, anon USING (true);

-- 7. MARKET SIGNALS CACHE
CREATE TABLE IF NOT EXISTS signals_cache (
    id          TEXT        PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    industry    TEXT        NOT NULL,
    geography   TEXT        NOT NULL,
    signals     JSONB       NOT NULL DEFAULT '[]'::jsonb,
    mode        TEXT        NOT NULL DEFAULT 'live',
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (industry, geography)
);

CREATE INDEX IF NOT EXISTS signals_cache_lookup_idx ON signals_cache (LOWER(industry), LOWER(geography));

ALTER TABLE signals_cache ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS signals_cache_select ON signals_cache;
CREATE POLICY signals_cache_select ON signals_cache FOR SELECT TO authenticated, anon USING (true);

-- 8. ECOSYSTEM POSTS & EXECUTION FEED
CREATE TABLE IF NOT EXISTS posts (
    id              TEXT        PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    startup_id      TEXT        REFERENCES startups(id) ON DELETE CASCADE,
    author_id       TEXT        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content         TEXT        NOT NULL,
    type            TEXT        NOT NULL DEFAULT 'update',
    metadata        JSONB       DEFAULT '{}'::jsonb,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS posts_startup_id_idx ON posts (startup_id);
CREATE INDEX IF NOT EXISTS posts_created_at_idx ON posts (created_at DESC);

ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS posts_select ON posts;
CREATE POLICY posts_select ON posts FOR SELECT TO authenticated, anon USING (true);

-- 9. BOUNTIES
CREATE TABLE IF NOT EXISTS bounties (
    id              TEXT        PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    startup_id      TEXT        REFERENCES startups(id) ON DELETE CASCADE,
    title           TEXT        NOT NULL,
    description     TEXT        NOT NULL DEFAULT '',
    points          INTEGER     NOT NULL DEFAULT 10,
    reward          TEXT        NOT NULL DEFAULT '',
    status          TEXT        NOT NULL DEFAULT 'open',
    submissions     JSONB       DEFAULT '[]'::jsonb,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS bounties_startup_idx ON bounties (startup_id);
CREATE INDEX IF NOT EXISTS bounties_status_idx ON bounties (status);

ALTER TABLE bounties ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS bounties_select ON bounties;
CREATE POLICY bounties_select ON bounties FOR SELECT TO authenticated, anon USING (true);

-- 10. OPPORTUNITIES & GRANTS
CREATE TABLE IF NOT EXISTS opportunities (
    id              TEXT        PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    title           TEXT        NOT NULL,
    type            TEXT        NOT NULL DEFAULT 'grant',
    organization    TEXT        NOT NULL DEFAULT '',
    description     TEXT        NOT NULL DEFAULT '',
    geography       TEXT        NOT NULL DEFAULT '',
    industries      TEXT        NOT NULL DEFAULT '',
    stages          TEXT        NOT NULL DEFAULT '',
    deadline        TEXT,
    link            TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS opportunities_type_idx ON opportunities (type);

ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS opportunities_select ON opportunities;
CREATE POLICY opportunities_select ON opportunities FOR SELECT TO authenticated, anon USING (true);

-- 11. CAP TABLES & EQUITY PLANNERS
CREATE TABLE IF NOT EXISTS cap_tables (
    id              TEXT        PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    startup_id      TEXT        NOT NULL REFERENCES startups(id) ON DELETE CASCADE,
    version_name    TEXT        NOT NULL DEFAULT 'Current',
    state           JSONB       NOT NULL DEFAULT '{}'::jsonb,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS cap_tables_startup_idx ON cap_tables (startup_id);

ALTER TABLE cap_tables ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS cap_tables_select ON cap_tables;
CREATE POLICY cap_tables_select ON cap_tables FOR SELECT TO authenticated USING (true);

-- 12. INVESTOR GRAPH
CREATE TABLE IF NOT EXISTS investor_graph (
    id              TEXT        PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    user_id         TEXT        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    organization    TEXT        NOT NULL DEFAULT '',
    thesis          JSONB       NOT NULL DEFAULT '{}'::jsonb,
    stages          TEXT[]      NOT NULL DEFAULT '{}',
    ticket_size     TEXT        NOT NULL DEFAULT '',
    sectors         TEXT[]      NOT NULL DEFAULT '{}',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS investor_graph_user_idx ON investor_graph (user_id);

ALTER TABLE investor_graph ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS investor_graph_select ON investor_graph;
CREATE POLICY investor_graph_select ON investor_graph FOR SELECT TO authenticated, anon USING (true);

-- 13. ECOSYSTEM GRAPH (INSTITUTIONS)
CREATE TABLE IF NOT EXISTS ecosystem_graph (
    id              TEXT        PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    user_id         TEXT        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    institution     TEXT        NOT NULL DEFAULT '',
    region          TEXT        NOT NULL DEFAULT '',
    mandate         TEXT        NOT NULL DEFAULT '',
    active_programs JSONB       NOT NULL DEFAULT '[]'::jsonb,
    health_metrics  JSONB       NOT NULL DEFAULT '{}'::jsonb,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ecosystem_graph_user_idx ON ecosystem_graph (user_id);

ALTER TABLE ecosystem_graph ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS ecosystem_graph_select ON ecosystem_graph;
CREATE POLICY ecosystem_graph_select ON ecosystem_graph FOR SELECT TO authenticated, anon USING (true);

-- 14. GRANULAR FOUNDER MEMORIES
CREATE TABLE IF NOT EXISTS founder_memories (
    id              TEXT        PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    founder_id      TEXT        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    startup_id      TEXT        REFERENCES startups(id) ON DELETE CASCADE,
    title           TEXT        NOT NULL,
    content         TEXT        NOT NULL DEFAULT '',
    memory_type     TEXT        NOT NULL DEFAULT 'note',
    impact_tags     TEXT[]      DEFAULT '{}',
    entry_date      DATE        NOT NULL DEFAULT CURRENT_DATE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS founder_memories_founder_idx ON founder_memories (founder_id);
CREATE INDEX IF NOT EXISTS founder_memories_startup_idx ON founder_memories (startup_id);

ALTER TABLE founder_memories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS founder_memories_select ON founder_memories;
CREATE POLICY founder_memories_select ON founder_memories FOR SELECT TO authenticated USING ((select auth.uid()::text) = founder_id);

-- 15. WAITLIST SIGNUPS
CREATE TABLE IF NOT EXISTS waitlist (
    id              TEXT        PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    name            TEXT        NOT NULL,
    email           TEXT        NOT NULL,
    plan            TEXT        NOT NULL DEFAULT 'general',
    message         TEXT        DEFAULT '',
    status          TEXT        NOT NULL DEFAULT 'pending',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS waitlist_email_idx ON waitlist (LOWER(email));
CREATE INDEX IF NOT EXISTS waitlist_created_at_idx ON waitlist (created_at DESC);

ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS waitlist_insert_anon ON waitlist;
CREATE POLICY waitlist_insert_anon ON waitlist FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS waitlist_select_auth ON waitlist;
CREATE POLICY waitlist_select_auth ON waitlist FOR SELECT TO authenticated USING (true);

-- 16. WALKTHROUGH BOOKINGS (Executive 1-on-1 Demo Calls)
CREATE TABLE IF NOT EXISTS walkthrough_bookings (
    id                 TEXT        PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    role               TEXT        NOT NULL DEFAULT 'founder',
    name               TEXT        NOT NULL,
    email              TEXT        NOT NULL,
    phone              TEXT        DEFAULT '',
    organization       TEXT        NOT NULL DEFAULT '',
    website            TEXT        DEFAULT '',
    stage              TEXT        DEFAULT '',
    objectives         JSONB       DEFAULT '[]'::jsonb,
    help_details       TEXT        DEFAULT '',
    selected_date      TEXT        NOT NULL,
    selected_time_slot TEXT        NOT NULL,
    timezone           TEXT        NOT NULL DEFAULT 'EST',
    meet_platform      TEXT        NOT NULL DEFAULT 'Google Meet',
    status             TEXT        NOT NULL DEFAULT 'scheduled',
    created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS walkthrough_bookings_email_idx ON walkthrough_bookings (LOWER(email));
CREATE INDEX IF NOT EXISTS walkthrough_bookings_date_idx ON walkthrough_bookings (selected_date);

ALTER TABLE walkthrough_bookings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS walkthrough_insert_anon ON walkthrough_bookings;
CREATE POLICY walkthrough_insert_anon ON walkthrough_bookings FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS walkthrough_select_auth ON walkthrough_bookings;
CREATE POLICY walkthrough_select_auth ON walkthrough_bookings FOR SELECT TO authenticated USING (true);

-- DATA API GRANTS
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

---
name: database
description: Schema design, migration strategies, indexing conventions, query patterns, and ORM usage for TopNetworks properties. Covers Supabase PostgreSQL (route-genius), Cloud SQL PostgreSQL (emailgenius), and BigQuery (arbitrage-dashboard). Use when designing schemas, writing migrations, or building data access layers.
---

# Database — TopNetworks, Inc.

This skill governs all database work across TopNetworks properties. Derived from route-genius (Supabase PostgreSQL + RLS), emailgenius-broadcasts-generator (Cloud SQL PostgreSQL), and arbitrage-manager-dashboard (BigQuery). Content platform properties (topfinanzas-\*, budgetbee-next, kardtrust) have no database — content is hardcoded in React components.

---

## Scope

**Use for:** Schema design, SQL migrations, RLS policies, query patterns, data access layer (DAL) functions, indexing, Supabase client usage, BigQuery analytics queries, and ORM/query builder patterns.

**Not for:** Frontend data display (see `frontend` skill), API route wiring (see `backend` skill), or authentication tables managed by Better Auth (those are auto-migrated — don't modify manually).

---

## Database by Project

| Project                                                  | Database       | Host             | ORM / Client                     |
| -------------------------------------------------------- | -------------- | ---------------- | -------------------------------- |
| route-genius                                             | PostgreSQL 15+ | Supabase         | `@supabase/supabase-js`          |
| emailgenius-broadcasts-generator                         | PostgreSQL     | Google Cloud SQL | `pg` (node-postgres)             |
| arbitrage-manager-dashboard                              | BigQuery       | Google Cloud     | `google-cloud/bigquery` (Python) |
| Content platforms (topfinanzas-\*, budgetbee, kardtrust) | None           | N/A              | No DB — hardcoded content        |

---

## Supabase PostgreSQL (route-genius)

### Schema Design Principles

1. Every table has a `user_id` column (UUID, references `auth.users`) for multi-tenancy
2. Every table has `created_at TIMESTAMPTZ DEFAULT NOW()` and `updated_at TIMESTAMPTZ DEFAULT NOW()`
3. Primary keys use UUID (`gen_random_uuid()` or `uuid_generate_v4()`)
4. Use JSONB for flexible/variable data structures (tags, rotation_rules)
5. Always enable RLS on tables containing user data

### Production Schema (route-genius)

```sql
-- Migration 001: Create core tables
CREATE TABLE IF NOT EXISTS projects (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL,
  workspace_id  UUID,
  name          TEXT NOT NULL,
  title         TEXT,
  description   TEXT,
  tags          JSONB DEFAULT '[]'::jsonb,
  archived      BOOLEAN DEFAULT FALSE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS links (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID NOT NULL,
  project_id            UUID REFERENCES projects(id) ON DELETE CASCADE,
  name                  TEXT NOT NULL,
  main_destination_url  TEXT NOT NULL,
  rotation_rules        JSONB DEFAULT '[]'::jsonb,
  status                TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'disabled')),
  rotation_enabled      BOOLEAN DEFAULT TRUE,
  archived              BOOLEAN DEFAULT FALSE,
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS click_events (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  link_id                 UUID NOT NULL REFERENCES links(id) ON DELETE CASCADE,
  resolved_destination_url TEXT NOT NULL,
  went_to_main            BOOLEAN NOT NULL,
  user_agent              TEXT,
  ip_address              TEXT,
  referer                 TEXT,
  country_code            CHAR(2),
  created_at              TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS rate_limits (
  key          TEXT PRIMARY KEY,
  count        INTEGER DEFAULT 1,
  window_start TIMESTAMPTZ DEFAULT NOW()
);
```

```sql
-- Migration 002: Add user_id ownership and enable RLS
-- Enable RLS on user-owned tables
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE links ENABLE ROW LEVEL SECURITY;

-- Deny-all default (no permissive policies for anon or cross-tenant authenticated)
-- Application layer enforces user_id filtering — RLS is defense-in-depth only
-- Service role key bypasses RLS for authorized server operations
```

### Indexing Conventions

```sql
-- Index user_id on all multi-tenant tables (most common query filter)
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_links_user_id ON links(user_id);
CREATE INDEX idx_links_project_id ON links(project_id);

-- Index time-series queries
CREATE INDEX idx_click_events_link_id_created_at ON click_events(link_id, created_at DESC);
CREATE INDEX idx_click_events_created_at ON click_events(created_at DESC);

-- Index frequently filtered columns
CREATE INDEX idx_projects_archived ON projects(archived);
CREATE INDEX idx_links_archived ON links(archived);
CREATE INDEX idx_links_status ON links(status);
```

### Supabase Client — Singleton Pattern

```typescript
// lib/supabase.ts — ALWAYS use singleton, never create multiple clients
import { createClient, SupabaseClient } from "@supabase/supabase-js";

let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (!supabaseInstance) {
    supabaseInstance = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!, // Service role — bypasses RLS
      {
        auth: { persistSession: false }, // Server-side: no session persistence
      },
    );
  }
  return supabaseInstance;
}

export const supabase = getSupabaseClient();
```

### Data Access Layer (DAL) Pattern

All database queries live in `lib/mock-data.ts` (route-genius) or an equivalent DAL file. **Never write Supabase queries directly in Server Actions or API routes.**

```typescript
// lib/mock-data.ts
import { supabase } from "./supabase";
import type { Project, Link } from "./types";

// ✅ Always filter by user_id — NEVER query cross-user data
export async function getAllProjects(userId: string): Promise<Project[]> {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("user_id", userId) // MANDATORY — application-level ownership check
    .eq("archived", false)
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Failed to fetch projects: ${error.message}`);
  return data ?? [];
}

export async function createProject(
  project: Omit<Project, "id" | "user_id" | "created_at" | "updated_at">,
  userId: string,
): Promise<Project> {
  const { data, error } = await supabase
    .from("projects")
    .insert({ ...project, user_id: userId })
    .select()
    .single();

  if (error) throw new Error(`Failed to create project: ${error.message}`);
  return data;
}

// Exception: redirect lookup doesn't filter by user_id (public endpoint)
export async function getLinkForRedirect(linkId: string): Promise<Link | null> {
  const { data } = await supabase
    .from("links")
    .select("*")
    .eq("id", linkId)
    .eq("status", "active")
    .single();
  return data;
}
```

### Supabase RPC Functions

Custom PostgreSQL functions exposed via Supabase RPC:

```typescript
// Sliding window rate limiting
const { data } = await supabase.rpc("check_rate_limit", {
  p_key: `redirect:${ip}`,
  p_window_seconds: 10,
  p_max_requests: 100,
});

// Time-series aggregation
const { data } = await supabase.rpc("get_clicks_by_day", {
  p_link_id: linkId,
  p_start_date: startDate,
  p_end_date: endDate,
});

// Geographic distribution
const { data } = await supabase.rpc("get_clicks_by_country", {
  p_link_id: linkId,
});
```

### Supabase Realtime

Used for live click counter in route-genius:

```typescript
// In Client Component
import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase";

export function RealtimeClickCounter({ linkId }: { linkId: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const supabase = getSupabaseClient();
    const channel = supabase
      .channel(`clicks:${linkId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "click_events",
          filter: `link_id=eq.${linkId}`,
        },
        () => setCount((c) => c + 1),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [linkId]);
}
```

---

## JSONB Column Patterns

JSONB is used for flexible schemas (tags, rotation rules):

```typescript
// TypeScript types for JSONB columns
interface RotationRule {
  id: string; // crypto.randomUUID()
  destination_url: string;
  weight: number; // 0–100, secondary weights sum ≤ 100
  label?: string;
}

interface Link {
  id: string;
  rotation_rules: RotationRule[]; // JSONB column
  tags: string[]; // JSONB column
}

// Querying JSONB in Supabase
const { data } = await supabase
  .from("links")
  .select("*")
  .contains("tags", ["campaign-a"]); // JSONB @> operator

// Updating JSONB
await supabase
  .from("links")
  .update({ rotation_rules: newRules })
  .eq("id", linkId)
  .eq("user_id", userId);
```

---

## Cloud SQL PostgreSQL (emailgenius-broadcasts-generator)

Uses `pg` (node-postgres) with connection pool:

```typescript
// lib/db.ts
import { Pool } from "pg";

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT ?? "5432"),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
  max: 20, // Maximum pool size
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export async function query<T>(sql: string, params?: unknown[]): Promise<T[]> {
  const client = await pool.connect();
  try {
    const result = await client.query(sql, params);
    return result.rows as T[];
  } finally {
    client.release();
  }
}
```

Always use parameterized queries — never string interpolation:

```typescript
// ✅ Safe
const rows = await query("SELECT * FROM broadcasts WHERE market = $1", [
  market,
]);

// ❌ SQL injection risk — never do this
const rows = await query(`SELECT * FROM broadcasts WHERE market = '${market}'`);
```

---

## BigQuery (arbitrage-manager-dashboard — Python)

```python
# Python BigQuery pattern
from google.cloud import bigquery

client = bigquery.Client(project=GCP_PROJECT_ID)

def get_campaign_performance(account_id: str, date_range: tuple) -> list:
    query = """
    SELECT
        campaign_id,
        campaign_name,
        SUM(spend) as total_spend,
        SUM(revenue) as total_revenue,
        SAFE_DIVIDE(SUM(revenue), SUM(spend)) as roas
    FROM `{project}.advertising.campaign_metrics`
    WHERE account_id = @account_id
        AND date BETWEEN @start_date AND @end_date
    GROUP BY campaign_id, campaign_name
    ORDER BY total_spend DESC
    """.format(project=GCP_PROJECT_ID)

    job_config = bigquery.QueryJobConfig(
        query_parameters=[
            bigquery.ScalarQueryParameter("account_id", "STRING", account_id),
            bigquery.ScalarQueryParameter("start_date", "DATE", date_range[0]),
            bigquery.ScalarQueryParameter("end_date", "DATE", date_range[1]),
        ]
    )

    return list(client.query(query, job_config=job_config).result())
```

---

## Migration Strategy

### Supabase Migrations

All schema changes must be scripted and versioned:

```
scripts/
├── 001-create-projects-links-tables.sql    # Table creation
├── 002-add-user-id-enable-rls.sql          # Security layer
├── 003-add-click-events-indexes.sql        # Performance indexes
└── NNN-description-of-change.sql          # Incremental, ordered
```

Naming convention: `NNN-kebab-case-description.sql` (zero-padded 3-digit sequence number).

Apply via Supabase SQL Editor in numeric order. Never modify already-applied migrations — always create a new migration.

```sql
-- Always wrap schema changes in transactions
BEGIN;

ALTER TABLE links ADD COLUMN IF NOT EXISTS click_count INTEGER DEFAULT 0;
CREATE INDEX IF NOT EXISTS idx_links_click_count ON links(click_count DESC);

COMMIT;
```

### Schema Change Workflow

1. Write SQL migration script in `scripts/NNN-description.sql`
2. Apply via Supabase SQL Editor (or `psql` for Cloud SQL)
3. Update TypeScript types in `lib/types.ts` to match
4. Update DAL functions in `lib/mock-data.ts` (or equivalent)
5. Test locally against a dev Supabase project
6. Commit migration script to git alongside code changes

---

## TypeScript Type Conventions

All database entity types live in `lib/types.ts`:

```typescript
// lib/types.ts
export interface Project {
  id: string; // UUID
  user_id: string; // UUID — owner
  workspace_id?: string; // UUID — optional grouping
  name: string;
  title?: string;
  description?: string;
  tags: string[]; // JSONB
  archived: boolean;
  created_at: string; // ISO 8601 string from Supabase
  updated_at: string;
}

export interface Link {
  id: string;
  user_id: string;
  project_id?: string;
  name: string;
  main_destination_url: string;
  rotation_rules: RotationRule[]; // JSONB
  status: "active" | "paused" | "disabled";
  rotation_enabled: boolean;
  archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface ClickEvent {
  id: string;
  link_id: string;
  resolved_destination_url: string;
  went_to_main: boolean;
  user_agent?: string;
  ip_address?: string;
  referer?: string;
  country_code?: string;
  created_at: string;
}
```

---

## Constraints

- **Never** modify Better Auth managed tables (`user`, `session`, `account`, `verification`) — these are auto-migrated
- **Never** query without `user_id` filter (except `getLinkForRedirect` and other explicitly public queries)
- **Never** use `SUPABASE_SERVICE_ROLE_KEY` in client-side code — server only
- **Never** use float types for monetary values — use integers (cents/pence)
- **Never** skip migration scripts for schema changes — all changes must be versioned in `scripts/`
- **Never** create multiple Supabase client instances — use the singleton
- **Never** use string interpolation in SQL — always use parameterized queries
- Analytics-only tables (`click_events`, `rate_limits`) do not require RLS — they are written via service role
- JSONB default values must be explicitly set: `DEFAULT '[]'::jsonb` or `DEFAULT '{}'::jsonb`

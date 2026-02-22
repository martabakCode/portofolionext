/**
 * Database Setup Script - Direct Execution
 * 
 * Creates all tables directly using Supabase REST API with Service Role Key.
 * Run: npx tsx scripts/setup-db-direct.ts
 * 
 * Requires SUPABASE_SERVICE_ROLE_KEY in .env.local
 */

import * as dotenv from "dotenv";
import * as path from "path";
import * as fs from "fs";

dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    console.error("❌ Missing environment variables!");
    console.error("   Make sure .env.local has:");
    console.error("   - NEXT_PUBLIC_SUPABASE_URL");
    console.error("   - SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
}

// Extract ADMIN_USER_ID from constants.ts
const constantsPath = path.resolve(__dirname, "../src/lib/constants.ts");
const constantsContent = fs.readFileSync(constantsPath, "utf-8");
const match = constantsContent.match(/ADMIN_USER_ID\s*=\s*"([^"]+)"/);
const ADMIN_USER_ID = match ? match[1] : null;

if (!ADMIN_USER_ID || ADMIN_USER_ID.includes("ISI_USER_ID")) {
    console.error("❌ ADMIN_USER_ID not found in src/lib/constants.ts");
    console.error("   Please run 'npm run seed:admin' first.");
    process.exit(1);
}

console.log(`🔧 Using Admin User ID: ${ADMIN_USER_ID}`);
console.log(`🔗 Connecting to: ${SUPABASE_URL}`);

// SQL queries to run in order
const sqlQueries = [
    // Enable UUID extension
    `create extension if not exists "uuid-ossp"`,

    // 1. POSTS TABLE
    `create table if not exists posts (
        id uuid primary key default uuid_generate_v4(),
        title text not null,
        slug text unique not null,
        content text,
        image_url text,
        published boolean default false,
        created_at timestamptz default now(),
        updated_at timestamptz default now()
    )`,

    `alter table posts enable row level security`,

    `drop policy if exists "Public can read published posts" on posts`,
    `drop policy if exists "Admin can do everything on posts" on posts`,

    `create policy "Public can read published posts"
        on posts for select
        using (published = true)`,

    `create policy "Admin can do everything on posts"
        on posts for all
        using (auth.role() = 'service_role' or auth.uid() = '${ADMIN_USER_ID}'::uuid)`,

    // 2. PROJECTS TABLE
    `create table if not exists projects (
        id uuid primary key default uuid_generate_v4(),
        title text not null,
        description text,
        link text,
        tech_stack text[],
        image_url text,
        created_at timestamptz default now(),
        updated_at timestamptz default now()
    )`,

    `alter table projects enable row level security`,

    `drop policy if exists "Public can read all projects" on projects`,
    `drop policy if exists "Admin can do everything on projects" on projects`,

    `create policy "Public can read all projects"
        on projects for select
        using (true)`,

    `create policy "Admin can do everything on projects"
        on projects for all
        using (auth.role() = 'service_role' or auth.uid() = '${ADMIN_USER_ID}'::uuid)`,

    // 3. PROFILES TABLE
    `create table if not exists profiles (
        id uuid primary key default uuid_generate_v4(),
        full_name text,
        headline text,
        bio text,
        avatar_url text,
        github_url text,
        linkedin_url text,
        twitter_url text,
        email text,
        created_at timestamptz default now(),
        updated_at timestamptz default now()
    )`,

    `alter table profiles enable row level security`,

    `drop policy if exists "Public can read profiles" on profiles`,
    `drop policy if exists "Admin can do everything on profiles" on profiles`,

    `create policy "Public can read profiles"
        on profiles for select
        using (true)`,

    `create policy "Admin can do everything on profiles"
        on profiles for all
        using (auth.role() = 'service_role' or auth.uid() = '${ADMIN_USER_ID}'::uuid)`,

    // 4. WORK EXPERIENCES TABLE
    `create table if not exists work_experiences (
        id uuid primary key default uuid_generate_v4(),
        company text not null,
        role text not null,
        description text,
        start_date date not null,
        end_date date,
        current boolean default false,
        created_at timestamptz default now(),
        updated_at timestamptz default now()
    )`,

    `alter table work_experiences enable row level security`,

    `drop policy if exists "Public can read work_experiences" on work_experiences`,
    `drop policy if exists "Admin can do everything on work_experiences" on work_experiences`,

    `create policy "Public can read work_experiences"
        on work_experiences for select
        using (true)`,

    `create policy "Admin can do everything on work_experiences"
        on work_experiences for all
        using (auth.role() = 'service_role' or auth.uid() = '${ADMIN_USER_ID}'::uuid)`,

    // 5. SITE CONFIG TABLE
    `create table if not exists site_config (
        id uuid primary key default uuid_generate_v4(),
        site_name text default 'My Portfolio',
        site_description text,
        logo_text text,
        logo_image text,
        primary_color text default '#4f46e5',
        secondary_color text default '#ec4899',
        accent_color text default '#10b981',
        created_at timestamptz default now(),
        updated_at timestamptz default now()
    )`,

    `alter table site_config enable row level security`,

    `drop policy if exists "Public can read site_config" on site_config`,
    `drop policy if exists "Admin can do everything on site_config" on site_config`,

    `create policy "Public can read site_config"
        on site_config for select
        using (true)`,

    `create policy "Admin can do everything on site_config"
        on site_config for all
        using (auth.role() = 'service_role' or auth.uid() = '${ADMIN_USER_ID}'::uuid)`,

    // 6. TECH STACKS TABLE
    `create table if not exists tech_stacks (
        id uuid primary key default uuid_generate_v4(),
        name text not null,
        material_icon_name text not null default 'code',
        category text not null default 'Other',
        display_order integer default 0,
        created_at timestamptz default now(),
        updated_at timestamptz default now()
    )`,

    `alter table tech_stacks enable row level security`,

    `drop policy if exists "Public can read tech_stacks" on tech_stacks`,
    `drop policy if exists "Admin can do everything on tech_stacks" on tech_stacks`,

    `create policy "Public can read tech_stacks"
        on tech_stacks for select
        using (true)`,

    `create policy "Admin can do everything on tech_stacks"
        on tech_stacks for all
        using (auth.role() = 'service_role' or auth.uid() = '${ADMIN_USER_ID}'::uuid)`,

    // Initial seed data
    `insert into profiles (full_name, headline, bio)
     select 'Your Name', 'Fullstack Engineer', 'Building digital experiences...'
     where not exists (select 1 from profiles)`,

    `insert into site_config (site_name, logo_text)
     select 'My Portfolio', 'PORTFOLIO'
     where not exists (select 1 from site_config)`,
];

async function runQuery(query: string, index: number) {
    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${SERVICE_ROLE_KEY}`,
                "apikey": SERVICE_ROLE_KEY || "",
                "Prefer": "resolution=merge-duplicates",
            },
            body: JSON.stringify({ query }),
        });

        if (!response.ok) {
            const error = await response.text();
            // Ignore "already exists" errors
            if (error.includes("already exists") || error.includes("42P07")) {
                console.log(`   ⚠️  Query ${index + 1}: Already exists, skipped`);
                return true;
            }
            console.error(`   ❌ Query ${index + 1} failed:`, error);
            return false;
        }

        console.log(`   ✅ Query ${index + 1}: Success`);
        return true;
    } catch (error) {
        console.error(`   ❌ Query ${index + 1} error:`, error);
        return false;
    }
}

async function main() {
    console.log("\n🚀 Running database setup...\n");

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < sqlQueries.length; i++) {
        const success = await runQuery(sqlQueries[i], i);
        if (success) {
            successCount++;
        } else {
            failCount++;
        }
    }

    console.log(`\n📊 Results: ${successCount} succeeded, ${failCount} failed`);

    if (failCount > 0) {
        console.log("\n⚠️  Some queries failed. This might be due to:");
        console.log("   - Tables already exist (safe to ignore)");
        console.log("   - Permission issues with service role key");
        console.log("\n📝 If issues persist, run this SQL manually in Supabase Dashboard:");
        console.log("   https://app.supabase.com/project/_/sql/new");
        process.exit(1);
    } else {
        console.log("\n✅ Database setup completed successfully!");
        console.log("   You can now use the application.");
    }
}

main();

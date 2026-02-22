import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

// Manually parse .env.local
const envPath = path.resolve(__dirname, "../.env.local");
if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, "utf-8");
    envConfig.split("\n").forEach((line) => {
        const [key, value] = line.split("=");
        if (key && value) {
            process.env[key.trim()] = value.trim();
        }
    });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    console.log("--- START CHECK ---");

    try {
        // Check Profiles
        const { count: profileCount, error: profileError } = await supabase
            .from("profiles")
            .select("*", { count: "exact", head: true });

        if (profileError) {
            console.log("PROFILES: ERROR -> " + profileError.message);
        } else {
            console.log(`PROFILES: OK (Count: ${profileCount})`);
        }

        // Check Work Experiences
        const { count: expCount, error: expError } = await supabase
            .from("work_experiences")
            .select("*", { count: "exact", head: true });

        if (expError) {
            console.log("EXPERIENCES: ERROR -> " + expError.message);
        } else {
            console.log(`EXPERIENCES: OK (Count: ${expCount})`);
        }
    } catch (e) {
        console.log("FATAL ERROR: " + e);
    }
    console.log("--- END CHECK ---");
}

check();

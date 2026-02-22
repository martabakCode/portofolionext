/**
 * Admin User Seeder — writes result to seed_result.txt
 */

import * as dotenv from "dotenv";
import * as path from "path";
import * as fs from "fs";

dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    console.error("Missing environment variables");
    process.exit(1);
}

const ADMIN_EMAIL = "admin@martabakcode.com";
const ADMIN_PASSWORD = "Admin@12345";
const RESULT_FILE = path.resolve(__dirname, "../seed_result.txt");

function writeResult(lines: string[]) {
    fs.writeFileSync(RESULT_FILE, lines.join("\n"), "utf-8");
    console.log("Result written to seed_result.txt");
}

async function seedAdmin() {
    console.log("Starting seeder...");

    // Step 1: Try to create user via signup
    const signupRes = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            apikey: SERVICE_ROLE_KEY!,
            Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
        },
        body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
    });

    const signupData = await signupRes.json();

    // If 422 = user already registered, try to sign in to get the user ID
    if (signupRes.status === 422) {
        console.log("User already exists, signing in to get ID...");

        const loginRes = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                apikey: SERVICE_ROLE_KEY!,
            },
            body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
        });

        const loginData = await loginRes.json();

        if (loginRes.ok && loginData?.user?.id) {
            writeResult([
                "STATUS=EXISTS",
                `EMAIL=${ADMIN_EMAIL}`,
                `USER_ID=${loginData.user.id}`,
                `CONSTANTS=export const ADMIN_USER_ID = "${loginData.user.id}";`,
            ]);
            console.log("Done!");
            return;
        }

        // Fallback: dump login response for debugging
        writeResult([
            "STATUS=EXISTS_BUT_CANNOT_GET_ID",
            `LOGIN_STATUS=${loginRes.status}`,
            `LOGIN_RESPONSE=${JSON.stringify(loginData)}`,
        ]);
        console.log("Could not get ID. Check seed_result.txt");
        return;
    }

    // If signup succeeded
    const userId = signupData?.id || signupData?.user?.id;

    if (!signupRes.ok || !userId) {
        writeResult([
            "STATUS=ERROR",
            `HTTP_STATUS=${signupRes.status}`,
            `RESPONSE=${JSON.stringify(signupData)}`,
        ]);
        console.log("Error. Check seed_result.txt");
        process.exit(1);
    }

    // Auto-confirm email
    await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${userId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
            apikey: SERVICE_ROLE_KEY!,
        },
        body: JSON.stringify({ email_confirm: true }),
    });

    writeResult([
        "STATUS=CREATED",
        `EMAIL=${ADMIN_EMAIL}`,
        `PASSWORD=${ADMIN_PASSWORD}`,
        `USER_ID=${userId}`,
        `CONSTANTS=export const ADMIN_USER_ID = "${userId}";`,
    ]);
    console.log("Done!");
}

seedAdmin();

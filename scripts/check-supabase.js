const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

const envPath = path.join(__dirname, "..", ".env.local");
const envText = fs.readFileSync(envPath, "utf8");

for (const line of envText.split(/\r?\n/)) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
  const index = trimmed.indexOf("=");
  const key = trimmed.slice(0, index).trim();
  const value = trimmed.slice(index + 1).trim();
  process.env[key] = value;
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

if (!url || url.includes("your-project-id") || !key || key.includes("your-publishable")) {
  console.log("ENV_PLACEHOLDER");
  process.exit(1);
}

const supabase = createClient(url, key);

supabase
  .from("programs")
  .select("id,title")
  .then(({ data, error }) => {
    if (error) {
      console.log("ERROR");
      console.log(error.message);
      process.exit(1);
    }
    const titles = (data || []).map((row) => row.title);
    console.log("COUNT", titles.length);
    console.log("HAS_EXAM_FLOW", titles.includes("Exam Flow"));
  });

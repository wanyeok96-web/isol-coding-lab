const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

const PROGRAM_IDS = [
  "exam-flow",
  "sign-on",
  "event-desk",
  "timetable-lab",
  "teachertalk",
  "class-tools",
  "class-manager",
  "curriculum-guide",
  "another-geox",
  "urban-trail",
  "geo-tools",
  "class-mate",
];
const MAKER_IDS = ["maker-001", "maker-002", "maker-003", "maker-004"];
const IDEA_IDS = ["idea-001", "idea-002", "idea-003", "idea-004", "idea-005"];

const envPath = path.join(__dirname, "..", ".env.local");
const envText = fs.readFileSync(envPath, "utf8");

for (const line of envText.split(/\r?\n/)) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
  const index = trimmed.indexOf("=");
  process.env[trimmed.slice(0, index).trim()] = trimmed.slice(index + 1).trim();
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

if (!url || url.includes("your-project-id") || !key || key.includes("your-publishable")) {
  console.log("SKIP_ENV");
  process.exit(0);
}

const supabase = createClient(url, key);

async function remove(table, column, ids) {
  const { error, count } = await supabase.from(table).delete({ count: "exact" }).in(column, ids);
  if (error) {
    console.log("FAIL", table, error.message);
    return false;
  }
  console.log("OK", table, count ?? 0);
  return true;
}

(async () => {
  await remove("idea_developers", "idea_id", IDEA_IDS);
  await remove("idea_developers", "maker_id", MAKER_IDS);
  await remove("ideas", "id", IDEA_IDS);
  await remove("program_makers", "program_id", PROGRAM_IDS);
  await remove("program_makers", "maker_id", MAKER_IDS);
  await remove("programs", "id", PROGRAM_IDS);
  await remove("makers", "id", MAKER_IDS);
})();

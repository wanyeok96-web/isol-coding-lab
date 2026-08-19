const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const makers = JSON.parse(fs.readFileSync(path.join(root, "data/makers.json"), "utf8"));
const programs = JSON.parse(fs.readFileSync(path.join(root, "data/programs.json"), "utf8"));

if (!makers.length && !programs.length) {
  fs.writeFileSync(
    path.join(root, "supabase/seed.sql"),
    `-- ISOL CODING LAB · seed
-- 모의 프로그램·제작자·아이디어는 넣지 않습니다.
-- 실제 데이터는 사이트에서 교직원이 등록합니다.
`
  );
  console.log("makers 0, programs 0");
  process.exit(0);
}

function q(value) {
  return `'${String(value ?? "").replace(/'/g, "''")}'`;
}

function arr(values) {
  return `ARRAY[${(values || []).map(q).join(", ")}]::text[]`;
}

const makerRows = makers
  .map(
    (maker) =>
      `  (${[q(maker.id), q(maker.name), q(maker.subject), q(maker.bio), q(maker.profileImage || "")].join(", ")})`
  )
  .join(",\n");

const programRows = programs
  .map((program) => {
    const values = [
      q(program.id),
      q(program.title),
      q(program.subtitle),
      q(program.description),
      q(program.background),
      q(program.category),
      arr(program.tags),
      arr(program.tools),
      q(program.thumbnail || ""),
      q(program.url || ""),
      q(program.github || ""),
      q(program.visibility || "public"),
      program.featured ? "true" : "false",
      Number(program.likes || 0),
      q(program.createdAt),
    ];
    return `  (${values.join(", ")})`;
  })
  .join(",\n");

const linkRows = programs
  .flatMap((program) => (program.makerIds || []).map((makerId) => `  (${q(program.id)}, ${q(makerId)})`))
  .join(",\n");

const sql = `-- ISOL CODING LAB · STEP 10
-- JSON 데이터를 표에 넣습니다. SQL Editor에서 한 번만 실행하세요.

insert into public.makers (id, name, subject, bio, profile_image) values
${makerRows}
on conflict (id) do nothing;

insert into public.programs (
  id, title, subtitle, description, background, category, tags, tools,
  thumbnail, url, github, visibility, featured, likes, created_at
) values
${programRows}
on conflict (id) do nothing;

insert into public.program_makers (program_id, maker_id) values
${linkRows}
on conflict (program_id, maker_id) do nothing;
`;

fs.writeFileSync(path.join(root, "supabase/seed.sql"), sql);
console.log(`makers ${makers.length}, programs ${programs.length}, links ${linkRows.split("\n").length}`);

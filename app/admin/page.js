import { createServerSupabase } from "../../lib/supabase-server";
import { getCurrentMember, isAdminMember, normalizeEmail } from "../../lib/staff";
import StaffMemberRow from "../../components/StaffMemberRow";

export const metadata = {
  title: "가입 승인 | ISOL CODING LAB",
  description: "이코랩 교직원 가입 요청을 승인합니다.",
};

function displayName(email, makersByEmail) {
  const key = normalizeEmail(email);
  const fromMaker = makersByEmail.get(key);
  if (fromMaker) return fromMaker;
  return String(email || "").split("@")[0] || "이름 없음";
}

export default async function AdminPage() {
  const supabase = await createServerSupabase();
  const { data } = supabase ? await supabase.auth.getUser() : { data: { user: null } };
  const member = await getCurrentMember(supabase, data.user?.email);
  const currentEmail = normalizeEmail(data.user?.email);

  if (!isAdminMember(member)) {
    return (
      <main id="main" className="page-shell">
        <section className="page-hero page-hero--simple">
          <div className="container page-hero__stack">
            <div>
              <p className="hero-eyebrow">ISOL CODING LAB · 이코랩</p>
              <h1>관리자만 볼 수 있는 페이지입니다</h1>
              <p className="page-lead">메인 관리자 계정으로 로그인해 주세요.</p>
            </div>
          </div>
        </section>
      </main>
    );
  }

  const [{ data: members }, { data: makers }] = await Promise.all([
    supabase.from("staff_members").select("email, role, status, created_at").order("created_at", { ascending: false }),
    supabase.from("makers").select("email, name"),
  ]);

  const makersByEmail = new Map(
    (makers || [])
      .filter((row) => row.email && row.name)
      .map((row) => [normalizeEmail(row.email), String(row.name).trim()])
  );

  const pending = (members || []).filter((row) => row.status === "pending");
  const approved = (members || []).filter((row) => row.status === "approved");
  const adminCount = approved.filter((row) => row.role === "admin").length;

  return (
    <main id="main" className="page-shell">
      <section className="page-hero page-hero--simple">
        <div className="container page-hero__stack">
          <div>
            <p className="hero-eyebrow">ISOL CODING LAB · 이코랩</p>
            <h1>가입 승인</h1>
            <p className="page-lead">승인 요청을 확인하고, 교직원으로 허용할 선생님을 선택하세요.</p>
          </div>
        </div>
      </section>

      <section className="page-section">
        <div className="container staff-admin">
          <article className="surface-card">
            <h2>승인 대기 {pending.length}명</h2>
            {pending.length ? (
              <ul className="staff-list">
                {pending.map((row) => (
                  <StaffMemberRow
                    key={row.email}
                    email={row.email}
                    name={displayName(row.email, makersByEmail)}
                    canApprove
                    canDelete
                  />
                ))}
              </ul>
            ) : (
              <p>지금은 대기 중인 요청이 없습니다.</p>
            )}
          </article>

          <article className="surface-card">
            <h2>교직원 {approved.length}명</h2>
            <ul className="staff-list">
              {approved.map((row) => {
                const isSelf = normalizeEmail(row.email) === currentEmail;
                const isLastAdmin = row.role === "admin" && adminCount <= 1;
                return (
                  <StaffMemberRow
                    key={row.email}
                    email={row.email}
                    name={displayName(row.email, makersByEmail)}
                    role={row.role}
                    canDelete={!isSelf && !isLastAdmin}
                  />
                );
              })}
            </ul>
          </article>
        </div>
      </section>
    </main>
  );
}

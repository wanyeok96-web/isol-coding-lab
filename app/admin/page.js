import { createServerSupabase } from "../../lib/supabase-server";
import { getCurrentMember, isAdminMember } from "../../lib/staff";
import { approveStaff } from "./actions";

export const metadata = {
  title: "가입 승인 | ISOL CODING LAB",
  description: "이코랩 교직원 가입 요청을 승인합니다.",
};

export default async function AdminPage() {
  const supabase = await createServerSupabase();
  const { data } = supabase ? await supabase.auth.getUser() : { data: { user: null } };
  const member = await getCurrentMember(supabase, data.user?.email);

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

  const { data: members } = await supabase
    .from("staff_members")
    .select("email, role, status, created_at")
    .order("created_at", { ascending: false });

  const pending = (members || []).filter((row) => row.status === "pending");
  const approved = (members || []).filter((row) => row.status === "approved");

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
                  <li className="staff-list__item" key={row.email}>
                    <span>{row.email}</span>
                    <form action={approveStaff}>
                      <input type="hidden" name="email" value={row.email} />
                      <button className="btn btn--primary" type="submit">
                        승인
                      </button>
                    </form>
                  </li>
                ))}
              </ul>
            ) : (
              <p>지금은 대기 중인 요청이 없습니다.</p>
            )}
          </article>

          <article className="surface-card">
            <h2>교직원 {approved.length}명</h2>
            <ul className="staff-list">
              {approved.map((row) => (
                <li className="staff-list__item" key={row.email}>
                  <span>{row.email}</span>
                  <span className="staff-role">{row.role === "admin" ? "관리자" : "교직원"}</span>
                </li>
              ))}
            </ul>
          </article>
        </div>
      </section>
    </main>
  );
}

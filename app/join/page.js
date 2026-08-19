import JoinPanel from "../../components/JoinPanel";
import { createServerSupabase } from "../../lib/supabase-server";
import { getCurrentMember, isApprovedStaff } from "../../lib/staff";

export const metadata = {
  title: "교직원 인증 | ISOL CODING LAB",
  description: "가입 코드를 입력하거나 관리자 승인을 요청해 이코랩 교직원으로 인증합니다.",
};

function JoinNotice({ result }) {
  if (result === "bad-code") {
    return <p className="join-notice">가입 코드가 올바르지 않습니다. 다시 확인해 주세요.</p>;
  }
  if (result === "requested") {
    return <p className="join-notice">승인 요청을 보냈습니다. 관리자 확인을 기다려 주세요.</p>;
  }
  if (result === "error") {
    return <p className="join-notice">잠시 후 다시 시도해 주세요.</p>;
  }
  return null;
}

export default async function JoinPage({ searchParams }) {
  const params = await searchParams;
  const supabase = await createServerSupabase();
  const { data } = supabase ? await supabase.auth.getUser() : { data: { user: null } };
  const email = data.user?.email || null;
  const member = await getCurrentMember(supabase, email);

  if (isApprovedStaff(member)) {
    return (
      <main id="main" className="page-shell">
        <section className="page-hero page-hero--simple">
          <div className="container page-hero__stack">
            <div>
              <p className="hero-eyebrow">ISOL CODING LAB · 이코랩</p>
              <h1>이미 교직원으로 인증되어 있습니다</h1>
              <p className="page-lead">학교 프로그램을 바로 이용할 수 있습니다.</p>
            </div>
            <a className="btn btn--primary" href="/">
              홈으로 가기
            </a>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main id="main" className="page-shell">
      <section className="page-hero page-hero--simple">
        <div className="container page-hero__stack">
          <div>
            <p className="hero-eyebrow">ISOL CODING LAB · 이코랩</p>
            <h1>교직원 인증</h1>
            <p className="page-lead">
              {email
                ? "가입 코드를 입력하거나, 메인 관리자에게 승인을 요청하세요."
                : "먼저 오른쪽 위 Google로 로그인한 뒤, 가입 코드 또는 승인을 진행하세요."}
            </p>
          </div>
        </div>
      </section>

      <section className="page-section">
        <div className="container">
          <JoinNotice result={params.result} />
          {email ? (
            <JoinPanel pending={member?.status === "pending"} />
          ) : (
            <article className="surface-card">
              <h2>로그인이 필요합니다</h2>
              <p>Google로 로그인한 뒤에 가입 코드를 입력하거나 승인을 요청할 수 있습니다.</p>
            </article>
          )}
        </div>
      </section>
    </main>
  );
}

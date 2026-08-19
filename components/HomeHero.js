import ProgramSubmitButton from "./ProgramSubmitButton";

export default function HomeHero({ likeAccess = "guest" }) {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="container hero-inner">
        <div className="hero-copy">
          <p className="hero-eyebrow">
            <img src="/icons/isol-emblem.png" alt="" width="22" height="22" />
            이솔고등학교
          </p>
          <p className="hero-motto">성찰하는 이성 · 실천하는 양심</p>
          <h1 id="hero-title">
            선생님의 아이디어가 학교의 도구가 됩니다.
          </h1>
          <p className="hero-lead">
            이솔고등학교 선생님들이 직접 만든 수업과 업무를 위한 디지털 도구를 만나보세요.
          </p>
          <div className="hero-actions">
            <a className="btn btn--primary" href="#programs">
              프로그램 둘러보기
            </a>
            <ProgramSubmitButton likeAccess={likeAccess} />
          </div>
        </div>

        <div className="hero-visual" aria-hidden="true">
          <div className="hero-glow"></div>
          <div className="hero-window">
            <div className="hero-window__bar">
              <span className="hero-traffic">
                <span className="hero-dot hero-dot--close"></span>
                <span className="hero-dot hero-dot--min"></span>
                <span className="hero-dot hero-dot--max"></span>
              </span>
              <span className="hero-window__title">
                <img src="/icons/isol-emblem.png" alt="" width="16" height="16" />
                이코랩
              </span>
            </div>
            <div className="hero-window__body">
              <div className="hero-mini-board">
                <p className="hero-mini-kicker">이솔고등학교 · 이코랩</p>
                <p className="hero-mini-headline">선생님의 아이디어가 학교의 도구가 됩니다.</p>
                <div className="hero-mini-search">어떤 도구가 필요하신가요?</div>
                <div className="hero-mini-filters">
                  <span className="is-active">전체</span>
                  <span>학교업무</span>
                  <span>담임업무</span>
                  <span>교과업무</span>
                </div>
                <div className="hero-mini-welcome">
                  <img src="/icons/isol-emblem.png" alt="" width="40" height="40" />
                  <strong>이코랩</strong>
                  <small>수업과 업무를 위한 디지털 도구</small>
                </div>
              </div>
            </div>
          </div>
          <div className="hero-float hero-float--1">
            <span className="hero-float__label">카테고리</span>
            학교 · 담임 · 교과
          </div>
          <div className="hero-float hero-float--2">
            <img src="/icons/isol-emblem.png" alt="" width="28" height="28" />
            <span>이솔고등학교</span>
          </div>
        </div>
      </div>
    </section>
  );
}

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
            <span className="hero-title-plain">이솔고 코딩 연구소</span>
            <span className="hero-title-accent">이.코.랩</span>
          </h1>
          <p className="hero-lead">
            이솔고등학교 선생님들이 직접 만든 디지털 도구
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
              <span className="hero-window__title">index.html</span>
            </div>
            <div className="hero-editor">
              <aside className="hero-editor__files">
                <span className="is-active">index.html</span>
                <span>style.css</span>
                <span>script.js</span>
              </aside>
              <pre className="hero-editor__code">
                <code>
                  <span className="code-row">
                    <i>1</i>
                    <b>&lt;!DOCTYPE html&gt;</b>
                  </span>
                  <span className="code-row">
                    <i>2</i>
                    <b>
                      &lt;<em>html</em> lang=&quot;ko&quot;&gt;
                    </b>
                  </span>
                  <span className="code-row">
                    <i>3</i>
                    <b>
                      &lt;<em>body</em>&gt;
                    </b>
                  </span>
                  <span className="code-row">
                    <i>4</i>
                    <b>
                      {"  "}&lt;<em>h1</em>&gt;이코랩&lt;/<em>h1</em>&gt;
                    </b>
                  </span>
                  <span className="code-row">
                    <i>5</i>
                    <b>
                      {"  "}&lt;<em>p</em>&gt;선생님의 아이디어가 학교의 도구가 됩니다.&lt;/<em>p</em>&gt;
                    </b>
                  </span>
                  <span className="code-row">
                    <i>6</i>
                    <b>
                      &lt;/<em>body</em>&gt;
                    </b>
                  </span>
                  <span className="code-row">
                    <i>7</i>
                    <b>&lt;/html&gt;</b>
                  </span>
                </code>
              </pre>
            </div>
          </div>
          <div className="hero-float hero-float--1">
            <span className="hero-float__label">파일</span>
            html · css · js
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

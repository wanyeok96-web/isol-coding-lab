import { redeemInviteCode, requestStaffAccess } from "../app/join/actions";

export default function JoinPanel({ pending }) {
  return (
    <div className="join-grid">
      <article className="surface-card">
        <h2>가입 코드 입력</h2>
        <p>관리자에게 받은 코드를 입력하면 바로 교직원으로 인증됩니다.</p>
        <form className="join-form" action={redeemInviteCode}>
          <label className="join-form__label" htmlFor="invite-code">
            가입 코드
          </label>
          <input
            id="invite-code"
            className="join-form__input"
            name="code"
            type="text"
            autoComplete="off"
            required
          />
          <button className="btn btn--primary" type="submit">
            코드로 가입
          </button>
        </form>
      </article>

      <article className="surface-card">
        <h2>관리자 승인 요청</h2>
        {pending ? (
          <p>승인 요청이 전달되었습니다. 메인 관리자가 확인하면 교직원으로 이용할 수 있습니다.</p>
        ) : (
          <>
            <p>코드를 모를 때는 승인을 요청하세요. 메인 관리자가 명단에서 허용해 줍니다.</p>
            <form action={requestStaffAccess}>
              <button className="btn btn--secondary" type="submit">
                승인 요청하기
              </button>
            </form>
          </>
        )}
      </article>
    </div>
  );
}

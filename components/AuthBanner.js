export default function AuthBanner({ reason }) {
  if (reason === "joined") {
    return (
      <div className="auth-banner" role="status">
        교직원으로 인증되었습니다. 학교 프로그램을 이용할 수 있습니다.
      </div>
    );
  }

  if (reason === "staff") {
    return (
      <div className="auth-banner" role="status">
        교직원 인증이 필요합니다. 가입 코드를 입력하거나 관리자 승인을 요청해 주세요.
      </div>
    );
  }

  if (reason === "error") {
    return (
      <div className="auth-banner" role="status">
        로그인에 실패했습니다. 잠시 후 다시 시도해 주세요.
      </div>
    );
  }

  return null;
}

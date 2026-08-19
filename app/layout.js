import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import { getAuthState } from "../lib/staff";
import "./globals.css";

export const metadata = {
  title: "ISOL CODING LAB · 이코랩",
  description:
    "이솔고등학교 선생님들이 AI와 바이브코딩으로 만든 수업·학교업무용 디지털 도구를 발견하고 공유하는 플랫폼. 선생님의 아이디어가 학교의 도구가 됩니다.",
  icons: {
    icon: "/icons/isol-emblem.png",
    apple: "/icons/isol-emblem.png",
  },
};

export default async function RootLayout({ children }) {
  const { userEmail, staffStatus, isAdmin } = await getAuthState();

  return (
    <html lang="ko">
      <body>
        <div className="ambient" aria-hidden="true">
          <span className="ambient__blob ambient__blob--blue"></span>
          <span className="ambient__blob ambient__blob--violet"></span>
          <span className="ambient__blob ambient__blob--cyan"></span>
        </div>
        <a className="skip-link" href="#main">
          본문으로 건너뛰기
        </a>
        <SiteHeader userEmail={userEmail} staffStatus={staffStatus} isAdmin={isAdmin} />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}

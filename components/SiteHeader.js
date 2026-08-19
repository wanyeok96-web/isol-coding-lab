"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import AuthButtons from "./AuthButtons";

const NAV_ITEMS = [
  { key: "programs", href: "/", label: "프로그램" },
  { key: "makers", href: "/makers", label: "제작자" },
  { key: "ideas", href: "/ideas", label: "아이디어" },
  { key: "guide", href: "/guide", label: "Vibe Guide" },
];

function getActiveKey(pathname) {
  if (pathname.startsWith("/makers")) return "makers";
  if (pathname.startsWith("/ideas")) return "ideas";
  if (pathname.startsWith("/guide")) return "guide";
  return "programs";
}

export default function SiteHeader({ userEmail, staffStatus, isAdmin }) {
  const pathname = usePathname();
  const activeKey = getActiveKey(pathname);
  const [menuOpen, setMenuOpen] = useState(false);

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <header className="site-header" id="top">
      <div className="container header-inner">
        <Link className="brand" href="/" aria-label="이솔고등학교 이코랩 홈" onClick={closeMenu}>
          <img className="brand__emblem" src="/icons/isol-emblem.png" alt="이솔고등학교 교표" width="28" height="28" />
          <span className="brand__text">
            <span className="brand__name">이코랩</span>
            <span className="brand__school">이솔고등학교</span>
          </span>
        </Link>

        <button
          className={`menu-toggle${menuOpen ? " is-open" : ""}`}
          type="button"
          aria-label={menuOpen ? "메뉴 닫기" : "메뉴 열기"}
          aria-expanded={menuOpen}
          aria-controls="site-nav"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span className="menu-toggle__bar" aria-hidden="true"></span>
          <span className="menu-toggle__bar" aria-hidden="true"></span>
        </button>

        <nav className={`site-nav${menuOpen ? " is-open" : ""}`} id="site-nav" aria-label="주요 메뉴">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.key}
              className={`nav-link${activeKey === item.key ? " is-active" : ""}`}
              href={item.href}
              aria-current={activeKey === item.key ? "page" : undefined}
              onClick={closeMenu}
            >
              {item.label}
            </Link>
          ))}
          <AuthButtons email={userEmail} staffStatus={staffStatus} isAdmin={isAdmin} />
        </nav>
      </div>
    </header>
  );
}

export const CATEGORY_THEME = {
  학교업무: { from: "#5ac8fa", to: "#007aff" },
  담임업무: { from: "#64d2ff", to: "#30b0c7" },
  교과업무: { from: "#af52de", to: "#5856d6" },
};

export const CATEGORY_EMOJI = {
  학교업무: "🏫",
  담임업무: "🧑‍🏫",
  교과업무: "📝",
};

export function getCategoryEmoji(category) {
  return CATEGORY_EMOJI[category] || "";
}

export const CATEGORIES = ["전체", "학교업무", "담임업무", "교과업무"];

export const CATEGORY_UNITS = {
  학교업무: [
    "교무기획부",
    "교육연구부",
    "학생인권자치부",
    "예술체육부",
    "교육과정부",
    "인문사회부",
    "수리과학부",
    "교육정보부",
    "진로진학부",
    "학년부",
  ],
  담임업무: ["1학년부", "2학년부", "3학년부"],
  교과업무: ["국어과", "영어과", "수학과", "사회과", "과학과", "예체능과", "제2외국어과", "정보과", "진로과"],
};

export const UNIT_LABELS = {
  학교업무: "부서",
  담임업무: "학년부",
  교과업무: "교과",
};

export function getUnitOptions(category) {
  return CATEGORY_UNITS[category] || [];
}

export function getUnitLabel(category) {
  return UNIT_LABELS[category] || "부서 또는 교과";
}

export const IDEA_STATUS_META = {
  open: "아이디어",
  recruiting: "제작자를 찾고 있어요",
  building: "제작 중",
  completed: "프로그램 완성",
};

export const GUIDE_ICON_META = {
  "what-is-vibe": "01",
  "meet-the-tools": "02",
  "design-prompt": "03",
  "start-building": "04",
  "understand-structure": "05",
  "share-on-github": "06",
};

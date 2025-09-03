import { createSidebar } from "./components/Sidebar.js";
import { navigate } from "./router/router.js";
import { parseDocumentId } from "./utils/parseDocumentId.js";

// 사이드바 생성
const sidebar = createSidebar({
  onSelect: (id) => {
    if (id == null) navigate("/"); // 선택 해제 → 루트
    else navigate(`/documents/${id}`); // 문서 선택 → /documents/:id
  },
});

// 초기 로드: 트리 불러오고 현재 경로 id로 하이라이트 맞추기
window.addEventListener("DOMContentLoaded", async () => {
  await sidebar.load(parseDocumentId());
});

// 뒤/앞으로 가기 시에도 선택 하이라이트 동기화
window.addEventListener("popstate", () => {
  sidebar.setSelected(parseDocumentId());
});

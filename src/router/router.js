import { openDocument } from "../components/Editor.js";
import { parseDocumentId } from "../utils/parseDocumentId.js";

export const handleRoute = async () => {
  const id = parseDocumentId();
  // 루트 문서일 경우 id가 null이므로 null 넘김
  await openDocument(id ?? null);
};

// 페이지 이동 함수 (sidebar.js가 호출)
export const navigate = (path) => {
  history.pushState({}, "", path);
  handleRoute();
};

// 초기 페이지 로드 시 라우팅 시작
window.addEventListener("DOMContentLoaded", handleRoute);
window.addEventListener("popstate", handleRoute);

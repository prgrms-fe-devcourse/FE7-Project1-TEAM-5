export const handleRoute = () => {
  // 현재 URL 경로를 가져오는 코드
  const pathname = window.location.pathname;
  // '/'를 기준으로 경로를 나눠서 배열 생성.
  const parts = pathname.split('/');

  const documentId = parts[parts.length - 1]; // 배열 마지막이 아이디 요소.

  // 이 ID를 사용하여 문서 내용을 부르고 편집기를 렌더링.
};

// 페이지 이동 함수 (sidebar.js가 호출)
export const navigate = (path) => {
  history.pushState({}, '', path);
  handleRoute();
};

// 초기 페이지 로드 시 라우팅 시작
window.addEventListener('DOMContentLoaded', handleRoute);
window.addEventListener('popstate', handleRoute);

import { renderEditorContent } from './editor.js';

export const handleRoute = async () => {
  // 현재 URL 경로를 가져오는 코드
  const pathname = window.location.pathname;
  // '/'를 기준으로 경로를 나눠서 배열 생성.
  const parts = pathname.split('/');
  if (parts[parts.length - 2] === 'documents') {
    //아이디 존재여부로 루트인지 아닌지 확인.
    const documentId = parts[parts.length - 1]; // 배열 마지막이 아이디 요소.  이 ID를 사용하여 문서 내용을 부르고 편집기를 렌더링.

    // ID를 받아서 editor.js의 함수를 호출.
    await renderEditorContent(documentId);
  } else {
    // 루트문서일 경우.

    await renderEditorContent(null);
  }
};

// 페이지 이동 함수 (sidebar.js가 호출)
export const navigate = (path) => {
  history.pushState({}, '', path);
  handleRoute();
};

// 초기 페이지 로드 시 라우팅 시작
window.addEventListener('DOMContentLoaded', handleRoute);
window.addEventListener('popstate', handleRoute);

// 문서 ID를 URL 경로에서 파싱하는 유틸리티 함수
export function parseDocumentId() {
  // 현재 URL 경로를 가져오는 코드
  const pathname = window.location.pathname;
  // '/'를 기준으로 경로를 나눠서 배열 생성.
  const parts = pathname.split("/").filter(Boolean); // 빈 조각 정리
  // 아이디 존재여부로 루트인지 아닌지 확인.
  const isDocuments = parts[parts.length - 2] === "documents";

  if (!isDocuments) return null;

  // 배열 마지막이 아이디 요소.
  // 마지막 요소를 id로 파싱. (디코딩 + 숫자화)
  const raw = parts[parts.length - 1];

  return Number(decodeURIComponent(raw));
}

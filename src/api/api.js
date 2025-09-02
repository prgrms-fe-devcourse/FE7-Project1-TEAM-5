const BASE_URL = "https://kdt-api.fe.dev-cos.com";
const USERNAME = "crabBurger";
const DEFAULT_TIMEOUT = 10000; // 10초 타임아웃

// buildHeader: 모든 요청에 기본으로 들어가는 헤더(x-username)를 생성하는 함수
// POST, PUT처럼 body가 필요할 경우 자동으로 "Content-Type": "application/json" 추가
function buildHeaders(extra = {}, hasBody = false) {
  const header = {
    "x-username": USERNAME,
    ...extra,
  };
  if (hasBody && !("Content-Type" in header)) {
    header["Content-Type"] = "application/json";
  }
  return header;
}

// request: API 요청을 담당하는 공통 함수
//   path: 엔드포인트 경로
//   method: HTTP 메서드 (기본값: "GET") (선택사항)
//   headers: 추가 헤더 (기본값: {}) (선택사항)
//   body: 요청 본문 (기본값: null) (선택사항)
//   timeout: 요청 타임아웃 (기본값: DEFAULT_TIMEOUT) (선택사항)
export async function request(
  path,
  { method = "GET", headers = {}, body = null, timeout = DEFAULT_TIMEOUT } = {}
) {
  // URL 생성 (BASE_URL + path)
  const url = `${BASE_URL}${path.startsWith("/") ? path : "/" + path}`;

  // 타임아웃 설정을 위한 AbortController 사용
  const controller = new AbortController();
  const timer = setTimeout(
    () => controller.abort(new Error("Request timed out")),
    timeout
  );

  try {
    // fetch 실행
    // 응답을 JSON 또는 텍스트로 파싱하여 처리
    const res = await fetch(url, {
      method,
      headers: buildHeaders(headers, body != null),
      body:
        body != null
          ? typeof body === "string"
            ? body
            : JSON.stringify(body)
          : undefined,
      signal: controller.signal,
    });

    const contentType = res.headers.get("content-type") || "";
    const isJSON = contentType.includes("application/json");
    const data = isJSON ? await res.json() : await res.text();

    // HTTP 상태 코드가 200-299 범위가 아니면 에러 처리
    // 오류 상태(res.ok === false)일 경우 에러 throw
    // 성공 시 응답 데이터 반환
    if (!res.ok) {
      const err = new Error((data && data.message) || `HTTP ${res.status}`);
      err.status = res.status;
      err.data = data;
      throw err;
    }

    return data;
  } finally {
    clearTimeout(timer); // 타이머 정리
  }
}

// ================ API 함수들 ================= //

// 문서 목록 조회
export function listDocuments() {
  return request("/documents");
}

// 단일 문서 조회
export function getDocument(id) {
  if (!id) throw new Error("getDocument requires an id");
  return request(`/documents/${id}`);
}

// 문서 생성
export function createDocument({ title, parent = null }) {
  return request("/documents", {
    method: "POST",
    body: { title, parent },
  });
}

// 문서 수정
export function updateDocument(id, payload) {
  if (!id) throw new Error("updateDocument requires an id");
  return request(`/documents/${id}`, {
    method: "PUT",
    body: payload,
  });
}

// 문서 삭제
export function deleteDocument(id) {
  if (!id) throw new Error("deleteDocument requires an id");
  return request(`/documents/${id}`, { method: "DELETE" });
}

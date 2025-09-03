const BASE_URL = "https://kdt-api.fe.dev-cos.com";
const USERNAME = "crabBurger";
const TIMEOUT = 10_000; // ms

// 공통 헤더 (모든 요청은 JSON)
function headers(extra = {}) {
  return {
    "x-username": USERNAME,
    "Content-Type": "application/json",
    ...extra,
  };
}

// URL 합치기
function url(path) {
  return `${BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

// 공통 요청 함수 (JSON 전용)
export async function request(
  path,
  { method = "GET", body = null, timeout = TIMEOUT } = {}
) {
  const controller = new AbortController();
  const timer = setTimeout(
    () => controller.abort(new Error("timeout")),
    timeout
  );

  try {
    const res = await fetch(url(path), {
      method,
      headers: headers(),
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    const data = await res.json();

    if (!res.ok) {
      const err = new Error(data?.message || `HTTP ${res.status}`);
      err.status = res.status;
      err.data = data;
      throw err;
    }

    return data;
  } finally {
    clearTimeout(timer);
  }
}

/* ============== 문서 API ============== */

// 문서 트리 조회
export function listDocuments() {
  return request("/documents");
}

// 문서 단건 조회
export function getDocument(id) {
  if (id == null) throw new Error("getDocument: id가 필요합니다.");
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
  if (id == null) throw new Error("updateDocument: id가 필요합니다.");
  return request(`/documents/${id}`, {
    method: "PUT",
    body: payload,
  });
}

// 문서 삭제
export function deleteDocument(id) {
  if (id == null) throw new Error("deleteDocument: id가 필요합니다.");
  return request(`/documents/${id}`, { method: "DELETE" });
}

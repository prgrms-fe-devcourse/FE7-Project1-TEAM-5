import {
  getDocument as apiGetDocument,
  updateDocument as apiUpdateDocument,
} from "../api/api.js";

const DEBOUNCE_MS = 1500;

let currentId = null; // 현재 편집 중 문서 ID
let isEdit = false; // 사용자 입력 발생 여부
let saving = false; // 저장 중에 쓰는 것
let saveTimer = null; // 디바운스 타이머

// DOM
const titleEl = document.querySelector(".Title");
const contentEl = document.querySelector(".EditorContainer");

// 에디터 값 세팅
function setEditor(title, content) {
  if (titleEl) titleEl.value = title;
  if (contentEl) contentEl.value = content;
}

// 라우터에서 호출하면 문서 보여주는 함수
export async function openDocument(id) {
  currentId = id || null;

  if (!currentId) {
    setEditor("", "");
    isEdit = false;
    return;
  }

  try {
    const doc = await apiGetDocument(currentId);
    const docTitle = doc.title;
    const docContent = doc.content;

    setEditor(docTitle, docContent);
    isEdit = false;
  } catch (err) {
    console.error("[editor] 문서 불러오기 실패:", err);
    setEditor("", "");
    isEdit = false;
  }
}

// 즉시 저장(디바운스 만료/blur에서 호출)
async function saveNow() {
  if (!currentId) return;
  if (!isEdit) return;
  if (saving) return;

  saving = true;
  const payload = {
    title: titleEl.value,
    content: contentEl.value,
  };

  try {
    await apiUpdateDocument(currentId, payload); // PUT /documents/:id
    isEdit = false; // 저장 성공 시 편집 유무 다운
  } catch (err) {
    console.error("[editor] 자동저장 실패:", err);
    // 실패 시 편집 변수(isEdit) 유지 및 재시도
  } finally {
    saving = false;
  }
}

// 디바운스
function debounce() {
  isEdit = true;
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(saveNow, DEBOUNCE_MS);
}

// 이벤트
titleEl.addEventListener("keyup", debounce);
contentEl.addEventListener("keyup", debounce);

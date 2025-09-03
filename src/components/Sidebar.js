import { listDocuments, createDocument, deleteDocument } from "../api/api.js";

const ACTION = {
  SELECT: "select",
  ADD_CHILD: "add-child",
  DELETE: "delete",
  ADD_ROOT: "add-root",
};

// 사이드바를 만들어 주는 함수
export function createSidebar({ onSelect }) {
  // 내부 상태 (바깥에서 직접 못 만짐)
  const mountElement = document.querySelector(".doc-tree");
  const sidebarEl = document.querySelector("aside");
  const state = {
    tree: [], // 문서 트리 데이터
    selectedId: null, // 현재 선택 문서 id
  };

  /*  외부로 내보낼 API(메서드)들 */
  // 문서 트리 로딩 (초기 또는 갱신용)
  async function load(initialSelectedId = null) {
    try {
      state.tree = await listDocuments();
      state.selectedId = Number(initialSelectedId);

      render();
      syncSelectedHighlight();
    } catch (e) {
      console.error(e);
    }
  }

  // 선택 문서 id 갱신
  function setSelected(id) {
    state.selectedId = Number(id);
    syncSelectedHighlight();
  }

  // 이벤트 해제 및 정리
  function destroy() {
    sidebarEl.removeEventListener("click", handleClick);
    mountElement.innerHTML = "";
  } // 메모리 누수나 중복 이벤트 문제를 방지

  /* 내부 헬퍼들 */
  // 트리 렌더링 (재귀 렌더링)
  function render() {
    const build = (nodes) => {
      if (!Array.isArray(nodes) || nodes.length === 0) return ""; // 재귀 종결

      return nodes
        .map((node) => {
          const id = Number(node.id);
          const title = node.title || "제목 없음";
          const children = node.documents || [];

          return `
            <div class="doc-node" data-id="${id}">
              <div class="doc-row" data-action="${
                ACTION.SELECT
              }" data-id="${id}">
                ${title}
                <div class="doc-actions-container">
                  <button
                    class="doc-actions"
                    data-action="${ACTION.DELETE}"
                    data-id="${id}"
                    title="삭제"
                    aria-label="문서 삭제"
                  >-</button>
                  <button
                    class="doc-actions"
                    data-action="${ACTION.ADD_CHILD}"
                    data-id="${id}"
                    title="하위 문서 추가"
                    aria-label="하위 문서 추가"
                  >＋</button>
                </div>
              </div>
              ${
                children.length
                  ? `<div class="doc-children">${build(children)}</div>`
                  : ""
              }
            </div>
          `;
        })
        .join("");
    };

    // 한 번의 DOM 갱신으로 전체 트리를 교체
    mountElement.innerHTML = build(state.tree);
  }

  // 선택 문서 강조 표시 동기화
  function syncSelectedHighlight() {
    mountElement.querySelectorAll(".doc-row.selected").forEach((row) => {
      row.classList.remove("selected");
    });

    if (state.selectedId == null) return;

    const node = mountElement.querySelector(
      `.doc-node[data-id="${state.selectedId}"]`
    );
    const row = node ? node.querySelector(".doc-row") : null;

    if (row) row.classList.add("selected");
  }

  // 클릭 이벤트 핸들러 (이벤트 위임)
  async function handleClick(e) {
    const el = e.target.closest("[data-action]");
    if (!el) return;

    const action = el.dataset.action;
    const id = Number(el.dataset.id);
    if (Number.isNaN(id)) return;

    try {
      // 루트 문서 추가
      if (action === ACTION.ADD_ROOT) {
        try {
          const created = await createDocument({
            title: "New page",
            parent: null,
          });
          await load(created.id);
          onSelect && onSelect(created.id);
        } catch (err) {
          console.error(err);
        }
        return;
      }

      // 선택: 표시만 바꾸고, 외부(onSelect)에 "선택됨" 알림
      if (action === ACTION.SELECT) {
        state.selectedId = id;
        syncSelectedHighlight();
        onSelect && onSelect(id);
        return;
      }

      // 하위 문서 추가: 내부에서 트리 갱신 + 선택 표시, 외부에 알림
      if (action === ACTION.ADD_CHILD) {
        const created = await createDocument({
          title: "제목 없음",
          parent: id,
        });
        await load(created.id); // 새 문서를 선택 상태로 갱신
        onSelect && onSelect(created.id);
        return;
      }

      // 삭제: 내부에서 트리 갱신, 선택 문서였으면 외부에 null 알림
      if (action === ACTION.DELETE) {
        const ok = confirm("삭제할까요? 하위 문서도 함께 삭제됩니다.");
        if (!ok) return;

        const isSelected = state.selectedId === id;
        await deleteDocument(id);

        if (isSelected) {
          await load(null); // 선택 해제 상태로 트리만 갱신
          onSelect && onSelect(null);
        } else {
          await load(state.selectedId); // 기존 선택 유지
        }
        return;
      }
    } catch (err) {
      console.error(err);
    }
  }

  // 초기 이벤트 바인딩
  sidebarEl.addEventListener("click", handleClick);

  // 외부에 공개
  return { load, setSelected, destroy };
}

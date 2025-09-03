import {} from '../api/api.js';

async function runExamples() {
  try {
    // 1) 문서 목록 조회 (GET /documents)
    const docs = await listDocuments();
    console.log('문서 트리:', docs);

    // 2) 단일 문서 조회 (GET /documents/:id)
    const docId = docs[0]?.id; // 첫 번째 문서 ID (예시)
    // id값을 안다면 여기서부터 작성
    if (docId) {
      const doc = await getDocument(docId);
      console.log('단일 문서:', doc);
    }

    // 4) 문서 수정 (PUT /documents/:id)
    const updatedDoc = await updateDocument(newDoc.id, {
      title: '수정된 문서 제목',
    });
    console.log('수정된 문서:', updatedDoc);
  } catch (err) {
    console.error('API 호출 중 에러:', err);
  }
}

runExamples();

const title = document.querySelector('.Title');
const content = document.querySelector('.EditorContainer');

let currentId = null;
let dirty = false;

title.addEventListener('keyup', (e) => {
  let titleEdit = e.target.value;
});
content.addEventListener('keyup', (e) => {
  let contentEdit = e.target.value;
});

async function openDocument(id) {
  currentId = id;
  try {
    const doc = await getDocument(id);
    title.value = doc.title ?? '';
    content.value = doc.content ?? '';
    dirty = false;
  } catch (e) {
    console.error('문서 로드 실패:', e);
    title.value = '';
    content.value = '';
  }
}

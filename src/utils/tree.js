// 특정 id의 노드를 찾는 함수
export function findNode(nodes, targetId) {
  for (const node of nodes) {
    if (Number(node.id) === Number(targetId)) return node;

    const children = node.documents || [];
    const hit = findNode(children, targetId);

    if (hit) return hit;
  }
  return null;
}

// 노드 포함, 모든 하위 문서 id를 (부모가 마지막이 되도록) 후위 순회로 수집
export function collectSubtreeIds(node, acc = []) {
  const children = node.documents || [];

  for (const child of children) {
    collectSubtreeIds(child, acc);
  }
  acc.push(Number(node.id));

  return acc;
}

export class BinarySearchTree {
  constructor() {
    this.root = null;
  }

  insert(value) {
    const node = { value, left: null, right: null };
    if (!this.root) {
      this.root = node;
      return true;
    }
    let current = this.root;
    while (true) {
      if (value === current.value) return false;
      const side = value < current.value ? "left" : "right";
      if (!current[side]) {
        current[side] = node;
        return true;
      }
      current = current[side];
    }
  }

  search(value) {
    let current = this.root;
    while (current) {
      if (current.value === value) return true;
      current = value < current.value ? current.left : current.right;
    }
    return false;
  }

  traverse(order = "inorder") {
    const values = [];
    const visit = (node) => {
      if (!node) return;
      if (order === "preorder") values.push(node.value);
      visit(node.left);
      if (order === "inorder") values.push(node.value);
      visit(node.right);
      if (order === "postorder") values.push(node.value);
    };
    visit(this.root);
    return values;
  }
}

export function breadthFirstSearch(graph, start) {
  if (!graph.has(start)) return [];
  const visited = new Set([start]);
  const order = [];
  const queue = [start];
  for (let head = 0; head < queue.length; head += 1) {
    const vertex = queue[head];
    order.push(vertex);
    for (const neighbor of graph.get(vertex) || []) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
      }
    }
  }
  return order;
}

export function depthFirstSearch(graph, start) {
  if (!graph.has(start)) return [];
  const visited = new Set();
  const order = [];
  const visit = (vertex) => {
    if (visited.has(vertex)) return;
    visited.add(vertex);
    order.push(vertex);
    for (const neighbor of graph.get(vertex) || []) visit(neighbor);
  };
  visit(start);
  return order;
}

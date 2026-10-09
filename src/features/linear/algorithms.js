export class LinkedList {
  constructor(values = []) {
    this.head = null;
    this.length = 0;
    values.forEach((value) => this.append(value));
  }

  append(value) {
    const node = { value, next: null };
    if (!this.head) {
      this.head = node;
    } else {
      let current = this.head;
      while (current.next) current = current.next;
      current.next = node;
    }
    this.length += 1;
  }

  remove(value) {
    if (!this.head) return false;
    if (this.head.value === value) {
      this.head = this.head.next;
      this.length -= 1;
      return true;
    }
    let current = this.head;
    while (current.next && current.next.value !== value) current = current.next;
    if (!current.next) return false;
    current.next = current.next.next;
    this.length -= 1;
    return true;
  }

  toArray() {
    const values = [];
    let current = this.head;
    while (current) {
      values.push(current.value);
      current = current.next;
    }
    return values;
  }
}

export class Stack {
  constructor() {
    this.items = [];
  }
  push(value) {
    this.items.push(value);
  }
  pop() {
    return this.items.pop();
  }
  toArray() {
    return [...this.items].reverse();
  }
}

export class Queue {
  constructor() {
    this.items = [];
    this.front = 0;
  }
  enqueue(value) {
    this.items.push(value);
  }
  dequeue() {
    if (this.front >= this.items.length) return undefined;
    const value = this.items[this.front];
    this.front += 1;
    if (this.front > 32 && this.front * 2 >= this.items.length) {
      this.items = this.items.slice(this.front);
      this.front = 0;
    }
    return value;
  }
  toArray() {
    return this.items.slice(this.front);
  }
}

export function evaluateExpression(expression) {
  const tokens = expression.match(/\d+(?:\.\d+)?|[()+\-*/]/g) || [];
  const compact = expression.replace(/\s/g, "");
  if (!tokens.length || tokens.join("") !== compact) {
    throw new Error("Use numbers and the +, −, ×, ÷ signs or brackets only.");
  }

  const output = [];
  const operators = [];
  const precedence = { "+": 1, "-": 1, "*": 2, "/": 2, "u-": 3 };
  let expectValue = true;

  for (const token of tokens) {
    if (/^\d/.test(token)) {
      if (!expectValue) throw new Error("Add a sign between the numbers.");
      output.push(Number(token));
      expectValue = false;
    } else if (token === "(") {
      if (!expectValue) throw new Error("Add a sign before the bracket.");
      operators.push(token);
    } else if (token === ")") {
      if (expectValue) throw new Error("Check the numbers and signs before the closing bracket.");
      while (operators.length && operators.at(-1) !== "(") output.push(operators.pop());
      if (operators.pop() !== "(") throw new Error("The opening and closing brackets do not match.");
      expectValue = false;
    } else {
      let operator = token;
      if (expectValue && operator === "-") operator = "u-";
      else if (expectValue) throw new Error("Put a number before this sign.");
      const rightAssociative = operator === "u-";
      while (
        operators.length &&
        operators.at(-1) !== "(" &&
        (precedence[operators.at(-1)] > precedence[operator] ||
          (!rightAssociative && precedence[operators.at(-1)] === precedence[operator]))
      ) {
        output.push(operators.pop());
      }
      operators.push(operator);
      expectValue = true;
    }
  }

  if (expectValue) throw new Error("Finish with a number.");
  while (operators.length) {
    const operator = operators.pop();
    if (operator === "(") throw new Error("The opening and closing brackets do not match.");
    output.push(operator);
  }

  const values = [];
  for (const token of output) {
    if (typeof token === "number") {
      values.push(token);
    } else if (token === "u-") {
      if (values.length < 1) throw new Error("The expression is incomplete.");
      values.push(-values.pop());
    } else {
      if (values.length < 2) throw new Error("The expression is incomplete.");
      const right = values.pop();
      const left = values.pop();
      if (token === "/" && right === 0) throw new Error("You cannot divide by zero.");
      values.push(token === "+" ? left + right : token === "-" ? left - right : token === "*" ? left * right : left / right);
    }
  }
  if (values.length !== 1 || !Number.isFinite(values[0])) throw new Error("Check your numbers and signs, then try again.");
  return values[0];
}

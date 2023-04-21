export type StackNode<T> = {
  value: T;
  prev: StackNode<T> | undefined;
  next: StackNode<T> | undefined;
};

export class Stack<T> {
  constructor() {
    this.tail = undefined;
    this.length = 0;
  }
  length: number;
  tail: StackNode<T> | undefined;
  push(value: T): number {
    this.length++;
    let newNode: StackNode<T> = { value, next: undefined, prev: undefined };
    if (!this.tail) {
      this.tail = newNode;
      return this.length;
    }
    this.tail.next = newNode;
    newNode.prev = this.tail;
    this.tail = newNode;
    return this.length;
  }
  pop(): T | undefined {
    if (!this.tail) return undefined;
    this.length--;
    let value = this.tail.value;
    if (this.length === 0) {
      this.tail = undefined;
      return value;
    }
    this.tail = this.tail.prev;
    this.tail!.next = undefined;
    return value;
  }
  peek(): T | undefined {
    return this.tail?.value;
  }
}

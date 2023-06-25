class SkipListNode<T> {
  value: T;
  level: number;
  height: number;

  up: SkipListNode<T>;
  down: SkipListNode<T>;
  next: SkipListNode<T>;
  prev: SkipListNode<T>;

  constructor(value: T, level: number, height: number) {
    this.value = value;
    this.level = level;
    this.up = null;
    this.down = null;
    this.next = null;
    this.prev = null;
    this.height = height;
  }
}

export class SkipList<T> {
  private heads: SkipListNode<T>[];
  private tails: SkipListNode<T>[];
  private MAX_VALUE;
  private MIN_VALUE;
  private MAXIMUM_LEVEL_LIMIT = 10; // if maxLength of list = n, around log(n)
  private size: number;
  private compareFunction: (a: T, b: T) => number = function (a: T, b: T) {
    if (a > b) {
      return 1;
    }

    if (a < b) {
      return -1;
    }

    return 0;
  }; // same rule with https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort

  constructor(MIN_VALUE: T, MAX_VALUE: T, compareFunction?: (a: T, b: T) => number) {
    this.MAX_VALUE = MAX_VALUE;
    this.MIN_VALUE = MIN_VALUE;

    this.compareFunction = compareFunction;

    this.size = 0;

    const heads = [];
    const tails = [];

    for (let i = 0; i < this.MAXIMUM_LEVEL_LIMIT; i++) {
      const head = new SkipListNode<number>(this.MIN_VALUE, i, this.MAXIMUM_LEVEL_LIMIT);
      const tail = new SkipListNode<number>(this.MAX_VALUE, i, this.MAXIMUM_LEVEL_LIMIT);
      head.next = tail;
      tail.prev = head;
      heads.push(head);
      tails.push(tail);
    }

    this._bindHorizontally(heads);
    this._bindHorizontally(tails);

    this.heads = heads;
    this.tails = tails;
  }

  private _bindHorizontally(nodes: SkipListNode<T>[]) {
    for (let i = 0; i < nodes.length; i++) {
      if (i > 0) {
        nodes[i].down = nodes[i - 1];
      }
      if (i + 1 < nodes.length) {
        nodes[i].up = nodes[i + 1];
      }
    }
  }

  private randomLevel(): number {
    let level = 1;
    while (Math.random() < 0.5 && level < this.MAXIMUM_LEVEL_LIMIT) {
      level++;
    }
    return level;
  }

  public insert(value: T): void {
    const randomLevel = this.randomLevel();

    const nodes = [];
    for (let i = 0; i < randomLevel; i++) {
      nodes.push(new SkipListNode(value, i, randomLevel));
    }

    this._bindHorizontally(nodes);

    let level = randomLevel - 1;
    let current = this.heads[level];

    while (level >= 0) {
      while (this.compareFunction(current.next.value, value) < 0) {
        current = current.next;
      }

      nodes[level].prev = current;
      nodes[level].next = current.next;

      current.next.prev = nodes[level];
      current.next = nodes[level];

      current = current.down;
      level--;
    }
  }

  public search(value: T): SkipListNode<T> {
    let current = this.heads[this.MAXIMUM_LEVEL_LIMIT - 1];
    let currentLevel = this.MAXIMUM_LEVEL_LIMIT - 1;

    while (currentLevel > 0) {
      while (this.compareFunction(current.next.value, value) <= 0) {
        current = current.next;
      }

      if (current?.value === value) {
        break;
      }

      if (current.down) {
        current = current.down;
      } else {
        break;
      }
      currentLevel--;
    }

    while (current?.down) {
      current = current.down;
    }

    while (this.compareFunction(current.next.value, value) <= 0) {
      current = current.next;
    }

    if (current?.value === value) {
      return current;
    }

    return null;
  }

  public delete(value: T): void {
    let current = this.search(value);

    if (!current) {
      return;
    }

    const prev = current.prev;
    const next = current.next;

    prev.next = next;
    next.prev = prev;

    while (current?.up) {
      current = current.up;

      const prev = current.prev;
      const next = current.next;

      prev.next = next;
      next.prev = prev;
    }
  }

  public getWholeStructureVertically() {
    const result = [];
    let current = this.heads[0];

    while (current.next) {
      const column = [];
      let cur = current;
      column.push(cur.value);
      while (cur.up) {
        column.push(cur.value);
        cur = cur.up;
      }
      result.push(column);

      current = current.next;
    }

    return result;
  }

  public getWholeStructureHorizontally() {
    const result = [];

    for (let i = 0; i < this.heads.length; i++) {
      let current = this.heads[i];
      const row = [];

      let cur = current;
      row.push(cur.value);
      while (cur.next) {
        cur = cur.next;
        row.push(cur.value);
      }

      result.push(row);
    }

    return result;
  }

  public traverse() {
    const result = [];

    let current = this.heads[0];

    result.push({
      val: current.value,
      prev: current.prev?.value,
      next: current.next?.value,
      height: current.height,
    });
    current = current.next;

    while (current.next) {
      result.push({
        val: current.value,
        prev: current.prev?.value,
        next: current.next?.value,
        height: current.height,
      });

      current = current.next;
    }

    result.push({
      val: current.value,
      prev: current.prev?.value,
      next: current.next?.value,
      height: current.height,
    });

    return result;
  }
}

const test = () => {
  const valueLimit = 999999;
  const compareFunction = (a: number, b: number) => {
    if (a > b) {
      return 1;
    }

    if (a < b) {
      return -1;
    }

    return 0;
  };

  const skipList = new SkipList<number>(-valueLimit, valueLimit, compareFunction);

  const randomNumbers = [];

  for (let i = 0; i < 10; i++) {
    randomNumbers.push((Math.random() * 100) | 0);
  }

  let i = randomNumbers.length;
  while (i--) {
    skipList.insert(randomNumbers[i]);
  }
  console.log(skipList.traverse());
  i = randomNumbers.length;
  while (i--) {
    skipList.delete(randomNumbers[i]);
  }
  console.log(skipList.traverse());
};

test();

"use strict";
exports.__esModule = true;
exports.SkipList = void 0;
var SkipListNode = /** @class */ (function () {
    function SkipListNode(value, level, height) {
        this.value = value;
        this.level = level;
        this.up = null;
        this.down = null;
        this.next = null;
        this.prev = null;
        this.height = height;
    }
    return SkipListNode;
}());
var SkipList = /** @class */ (function () {
    function SkipList(MIN_VALUE, MAX_VALUE) {
        this.MAXIMUM_LEVEL_LIMIT = 10; // if maxLength of list = n, around log(n)
        this.MAX_VALUE = MAX_VALUE;
        this.MIN_VALUE = MIN_VALUE;
        this.size = 0;
        var heads = [];
        var tails = [];
        for (var i = 0; i < this.MAXIMUM_LEVEL_LIMIT; i++) {
            var head = new SkipListNode(this.MIN_VALUE, i, this.MAXIMUM_LEVEL_LIMIT);
            var tail = new SkipListNode(this.MAX_VALUE, i, this.MAXIMUM_LEVEL_LIMIT);
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
    SkipList.prototype._bindHorizontally = function (nodes) {
        for (var i = 0; i < nodes.length; i++) {
            if (i > 0) {
                nodes[i].down = nodes[i - 1];
            }
            if (i + 1 < nodes.length) {
                nodes[i].up = nodes[i + 1];
            }
        }
    };
    SkipList.prototype.randomLevel = function () {
        var level = 1;
        while (Math.random() < 0.5 && level < this.MAXIMUM_LEVEL_LIMIT) {
            level++;
        }
        return level;
    };
    SkipList.prototype.insert = function (value) {
        var randomLevel = this.randomLevel();
        var nodes = [];
        for (var i = 0; i < randomLevel; i++) {
            nodes.push(new SkipListNode(value, i, randomLevel));
        }
        this._bindHorizontally(nodes);
        var level = randomLevel - 1;
        var current = this.heads[level];
        while (level >= 0) {
            while (value > current.next.value) {
                current = current.next;
            }
            nodes[level].prev = current;
            nodes[level].next = current.next;
            current.next.prev = nodes[level];
            current.next = nodes[level];
            current = current.down;
            level--;
        }
    };
    SkipList.prototype.search = function (value) {
        var _a, _b;
        var current = this.heads[this.MAXIMUM_LEVEL_LIMIT - 1];
        var currentLevel = this.MAXIMUM_LEVEL_LIMIT - 1;
        while (currentLevel > 0) {
            while (((_a = current === null || current === void 0 ? void 0 : current.next) === null || _a === void 0 ? void 0 : _a.value) <= value) {
                current = current.next;
            }
            if ((current === null || current === void 0 ? void 0 : current.value) === value) {
                break;
            }
            if (current.down) {
                current = current.down;
            }
            else {
                break;
            }
            currentLevel--;
        }
        while (current === null || current === void 0 ? void 0 : current.down) {
            current = current.down;
        }
        while (((_b = current === null || current === void 0 ? void 0 : current.next) === null || _b === void 0 ? void 0 : _b.value) <= value) {
            current = current.next;
        }
        if ((current === null || current === void 0 ? void 0 : current.value) === value) {
            return current;
        }
        return null;
    };
    SkipList.prototype["delete"] = function (value) {
        var current = this.search(value);
        if (!current) {
            return;
        }
        var prev = current.prev;
        var next = current.next;
        prev.next = next;
        next.prev = prev;
        while (current === null || current === void 0 ? void 0 : current.up) {
            current = current.up;
            var prev_1 = current.prev;
            var next_1 = current.next;
            prev_1.next = next_1;
            next_1.prev = prev_1;
        }
    };
    SkipList.prototype.getWholeStructureVertically = function () {
        var result = [];
        var current = this.heads[0];
        while (current.next) {
            var column = [];
            var cur = current;
            column.push(cur.value);
            while (cur.up) {
                column.push(cur.value);
                cur = cur.up;
            }
            result.push(column);
            current = current.next;
        }
        return result;
    };
    SkipList.prototype.getWholeStructureHorizontally = function () {
        var result = [];
        for (var i = 0; i < this.heads.length; i++) {
            var current = this.heads[i];
            var row = [];
            var cur = current;
            row.push(cur.value);
            while (cur.next) {
                cur = cur.next;
                row.push(cur.value);
            }
            result.push(row);
        }
        return result;
    };
    SkipList.prototype.traverse = function () {
        var _a, _b, _c, _d, _e, _f;
        var result = [];
        var current = this.heads[0];
        result.push({
            val: current.value,
            prev: (_a = current.prev) === null || _a === void 0 ? void 0 : _a.value,
            next: (_b = current.next) === null || _b === void 0 ? void 0 : _b.value,
            height: current.height
        });
        current = current.next;
        while (current.next) {
            result.push({
                val: current.value,
                prev: (_c = current.prev) === null || _c === void 0 ? void 0 : _c.value,
                next: (_d = current.next) === null || _d === void 0 ? void 0 : _d.value,
                height: current.height
            });
            current = current.next;
        }
        result.push({
            val: current.value,
            prev: (_e = current.prev) === null || _e === void 0 ? void 0 : _e.value,
            next: (_f = current.next) === null || _f === void 0 ? void 0 : _f.value,
            height: current.height
        });
        return result;
    };
    return SkipList;
}());
exports.SkipList = SkipList;
var test = function () {
    var valueLimit = 999999;
    var skipList = new SkipList(-valueLimit, valueLimit);
    var randomNumbers = [];
    for (var i_1 = 0; i_1 < 10; i_1++) {
        randomNumbers.push((Math.random() * 100) | 0);
    }
    var i = randomNumbers.length;
    while (i--) {
        skipList.insert(randomNumbers[i]);
    }
    console.log(skipList.traverse());
    i = randomNumbers.length;
    while (i--) {
        skipList["delete"](randomNumbers[i]);
    }
    console.log(skipList.traverse());
};
test();

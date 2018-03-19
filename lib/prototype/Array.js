"use strict";

//返回时间的字符串格式.
Object.defineProperty(Array.prototype, "spliceDate", {
  value: function value() {
    if (this.length == 0) return [];
    return this.map(function (it) {
      if (!it) return it;
      return it.valueOf().toDateString();
    });
  },
  enumerable: false
});

Object.defineProperty(Array.prototype, "last", {
  value: function value(filter) {
    if (!this.length) return null;
    if (!filter) {
      filter = function filter() {
        return true;
      };
    }

    for (var i = this.length - 1; i > -1; i--) {
      var item = this[i];
      if (filter(item)) return item;
    }
    return null;
  },
  enumerable: false
});

/**
 * eqFunc = function(a,b){ a == b } ;
 */
Object.defineProperty(Array.prototype, "putDistinct", {
  value: function value(val, eqFunc) {
    if (!eqFunc) {
      eqFunc = function eqFunc(a, b) {
        return a == b;
      };
    }

    if (this.findIndex(function (it) {
      return eqFunc(it, val);
    }) >= 0) {
      return;
    }

    this.push(val);
  },
  enumerable: false
});

/**
 * eqFunc = function(a,b){ return a == b }
 */
Object.defineProperty(Array.prototype, "distinct", {
  value: function value(eqFunc) {
    var ret = [];
    if (!eqFunc) {
      eqFunc = function eqFunc(a, b) {
        return a == b;
      };
    }

    this.forEach(function (it) {
      ret.putDistinct(it, eqFunc);
    });

    return ret;
  },
  enumerable: false
});

// Object.defineProperty(Array.prototype, "reSplice", {
//   value() {
//     this.splice.apply(this, [0, this.length].concat(this));
//   }, enumerable: false
// });
//交换两项的位置
Object.defineProperty(Array.prototype, "swap", {
  value: function value(index1, index2) {
    this[index1] = this.splice(index2, 1, this[index1])[0];
    return this;
  }
});

/** 递归一个数组:
 * @param subCallback, 每一项包含子项的回调.
 * @param action 参数:自己,父节点,自己在父节点的索引.每一项的回调. 如果返回false,则停止 , 如果返回 null,则停止子项.
 */
Object.defineProperty(Array.prototype, "recursion", {
  value: function value(subCallback, action) {
    var r;
    for (var i = 0, len = this.length; i < len; i++) {
      var item = this[i];
      var r = action(item, i);
      if (r === false) return false;
      if (r === null) continue;
      var subItems = subCallback(item);
      if (subItems && subItems.length) {
        if (subItems.recursion(subCallback, action) === false) return false;
      }
    }
    return true;
  },
  enumerable: false
});

/**
 * 获取两个数组交集,返回 Set 类型
 */
Object.defineProperty(Array.prototype, "intersect", {
  value: function value(other, eqFunc) {
    var ret = [];
    if (!eqFunc) {
      eqFunc = function eqFunc(a, b) {
        return a == b;
      };
    }
    if (!other) return ret;
    other = Array.from(other);
    for (var i = 0, len = this.length; i < len; i++) {
      var item = this[i];
      if (other.findIndex(function (it) {
        return eqFunc(item, it);
      }) >= 0) {
        ret.putDistinct(item, eqFunc);
      }
    }
    return ret;
  },
  enumerable: false
});

/**
 * 把数组的数组,解开合成一个数组.
 */
Object.defineProperty(Array.prototype, "unwind", {
  value: function value() {
    var ret = [];
    this.forEach(function (wai) {
      wai.forEach(function (it) {
        ret.push(it);
      });
    });
    return ret;
  },
  enumerable: false
});
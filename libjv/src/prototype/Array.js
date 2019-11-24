//返回时间的字符串格式.
Object.defineProperty(Array.prototype, "spliceDate", {
    value() {
        if (this.length == 0) return [];
        return this.map(it => {
            if (!it) return it;
            return it.valueOf().toDateString(null,"local");
        });
    }
    , enumerable: false
});


Object.defineProperty(Array.prototype, "last", {
    value(filter) {
        if (!this.length) return null;
        if (!filter) {
            filter = function () {
                return true;
            }
        }

        for (var i = this.length - 1; i > -1; i--) {
            var item = this[i];
            if (filter(item,i)) return item;
        }
        return null;
    }, enumerable: false
});

//增强型ForEach，函数返回 false 退出循环。
// filter第二个参数是 index
//返回循环的个数。
Object.defineProperty(Array.prototype, "ForEach", {
    value(filter, trueAction, falseAction) {
        var ret = 0;
        if (!this.length || !filter) return ret;

        for (var i = 0, len = this.length; i < len; i++) {
            var item = this[i];
            var ret = filter(item, i);
            if (ret === false) {
                if (falseAction && (falseAction(item, i) !== false)) {
                    continue;
                }
                return ret;
            } else if (ret === true && trueAction) {
                trueAction(item, i);
            }
            ret++;
        }
        return ret;
    }, enumerable: false
});

/**
 * eqFunc = function(a,b){ a == b } ;
 */
Object.defineProperty(Array.prototype, "putDistinct", {
    value(val, eqFunc) {
        if (!eqFunc) {
            eqFunc = function (a, b) {
                return a == b
            };
        }

        if (this.findIndex(it => eqFunc(it, val)) >= 0) {
            return;
        }

        this.push(val);
    }, enumerable: false
});

/**
 * eqFunc = function(a,b){ return a == b }
 */
Object.defineProperty(Array.prototype, "distinct", {
    value(eqFunc) {
        var ret = [];
        if (!eqFunc) {
            eqFunc = function (a, b) {
                return a == b
            }
        }

        this.forEach(it => {
            ret.putDistinct(it, eqFunc);
        })

        return ret;
    }, enumerable: false
});

//使用 splice 方法，使数据变化有效。参数可以是具体的值，也可以是数组对象。可以是任意多个。
// value 可以是 Array , Set
Object.defineProperty(Array.prototype, "pushAll", {
    value(ary) {
        if (!ary) return this;
        if (ary.Type == "set") {
            ary = Array.from(ary);
        }
        this.splice.apply(this, [0, this.length].concat(this).concat(jv.IsNull(ary) ? [] : ary));
        return this;
    }, enumerable: false
});

//交换两项的位置
Object.defineProperty(Array.prototype, "swap", {
    value(index1, index2) {
        this[index1] = this.splice(index2, 1, this[index1])[0];
        return this;
    }
});


/** 递归一个数组:
 * @param subCallback, 每一项包含子项的回调.
 * @param action 参数:自己,父节点,自己在父节点的索引.每一项的回调. 如果返回false,则停止 , 如果返回 null,则停止子项.
 */
Object.defineProperty(Array.prototype, "recursion", {
    value(subCallback, action) {
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
    }, enumerable: false
});

//集合减法，用 filter .
Object.defineProperty(Array.prototype, "minus", {
    value(other, eqFunc) {
        if (jv.IsNull(other)) return this;
        if (!other.length ) return this;

        eqFunc = eqFunc || ((a, b) => a == b);
        var ret = [];

        for (var i = 0, len = this.length; i < len; i++) {
            var one = this[i];
            var two = other.findIndex(it=>eqFunc(one,it));
            if (two < 0) {
                ret.push(one);
            }
        }
        return ret;
    }
});
/**
 * 获取两个数组交集,返回 Set 类型
 */
Object.defineProperty(Array.prototype, "intersect", {
    value(other, eqFunc) {
        var ret = []
        if (!eqFunc) {
            eqFunc = function (a, b) {
                return a == b
            };
        }
        if (!other) return ret;
        other = Array.from(other);
        for (var i = 0, len = this.length; i < len; i++) {
            var item = this[i];
            if (other.findIndex(it => eqFunc(item, it)) >= 0) {
                ret.putDistinct(item, eqFunc);
            }
        }
        return ret;
    }, enumerable: false
});

/**
 * 把数组的数组,解开合成一个数组.
 */
Object.defineProperty(Array.prototype, "unwind", {
    value() {
        var ret = [];
        this.forEach(wai => {
            wai.forEach(it => {
                ret.push(it);
            });
        });
        return ret;
    }, enumerable: false
});

Object.defineProperty(Array.prototype, "max", {
    value(emptyValue) {
        if (!this.length) return emptyValue || 0;
        return Math.max.apply(Math, this);
    }, enumerable: false
});

Object.defineProperty(Array.prototype, "min", {
    value(emptyValue) {
        if (!this.length) return emptyValue || 0;
        return Math.min.apply(Math, this);
    }, enumerable: false
});
Object.defineProperty(Array.prototype, "sum", {
    value(emptyValue) {
        if (!this.length) return emptyValue || 0;
        return this.reduce((t, i) => t + i);
    }, enumerable: false
});

Object.defineProperty(Array.prototype, "removeAt", {
    value(index) {
        if (index < 0 || index >= this.length) return this;
        return this.splice(index, 1);
    }, enumerable: false
});

/**
 * 移除某项。
 * 参数可以是某一项，也可以是回调，参数：item,index
 */
Object.defineProperty(Array.prototype, "removeItem", {
    value(item) {
        var indeies = [];
        this.ForEach((it, index) => {
            if (it === item) {
                indeies.push(index)
            }
        });

        if (item && item.Type == "function") {
            this.ForEach(item, (it, index) => {
                indeies.push(index)
            }, it => null);
        }

        if (!indeies.length) return this;

        indeies.reverse().ForEach((index) => {
            this.splice(index, 1);
        });
        return this;
    }, enumerable: false
});
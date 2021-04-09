(function () {
    if (Array.init) {
        return;
    }

// 初始化指定数量的数组。初始化值不指定，会使用 null 初始化。
    Array.init = (number, value) => {
        var ret = [];
        if (!number) return ret;
        var isNul = jv.isNull(value);
        for (var i = 0; i < number; i++) {
            ret.push(isNul ? null : value);
        }
        return ret;
    };
    // /**
    //  * 根据 key 或 lambda 找出最小的项。
    //  */
    // Object.defineProperty(Array.prototype, "findIndex", {
    //     value(eqCallback) {
    //         var eqIsFunction = eqCallback.Type == "function";
    //         for (var i = 0, len = this.length; i < len; i++) {
    //             if (eqIsFunction) {
    //                 if (eqCallback(this[i])) return i;
    //             } else {
    //                 if (this[i] === eqCallback) return i;
    //             }
    //         }
    //         return -1;
    //     }
    //     , enumerable: false
    // });

    //返回时间的字符串格式.
    Object.defineProperty(Array.prototype, "spliceDate", {
        value() {
            if (!this.length) return [];
            return this.map(it => {
                if (!it) return it;
                return it.valueOf().toDateString(null, "local");
            });
        }
        , enumerable: false
    });

    Object.defineProperty(Array.prototype, "IndexOf", {
        value(filter) {
            if (!this.length) return -1;
            if (!filter || filter.Type != "function") {
                return this.indexOf(filter);
            }

            for (var i = 0, len = this.length; i < len; i++) {
                var item = this[i];
                if (filter(item, i)) return i;
            }
            return -1;
        }, enumerable: false
    });

    Object.defineProperty(Array.prototype, "LastIndexOf", {
        value(filter) {
            if (!this.length) return -1;
            if (!filter || filter.Type != "function") {
                return this.lastIndexOf(filter);
            }

            for (var i = this.length - 1; i > -1; i--) {
                var item = this[i];
                if (filter(item, i)) return i;
            }
            return -1;
        }, enumerable: false
    });

    Object.defineProperty(Array.prototype, "last", {
        value(filter) {
            if (!this.length) return null;
            if (!filter) {
                filter = () => true
            }

            for (var i = this.length - 1; i > -1; i--) {
                var item = this[i];
                if (filter(item, i)) return item;
            }
            return null;
        }, enumerable: false
    });

    //增强型ForEach，函数返回 false 退出循环。
    // filter第二个参数是 index
    //没有值返回 null , 如果全部执行完，返回true, 否则返回 filter 返回的值false。
    Object.defineProperty(Array.prototype, "ForEach", {
        value(filter, trueAction, falseAction) {
            return this.forEachIndexed(filter, trueAction, falseAction)
        }, enumerable: false
    });

    Object.defineProperty(Array.prototype, "forEachIndexed", {
        value(filter, trueAction, falseAction) {
            if (!this.length) return null;
            if (!filter) return true;

            for (var index = 0, len = this.length; index < len; index++) {
                var item = this[index];
                var ret = filter(item, index);
                if (ret === false) {
                    if (falseAction && (falseAction(item, index) !== false)) {
                        continue;
                    }
                    return ret;
                } else if (ret === true && trueAction) {
                    trueAction(item, index);
                }
            }
            return true;
        }, enumerable: false
    });


    /**
     * eqFunc = function(a,b){ a == b } ;
     */
    Object.defineProperty(Array.prototype, "putDistinct", {
        value(val, eqFunc) {
            if (!eqFunc) {
                eqFunc = (a, b) => a == b
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
                eqFunc = (a, b) => a == b
            }

            this.forEach(it => {
                ret.putDistinct(it, eqFunc);
            });

            return ret;
        }, enumerable: false
    });

//使用 splice 方法，使数据变化有效。参数可以是array,set。
    Object.defineProperty(Array.prototype, "pushAll", {
        value(ary) {
            if (!ary) {
                ary = [];
            }
            if (ary.Type == "set") {
                ary = Array.from(ary);
            }
            this.splice.apply(this, [this.length, 0].concat(ary));
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


    //兼容性
    if (!Array.prototype.includes) {
        Object.defineProperty(Array.prototype, "includes", {
            value(find) {
                return this.indexOf(find) >= 0;
            }, enumerable: false
        });
    }


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
            if (jv.isNull(other)) return this;
            if (!other.length) return this;

            eqFunc = eqFunc || ((a, b) => a == b);
            var ret = [];

            for (var i = 0, len = this.length; i < len; i++) {
                var one = this[i];
                var two = other.findIndex(it => eqFunc(one, it));
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
                eqFunc = (a, b) => a == b
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

    /**
     * 可以自定义比较,性能比 sort 好。
     * @param compare : 比较器，返回第1个数是否大于第2个数， 可以用 1 或 true 表示。
     */
    Object.defineProperty(Array.prototype, "max", {
        value(compare) {
            compare = compare || function (a, b) {
                return a > b;
            };

            var len = this.length;
            if (!len) return null;
            var max_item = this[0];
            for (var i = 1; i < len; i++) {
                var item = this[i];
                var ret = compare(item, max_item);

                if (ret === false) {
                    continue;
                }

                if (ret === true) {
                    max_item = item;
                } else if (ret > 0) {
                    max_item = item;
                }
            }
            return max_item;
        }, enumerable: false
    });


    /**
     * 可以自定义比较,性能比 sort 好。
     * @param compare : 比较器，返回第1个数是否大于第2个数， 可以用 1 或 true 表示。
     */
    Object.defineProperty(Array.prototype, "min", {
        value(compare) {
            compare = compare || function (a, b) {
                return a > b;
            };

            var len = this.length;
            if (!len) return null;
            var max_item = this[0];
            for (var i = 1; i < len; i++) {
                var item = this[i];
                var ret = compare(item, max_item);

                if (ret === true) {
                    continue;
                }

                if (ret === false) {
                    max_item = item;
                } else if (ret < 0) {
                    max_item = item;
                }
            }
            return max_item;
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
            this.splice(index, 1);
            return this;
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

})()
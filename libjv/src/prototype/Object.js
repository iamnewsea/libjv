//-------------------------------------------------------------
//返回 function ,string 等实际类名。
//单例.

(function () {
    if (Object.prototype.Type) {
        return;
    }

    JSON.clone = (value) => {
        return JSON.parse(JSON.stringify(value));
    };

    Object.defineProperty(Object.prototype, "Type", {
        get() {
            var ret = this.constructor.name || typeof (this);
            //把第一个非大写字母前面的全部变成小写字母。
            //不宜使用 this.prototype.constructor.name

            if (ret) {
                var index = 0;
                for (var it of ret) {
                    var code = it.charCodeAt();
                    if (code >= 65 && code <= 90) {
                        index++;
                    } else {
                        break;
                    }
                }

                if (index) {
                    if (index > 1) {
                        index--;
                    }
                    ret = ret.slice(0, index).toLocaleLowerCase() + ret.slice(index);
                }
            }
            return ret;
        }, enumerable: false,configurable:true
    });

    var primitives = ["object", "array", "function", "map", "set", "math", "date", "regexp", "string", "number", "boolean", "symbol", "undefined", "null"];
//判断是否是基本数据类型
//如果是内置数据类型，返回内置数据类型。
//否则，返回 false
    Object.defineProperty(Object.prototype, "PrimitiveType", {
        get() {
            var type = this.Type;
            if (primitives.includes(type)) {
                return type;
            }
            return false;
        }, enumerable: false,configurable:true
    });

//判断类型
    Object.defineProperty(Object.prototype, "ObjectType", {
        get() {
            var type = this.Type;
            if (["object", "map"].includes(type)) {
                return type;
            }
            if (primitives.includes(type)) {
                return false;
            }
            return type;
        }, enumerable: false,configurable:true
    });

//大于等于 and 小于等于
    Object.defineProperty(Object.prototype, "Between", {
        value(start, end) {
            if (start > end) {
                var t = start;
                start = end;
                end = t;
            }

            if (this < start) return false;
            if (this > end) return false;
            return true;
        }, enumerable: false,configurable:true
    });

    //移除Json的指定Keys。返回对象
    Object.defineProperty(Object.prototype, "deleteJsonKeys", {
        value() {
            Array.from(arguments).forEach(it => {
                if (it in this) {
                    delete this[it];
                }
            });
            return this;
        }, enumerable: false,configurable:true,writable:true
    });

    /**
     * 对 keys 的遍历
     */
    // Object.defineProperty(Object.prototype, "MapTo", {
    //     value(callback) {
    //
    //         Object.keys(this).forEach(key=>{
    //
    //         });
    //         if (callback) {
    //             return callback.apply(this);
    //         }
    //         return this;
    //     }, enumerable: false
    // });

})();


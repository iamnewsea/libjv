"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

//-------------------------------------------------------------
//返回 function ,string 等实际类名。
Object.defineProperty(Object.prototype, "Type", {
    get: function get() {
        var ret = this.constructor.name || _typeof(this);
        //把第一个非大写字母前面的全部变成小写字母。
        //不宜使用 this.prototype.constructor.name

        if (ret) {
            var index = 0;
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = ret[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var it = _step.value;

                    var code = it.charCodeAt();
                    if (code >= 65 && code <= 90) {
                        index++;
                    } else {
                        break;
                    }
                }
            } catch (err) {
                _didIteratorError = true;
                _iteratorError = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion && _iterator.return) {
                        _iterator.return();
                    }
                } finally {
                    if (_didIteratorError) {
                        throw _iteratorError;
                    }
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
    },
    enumerable: false
});

var primitives = ["object", "array", "function", "map", "set", "math", "date", "regexp", "string", "number", "boolean", "symbol", "undefined", "null"];
//判断是否是基本数据类型
//如果是内置数据类型，返回内置数据类型。
//否则，返回 false
Object.defineProperty(Object.prototype, "PrimitiveType", {
    get: function get() {
        var type = this.Type;
        if (primitives.includes(type)) {
            return type;
        }
        return false;
    },
    enumerable: false
});

//判断类型
Object.defineProperty(Object.prototype, "ObjectType", {
    get: function get() {
        var type = this.Type;
        if (["object", "map"].includes(type)) {
            return type;
        }
        if (primitives.includes(type)) {
            return false;
        }
        return type;
    },
    enumerable: false
});

//大于等于 and 小于等于
Object.defineProperty(Object.prototype, "Between", {
    value: function value(start, end) {
        if (start > end) {
            var t = start;
            start = end;
            end = t;
        }

        if (this < start) return false;
        if (this > end) return false;
    },
    enumerable: false
});
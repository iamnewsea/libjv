(function () {
    if (String.prototype.IsNumberFormat) {
        return;
    }


    //只做一件事。 空字符串时，返回空数组。
    Object.defineProperty(String.prototype, 'Split', {
        value(sep) {
            if (!this) return [];
            return this.split(sep);
        }, enumerable: false
    });

    Object.defineProperty(String.prototype, 'getBigCamelCase', {
        value(sep) {
            if (!this) return "";
            return this.split(/[\W_]+/)
                .filter(it => it)
                .map(it => it[0].toUpperCase() + it.slice(1))
                .join("");
        }, enumerable: false
    });
    Object.defineProperty(String.prototype, 'getSmallCamelCase', {
        value(sep) {
            var v = this.getBigCamelCase()
            if (!v) return v;
            return v[0].toLowerCase() + v.slice(1);
        }, enumerable: false
    });
    /**
     * 获取短横线格式
     */
    Object.defineProperty(String.prototype, 'getKebabCase', {
        value(sep) {
            var v = this.getSmallCamelCase();
            if (!v) return v;
            return v.replace(/[A-Z]/g, (it, index) => "-" + it.toLowerCase());
        }, enumerable: false
    });

    Object.defineProperty(String.prototype, 'replaceAll', {
        value(find, replace) {
            return this.split(find).join(replace);
        }, enumerable: false
    });

    Object.defineProperty(String.prototype, 'trimStartWith', {
        value() {
            var ps = Array.from(arguments);

            var value = this.trim();
            if (!ps.length) {
                return value;
            }


            var hittedItem = ""

            for (var i = 0, len = ps.length; i < len; i++) {
                var item = ps[i];
                if (value.startsWith(item)) {
                    hittedItem = item;
                    break;
                }
            }

            if (hittedItem) {
                value = value.slice(hittedItem.length);
                return value.trimStartWith.apply(value, ps);
            } else return value;
        },
        enumerable: false
    });

    /**
     * 参数可以是多个字符串，如：
     * "abc.txt.zip.log".trimEndWith(".txt",".zip",".log")
     */
    Object.defineProperty(String.prototype, 'trimEndWith', {
        value() {
            var ps = Array.from(arguments);

            var value = this.trim();
            if (!ps.length) {
                return value;
            }


            var hittedItem = "";

            for (var i = 0, len = ps.length; i < len; i++) {
                var item = ps[i];
                if (value.endsWith(item)) {
                    hittedItem = item;
                    break;
                }
            }

            if (hittedItem) {
                value = value.slice(0, 0 - hittedItem.length);
                return value.trimEndWith.apply(value, ps);
            } else return value;
        },
        enumerable: false
    });

    Object.defineProperty(String.prototype, 'trimWith', {
        value() {
            var ret = this.trimStartWith.apply(this, arguments);
            return ret.trimEndWith.apply(ret, arguments);
        },
        enumerable: false
    });
    /**
     * "@$<li>ok</li>$@".trimPairs("<li>,</li>".split(",") , "<div>,</div>".split(",") ,"$" ,"@" )
     */
    Object.defineProperty(String.prototype, 'trimPairs', {
        value() {
            var ps = Array.from(arguments);

            var value = this.trim();
            if (!ps.length) {
                return value;
            }

            //补全.
            ps = ps.map(it => {
                if (it.length == 1) {
                    if (typeof ps[0] == "string") {
                        return [it, it];
                    } else {
                        return [it[0], it[0]];
                    }
                }
                return it;
            });

            var hit = false;
            for (var i = 0, len = ps.length; i < len; i++) {
                var pairs = ps[i];

                var start = pairs[0], end = pairs[1];

                if (value.startsWith(start) && value.endsWith(end)) {
                    value = value.slice(start.length, 0 - end.length).trim();
                    hit = true;
                    break;
                }
            }

            if (hit) {
                return value.trimPairs.apply(value, ps);
            } else return value;
        },
        enumerable: false
    });

    /**
     * 把输入的 2018-09-20 转换为北京本地时间，即： 2018-09-20 GMT+0800
     *
     * "2018-09-20".AsLocalDate() 相当于  new Date("2018-09-20 08:00:00")
     */
// Object.defineProperty(String.prototype, 'AsLocalDate', {
//     value() {
//         if (this == "") {
//             return new Date(-28800000);
//         }
//         return new Date(this + " GMT+0800")
//     }, enumerable: false
// });


    Object.defineProperty(String.prototype, 'IsTimeFormat', {
        value() {
            return /^[0-2]?\d:[0-5]?\d:[0-5]?\d$/.test(this)
        }, enumerable: false
    });
    Object.defineProperty(String.prototype, 'IsDateFormat', {
        value() {
            return /^\d{4}[-/][0-1]?\d[-/][0-3]?\d?$/.test(this)
        }, enumerable: false
    });

    Object.defineProperty(String.prototype, 'IsDateTimeFormat', {
        value() {
            return /^\d{4}[-/][0-1]?\d[-/][0-3]?\d[ T]?[0-2]?\d:[0-5]?\d:[0-5]?\dZ?$/.test(this)
        }, enumerable: false
    });

    Object.defineProperty(String.prototype, 'IsDateOrDateTimeFormat', {
        value() {
            return /^\d{4}[-/][0-1]?\d[-/][0-3]?\d([ T]?[0-2]?\d:[0-5]?\d:[0-5]?\d)?Z?$/.test(this)
        }, enumerable: false
    });

    Object.defineProperty(String.prototype, 'IsNumberFormat', {
        value() {
            return /^[-+]?((\d+\.*\d*)|(\.\d+))$/.test(this)
        }, enumerable: false
    });

    /**
     *
     */
    Object.defineProperty(String.prototype, 'toCharArray', {
        value() {
            return this.split("")
        }, enumerable: false
    });

    /**
     * 是否是大写字母
     */
    Object.defineProperty(String.prototype, 'IsUpperLetter', {
        value() {
            return this.toCharArray().every(it => it >= 65 && it <= 90);
        }, enumerable: false
    });

    /**
     * 是否是小写字母
     */
    Object.defineProperty(String.prototype, 'IsLowerLetter', {
        value() {
            return this.toCharArray().every(it => it >= 97 && it <= 122);
        }, enumerable: false
    });

    /**
     * 是否是数字，0-9
     */
    Object.defineProperty(String.prototype, 'IsDigit', {
        value() {
            return this.toCharArray().every(it => it >= 48 && it <= 57);
        }, enumerable: false
    });


    Object.defineProperty(String.prototype, 'findIndex', {
        value() {
            //第一个是 action , 第二个是 index.
            var action = arguments[0], startIndex = arguments[1] || 0;
            for (let len = this.length; startIndex < len; startIndex++) {
                if (action(this[startIndex], startIndex) === true) return startIndex;
            }
            return -1;
        }, enumerable: false
    });


//参数是 Json 的 format。参数：
// json 数据
// 样式: {} , ${}, @ 仅有这三种.
// 数据回调：取到每一个值后，执行该回调。
    /*
    样式:
        {}   : {
        ${}
        @

    样式如下:
        "hello {user.name}!".format({user:{name:"world"}} );
        "hello [0]!".format(["world"] );
        "hello ${user.name}!".format({user:{name:"world"}} , "${}");
        "hello @name!".format({name:"world"} , "@", it=>it.toUpperCase() );
    =>
        hello world!
     */
    Object.defineProperty(String.prototype, 'format', {
        value() {
            var json = arguments[0],
                style = arguments[1] || "{}", // 默认样式.
                itemCallback = arguments[2];

            var regexp = {
                "{}": "{([^{}]+)}",
                "${}": "\\${([^{}]+)}",
                "@": "@(\\w+)"
            } [style];

            return this.replace(new RegExp(regexp, "g"),
                // m 是指搜索到的整个部分， "(\\w+)"如： {id} , 而 i  是指 该部分的分组内容 ， 如 id
                function (m, key) {
                    var value = m;
                    try {
                        value = eval("(function(){ return  this['" + key + "']; })").call(json)
                    } catch (e) {
                        console.error("String.format 执行出错, " + e.message);
                        throw e;
                    }

                    // if ((value === 0) || (value === false) || (value === "") || value === null ) {
                    //     return value;
                    // }
                    // return value || m;
                    if (itemCallback) {
                        return itemCallback(value)
                    }
                    return value;
                })
        }, enumerable: false
    });

    Object.defineProperty(String.prototype, "toDateString", {
        value(format, timezone) {
            if (!this) return "";
            return new Date(this).toDateString(format, timezone);
        }, enumerable: false
    });

    /**
     * IE 没有 padStart
     */
    if (!String.prototype.padStart) {
        Object.defineProperty(String.prototype, "padStart", {
            value(length, fillString) {
                if (this.length >= length) return this;
                if (jv.isNull(fillString)) {
                    fillString = ' ';
                }
                return Array.init(length - this.length, fillString).join("") + this;
            }, enumerable: false
        });
    }

    if (!String.prototype.includes) {
        Object.defineProperty(String.prototype, "includes", {
            value(find) {
                return this.indexOf(find) >= 0;
            }, enumerable: false
        })
    }

    //兼容IE
    if (!String.prototype.startsWith) {
        Object.defineProperty(String.prototype, "startsWith", {
            value(find) {
                return !this.indexOf(find)
            }, enumerable: false
        });
    }


    Object.defineProperty(String.prototype, 'ToRound', {
        value(dotLength = 2) {
            return Number(this).ToRound(dotLength);
        }, enumerable: false
    });

})();

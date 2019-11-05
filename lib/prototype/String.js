'use strict';

/**
 * "@$<li>ok</li>$@".trimPairs("<li>,</li>".split(",") , "<div>,</div>".split(",") ,"$" ,"@" )
 */
Object.defineProperty(String.prototype, 'trimPairs', {
    value: function value() {
        var ps = arguments;

        var value = this.trim();
        if (ps.length == 0) {
            return value;
        }

        //补全.
        ps = ps.map(function (it) {
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

            var start = pairs[0],
                end = pairs[1];

            if (value.startsWith(start) && value.endsWith(end)) {
                value = value.slice(start.length, 0 - end.length).trim();
                hit = true;
                break;
            }
        }

        if (hit) {
            return value.trimPairs(ps);
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

//只做一件事。 空字符串时，返回空数组。
Object.defineProperty(String.prototype, 'Split', {
    value: function value(sep) {
        if (!this) return [];
        return this.split(sep);
    },
    enumerable: false
});

Object.defineProperty(String.prototype, 'IsTimeFormat', {
    value: function value() {
        return (/^[0-2]?\d:[0-5]?\d:[0-5]?\d$/.test(this)
        );
    },
    enumerable: false
});
Object.defineProperty(String.prototype, 'IsDateFormat', {
    value: function value() {
        return (/^\d{4}[-/][0-1]?\d[-/][0-3]?\d?$/.test(this)
        );
    },
    enumerable: false
});

Object.defineProperty(String.prototype, 'IsDateTimeFormat', {
    value: function value() {
        return (/^\d{4}[-/][0-1]?\d[-/][0-3]?\d[ T]?[0-2]?\d:[0-5]?\d:[0-5]?\dZ?$/.test(this)
        );
    },
    enumerable: false
});

Object.defineProperty(String.prototype, 'IsDateOrDateTimeFormat', {
    value: function value() {
        return (/^\d{4}[-/][0-1]?\d[-/][0-3]?\d([ T]?[0-2]?\d:[0-5]?\d:[0-5]?\d)?Z?$/.test(this)
        );
    },
    enumerable: false
});

Object.defineProperty(String.prototype, 'findIndex', {
    value: function value() {
        //第一个是 action , 第二个是 index.
        var action = arguments[0],
            startIndex = arguments[1] || 0;
        for (var len = this.length; startIndex < len; startIndex++) {
            if (action(this[startIndex], startIndex) === true) return startIndex;
        }
        return -1;
    },
    enumerable: false
});

//参数是 Json 的 format。参数： json , 样式: {} , ${}, @ 仅有这三种.
/*
样式:
    {}   : {
    ${}
    @

样式如下:
    "hello {user.name}!".format({user:{name:"world"}} );
    "hello {0}!".format(["world"] );
    "hello ${user.name}!".format({user:{name:"world"}} , "${}");
    "hello @name!".format({name:"world"} , "@");
=>
    hello world!
 */
Object.defineProperty(String.prototype, 'format', {
    value: function value() {
        var json = arguments[0],
            style = arguments[1] || "{}",
            // 默认样式.
        emptyFunc = arguments[2];

        var styles = {
            "{}": { escape: "{{", regexp: "{([^}]+)}" },
            "${}": { escape: "$${", regexp: "\\${([^}]+)}" },
            "@": { escape: "@@", regexp: "@(\\w+)" }
        },
            config = styles[style];

        return this.replace(new RegExp(config.escape, "g"), String.fromCharCode(7)).replace(new RegExp(config.regexp, "g"),
        //m 是指搜索到的整个部分， "(\\w+)"如： {id} , 而 i  是指 该部分的分组内容 ， 如 id
        function (m, key) {
            var value = m;
            try {
                value = eval("(function(){ return  this." + key + "; })").call(json);
            } catch (e) {
                console.log("String.format 执行出错, " + e.message);
                if (emptyFunc) {
                    value = emptyFunc(key);
                }
            }

            if (value === 0 || value === false || value === "") {
                return value;
            }
            return value || m;
        }).replace(new RegExp(String.fromCharCode(7), "g"), config.escape);
    },
    enumerable: false
});
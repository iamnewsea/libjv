"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

require("./defineProperty");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

//单例.
var jv;
var JvObject = function () {
    //私有字段。
    // var db = Symbol("db");

    var JvObject = function JvObject() {
        _classCallCheck(this, JvObject);

        if (!jv) {
            jv = this;
        }

        // this[db] = {id:1};
        return jv;
    }

    // get db(){
    //   return this[db];
    // }
    ;

    return JvObject;
}();

jv = new JvObject();
jv.prototype = JvObject.prototype;
jv.noop = function () {};
//---------------------------------------------

//提供 基于 localStorage的缓存数据，增加过期时间机制。额外多保存一个 key ，默认有效期是4个小时。
jv.store = {
    getJson: function getJson(key) {
        var v = this.get(key);
        if (!v) return null;
        return JSON.parse(v);
    },
    setJson: function setJson(key, value, cacheSeconds) {
        if (!value) return false;
        this.set(key, JSON.stringify(value), cacheSeconds);
        return true;
    },
    get: function get(key) {
        if (!key) return null;
        key = "jv.store." + key;
        var expireAt_key = key + "..expireAt";
        var value = localStorage.getItem(key);
        if (jv.IsNull(value)) {
            localStorage.removeItem(key);
            localStorage.removeItem(expireAt_key);
            return null;
        }

        this.check_key(key);
        return value;
    },
    check_key: function check_key(key) {
        var expireAt_key = key + "..expireAt";
        var expireAt = localStorage.getItem(expireAt_key);
        if (!expireAt) {
            return;
        }
        if (parseInt(expireAt) < Date.now()) {
            localStorage.removeItem(key);
            localStorage.removeItem(expireAt_key);
            return null;
        }
    },
    check: function check() {
        for (var i = localStorage.length - 1; i >= 0; i--) {
            var key = localStorage.key(i);
            if (key.startsWith("jv.store.") == false) {
                continue;
            }

            if (key.endsWith("..expireAt") == false) {
                continue;
            }

            var cacheKey = key.slice(9, 0 - 10);

            this.check_key(cacheKey);
        }
    },
    remove: function remove(key) {
        if (!key) return;

        localStorage.removeItem(key);
        var expireAt_key = key + "..expireAt";
        localStorage.removeItem(expireAt_key);
    },
    set: function set(key, value, cacheSeconds) {
        if (!key) return;

        key = "jv.store." + key;
        var expireAt_key = key + "..expireAt";

        if (value === null) {
            localStorage.removeItem(key);
            localStorage.removeItem(expireAt_key);
            return;
        }

        localStorage.setItem(key, value);

        cacheSeconds = cacheSeconds || 14400; //默认4小时。

        if (cacheSeconds < 0) return;

        localStorage.setItem(expireAt_key, Date.now() + cacheSeconds * 1000);
    },
    setExpire: function setExpire(key, cacheSeconds) {
        if (!key) return;
        cacheSeconds = cacheSeconds || 14400;
        if (cacheSeconds < 0) ;

        var expireAt_key = key + "..expireAt";
        localStorage.removeItem(key);
        localStorage.removeItem(expireAt_key);

        localStorage.setItem(expireAt_key, Date.now() + cacheSeconds * 1000);
    }
};

jv.cache_db = {};

// /**
//  * jv.cache.get("/info/getCitys").then(res=> this.citys_data = res.data.data);
//  * @type {{get: (function(*=, *)), set: (function(*, *))}}
//  */
// jv.cache = {
//   get(url, postData, resultFunc) {
//     if (!url) return null;
//
//     var ret = jv.cache_db[url];
//     if (ret) {
//       resultFunc(ret);
//       return  ;
//     }
//
//     jv.ajax.post(url).then(res=>{
//       var json = res.data.data;
//       if(json) {
//         jv.cache.set(url,json);
//         resultFunc(json);
//       }
//     });
//   },
//   set(url, value) {
//     if (value === null) {
//       return delete jv.cache_db[url];
//     }
//     jv.cache_db[url] = value;
//     return value;
//   }
// };

function JvEnum(typeName, json) {
    this.typeName = typeName;

    var index = 0;
    this.list = Object.keys(json).map(function (key) {
        return { name: key, index: index++, remark: json[key] };
    });

    this.getData = function (key) {
        if (!jv.IsNull(key)) {
            return this.list.filter(function (it) {
                return it.name == key;
            })[0] || {};
        }
        return this.list;
    };
    this.fillRes = function (obj, key) {
        if (key in obj == false) {
            return;
        }
        var value = obj[key];
        if (jv.IsNull(value)) {
            return;
        }

        var v = this.getData(value);
        if (!v || !v.name) {
            return;
        }

        obj[key + "_res"] = v.remark || "";
    };
}

// 判断是 null or defined
jv.IsNull = function (value) {
    var type = typeof value === "undefined" ? "undefined" : _typeof(value);
    if (type == "undefined") return true;
    return value === null;
};

// Object.defineProperty(JvEnum.prototype, "getData", {
//     value(key) {
//         if (!jv.IsNull(key)) {
//             return this.list.filter(it => it.name == key)[0] || {};
//         }
//         return this.list;
//     }, enumerable: false
// });

/*
定义枚举, 生成 jv.枚举 = {}
使用 对象.Enumer(键,jv.枚举)  对对象的key进行枚举化。
 */
jv.defEnum = function (typeName, json) {
    jv[typeName] = new JvEnum(typeName, json);
};

/**
 * 时间，布尔 的资源化
 * var obj = { id:1 , isPublished: true , isDownloaded: false, createAt: "2018-09-20 20:00:00", updateAt: "2018-09-20 20:00:00" }
 *
 * jv.fillRes(obj, "isPublished", "已发布,未发布" )
 * jv.fillRes(obj, "updateAt", "yyyy年MM月dd日hh时" )
 * jv.fillRes(obj)
 *
 * obj => { id:1 , isPublished: true ,isDownloaded: false, createAt: "2018-09-20 20:00:00", updateAt: "2018-09-20 20:00:00",
 * isPublished_res: "已发布" ,isDownloaded_res: "否", createAt_res: "2018-09-20 20:00" , updateAt: "2018年09月20日00时"}
 * @param obj
 * @param key
 * @param args
 */
jv.fillRes = function (obj, key, args) {
    if (!obj) {
        console.log("jv.fillRes 的 obj为空！");
        return;
    }

    var res1 = function res1(key1, value, args1, type) {
        if (jv.IsNull(value)) {
            obj[key1 + "_res"] = "";
            return;
        }

        type = type || value.Type;

        if (type == "boolean") {
            args1 = args1 || ""; //.replace(/，/g,",")
            var stringValue = "";
            var res_values = args1.split(",");
            if (value) {
                stringValue = res_values[0] || "是";
            } else {
                stringValue = res_values[1] || "否";
            }

            obj[key1 + "_res"] = stringValue;
            return true;
        } else if (type == "string") {
            if (value.IsDateOrDateTimeFormat()) {
                obj[key1 + "_res"] = Date.from(value).toDateString(args1, "local");
                return true;
            }
        }
    };

    var type = obj.PrimitiveType;
    if (type == "array" || type == "set") {
        Array.from(obj).forEach(function (it) {
            jv.fillRes(it, key, args);
        });
        return;
    } else if (!obj.ObjectType) {
        return;
    }
    if (key) {
        if (key in obj == false) return;
        return res1(key, obj[key], args);
    }

    Object.keys(obj).forEach(function (key) {
        var value = obj[key];
        if (!value && value !== false) {
            return;
        }

        if (key + "_res" in obj) {
            return;
        }

        var type = value.Type;
        res1(key, value, null, type);

        //遍历
        if (type == "object" || type == "array") {
            jv.fillRes(value);
        }
    });

    if (window.Image_Host && "id" in obj && "url" in obj && obj.url && !("fullUrl" in obj) && !("img256FullUrl" in obj)) {
        obj.fullUrl = window.Image_Host + obj.url;

        var ext = obj.url.split(".").last();
        if (/png|jpeg|bmp|gif/ig.test(ext)) {
            var sect = obj.url.split("/").slice(-2, -1)[0].split("-");
            var width = parseInt(sect[0]);
            var height = parseInt(sect.last());

            if (width > 256 || height > 256) {
                obj["img256FullUrl"] = obj.fullUrl + "-var/256." + ext;
            }
        }
    }
};

/*如果两个对象是数组, 使用refDataEquals比较内容, 不比较顺序.

如果两个对象是对象，则比较每个属性的值，依然使用 refDataEquals比较。
如果对象的值是 null 或 undefined,则忽略 key 的比较
objectEqualField 指定比较对象的id字段，如果该字段有值且相同，认为两个对象是相等的。
忽略String,Number类型差异，忽略null,undefined差异， 简单值比较都使用 String 进行比较
*/
jv.dataEquals = function (a, b, objectEqualField) {
    objectEqualField = objectEqualField || "";

    if (jv.IsNull(a) && jv.IsNull(b)) {
        return true;
    }
    if (a == b) return true;

    var a_type = a.Type,
        b_type = b.Type;

    var a_is_array = a_type == "array" || a_type == "set",
        b_is_array = b_type == "array" || b_type == "set";

    if (a_is_array ^ b_is_array) {
        return false;
    }

    if (a_is_array && b_is_array) {
        var a_length = a.length;
        var b_length = b.length;
        if (a_length != b_length) {
            return false;
        }

        if (a.intersect(b, function (_a, _b) {
            jv.dataEquals(_a, _b, objectEqualField);
        }).length != a_length) {
            return false;
        }
        return true;
    }

    var a_is_object = !!a.ObjectType,
        b_is_object = !!b.ObjectType;

    if (a_is_object ^ b_is_object) {
        return false;
    }

    if (a_is_object && b_is_object) {
        if (objectEqualField) {
            if (objectEqualField in a && objectEqualField in b && a[objectEqualField] && a[objectEqualField] == b[objectEqualField]) {
                return true;
            }
        }

        var a_keys = Object.keys(a),
            b_keys = Object.keys(b);

        var a_more_keys = a_keys.minus(b_keys);
        if (a_more_keys.some(function (key) {
            return !jv.IsNull(a[key]);
        })) {
            return false;
        }

        var b_more_keys = b_keys.minus(a_keys);
        if (b_more_keys.some(function (key) {
            return !jv.IsNull(b[key]);
        })) {
            return false;
        }

        if (a_keys.intersect(b_keys).some(function (key) {
            var a_value = a[key],
                b_value = b[key];

            return !jv.dataEquals(a_value, b_value, objectEqualField);
        })) {
            return false;
        }

        return true;
    }

    var a_simple_type = a_type == "string" || a_type == "number",
        b_simple_type = b_type == "string" || b_type == "number";

    if (a_simple_type ^ b_simple_type) {
        return false;
    }

    if (a_simple_type && b_simple_type) {
        return a.toString() == b.toString();
    }

    return a == b;
};

jv.isPlainObject = function (obj) {
    if (!obj) return false;
    return obj.ObjectType;
    // Detect obvious negatives
    // Use toString instead of jQuery.type to catch host objects
    // if (!obj || ({}).toString.call(obj) !== "[object Object]") {
    //     return false;
    // }
    // return true;
};

jv.random = function (min, max) {
    if (!min && !max) {
        return "r" + Math.random().toString(36).slice(3);
    }

    if (!max) {
        max = min;
        min = 0;
    }

    return min + parseInt(Math.random() * (max - min));
};
/**
 *
 * @param delayTime  循环暂停时间
 * @param action     每次循环的回调。返回 false 停止循环。
 * @param times      最多循环次数， 默认为 100
 * @returns {*}
 */
jv.await = function (delayTime, times, action) {
    times = times || 0;
    if (!times) {
        return;
    }

    if (action() !== false) {
        return setTimeout(function () {
            jv.await(delayTime, times - 1, action);
        }, delayTime);
    }
};

/**Java方式的序列化。
 Java定义：
 data class role(var name: String = "", var remark: String = "")
 data class user(var name: String = "", var roles: Array<role> = arrayOf())
 data class corp(var name: String = "", var users: Array<user> = arrayOf());

 @PostMapping(value = "hi")
 fun hiPost(qm: corp, session: HttpSession): String {}

 Java格式的数据：(如果数组是简单值的数组，可以使用 "," 连接，如： roles:"销售,开发" )
 map["name"] = "金维度";
 map["users[0].name"] = "张三";
 map["users[0].roles[0].name"] = "销售";
 map["users[0].roles[0].remark"] = "销售角色";

 map["users[1].name"] = "本四";
 map["users[1].roles[0].name"] = "开发";
 map["users[1].roles[0].remark"] = "开发角色";
 map["users[1].roles[1].name"] = "UI";
 map["users[1].roles[1].remark"] = "设计师";

 PostBody：
 name=%E9%87%91%E7%BB%B4%E5%BA%A6&users%5B0%5D.name=%E5%BC%A0%E4%B8%89&users%5B0%5D.roles%5B0%5D.name=%E9%94%80%E5%94%AE&users%5B0%5D.roles%5B0%5D.remark=%E9%94%80%E5%94%AE%E8%A7%92%E8%89%B2&users%5B1%5D.name=%E6%9C%AC%E5%9B%9B&users%5B1%5D.roles%5B0%5D.name=%E5%BC%80%E5%8F%91&users%5B1%5D.roles%5B0%5D.remark=%E5%BC%80%E5%8F%91%E8%A7%92%E8%89%B2&users%5B1%5D.roles%5B1%5D.name=UI&users%5B1%5D.roles%5B1%5D.remark=%E8%AE%BE%E8%AE%A1%E5%B8%88

 Js提交对象：
 var data =
 {name:"金维度",users:
   [
     {name:"张三",roles:[{name:"销售",remark:"销售角色"}]},
     {name:"本四",roles:[{name:"开发",remark:"开发角色"},{name:"UI",remark:"设计师"}]}
   ]
 }
 * @param obj
 */

jv.param_jmap = function (obj) {
    // var objType = typeof(obj);
    // if (objType == "string") {
    //   return obj;
    // }

    var ret = {};
    Object.keys(obj).forEach(function (key) {
        if (!key) return;
        if (key.endsWith("_res")) {
            return;
        }

        if (key[0] == "_") return;

        var value = obj[key];
        if (value === undefined) return;
        if (value === null) return;

        var isMap = function isMap(mapObject, objType) {
            var isMapValue = objType == "map";
            if (!isMapValue) {
                if (Object.keys(mapObject).findIndex(function (it) {
                    var code = it.charCodeAt();
                    if (code >= 65 && code <= 90) return true;
                    if (code >= 97 && code <= 122) return true;
                    return false;
                }) < 0) {
                    isMapValue = true;
                }
            }
            return isMapValue;
        };

        if (Array.isArray(value)) {

            value = value.filter(function (it) {
                return it != undefined && it != null;
            });

            if (value.length == 0) {
                ret[key] = "";
                return;
            }

            var firstType = _typeof(value[0]);
            if (firstType == "string" || firstType == "number") {
                ret[key] = value.join(",");
            }

            for (var i in value) {
                var item = value[i];
                if (!item) continue;
                var objType = item.ObjectType;
                if (objType) {
                    var m = jv.param_jmap(item);
                    var keys = Object.keys(m);

                    if (isMap(item, objType)) {
                        keys.forEach(function (sk) {
                            ret[key + "[" + i + "]['" + sk + "']"] = m[sk];
                        });
                    } else {
                        keys.forEach(function (sk) {
                            ret[key + "[" + i + "]." + sk] = m[sk];
                        });
                    }
                }
            }
        } else {
            var objType = item.ObjectType;
            if (objType) {
                var m = jv.param_jmap(value);
                var keys = Object.keys(m);

                if (isMap(value, objType)) {
                    keys.forEach(function (sk) {
                        ret[key + "['" + sk + "']"] = m[sk];
                    });
                } else {
                    keys.forEach(function (sk) {
                        ret[key + "." + sk] = m[sk];
                    });
                }
            } else if (value.Type == "date") {
                ret[key] = value.toDateString(null, "local");
            } else {
                ret[key] = value;
            }
        }
    });

    return ret;
};
jv.param = function (obj) {
    var ret = jv.param_jmap(obj);
    return Object.keys(ret).map(function (it) {
        return encodeURIComponent(it) + "=" + encodeURIComponent(ret[it]);
    }).join("&");
};

//用法： jv.evalExpression({a:{b:[{c:1}]}} , "a.b[0].c")
//返回: {value: 1 , ok: true }
jv.evalExpression = function (obj, path) {
    if (!path) return obj;
    var random = "_eval_expression_" + jv.random();
    jv[random] = obj;
    var ret = {};
    try {
        ret.value = eval("jv['" + random + "']." + path);
        ret.ok = true;
    } catch (e) {
        ret.ok = false;
    }
    delete jv[random];
    return ret;
};

exports.default = jv;
import "./defineProperty"

class JvObject {
    constructor() {
        if (!JvObject.instance) {
            JvObject.instance = this;
        }
        return JvObject.instance;
    }
}

console.log("jv init!");
var jv = new JvObject();
jv.prototype = JvObject.prototype;
jv.inBrowser = typeof window !== 'undefined';

jv.root = jv.inBrowser ? window : global;

jv.root.jv = jv;

jv.msie = jv.inBrowser && (!!window.ActiveXObject || "ActiveXObject" in window);

jv.noop = () => {
};

/**
 * 所有枚举。
 */
jv.enum = {};


/**
 *
 * @param eventName
 * @param evDetail 必须是 {detail: 数据 }
 * @returns {CustomEvent<any>}
 */
jv.createEvent = (eventName, evDetail) => {
    if (jv.inBrowser) {
        var chkEvent;
        if (document.createEvent) {
            chkEvent = document.createEvent("CustomEvent");
            chkEvent.initCustomEvent(eventName, true, true, evDetail);
        } else {
            chkEvent = new CustomEvent(eventName, evDetail);
        }
        return chkEvent;
    }
};


jv.info = console.info;
jv.error = console.error;
jv.warn = console.warn;

//调试使用，不显示。
jv.log = jv.info;

jv.fileTypes = {
    img: {type: "img", exts: "png,jpg,gif,bmp,ico,icon".split(","), remark: "图片文件"},
    doc: {type: "doc", exts: "doc,docx,xls,xlsx,pdf".split(","), remark: "office文档"},
    video: {type: "video", exts: "mp4,avi,webm,ogg,mov".split(","), remark: "视频文件"}
};

jv.getFileType = function (fileName) {
    var dotIndex = fileName.lastIndexOf('.');
    if (dotIndex < 0) return {};

    var ext = fileName.slice(dotIndex + 1).toLowerCase();

    var findKey = Object.keys(jv.fileTypes).last(key => jv.fileTypes[key].exts.includes(ext));
    if (findKey) {
        return Object.assign({ext: ext}, jv.fileTypes[findKey]);
    }

    return {type: "", ext: ext};
};


(() => {
    class Radio {
    }

    class Check {
    }

    jv.root.Radio = Radio;
    jv.root.Check = Check;
})();

jv.sleep = (time) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve();
        }, time);
    })
};

/**
 * 深覆盖。
 * Object.assign({},{a:{a1:1}}, { a: {b1:1}} ) => 结果 {a:{b1:1}}, a.a1会丢失。
 * @param objs
 */
// jv.extend = (target, ...sources) => {
//     target = target || {};
//
//     sources.forEach(source => {
//         let descriptors = Object.keys(source).reduce((descriptors, key) => {
//             var value = source[key];
//             if( value === null || value === 0 || value === "" || typeof(value) === "undefined"){
//                 return descriptors;
//             }
//             descriptors[key] = Object.getOwnPropertyDescriptor(source, key);
//             return descriptors;
//         }, {});
//
//         // Object.assign 默认也会拷贝可枚举的Symbols
//         Object.getOwnPropertySymbols(source).forEach(sym => {
//             let descriptor = Object.getOwnPropertyDescriptor(source, sym);
//             if (descriptor.enumerable) {
//                 descriptors[sym] = descriptor;
//             }
//         });
//         Object.defineProperties(target, descriptors);
//     });
//     return target;
// };


jv.getUrlHost = (url) => {
    var r;
    if (url.startsWith("//")) {
        r = /^\/\/([^/\\]+)/i.exec(url)
    } else {
        r = /^http[s]*\:\/\/([^/\\]+)/i.exec(url)
    }

    if (r) {
        return r[1];
    }
    return "";
};

//---------------------------------------------

/**
 * 提供 基于 localStorage 的缓存数据，增加过期时间机制。额外多保存一个 key ，默认有效期是4个小时。
 * Vue 中使用原型方法
 */
jv.store_db = {
    getStoreKey(key) {
        return "jv.store_db." + key;
    },
    getExpireKey(key) {
        return "jv.store_exp." + key;
    },
    getJson(key) {
        if (!key) return null;

        var v = this.getString(key);
        if (!v) return {};
        return JSON.parse(v);
    },
    setJson(key, value, cacheSeconds) {
        if (!value) return false;
        this.setString(key, JSON.stringify(value), cacheSeconds);
        return true;
    },
    getString(key) {
        if (!key) return null;
        this.check_key(key);

        var storeKey = this.getStoreKey(key);

        return localStorage.getItem(storeKey);
    },
    setString(key, value, cacheSeconds) {
        if (!key) return;
        if (value === null) {
            this.remove(key);
            return;
        }

        var storeKey = this.getStoreKey(key);

        localStorage.setItem(storeKey, value);

        cacheSeconds = cacheSeconds || 14400; //默认4小时。

        if (cacheSeconds < 0) return;

        var expireAt_key = this.getExpireKey(key);
        localStorage.setItem(expireAt_key, Date.now() + cacheSeconds * 1000);
    },
    check_key(key) {
        var expireAt_key = this.getExpireKey(key);
        var expireAt = localStorage.getItem(expireAt_key);
        if (!expireAt) {
            return;
        }
        if (parseInt(expireAt) < Date.now()) {
            this.remove(key);
            return null;
        }
    },
    check() {
        for (var i = localStorage.length - 1; i >= 0; i--) {
            var key = localStorage.key(i);

            if (key.startsWith("jv.store_exp.") == false) {
                continue;
            }

            var cacheKey = key.slice(13);

            this.check_key(cacheKey);
        }
    },
    remove(key) {
        if (!key) return;
        var storeKey = this.getStoreKey(key);
        var expireAt_key = this.getExpireKey(key);
        localStorage.removeItem(storeKey);
        localStorage.removeItem(expireAt_key);
    },
    /**
     *
     * @param key
     * @param cacheSeconds 设置为小于等于0,马上过期。
     */
    setExpire(key, cacheSeconds) {
        if (!key) return;
        cacheSeconds = cacheSeconds || 14400;
        if (cacheSeconds <= 0) {
            this.remove(key);
            return;
        }

        var expireAt_key = this.getExpireKey(key);
        localStorage.setItem(expireAt_key, Date.now() + cacheSeconds * 1000);
    }
};


//缓存在内存的数据
jv.cache = {};
// jv.getCacheData = function(url){
//     return
// };
//
// jv.setCacheData = function(url,value){
//
// };

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


/**
 * 定义枚举类型
 * @param typeName
 * @param json
 * @constructor
 */
jv.JvEnum = function JvEnum(typeName, json, keyCallback) {
    this.typeName = typeName;
    keyCallback = keyCallback || (it => it);
    var index = 0;
    this.list = Object.keys(json).map(key => {
        return {name: keyCallback(key), index: index++, remark: json[key]}
    });

    this.getData = (key) => {
        if (!jv.isNull(key)) {
            return this.list.filter(it => it.name == keyCallback(key))[0] || {};
        }
        return this.list;
    };
    this.fillRes = (obj, key) => {
        if (key in obj == false) {
            return;
        }

        if ((key + "_res") in obj) {
            return;
        }

        var self = this;
        Object.defineProperty(obj, key + "_res", {
            get() {
                var value = this[key];
                if (jv.isNull(value)) {
                    return "";
                }

                var v = self.getData(value);
                if (!v || !v.name) {
                    return "";
                }

                return v.remark || "";
            },
            enumerable: false,
            configurable: true
        });
    };
}


/**
 * 在枚举的基础上，定义一个多重状态设置
 */
jv.enumAllSet = function (enumType, enumValue) {
    if (!enumValue) {
        return;
    }

    if (!(enumType in jv.enum)) {
        throw new Error("找不到枚举： jv.enum." + enumType)
        return;
    }
    var key = "_" + enumType + "_";
    var set = jv.cache[key];
    if (!set) {
        set = new Set();
        jv.cache[key] = set;
    }

    var enum_items = jv.enum[enumType].getData().map(it => it.name);

    if (enum_items.includes(enumValue)) {
        set.push(enumValue);
    }

    return set.length == enum_items.length;
};


/**
 * meta标签
 * @param where
 * @param attrs
 */
jv.meta = (where, attrs) => {
    if (!attrs || !where) return;
    var metas = Array.from(document.head.children).filter(it => it.tagName == "META");
    Object.keys(where).forEach(key => {
        metas = metas.filter(it => it[key] == where[key]);
    });

    var meta = metas[0];
    if (!meta) {
        meta = document.createElement("META");
        Object.keys(where).forEach(key => {
            meta.setAttribute(key, where[key]);
        });
        document.head.appendChild(meta);
    }

    Object.keys(attrs).forEach(key => {
        meta.setAttribute(key, attrs[key]);
    });
};

/**
 * 窗口变化事件回调，延时 150ms 触发一次,
 * 应该放到 App.vue created 方法中执行。保证在DOMContentLoadedgk事件后。
 */
jv.resize = (callback, time) => {
    if (!callback) return;

    var timerId = 0;
    time = time || 150;

    var recalc = () => {
        if (timerId) {
            clearTimeout(timerId);
        }
        timerId = setTimeout(callback, time);
    };

    var resizeEvt = 'orientationchange' in window ? 'orientationchange' : 'resize';
    window.addEventListener(resizeEvt, recalc, false);
    callback();
    return recalc;
};

/**
 * isNaN 函数，参数是字符串会返回 true,不准。
 */
jv.isNaN = (value) => {
    if (jv.isNull(value)) return false;
    return value.Type == "number" && isNaN(value);
}

/**
 * 0,"",null, NaN -> false
 * {},[] -> false
 * @param value
 * @returns {boolean}
 * @constructor
 */
jv.hasValue = (value) => {
    if (jv.isNull(value)) return false;
    var type = value.Type;
    if (type == "number" && isNaN(value)) return false;
    if (value === Infinity) return false;
    if (value === -Infinity) return false;

    if (["array", "set", "object", "map"].includes(type)) {
        return !!Object.keys(value).length;
    }
    return !!value;
};

jv.isEmpty = (value) => !jv.hasValue(value);

// 判断是 null or defined
jv.isNull = (value) => {
    if (typeof (value) == "undefined") return true;
    return value === null;
};

jv.asBoolean = (value) => {
    if (jv.isNull(value)) return null;
    var type = value.Type;
    if (type == "number" && isNaN(value)) return false;
    if (value === Infinity) return false;
    if (value === -Infinity) return false;

    if (value === "null" ||
        value === "undefined") return null;

    //选择数据源，可能是空。
    if (value === "") return "";

    if (value === false ||
        value === "false" ||
        value === 0) return false;

    if (value === true ||
        value === "true" ||
        value === 1) return true;

    return value;
};

jv.asString = (value, format) => {
    if (jv.isNull(value)) return "";
    if (jv.isNull(format)) return value.toString(format);
    return value.toString();
}

//如果是数字形式，返回 Int，否则返回 0.
jv.asInt = (value) => {
    if (jv.isNull(value)) return 0;
    if (value.toString().IsNumberFormat(value)) {
        return parseInt(value);
    }
    return 0;
}

// Object.defineProperty(JvEnum.prototype, "getData", {
//     value(key) {
//         if (!jv.isNull(key)) {
//             return this.list.filter(it => it.name == key)[0] || {};
//         }
//         return this.list;
//     }, enumerable: false
// });

/**
 * 遍历Json对象。返回 false 停止遍历所有
 * @param json
 * @param eachJsonItemCallback 参数：key,value,object,deepth
 */
jv.recursionJson = (json, eachJsonItemCallback, deepth) => {
    if (!json) {
        return;
    }
    deepth = deepth || 0;

    var type = json.PrimitiveType;
    if (type == "array" || type == "set") {
        return Array.from(json).ForEach(it => {
            return jv.recursionJson(it, eachJsonItemCallback, deepth + 1);
        });
    } else if (!json.ObjectType) {
        return;
    }

    if (eachJsonItemCallback(json, deepth) === false) {
        return false;
    }

    return Object.keys(json).ForEach(key => {
        var value = json[key];
        if (value) {
            if (jv.recursionJson(value, eachJsonItemCallback, deepth + 1) === false) {
                return false;
            }
        }
    });
};

/*
定义枚举, 生成 jv.枚举 = {}
使用 对象.Enumer(键,jv.枚举)  对对象的key进行枚举化。
 */
jv.defEnum = (typeName, json, keyCallback) => {
    jv.enum[typeName] = new jv.JvEnum(typeName, json, keyCallback);
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
jv.fillRes = (obj, key, args) => {
    if (!obj) {
        console.log("jv.fillRes 的 obj为空！");
        return;
    }

    var res1 = (target, key1, args1, must) => {
        if (!target) {
            return;
        }


        if (!must && (key1 + "_res") in target) {
            return;
        }

        // if (jv.isNull(value)) {
        //     target[key1 + "_res"] = "";
        //     return;
        // }

        var value = target[key1];

        if (jv.isNull(value)) {
            if (must) {
                target[key1 + "_res"] = "";
            }
            return;
        }

        var type = value.Type;

        if (type == "boolean") {
            args1 = args1 || "";  //.replace(/，/g,",")

            Object.defineProperty(target, key1 + "_res", {
                get() {
                    var value = this[key1];
                    var stringValue = "";
                    var res_values = args1.split(",");
                    if (value) {
                        stringValue = res_values[0] || "是"
                    } else {
                        stringValue = res_values[1] || "否"
                    }

                    return stringValue;
                },
                enumerable: false,
                configurable: true
            });

            // target[key1 + "_res"] = stringValue;

            //暂不处理 Java 的 boolean 字段。
            // if (key1.startsWith("is")) {
            //     var key2 = key1.slice(2);
            //     if (key2) {
            //         key2 = key2[0].toLowerCase() + key2.slice(1);
            //         target[key2] = value;
            //         target[key2 + "_res"] = stringValue;
            //     }
            // }
            return true;
        }
        // else if (!ignoreDate && (type == "string")) {
        //     if (value.IsDateFormat()) {
        //         target[key1 + "_res"] = value;
        //         return true;
        //     } else if (value.IsDateTimeFormat()) {
        //         target[key1 + "_res"] = Date.from(value).toDateString(args1, "local");
        //         return true;
        //     }
        // }
    };


    if (key) {
        jv.recursionJson(obj, (json) => {
            if (Object.keys(json).includes(key)) {
                res1(json, key, args, true);
            }
        });
        return;
    }

    jv.recursionJson(obj, (json) => {
        Object.keys(json).forEach(key => {
            res1(json, key, args);
        })
    });
};


/**
 * 转换为人类可读的形式
 * @param value,数值,或带单位的字符串
 * @param precision, 精度，小数点位数。
 * @returns {number}
 */
jv.toHumanSize = (value, precision) => {
    if (!value) {
        return "";
    }
    if (value.Type == "string") {
        var unit = value.slice(-1), unitCode = unit.charCodeAt();
        //如果不是数字
        if (!unitCode.Between(48, 57)) {
            value = jv.fromHumanSize(value);
        }
    }

    if (jv.isNull(precision)) {
        precision = 2;
    }
    var scale = 1024;

    if (value < scale) {
        return value + "B"
    }

    for (var i = 0; i < 4; i++) {
        value = value / scale;
        if (value < scale || i == 3) {
            return value.ToRound(precision) + "KMGT"[i] + "B";
        }
    }
};

jv.fromHumanSize = (value) => {
    if (!value) return 0;
    value = value.toString().toUpperCase();

    var unit = value.slice(-1), unitCode = unit.charCodeAt();

    //如果是数字
    if (unitCode.Between(48, 57)) {
        return parseInt(value);
    }


    if (unit == "B") {
        value = value.slice(0, -1);
        unit = value.slice(-1);
    }

    value = parseFloat(value.slice(0, -1));

    if ("TGMK".indexOf(unit) < 0) {
        return value;
    }

    var j = ("KMGT".indexOf(unit) + 1) * 10;

    return parseInt(value * Math.pow(2, j));
}

/**
 * 代理对象，避免 toJSON 递归调用。
 * @param json
 * @returns {*}
 */
// jv.proxy = (json) => {
//     return new Proxy(json || {}, {
//         get: function (target, key) {
//             if (key in target == false) {
//                 if (key.Type == "symbol") {
//                     return null;
//                 }
//                 console.log("jv.proxy, 在对象：", JSON.stringify(target), ",找不到字段: ", key.toString());
//             }
//
//             return target[key];
//         }
//     });
// };

/**
 * 修复Java布尔类的字段名称。使用 isUdd 字段
 */
// jv.fixJavaBoolField = (json) => {
//     jv.recursionJson(json, (target) => {
//         Object.keys(target).forEach(key1 => {
//             var value = target[key1];
//
//             if (value !== false && value !== true) {
//                 return;
//             }
//
//             //转为 isUpper 形式。
//             if (key1.length > 2 && (key1.slice(0, 2) == "is" && key1.charCodeAt(2).Between(65, 90))) {
//
//             } else {
//                 var key2 = "is" + key1[0].toUpperCase() + key1.slice(1)
//                 if (key2 in target == false) {
//                     target[key2] = value;
//                     delete target[key1];
//                 }
//             }
//         });
//     });
// };


/*如果两个对象是数组, 使用refDataEquals比较内容, 不比较顺序.

如果两个对象是对象，则比较每个属性的值，依然使用 refDataEquals比较。
如果对象的值是 null 或 undefined,则忽略 key 的比较
objectEqualField 指定比较对象的id字段，如果该字段有值且相同，认为两个对象是相等的。
忽略String,Number类型差异，忽略null,undefined差异， 简单值比较都使用 String 进行比较
*/
jv.dataEquals = (a, b, objectEqualField) => {
    objectEqualField = objectEqualField || "";
    var a_nul = jv.isNull(a), b_nul = jv.isNull(b);

    if (a_nul && b_nul) {
        return true;
    }
    if (a_nul || b_nul) {
        return false;
    }

    if (a == b) return true;

    var a_type = a.Type,
        b_type = b.Type;

    var a_is_array = (a_type == "array" || a_type == "set"),
        b_is_array = (b_type == "array" || b_type == "set");

    if (a_is_array ^ b_is_array) {
        return false;
    }

    if (a_is_array && b_is_array) {
        var a_length = a.length;
        var b_length = b.length;
        if (a_length != b_length) {
            return false;
        }

        if (a.intersect(b, (_a, _b) => jv.dataEquals(_a, _b, objectEqualField)).length != a_length) {
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
            if (objectEqualField in a && objectEqualField in b && a[objectEqualField] && (a[objectEqualField] == b[objectEqualField])) {
                return true;
            }
        }

        var a_keys = Object.keys(a),
            b_keys = Object.keys(b);

        var a_more_keys = a_keys.minus(b_keys);
        if (a_more_keys.some(key => !jv.isNull(a[key]))) {
            return false;
        }

        var b_more_keys = b_keys.minus(a_keys);
        if (b_more_keys.some(key => !jv.isNull(b[key]))) {
            return false;
        }

        if (a_keys.intersect(b_keys).some(key => {
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

jv.isPlainObject = (obj) => {
    if (!obj) return false;
    return obj.ObjectType;
    // Detect obvious negatives
    // Use toString instead of jQuery.type to catch host objects
    // if (!obj || ({}).toString.call(obj) !== "[object Object]") {
    //     return false;
    // }
    // return true;
};


/**
 * 返回随机数
 * @param length
 * @returns {string}
 */
jv.random = (length, depth) => {
    length = length || 8;
    depth = depth || 0;
    var ret = Math.random().toString(36).slice(2).replace(/0/ig, "");
    if (length <= 0) return "";

    if (!depth && ret[0].charCodeAt().Between(48, 57)) {
        ret = "r" + ret.slice(1);
    }
    return ret.slice(0, length) + jv.random(length - ret.length, depth + 1);
};

/**
 *
 * @param delayTime  循环暂停时间
 * @param action     每次循环的回调。返回 false 停止循环。
 * @param times      最多循环次数， 负数为一直循环
 * @returns {*}
 */
jv.await = (delayTime, times, action) => {
    times = times || 0;
    if (!times) {
        return;
    }

    if (action() === false) {
        return;
    }

    return setTimeout(() => {
        jv.await(delayTime, times - 1, action);
    }, delayTime);
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

let param_jmap = (obj) => {
    // var objType = typeof(obj);
    // if (objType == "string") {
    //   return obj;
    // }

    var ret = {};
    Object.keys(obj).forEach(key => {
        if (!key) return;
        if (key.endsWith("_res")) {
            return;
        }

        if (key[0] == "_") return;

        var value = obj[key];
        if (value === undefined) return;
        if (value === null) return;

        var isMap = (mapObject, objType) => {
            var isMapValue = objType == "map";
            if (!isMapValue) {
                if (Object.keys(mapObject).findIndex(it => {
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

            value = value.filter(it => it != undefined && it != null);

            if (value.length == 0) {
                ret[key] = "";
                return;
            }

            var firstType = typeof (value[0]);
            if (firstType == "string" || firstType == "number") {
                ret[key] = value.join(",");
            }

            for (var i in value) {
                var item = value[i];
                if (!item) continue;
                var objType = item.ObjectType;
                if (objType) {
                    var m = param_jmap(item);
                    var keys = Object.keys(m);

                    if (isMap(item, objType)) {
                        keys.forEach(sk => {
                            ret[key + "[" + i + "]['" + sk + "']"] = m[sk];
                        })
                    } else {
                        keys.forEach(sk => {
                            ret[key + "[" + i + "]." + sk] = m[sk];
                        })
                    }
                }
            }
        } else {
            var objType = value.ObjectType;
            if (objType) {
                var m = param_jmap(value);
                var keys = Object.keys(m);

                if (isMap(value, objType)) {
                    keys.forEach(sk => {
                        ret[key + "['" + sk + "']"] = m[sk];
                    })
                } else {
                    keys.forEach(sk => {
                        ret[key + "." + sk] = m[sk];
                    })
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

/**
 * 把 JSON 转换为 URL 格式。
 * @param obj
 * @returns {string}
 */
jv.param = (obj) => {
    var ret = param_jmap(obj);
    return Object.keys(ret).map(it => {
        return encodeURIComponent(it) + "=" + encodeURIComponent(ret[it])
    }).join("&");
};

// class UrlCls {
//     constructor(fullUrl){
//
//     }
// }
//
// jv.url = (fullUrl) => {
//     var parts = fullUrl.split("?"),
//     path = parts[0],
//     queryHash = parts[1] || "",
//     queryHashParts = queryHash.split("#"),
//     query = queryHashParts[0],
//     hash = queryHashParts[1];
//
//     var getJson = (query)=>{
//         var ret  = {};
//         query.split("?").last().split("&").forEach((it) => {
//             var sects = it.split("=");
//             if (sects.length == 2) {
//                 var key = sects[0];
//                 var value = decodeURIComponent(sects[1]);
//                 if (key in ret) {
//                     var oriValue = ret[key];
//                     if (oriValue.Type == "array") {
//                         oriValue.push(value);
//                     } else {
//                         oriValue = [oriValue];
//                         oriValue.push(value);
//                     }
//                     ret[key] = oriValue;
//                 } else {
//                     ret[key] = value;
//                 }
//             }
//         });
//         return ret;
//     }
//
//     this
//
//     return {
//         getPath :()=> path,
//         getQueryJson:()=> getJson(query),
//         getHashJson:()=> getJson(hash)
//     }
// }

/**
 * 如果 query 里有 ？，则截断，取问号后面的部分。
 * @param query
 * @returns {{}}
 */
jv.query2Json = (query) => {
    let ret = {};
    if (!query) return ret;
    query.split("?").last().split("&").forEach((it) => {
        var sects = it.split("=");
        if (sects.length == 2) {
            var key = sects[0];
            var value = decodeURIComponent(sects[1]);
            if (key in ret) {
                var oriValue = ret[key];
                if (oriValue.Type == "array") {
                    oriValue.push(value);
                } else {
                    oriValue = [oriValue];
                    oriValue.push(value);
                }
                ret[key] = oriValue;
            } else {
                ret[key] = value;
            }
        }
    });
    return ret;
};


//用法： jv.evalExpression({a:{b:[{c:1}]}} , "a.b[0].c")
//如果有错误 会设置到 jv.evalExpressionError，请先检查这个错误。
jv.evalExpression = (obj, path) => {
    if (path === 0) return obj[path];

    if (!path) return obj;

    try {
        return eval("(obj)=>obj." + path)(obj);
    } catch (e) {
        jv.evalExpressionError = e;
    }
};

jv.setEvalExpression = (obj, path, value) => {
    if (path === 0) {
        obj[path] = value;
        return true;
    }

    if (!path) {
        return false;
    }

    try {
        eval("(obj,v)=>obj." + path + "=v")(obj, value);
        return true;
    } catch (e) {
        jv.evalExpressionError = e;
        return false;
    }
}

/**
 * 从 container 向下，遍历 $children，根据 $el == dom 查找 dom所属的 vnode
 * @param container
 * @param dom
 */
jv.findVNode = (container, dom) => {
    if (container.$el === dom) {
        return container;
    }
    var ret;
    for (var item of container.$children) {
        ret = jv.findVNode(item, dom);
        if (ret) {
            return ret;
        }
    }
};

export default jv;

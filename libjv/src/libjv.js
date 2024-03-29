import "./defineProperty"

class JvObject {
    constructor() {
        if (!JvObject.instance) {
            JvObject.instance = this;
        }
        return JvObject.instance;
    }
}

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

    var ext = fileName.slice(dotIndex + 1).toLowerCase(),
        findKey = Object.keys(jv.fileTypes).last(key => jv.fileTypes[key].exts.includes(ext));
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


//缓存在内存的数据
jv.cache = {};

/**
 * 定义枚举类型
 * @param typeName
 * @param json
 * @constructor
 */
jv.JvEnum = function JvEnum(typeName, json, keyCallback) {
    this.typeName = typeName;
    keyCallback = keyCallback || (it => it);

    var type = json.Type;
    if (["object", "map"].includes(type)) {
        var index = 0;
        this.list = Object.keys(json).map(key => {
            return {name: keyCallback(key), index: index++, remark: json[key]}
        });
    } else {
        var index = 0;
        this.list = json.map(it => {
            if (it.Type == "string") {
                return {name: it, remark: it, index: index++}
            }

            if (jv.isNull(it.index)) {
                it.index = index++
            }
            return it;
        })
    }


    this.list.sort((a, b) => a.index - b.index)

    this.getData = (key) => {
        if (jv.isNull(key)) {
            return this.list;
        }

        if (["array", "set"].includes(key.Type)) {
            return this.list.filter(it => key.map(k2 => keyCallback(k2)).includes(it.name))
        }


        return this.list.filter(it => it.name == keyCallback(key))[0] || {};
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
                if (!v) {
                    return "";
                } else if (v.length) {
                    return v.map(it => it.remark || it.name).join(",")
                } else if (!v.name) {
                    return "";
                }

                return v.remark || v.name || "";
            },
            enumerable: true, configurable: true
        });
    };
}
/**
 * 判断所有枚举项是否完全被设置过。
 * var p = jv.testEnumDone("SexEnum",callback);
 *
 * 方法1： p.set("Male");
 * 方法2： p.set("Female");
 * 全部设置后， 自动调用 callback
 *
 * @param enumType
 * @returns {{set: function(*)}}
 */
jv.testEnumDone = function (enumType, done) {
    return Object.assign({
        setted: [],
        set: function (enumValue) {
            var enum_items = jv.enum[this.enumType].getData().map(it => it.name);
            if (enum_items.includes(enumValue)) {
                this.setted.push(enumValue);
            }

            if (this.setted.length == enum_items.length) {
                this.done();
            }
        }
    }, {enumType: enumType, done: done});
}

/**
 * 判断所有枚举项是否完全被设置过。
 */
// jv.enumAllSet = function (enumType, enumValue) {
//     if (!enumValue) {
//         return;
//     }
//
//     if (!(enumType in jv.enum)) {
//         throw new Error("找不到枚举： jv.enum." + enumType)
//         return;
//     }
//     var key = "_" + enumType + "_",
//         set = jv.cache[key];
//
//     if (!set) {
//         set = new Set();
//         jv.cache[key] = set;
//     }
//
//     var enum_items = jv.enum[enumType].getData().map(it => it.name);
//
//     if (enum_items.includes(enumValue)) {
//         set.push(enumValue);
//     }
//
//     return set.length == enum_items.length;
// };


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

/**
 * 返回四态： true,false,"",null
 * @param value
 * @returns {string|null|boolean|*}
 */
jv.asBoolean = (value) => {
    if (jv.isNull(value)) return null;
    var type = value.Type;
    if (type == "number" && isNaN(value)) return false;
    if (value === Infinity) return false;
    if (value === -Infinity) return false;

    //选择数据源，可能是空。
    if (value === "") return "";

    if (value === "null" ||
        value === "undefined") return null;

    if (value === "false" ||
        value === "0") return false;

    return !!value;
};

jv.asString = (value, format) => {
    if (jv.isNull(value)) return "";
    if (jv.isNull(format)) return value.toString(format);
    return value.toString();
}

//如果是数字形式，返回 Int，否则返回 0.
jv.asInt = (value) => {
    if (jv.isNull(value)) return 0;
    if (value.toString().isNumberFormat(value)) {
        return parseInt(value);
    }
    return 0;
}

/**
 * 遍历Json对象。返回 false 停止遍历所有
 * @param json
 * @param eachJsonItemCallback 参数：item,depth,parent
 */
jv.recursionJson = (json, eachJsonItemCallback, deepth, parent) => {
    if (!json) {
        return;
    }
    deepth = deepth || 0;

    var type = json.PrimitiveType;
    if (type == "array" || type == "set") {
        return Array.from(json).ForEach(it => {
            return jv.recursionJson(it, eachJsonItemCallback, deepth + 1, parent);
        });
    } else if (!json.ObjectType) {
        return;
    }

    if (eachJsonItemCallback(json, parent, deepth) === false) {
        return false;
    }

    return Object.keys(json).ForEach(key => {
        var value = json[key];
        if (value) {
            if (jv.recursionJson(value, eachJsonItemCallback, deepth + 1, json) === false) {
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
    if (!json) return;
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
        console.log("jv.fillRes 参数不能为空！");
        return;
    }

    var res1 = (target, key1, args1, must) => {
        if (!target) {
            return;
        }
        if (!must && (key1 + "_res") in target) {
            return;
        }

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
                enumerable: false, configurable: true
            });
            return true;
        }
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


/*如果两个对象是数组, 使用refDataEquals比较内容, 比较数组中的顺序.

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

        for (var i = 0; i < a_length; i++) {
            if (jv.dataEquals(a[i], b[i]) == false) {
                return false;
            }
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

    var ret = {}, ary = [];
    Object.keys(obj).forEach(key => {
        if (!key) return;
        if (key.endsWith("_res")) {
            return;
        }

        var value = obj[key];
        if (value === undefined) return;
        if (value === null) return;

        //如果是 Array[Map]，生成 ret[items['id']]=1
        //如果是 Array[Object]，生成 ret[items.id]=1
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
            value = value.filter(it => !jv.isNull(it));

            if (!value.length) {
                ret[key] = "";
                return;
            }

            var firstType = typeof (value[0]);
            if (firstType == "string" || firstType == "number") {
                ary.pushAll(value.map(it => encodeURIComponent(key) + "=" + encodeURIComponent(it)));
            } else {
                for (var i in value) {
                    var item = value[i];
                    if (!item) continue;
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
                var m = param_jmap(value).json;
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

    return {json: ret, ary: ary};
};

/**
 * 获取Url中 非 _部分
 * @param url
 * @private
 */
jv.getUrlWithout_ = url => {
    var queryJson = jv.query2Json(url);
    Object.keys(queryJson).filter(it => it.startsWith("_") && it.endsWith("_")).forEach(it => {
        delete queryJson[it];
    })
    return jv.param(queryJson, true);
}

jv.getFullUrl = url => {
    url = url || ""
    if (url.startsWith("http://") ||
        url.startsWith("https://") ||
        url.startsWith("//")) return url;

    return window.location.origin + (window.BASE_URL + url).replaceAll("//", "/");
}

/**
 * 把 JSON 转换为 URL 格式。
 * @param obj
 * @returns {string}
 */
jv.param = (obj, withHost) => {
    var host = withHost && obj.getUrlPart && obj.getUrlPart() || "";
    var ret = param_jmap(obj);
    var ary = [];
    ary.pushAll(Object.keys(ret.json).map(it => {
        return encodeURIComponent(it) + "=" + encodeURIComponent(ret.json[it])
    }));
    ary.pushAll(ret.ary)

    return [host, ary.join("&")].filter(it => it).join("?")
};

/**
 * query 必须包含? 截取问号后面的部分。
 * @param query
 * @returns {{}}
 */
jv.query2Json = (query) => {
    let ret = {};
    if (!query) return ret;
    var url_sects = query.split("?");
    Object.defineProperty(ret, "getUrlPart", {
        value() {
            return url_sects[0];
        }, enumerable: false
    });
    var query_parts = (url_sects[1] || "").split("#");
    Object.defineProperty(ret, "getHashPart", {
        value() {
            return query_parts[1] || "";
        }, enumerable: false
    });

    query_parts[0].split("&").forEach((it) => {
        if (!it) return;
        var sects = it.split("=");
        if (sects.length != 2) {
            console.warn("jv.query2Json 不识别的URL:" + it);
            return;
        }

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


export default jv;

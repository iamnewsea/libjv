//-------------------------------------------------------------
//返回 function ,string 等实际类名。
Object.defineProperty(Object.prototype, "Type", {
  get() {
    var ret = this.constructor.name || typeof(this);
    //把第一个非大写字母前面的全部变成小写字母。

    if (ret) {
      var index = 0;
      for (var it of ret) {
        var code = it.charCodeAt();
        if (code >= 65 && code <= 90) {
          index++;
        }
        else {
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
  }, enumerable: false
});


/*
 obj.Enumer("sex",jv.SexEnum)
 data.sex_res == "男"
 */
Object.defineProperty(Object.prototype, "Enumer", {
  value(key, enumDef, override) {
    var obj = this;
    if (key in obj == false) {
      throw new Error("找不到 " + key + " 属性(" + enumDef.type + ")")
    }
    var p = obj[key];
    var v = enumDef.getData(p.toString());
    if (!v) {
      return;
    }
    if (override) {
      obj[key] = v.remark || "";
    }
    else {
      obj[key + "_res"] = v.remark || "";
    }
  }, enumerable: false
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
  }, enumerable: false
});
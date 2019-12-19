import jv from "libjv"

jv.citys = [{
  c: 110100,
  n: '北京',
  s: [{c: 110101, n: '东城'}, {c: 110102, n: '西城'}, {c: 110105, n: '朝阳'}, {c: 110106, n: '丰台'}, {
    c: 110107,
    n: '石景山'
  }, {c: 110108, n: '海淀'}, {c: 110109, n: '门头沟'}, {c: 110111, n: '房山'}, {c: 110112, n: '通州'}, {
    c: 110113,
    n: '顺义'
  }, {c: 110114, n: '昌平'}, {c: 110115, n: '大兴'}, {c: 110116, n: '怀柔'}, {c: 110117, n: '平谷'}, {
    c: 110228,
    n: '密云'
  }, {c: 110229, n: '延庆'}]
}, {
  c: 120100,
  n: '天津',
  s: [{c: 120101, n: '和平'}, {c: 120102, n: '河东'}, {c: 120103, n: '河西'}, {c: 120104, n: '南开'}, {
    c: 120105,
    n: '河北'
  }, {c: 120106, n: '红桥'}, {c: 120110, n: '东丽'}, {c: 120111, n: '西青'}, {c: 120112, n: '津南'}, {
    c: 120113,
    n: '北辰'
  }, {c: 120114, n: '武清'}, {c: 120115, n: '宝坻'}, {c: 120116, n: '滨海'}, {c: 120221, n: '宁河'}, {
    c: 120223,
    n: '静海'
  }, {c: 120225, n: '蓟'}]
}, {c: 130000, n: '河北'}, {c: 140000, n: '山西'}, {c: 150000, n: '内蒙古'}, {c: 210000, n: '辽宁'}, {
  c: 220000,
  n: '吉林'
}, {c: 230000, n: '黑龙江'}, {
  c: 310100,
  n: '上海',
  s: [{c: 310101, n: '黄浦'}, {c: 310104, n: '徐汇'}, {c: 310105, n: '长宁'}, {c: 310106, n: '静安'}, {
    c: 310107,
    n: '普陀'
  }, {c: 310108, n: '闸北'}, {c: 310109, n: '虹口'}, {c: 310110, n: '杨浦'}, {c: 310112, n: '闵行'}, {
    c: 310113,
    n: '宝山'
  }, {c: 310114, n: '嘉定'}, {c: 310115, n: '浦东新'}, {c: 310116, n: '金山'}, {c: 310117, n: '松江'}, {
    c: 310118,
    n: '青浦'
  }, {c: 310120, n: '奉贤'}, {c: 310230, n: '崇明'}]
}, {c: 320000, n: '江苏'}, {c: 330000, n: '浙江'}, {c: 340000, n: '安徽'}, {c: 350000, n: '福建'}, {
  c: 360000,
  n: '江西'
}, {c: 370000, n: '山东'}, {c: 410000, n: '河南'}, {c: 420000, n: '湖北'}, {c: 430000, n: '湖南'}, {
  c: 440000,
  n: '广东'
}, {c: 450000, n: '广西'}, {c: 460000, n: '海南'}, {c: 500000, n: '重庆'}, {c: 510000, n: '四川'}, {
  c: 520000,
  n: '贵州'
}, {c: 530000, n: '云南'}, {c: 540000, n: '西藏'}, {c: 610000, n: '陕西'}, {c: 620000, n: '甘肃'}, {
  c: 630000,
  n: '青海'
}, {c: 640000, n: '宁夏'}, {c: 650000, n: '新疆'}, {c: 710000, n: '台湾'}, {c: 810000, n: '香港'}, {
  c: 820000,
  n: '澳门'
}]

jv.citys.zhixia = [];

jv.citys.forEach(it => {
  if (it.c % 10000) {
    jv.citys.zhixia.push(parseInt(it.c / 10000));
  }
});

jv.citys.isZhixia = function (code) {
  return jv.citys.zhixia.indexOf(parseInt(code / 10000)) >= 0;
}

jv.citys.recursion(it => it.s, it => {
  if (it.c % 100) return;
  if (it.s && it.s.length) return;
  it.s = [];
});

jv.citys.getLevel = function (code) {
  if (!code) return 0;
  if (code % 100) return 3;
  if (code % 10000) return 2;
  return 1;
}

jv.citys.findByCode = function (code) {
  if (!code) return;
  code = parseInt(code);
  // 由于1级码可能是直辖市，所以.
  // var level2Code = parseInt(code / 100) * 100;

  var findSubOne = function (datas, code, level, maxLevel) {
    if (level > 3) return null;
    if (!datas) return null;
    if (level > maxLevel) return null;

    var chuShu = 1;
    if (level == 1) chuShu = 10000;
    else if (level == 2) chuShu = 100;

    var levelCode = parseInt(code / chuShu) * chuShu;

    for (var data of datas) {
      if (data.c == code) {
        return data;
      }
      if (data.c == levelCode) {
        return findSubOne(data.s, code, level + 1, maxLevel);
      }
      // if (level == 1 && data.c == level2Code) {
      //   return findSubOne(datas, code, level + 1);
      // }
    }
    return null;
  };

  var level = jv.citys.getLevel(code);
  var iszhi = jv.citys.isZhixia(code);
  if (level == 1 && iszhi) {
    return jv.citys.filter(it => parseInt(it.c / 10000) == parseInt(code / 10000))[0];
  }
  return findSubOne(jv.citys, code, iszhi ? 2 : 1, level);
}

jv.citys.url = "/open/getChildCitys";
jv.citys.loadChildCitys = function (code, loaded) {
  code = parseInt(code);
  if (code % 100) return;
  var city = jv.citys.findByCode(code);
  if (city && city.s && city.s.length) {
    return;
  }

  jv.ajax.post(jv.citys.url, {code: code},{proxy:true})
      .then(res => {
        var json = res.data.data;

        if (!( city.c % 10000)) {
          json.forEach(it => {
            it.s = [];
          });
        }

        city.s = json;

        if (loaded) {
          loaded(city);
        }
      });
};

//在页面加载的时候,根据 code ,加载出层级数据.
//如: code=101122 .加载出 第一级,10的第二级,及 11的第三级.
jv.citys.confirm = function (code, loaded) {
  if (!code) return;
  code = parseInt(code);
  var city = jv.citys.findByCode(code);
  if (city) return loaded(city);
  var level = jv.citys.getLevel(code);
  if (level >= 2) {
    jv.citys.loadChildCitys(parseInt(code / 10000) * 10000, it => {
      if (level == 3) {
        jv.citys.loadChildCitys(parseInt(code / 100) * 100, loaded);
      }
    });
  }
}

jv.citys.getEachCitys = function (code) {
  var ret = [];
  if (!code) return ret;
  code = parseInt(code);

  var level = jv.citys.getLevel(code);

  var chuShu = 1;
  for (var i = 1; i <= level; i++) {
    if (i == 1) {
      chuShu = 10000;
    }
    else if (i == 2) {
      chuShu = 100;
    }
    else chuShu = 1;

    var city = jv.citys.findByCode(parseInt(code / chuShu) * chuShu);
    if (!city) {
      if (i == 1) {
        continue;
      }
      return ret;
    }
    ret.push({c: city.c, n: city.n});
    if (city.c == code) break;
  }
  return ret;
}

export default jv;

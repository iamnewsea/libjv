import jv from './libjv'

jv.citys = [{
  c: 110100,
  n: '北京市',
  s: [{c: 110101, n: '东城区'}, {c: 110102, n: '西城区'}, {c: 110105, n: '朝阳区'}, {c: 110106, n: '丰台区'}, {
    c: 110107,
    n: '石景山区'
  }, {c: 110108, n: '海淀区'}, {c: 110109, n: '门头沟区'}, {c: 110111, n: '房山区'}, {c: 110112, n: '通州区'}, {
    c: 110113,
    n: '顺义区'
  }, {c: 110114, n: '昌平区'}, {c: 110115, n: '大兴区'}, {c: 110116, n: '怀柔区'}, {c: 110117, n: '平谷区'}, {
    c: 110228,
    n: '密云县'
  }, {c: 110229, n: '延庆县'}]
}, {
  c: 120100,
  n: '天津市',
  s: [{c: 120101, n: '和平区'}, {c: 120102, n: '河东区'}, {c: 120103, n: '河西区'}, {c: 120104, n: '南开区'}, {
    c: 120105,
    n: '河北区'
  }, {c: 120106, n: '红桥区'}, {c: 120110, n: '东丽区'}, {c: 120111, n: '西青区'}, {c: 120112, n: '津南区'}, {
    c: 120113,
    n: '北辰区'
  }, {c: 120114, n: '武清区'}, {c: 120115, n: '宝坻区'}, {c: 120116, n: '滨海新区'}, {c: 120221, n: '宁河县'}, {
    c: 120223,
    n: '静海县'
  }, {c: 120225, n: '蓟县'}]
}, {c: 130000, n: '河北省'}, {c: 140000, n: '山西省'}, {c: 150000, n: '内蒙古自治区'}, {c: 210000, n: '辽宁省'}, {
  c: 220000,
  n: '吉林省'
}, {c: 230000, n: '黑龙江省'}, {
  c: 310100,
  n: '上海市',
  s: [{c: 310101, n: '黄浦区'}, {c: 310104, n: '徐汇区'}, {c: 310105, n: '长宁区'}, {c: 310106, n: '静安区'}, {
    c: 310107,
    n: '普陀区'
  }, {c: 310108, n: '闸北区'}, {c: 310109, n: '虹口区'}, {c: 310110, n: '杨浦区'}, {c: 310112, n: '闵行区'}, {
    c: 310113,
    n: '宝山区'
  }, {c: 310114, n: '嘉定区'}, {c: 310115, n: '浦东新区'}, {c: 310116, n: '金山区'}, {c: 310117, n: '松江区'}, {
    c: 310118,
    n: '青浦区'
  }, {c: 310120, n: '奉贤区'}, {c: 310230, n: '崇明县'}]
}, {c: 320000, n: '江苏省'}, {c: 330000, n: '浙江省'}, {c: 340000, n: '安徽省'}, {c: 350000, n: '福建省'}, {
  c: 360000,
  n: '江西省'
}, {c: 370000, n: '山东省'}, {c: 410000, n: '河南省'}, {c: 420000, n: '湖北省'}, {c: 430000, n: '湖南省'}, {
  c: 440000,
  n: '广东省'
}, {c: 450000, n: '广西壮族自治区'}, {c: 460000, n: '海南省'}, {c: 500000, n: '重庆'}, {c: 510000, n: '四川省'}, {
  c: 520000,
  n: '贵州省'
}, {c: 530000, n: '云南省'}, {c: 540000, n: '西藏自治区'}, {c: 610000, n: '陕西省'}, {c: 620000, n: '甘肃省'}, {
  c: 630000,
  n: '青海省'
}, {c: 640000, n: '宁夏回族自治区'}, {c: 650000, n: '新疆维吾尔自治区'}, {c: 710000, n: '台湾'}, {c: 810000, n: '香港特别行政区'}, {
  c: 820000,
  n: '澳门特别行政区'
}]

jv.citys.zhixia = [];

jv.citys.forEach(it => {
  if (it.c % 10000) {
    jv.citys.zhixia.push(parseInt(it.c / 10000));
  }
});

jv.citys.isZhixia = function (code) {
  return jv.citys.indexOf(parseInt(code / 10000)) >= 0;
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

  //由于1级码可能是直辖市，所以.
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
        return findSubOne(data.s, code, level + 1,maxLevel);
      }
      // if (level == 1 && data.c == level2Code) {
      //   return findSubOne(datas, code, level + 1);
      // }
    }
    return null;
  };

  return findSubOne(jv.citys, code, jv.citys.isZhixia(code) ? 2 : 1, jv.citys.getLevel(code));
}

jv.citys.loadChildCitys = function (code, ajax, loaded) {
  if (code % 100) return;
  var city = jv.citys.findByCode(code);
  if (city && city.s && city.s.length) {
    return;
  }

  ajax.post("/open/getChildCitys", {code: code})
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

jv.citys.confirm = function (code, ajax, loaded) {
  if (!code) return;
  var city = jv.citys.findByCode(code);
  if (city) return loaded(city);
  var level = jv.citys.getLevel(code);
  if (level >= 2) {
    jv.citys.loadChildCitys(parseInt(code / 10000) * 10000, ajax, it => {
      if (level == 3) {
        jv.citys.loadChildCitys(parseInt(code / 100) * 100, ajax, loaded);
      }
    });
  }
}

jv.citys.getEachCitys = function (code) {
  var ret = [];
  if (!code) return ret;
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

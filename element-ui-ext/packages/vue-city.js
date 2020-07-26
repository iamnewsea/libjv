import jv from "libjv"

(function () {
    jv.cityData = [{
        c: 110000,
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
        c: 120000,
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
        c: 310000,
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
    }];


    var translateCityData = function (data) {
        data.value = data.c;
        data.label = data.n;
        if (data.s) {
            data.children = data.s;
        }

        delete data.c;
        delete data.n;
        delete data.s;
    };


    jv.city = {};

    /**
     * 1级：河北，2级：沧州，3级：献县
     * 1级：北京，2级：北京市，3级：海淀区
     *
     * 直辖市的时候，2级编码不准，比如北京市:110100 , 延庆： 110229
     * @param code
     * @returns {number}
     */
    jv.city.getLevel = function (code) {
        if (!code) return 0;
        if (code % 100) return 3;
        if (code % 10000) return 2;
        return 1;
    };

    jv.cityData.recursion(it => it.s || it.children, it => {
        var code = it.c;
        var codeLevel = jv.city.getLevel(code);

        if (codeLevel == 3) {
            it.leaf = true;
        }

        translateCityData(it);
    });


    /**
     * 根据 code,找数据项。
     * @param code
     */
    jv.city.getByCode = function (code) {
        if (!code) return;
        code = parseInt(code);


        var findSubOne = function (datas, code, currentLevel) {
            if (!datas) return null;
            var level = jv.city.getLevel(code);
            if (level > 3) return null;

            currentLevel = currentLevel || 1;
            var level1Code = parseInt(code / 10000) * 10000;

            for (var data of datas) {
                if (data.value == code) {
                    return data;
                }

                if (currentLevel == 1) {
                    if (data.value == level1Code) {
                        return findSubOne(data.children, code);
                    }
                } else {
                    var ret = findSubOne(data.children, code);
                    if (ret != null) {
                        return ret;
                    }
                }
            }
            return null;
        };

        return findSubOne(jv.cityData, code);
    }

    jv.child_citys_url = "/child-citys";

    jv.city.isZhixia = function (code) {
        if (code % 10000 != 0) return false;
        return [11, 12, 31].includes(code / 10000);
    };
    jv.city.isInZhixia = function (code) {
        return [11, 12, 31].includes(parseInt(code / 10000));
    };

    /**
     *
     * @param code 加载哪个省/市的数据
     * @param maxLevel 加载的最大级数
     * @param resolve 回调
     */
    jv.city.loadChildren = function (code, maxLevel, resolve) {
        maxLevel = maxLevel || 3;

        var procLevel = function (data, leaf) {
            data.forEach(it => {
                it.leaf = leaf;
                if (it.leaf) {
                    delete it.c;
                    delete it.children;
                }
            })
            return data;
        }

        resolve = resolve || jv.noop;
        code = parseInt(code);

        if (!code) {
            resolve(procLevel(jv.cityData, maxLevel == 1));
            return;
        }

        var codeLevel = jv.city.getLevel(code);

        if (codeLevel == 3) {
            resolve();
            return;
        }
        var subIsleaf = codeLevel == (maxLevel - 1);

        if (codeLevel == 1 && jv.city.isZhixia(code)) {
            subIsleaf = true;
        }

        var city = jv.city.getByCode(code);
        if (city && city.children && city.children.length) {
            resolve(procLevel(city.children, subIsleaf));
            return;
        }


        jv.ajax.post(jv.child_citys_url + "?pcode=" + code, {}, {cache: "page"})
            .then(res => {
                var json = res.data.data;
                json.forEach(it => translateCityData(it));
                city.children = json;
                resolve(procLevel(city.children, subIsleaf));

            });
    };

    //在页面加载的时候,根据 code ,加载出层级数据.
    //如: code=101122 .加载出 第一级,10的第二级,及 11的第三级.`
    jv.city.confirm = function (code, loaded) {
        if (!code) return;
        loaded = loaded || jv.noop;
        code = parseInt(code);
        var city = jv.city.getByCode(code);
        if (city) return loaded();
        var level = jv.city.getLevel(code);
        if (level >= 2) {
            jv.city.loadChildren(parseInt(code / 10000) * 10000, it => {
                if (level >= 3) {
                    jv.city.loadChildren(parseInt(code / 100) * 100, loaded);
                } else {
                    loaded();
                }
            });
        }
    };

    jv.city.getEachCitys = function (code) {
        var ret = [];
        if (!code) return ret;
        code = parseInt(code);

        var level = jv.city.getLevel(code);

        var chuShu = 1;
        for (var i = 1; i <= level; i++) {
            if (i == 1) {
                chuShu = 10000;
            } else if (i == 2) {
                if (jv.city.isInZhixia(code)) {
                    continue;
                }
                chuShu = 100;
            } else chuShu = 1;

            var city = jv.city.getByCode(parseInt(code / chuShu) * chuShu);
            if (!city) {
                return ret;
            }
            ret.push({value: city.value, label: city.label});
            if (city.value == code) break;
        }
        return ret;
    }

})();

export default jv;

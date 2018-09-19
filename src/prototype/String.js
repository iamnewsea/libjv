String.prototype.ori_trim = String.prototype.trim;

Object.defineProperty(String.prototype, 'trim', {
    value() {
        var ps = arguments;

        var value = this.ori_trim();
        if (ps.length == 0) {
            return value;
        }

        if (ps.length == 1 && (typeof(ps[0]) != "string") && ps[0].length) {
            ps = ps[0];
        }

        var hit = false;
        for (var i = 0, len = ps.length; i < len; i++) {
            var hit_inner = false;
            var v = ps[i];
            if (value.startsWith(v)) {
                value = value.slice(v.length).ori_trim();
                hit_inner = true;
            }

            if (value.endsWith(v)) {
                value = value.slice(0, 0 - v.length).ori_trim();
                hit_inner = true;
            }

            hit = hit_inner || hit;
            if (hit_inner) {
                i--;
            }
        }

        if (hit) {
            return value.trim(ps);
        }
        else return value;
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


//参数是 Json 的 format。参数： json , 样式: {} , ${}, @ 仅有这三种.
/*
样式:
    {}   : {
    ${}
    @

样式如下:
    "hello {user.name}!".format({user:{name:"world"}} );
    "hello ${user.name}!".format({user:{name:"world"}} , "${}");
    "hello @name!".format({name:"world"} , "@");
=>
    hello world!
 */
Object.defineProperty(String.prototype, 'format', {
    value() {
        var json = arguments[0],
            style = arguments[1] || "{}", // 默认样式.
            emptyFunc = arguments[2];

        var styles = {
            "{}": {escape: "{{", regexp: "{([^}]+)}"},
            "${}": {escape: "$${", regexp: "\\${([^}]+)}"},
            "@": {escape: "@@", regexp: "@(\\w+)"}
        }, config = styles[style]

        return this
            .replace(config.escape, String.fromCharCode(7), "g")
            .replace(new RegExp(config.regexp, "g"),
                //m 是指搜索到的整个部分， "(\\w+)"如： {id} , 而 i  是指 该部分的分组内容 ， 如 id
                function (m, key) {
                    var value = m;
                    try {
                        value = eval("(function(){with(this){ return  " + key + "; } })").call(json)
                    }
                    catch (e) {
                        console.log("String.format 执行出错, 变量: " + m + ", 数据: " + JSON.stringify(json));
                        if (emptyFunc) {
                            value = emptyFunc(key)
                        }
                    }

                    if ((value === 0) || (value === false) || (value === "")) {
                        return value;
                    }
                    return value || m;
                })
            .replace(String.fromCharCode(7), config.escape, "g")
            ;
    }, enumerable: false
});

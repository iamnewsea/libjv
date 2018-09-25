//格式化日期，将毫秒数转化为日期时间
Object.defineProperty(Number.prototype, "toDateString", {
    value(format) {
        if (!this) return "";
        var time = this;
        var t = new Date(time);
        if (!format) {
            if (t.valueOf() > 86400000 && !t.getHours() && !t.getMinutes() && !t.getSeconds()) {
                format = "yyyy-MM-dd";
            }
            else {
                format = "yyyy-MM-dd HH:mm:ss";
            }
        }
        var tf = function (i) {
            return (i < 10 ? '0' : '') + i
        };
        return format.replace(/yyyy|MM|dd|HH|mm|ss/g, function (a) {
            switch (a) {
                case 'yyyy':
                    return tf(t.getFullYear());
                    break;
                case 'MM':
                    return tf(t.getMonth() + 1);
                    break;
                case 'mm':
                    return tf(t.getMinutes());
                    break;
                case 'dd':
                    return tf(t.getDate());
                    break;
                case 'HH':
                    return tf(t.getHours());
                    break;
                case 'ss':
                    return tf(t.getSeconds());
                    break;
            }
        })
    }, enumerable: false
});


Object.defineProperty(Number.prototype, 'format', {
    value() {
        //"000.00" 只接收 0 和一个点。
        var ps = arguments;
        if (ps.length == 0) {
            return value;
        }
        // if (ps.length == 1 && (typeof(ps[0]) != "string") && ps[0].length) {
        //   ps = ps[0];
        // }


        var formatValue = ps[0],
            dotIndex = -1;

        //第一位，要么是0,要么是点。
        var zero1Index = formatValue.indexOf("0");
        if (zero1Index < 0) {
            return this.toString();
            ;
        }
        else if (zero1Index == 0) {
            dotIndex = formatValue.indexOf(".");

        }
        else if (formatValue[0] == ".") {
            dotIndex = 0;
        }
        else {
            return this.toString();
        }

        //点或0前面的位置
        var beforeMustLength = 0,
            endMustLength = dotIndex < 0 ? 0 : formatValue.length - dotIndex - 1,
            vs = this.toString().split(".");

        if (dotIndex < 0) {
            beforeMustLength = formatValue.length;
        }
        else if (dotIndex > zero1Index) {
            beforeMustLength = dotIndex - zero1Index;
        }

        vs[1] = vs[1] || "";

        var ret = "";

        for (var i = 0, len = beforeMustLength - vs[0].length; i < len; i++) {
            ret += "0";
        }
        ret += vs[0];
        if (dotIndex >= 0) {
            ret += ".";
        }
        if (endMustLength > 0) {
            ret += vs[1].slice(0, endMustLength);

            for (var i = 0, len = endMustLength - vs[1].length; i < len; i++) {
                ret += "0";
            }
        }
        return ret;
    }, enumerable: false
});


//获取整数的每一个二进制位的值。
Object.defineProperty(Number.prototype, 'EachBitValue', {
    get() {
        var ret = [];
        var value = parseInt(this);
        var position = 0;
        while (true) {
            if (!value) break;
            if (value & 1) {
                ret.push(Math.pow(2, position));
            }

            value = value >> 1;
            position++;
        }
        return ret;
    }, enumerable: false
});


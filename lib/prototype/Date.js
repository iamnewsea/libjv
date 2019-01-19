"use strict";

//时间按 UTC 处理.

Date.from = function (year, dates) {
    if (!year && !dates) return new Date();

    if (year.Type == "string" && !dates) {
        return new Date(year);
    }
    return new Date(new Date(year + "/01/01").valueOf() + (dates - 1) * 86400000);
};

Date.today = function () {
    var now = new Date();
    var time = now.getUTCHours() * 3600 + now.getUTCMinutes() * 60 + n.getUTCSeconds();
    return new Date(now.valueOf() - time * 1000);
};

//获取总秒数。
// Object.defineProperty(Date.prototype, "totalSeconds", {
//     get(format) {
//         return parseInt(this.valueOf() / 1000);
//     }, enumerable: false
// });

Object.defineProperty(Date.prototype, "toDateString", {
    value: function value(format) {
        return this.valueOf().toDateString(format);
    },
    enumerable: false
});

Object.defineProperty(Date.prototype, "addDays", {
    value: function value(days) {
        if (!days) return this;
        return new Date(this.valueOf() + days * 86400000);
    },
    enumerable: false
});

//获取时间的毫秒数 , 可以设置当前时间的毫秒数， 只影响时间， 不影响日期
Object.defineProperty(Date.prototype, "Time", {
    get: function get() {
        return this.valueOf() % 86400000;
    },
    set: function set(value) {
        if (value < 0) return;
        value = value % 86400000;

        var hours = value / 3600000;
        value = value % 3600000;
        var minutes = value / 6000;
        value = value % 6000;
        var secondes = value / 1000;

        this.setUTCHours(hours, minutes, secondes);
    },

    enumerable: false
});

//一年的第几天。
Object.defineProperty(Date.prototype, "DayOfYear", {
    get: function get() {
        var ret = (this.valueOf() - new Date(this.getUTCFullYear() + "/01/01").valueOf()) / 86400000;
        return parseInt(ret) + 1;
    },
    enumerable: false
});
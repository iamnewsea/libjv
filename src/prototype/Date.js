Date.from = function (year, dates) {
    if (!year && !dates) return new Date(-28800000);

    if (year.Type == "string" && !dates) {
        return year.AsLocalDate()
    }
    return new Date(new Date(year + "/01/01").valueOf() + (dates - 1) * 86400000);
}

Date.today = function () {
    var now = new Date();
    return new Date(now.getFullYear() + "/" + (now.getMonth() + 1) + "/" + now.getDate() + " 00:00:00");
}


//获取总秒数。
Object.defineProperty(Date.prototype, "totalSeconds", {
    get(format) {
        return parseInt(this.valueOf() / 1000);
    }, enumerable: false
});

Object.defineProperty(Date.prototype, "toDateString", {
    value(format) {
        return this.valueOf().toDateString(format);
    }, enumerable: false
});


Object.defineProperty(Date.prototype, "addDays", {
    value(days) {
        if (!days) return this;
        return new Date(this.valueOf() + days * 86400000);
    }, enumerable: false
});

//获取时间的毫秒数 , 可以设置当前时间的毫秒数， 只影响时间， 不影响日期
Object.defineProperty(Date.prototype, "Time", {
    get() {
        return this.getHours() * 3600000 + this.getMinutes() * 60000 + this.getSeconds() * 1000 + this.getMilliseconds();
    },
    set(value) {
        if (value < 0 || value > 86400000) return;

        var hours = value / 3600000;
        value = value % 3600000;
        var minutes = value / 6000;
        value = value % 6000;
        var secondes = value / 1000;

        this.setHours(hours, minutes, secondes);
    },
    enumerable: false
});
//一年的第几天。
Object.defineProperty(Date.prototype, "DayOfYear", {
    get() {
        var ret = (this.valueOf() - new Date(this.getFullYear() + "/01/01").valueOf()) / 86400000;
        return parseInt(ret) + 1;
    }, enumerable: false
});

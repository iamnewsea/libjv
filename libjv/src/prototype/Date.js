(function () {

    if (Date.today) {
        return;
    }

    /**
     * 要保证， Date.from("当日").toDateString()  返回的结果是一样的。
     *  new Date("2020/02/17") 是当地时间
     * @param year
     * @param dates
     * @returns {Date}
     */
    Date.from = (year, dates) => {
        var now = new Date();
        if (!year && !dates) return now;

        if (year.Type == "string" && !dates) {
            return new Date(year.replace(/-/g, '\/').trim());
        }

        return new Date(new Date(year, 0, 1).valueOf() + (dates - 1) * 86400000);
    };

    /**
     * 返回北京时间的，当天的0分0秒0分。
     * 也就是说，北京的零晨执行时，也是当日。
     * Date.today().toDateString(null,"local") 必须正确。
     */
    Date.today = () => {
        var now = new Date();
        return new Date(now.getFullYear(), now.getMonth(), now.getDate());
    };


//获取总秒数。
// Object.defineProperty(Date.prototype, "totalSeconds", {
//     get(format) {
//         return parseInt(this.valueOf() / 1000);
//     }, enumerable: false
// });

    Object.defineProperty(Date.prototype, "toDateString", {
        value(format, timezone) {
            return this.valueOf().toDateString(format, timezone);
        }, enumerable: false,configurable:true,writable:true
    });


    Object.defineProperty(Date.prototype, "addDays", {
        value(days) {
            if (!days) return this;
            return new Date(this.valueOf() + days * 86400000);
        }, enumerable: false,configurable:true,writable:true
    });

//获取时间的毫秒数 , 可以设置当前时间的毫秒数， 只影响时间， 不影响日期
    Object.defineProperty(Date.prototype, "Time", {
        get() {
            return this.valueOf() % 86400000;
        },
        set(value) {
            if (value < 0) return;
            value = value % 86400000;

            var hours = value / 3600000;
            value = value % 3600000;
            var minutes = value / 6000;
            value = value % 6000;
            var secondes = value / 1000;

            this.setUTCHours(hours, minutes, secondes);
        },
        enumerable: false,configurable:true
    });


//一年的第几天。
    Object.defineProperty(Date.prototype, "DayOfYear", {
        get() {
            var ret = (this.valueOf() - new Date(this.getUTCFullYear() + "/01/01").valueOf()) / 86400000;
            return parseInt(ret) + 1;
        }, enumerable: false,configurable:true
    });

})()
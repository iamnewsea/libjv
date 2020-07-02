(function () {
    if (Set.prototype.push) {
        return;
    }


    //可以push Array，及Set
    Object.defineProperty(Set.prototype, "push", {
        value(value) {
            if (!value) {
                this.add(value);
            } else {
                if (["array", "set"].includes(value.Type)) {
                    value = Array.from(value);

                    for (var i = 0, len = value.length; i < len; i++) {
                        this.add(value[i]);
                    }
                } else {
                    this.add(value);
                }
            }
            return this.size;
        }, enumerable: false
    });

})();

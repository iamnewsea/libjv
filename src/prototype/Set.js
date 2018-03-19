
//可以push Array，及Set
Object.defineProperty(Set.prototype, "push", {
  value(value) {
    if (value && value.Type == "set") {
      value = Array.from(value);
    }
    for (var i = 0, len = value.length; i < len; i++) {
      this.add(value[i]);
    }
    return this.size;
  }, enumerable: false
});
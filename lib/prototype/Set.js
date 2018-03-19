"use strict";

//可以push Array，及Set
Object.defineProperty(Set.prototype, "push", {
  value: function value(_value) {
    if (_value && _value.Type == "set") {
      _value = Array.from(_value);
    }
    for (var i = 0, len = _value.length; i < len; i++) {
      this.add(_value[i]);
    }
    return this.size;
  },
  enumerable: false
});
var inline = require("./inline-res")
var tagLag = require("./tag-lang")
var vars = require("./vars")
var jv = require("libjv")


module.exports = function (source) {
    if (this.resourceQuery) {
        return source;
    }

    // source = hi.call(this,source);
    source = vars.call(this, source);
    source = inline.call(this, source);
    source = tagLag.call(this, source);
    return source;
}

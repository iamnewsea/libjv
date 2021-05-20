var inline = require("./inline-res")
var tagLag = require("./tag-lang")

module.exports = function (source) {
    source = inline.call(this, source);
    source = tagLag.call(this,source);

    return source;
}

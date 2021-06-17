var inline = require("./inline-res")
var tagLag = require("./tag-lang")
var jv = require("libjv")


module.exports = function (source) {
    //变量
    source = source.replaceAll("@YEAR@", (new Date()).getFullYear())
    source = source.replaceAll("@BUILDAT@", Date.now().toDateString())

    var modeIndex = process.argv.indexOf("--mode");
    if (modeIndex > 0 && modeIndex < process.argv.length - 1) {
        var mode = process.argv[modeIndex + 1];

        source = source.replaceAll("@ENVNAME@", mode)
    }


    source = inline.call(this, source);
    source = tagLag.call(this, source);

    return source;
}

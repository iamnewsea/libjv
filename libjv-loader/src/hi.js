var path = require("path");
var fs = require('fs')

module.exports = function (source) {

    var fullSrcPath = path.join(this.rootContext, "src/App.vue");
    if (fullSrcPath == this.resourcePath) {
        var target = path.join(this.rootContext, "public/hi.html");

        var vars = {};
        vars["BUILDAT"] = Date.now().toDateString()

        var modeIndex = process.argv.indexOf("--mode");
        if (modeIndex > 0 && modeIndex < process.argv.length - 1) {
            var mode = process.argv[modeIndex + 1];

            vars["ENVNAME"] = mode
        }

        fs.writeFileSync(target, `<!DOCTYPE html><html><body>《${process.env.npm_package_name}》 ${vars["ENVNAME"]} 环境构建于 ${vars["BUILDAT"]}</body></html>`)
    }

    return source;
}

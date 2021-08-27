module.exports = function (compilation, callback) {
    var path = require("path");
    var fs = require("fs");
    var jv = require("libjv")


    var vars = {};
    vars["BUILDAT"] = Date.now().toDateString()

    var modeIndex = process.argv.indexOf("--mode");
    if (modeIndex > 0 && modeIndex < process.argv.length - 1) {
        var mode = process.argv[modeIndex + 1];

        vars["ENVNAME"] = mode
    }
    
    var getEnvValue = function(key){
        return vars[key] || "";
    }

    var hi_content = fs.readFileSync(path.join(__dirname, "../res/hi.html"), 'utf-8')
        .replaceAll("@PROJECTNAME@", process.env.npm_package_name)
        .replaceAll("@ENVNAME@", getEnvValue("ENVNAME"))
        .replaceAll("@BUILDAT@", getEnvValue("BUILDAT"))
        .replaceAll("@HOSTNAME@", getEnvValue("HOSTNAME"))
        .replaceAll("@GIT_COMMIT_ID@", getEnvValue("GIT_COMMIT_ID"))
        .replaceAll("@GIT_COMMIT_TIME@", getEnvValue("GIT_COMMIT_TIME"))

    // 将这个列表作为一个新的文件资源，插入到 webpack 构建中：
    compilation.assets['hi.html'] = {
        source: function () {
            return hi_content;
        },
        size: function () {
            return hi_content.length;
        }
    };
    callback();
}

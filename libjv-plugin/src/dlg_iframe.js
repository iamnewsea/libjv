module.exports = function (compilation, callback) {
    var path = require("path");
    var fs = require("fs");
    var jv = require("libjv")

    var hi_content = fs.readFileSync(path.join(__dirname, "../res/dlg_iframe.html"), 'utf-8')

    // 将这个列表作为一个新的文件资源，插入到 webpack 构建中：
    compilation.assets['dlg_iframe.html'] = {
        source: function () {
            return hi_content;
        },
        size: function () {
            return hi_content.length;
        }
    };
    callback();
}

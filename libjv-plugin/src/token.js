module.exports = function (compilation, callback) {
    var path = require("path");
    var fs = require("fs");
    var jv = require("libjv")

    /**
    window.token_callback = function () {
        alert(1);
    }

    window.postMessage({token: 'OK', callback: "token_callback"}, "*")
     */
    var hi_content = fs.readFileSync(path.join(__dirname, "../res/token.html"), 'utf-8')

    // 将这个列表作为一个新的文件资源，插入到 webpack 构建中：
    compilation.assets['token.html'] = {
        source: function () {
            return hi_content;
        },
        size: function () {
            return hi_content.length;
        }
    };
    callback();
}

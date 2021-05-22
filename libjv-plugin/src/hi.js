var path = require("path");
var fs = require("./async_fs");
var jv = require("libjv")

module.exports = function (compilation, options) {
    var package_json_path = compilation.options.context + path.sep + "package.json";

    return fs.existsAsync(package_json_path).then(v => {
        if (v == false) {
            return;
        }

        var json = JSON.parse(fs.readFileSync(package_json_path, "utf-8"));

        var hi_content = fs.readFileSync(path.join(__dirname, "../hi.html"), 'utf-8')
            .replaceAll("@projectName@", json.name)
            .replaceAll("@projectVersion@", json.version)
            .replaceAll("@projectDescription@", json.description)
            .replaceAll("@buildAt@", Date.now().toDateString())

        fs.writeFileSync(path.join(compilation.options.context, "public/hi.html"), hi_content);

        return;
    })
}

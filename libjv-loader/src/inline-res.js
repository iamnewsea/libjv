var cheerio = require('cheerio');
var path = require("path");
var fs = require("fs");
var jv = require("libjv")

module.exports = function (source) {
    var res_tag = process.env.VUE_APP_Inline_Res_Tag || "inline-res"

    if (source.includes("<" + res_tag) == false) {
        return source;
    }
    var filePath = this.resourcePath;
    if (!filePath) {
        return source;
    }

    var $ = cheerio.load("<p-inline-res-loader-container>" + source + "</p-inline-res-loader-container>", {
        xmlMode: true,
        decodeEntities: false,
        recognizeSelfClosing: true
    });

    var getFileContent = function (res) {
        var $res = $(res);
        var src = $res.attr("src");
        if (!src) {
            return "<template></template>"
        }

        var fullSrcPath = path.join(filePath, "../", src);
        return fs.readFileSync(fullSrcPath, 'utf-8');
    }

    $(res_tag).each((index, res) => {
        var attrs_keys = Object.keys(res.attribs).filter(it => it != "src");
        // .map(it => {
        //     return it + "=" + res.attribs[it];
        // }) ;

        var $content = cheerio.load("<p-inline-res-loader-container>" + getFileContent(res) + "</p-inline-res-loader-container>");
        var template = $content("template")[0];
        if (template && template.children.length) {
//有Bug，需要先 html() 一下。
            $content("p-inline-res-loader-container > template").html();
            Array.from($content("p-inline-res-loader-container > template").children()).forEach(root => {
                attrs_keys.forEach(key => {
                    root.attribs[key] = res.attribs[key];
                })
            });

            $(res).replaceWith($content("p-inline-res-loader-container >template")[0].children);
        }

        $content("p-inline-res-loader-container >*:not(template)").each((_index, _item) => {
            $("p-inline-res-loader-container").append(_item);
        });
    })


    var ret = $("p-inline-res-loader-container").html()

    if (!jv.inlineResLoadered) {
        jv.inlineResLoadered = [];
    }

    if (jv.inlineResLoadered.includes(filePath) == false) {
        jv.inlineResLoadered.push(filePath);
        console.log("")
        console.log(filePath)
        console.log("----------")
        console.log(ret);
        console.log("----------")
    }
    return ret;
}

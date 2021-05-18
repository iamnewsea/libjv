var cheerio = require('cheerio');
var jv = require('libjv');
var path = require("path");

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
    console.log($.html())
    $(res_tag).each((index, it) => {
        var $it = $(it);
        var src = $it.attr("src");
        var fullSrcPath = path.join(filePath, src);

        var attrs = Object.keys(it.attribs).filter(it => it != "src");


        var content = fullSrcPath + ":" + JSON.stringify(attrs)

        var contentNode = $("<p-inline-res-loader-container>" + content + "</p-inline-res-loader-container>")[0].children[0]
        it.parent.children.splice(index, 1, contentNode);
    })


    return $("p-inline-res-loader-container").html()
}
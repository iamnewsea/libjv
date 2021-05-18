module.exports = function (source) {
    var langs = (process.env.VUE_APP_All_Langs || "").split(",").filter(it => it).map(it=>it.trim())
    if (!langs.length) return source;

    var lang = process.env.VUE_APP_Lang || "";
    if (!lang) return source;

    var filePath = this.resourcePath;
    if (langs.includes(lang) == false) {
        throw new Error( filePath + " 不存在的语言代码 " + lang)
    }

    var removeLangs = langs.filter(it => it != lang);

    source = source.replace(new RegExp(`<${lang}[^>]*>((.|\n)*?)</${lang}>`, "igm"), "$1");

    removeLangs.forEach(lang => {
        source = source.replace(new RegExp(`<${lang}[^>]*>(.|\n)*?</${lang}>`, "igm"), "")
    })

    return source;
}
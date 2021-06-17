module.exports = function (source) {

    var vars = {};
    vars["YEAR"] = (new Date()).getFullYear()
    vars["BUILDAT"] = Date.now().toDateString()

    var modeIndex = process.argv.indexOf("--mode");
    if (modeIndex > 0 && modeIndex < process.argv.length - 1) {
        var mode = process.argv[modeIndex + 1];

        vars["ENVNAME"] = mode
    }

    var envs = process.env
    Object.keys(envs).filter(it => it.startsWith("VUE_APP_")).forEach(it => {
        var key2 = key.slice(8);
        vars[key2] = envs[key2];
    })

    source = source.replace(/@([\w_]*)@/ig, (match, groupValue, startIndex) => {
        if (groupValue in vars) return vars[groupValue];
        if (groupValue in envs) return envs[groupValue]
        return match;
    })

    return source;
}

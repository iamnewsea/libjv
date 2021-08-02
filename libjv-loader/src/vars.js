module.exports = function (source) {
    if(this.query.vars === false){
        return source;
    }

    var vars = {};
    vars["YEAR"] = (new Date()).getFullYear()
    vars["BUILDAT"] = Date.now().toDateString()

    var modeIndex = process.argv.indexOf("--mode");
    if (modeIndex > 0 && modeIndex < process.argv.length - 1) {
        var mode = process.argv[modeIndex + 1];

        vars["ENVNAME"] = mode
    }

    var envs = Object.assign({},envs,process.env);

    source = source.replace(/@(\w*)@/ig, (match, groupValue, startIndex) => {
        if (groupValue in vars) return vars[groupValue];
        if (groupValue in envs) return envs[groupValue]
        return match;
    })

    return source;
}

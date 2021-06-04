var jv = require("libjv");
var util = require("./util")

var path = require('path');
var program = require('commander');

const fs = require('./async_file');

var print = function (msg) {
    if (!msg) return;
    process.stdout.write("[" + (new Date().toDateString()) + "]" + msg + "\n");
}

var cmd = program
    .usage('<--source 源> <--target 目标>')
    .option('--path <文件夹>', "")
    .option('--deep <深度>', "")
    .parse(process.argv);

var git_fetch_cmd = "git fetch origin"


if (!cmd.deep) {
    cmd.deep = 2;
}

var path_abs = path.resolve(cmd.path);

util.walkFile(path_abs, async (filePath, isFile) => {
    if (isFile) return null;
    if (filePath.endsWith("node_modules")) return null;
    if (filePath.endsWith(".git")) return null;

    var deep = filePath.slice(path_abs.length).trimWith(path.sep).split(path.sep).length;

    if (deep > cmd.deep) return null;

    if (fs.existsSync(filePath + path.sep + ".git")) {
        process.chdir(filePath);

        print("获取 " + filePath);

        try {
            await util.execCmd(git_fetch_cmd);
        } catch (e) {
            print(e.message)
            return null
        }
    }
})



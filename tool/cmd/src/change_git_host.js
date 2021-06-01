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
    .option('--source <源Host>', "")
    .option('--target <目标Host>', "")
    .option('--deep <深度>', "")
    .parse(process.argv);

var get_url_cmd = "git ls-remote --get-url origin"
var set_url_cmd = "git remote set-url origin {url}"

if (!cmd.source || !cmd.target) {
    cmd.outputHelp();
    process.exit(-1);
}

if (!cmd.deep) {
    cmd.deep = 5;
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
        var gitPath = await util.execCmd(get_url_cmd);
        gitPath = gitPath.replaceAll("\n", "")
        if (!gitPath.includes(cmd.source)) {
            if (gitPath.includes(cmd.target)) {
                // print(gitPath + " 已经设置了")
            } else {
                print("跳过 " + gitPath)
            }
            return;
        }

        var newGitPath = gitPath.replaceAll(cmd.source, cmd.target);

        print(gitPath + " --> " + newGitPath);
        // if (await util.readLine() != "y") return;
        await util.execCmd(set_url_cmd.format({url: newGitPath}));
    }

})



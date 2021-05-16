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
    .option('--source <源文件夹>', "")
    .option('--target <源文件夹>', "")
    .parse(process.argv);

var get_url_cmd = "git ls-remote --get-url origin"
var set_url_cmd = "git remote set-url origin {url}"

if (!cmd.source || !cmd.target) {
    cmd.outputHelp();
    process.exit(-1);
}

util.walkFile(path.resolve("."), async (filePath, isFile) => {
    if (isFile) return false;
    if (filePath.endsWith("node_modules")) return false;
    if (filePath.endsWith(".git")) return false;
    print(filePath);


    if (fs.existsSync(filePath + path.sep + ".git")) {
        process.chdir(filePath);
        var gitPath = await util.execCmd(get_url_cmd);
        var newGitPath = gitPath.replace(cmd.source, cmd.target);

        print(gitPath + " : " + gitPath + " --> " + newGitPath);
        if (await util.readLine() != "y") return;
        await util.execCmd(set_url_cmd.format({url: newGitPath}));
    }

})



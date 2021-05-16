import jv from "libjv";

var path = require('path');
var program = require('commander');
var exec = require('child_process').exec;
const fs = require('./async_file');

var print = function (msg) {
    if (!msg) return;
    process.stdout.write("[" + (new Date().toDateString()) + "]" + msg + "\n");
}
print(path.resolve("."))

var cmd = program
    .usage('<--source 源> <--target 目标>')
    .option('--source <源文件夹>', "")
    .option('--target <源文件夹>', "")
    .parse(process.argv);

var get_url_cmd = "git ls-remote --get-url origin"
var set_url_cmd = "git remote set-url origin {url}"

if(!cmd.source || !cmd.target){
    cmd.outputHelp();
    process.exit(-1);
}

(async function(){
    var list = await fs.readdirAsync(".");
    list.forEach(async it=>{
        var fullPath = path.resolve(it);
        var stat = await fs.statAsync(fullPath);
        if( stat.isDirectory() == false){
            return;
        }
        process.chdir(fullPath);
        await exec(get_url_cmd);
    })

})();




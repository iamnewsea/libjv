const readline = require('readline')
const fs = require('./async_file');
var exec = require('child_process').exec;
var path = require('path');

/**
 * 读入一行
 */
function readLine() {
    return new Promise(resolve => {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        })

        rl.on('line', (str) => {
            resolve(str)
            rl.close()
        })

    })
}

//返回 false 终止遍历， 返回 null 终止子文件夹。
let walkFile = async function (filePath, handleFile, isFile) {
    var ret = await handleFile(filePath, isFile || false);
    if (ret === false) return false;
    if (ret === null) return null;
    let files = fs.readdirSync(filePath);
    for (let item of files) {
        let tmpPath = filePath + path.sep + item;
        let stats = await fs.statSync(tmpPath);
        if (stats.isDirectory()) {
            ret = await walkFile(tmpPath, handleFile, false);
            if (ret === false) return false;
            if (ret === null) continue;
        } else {
            if (await handleFile(tmpPath, true) === false) return false;
        }
    }
}

let execCmd = function (cmd) {
    return new Promise((resolve, reject) => {
        exec(cmd, function (err, standardOutput, standardError) {
            if (err) {
                reject(err);
            }
            if (standardError) {
                reject(standardError);

                return;
            }

            resolve(standardOutput);
        });
    });
}

module.exports = {readLine, walkFile, execCmd}
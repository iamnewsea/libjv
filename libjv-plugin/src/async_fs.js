/**
 * Created by udi on 17-7-14.
 */
'use strict';

const fs = require('fs');
var path = require('path');

//Cannot promisify an API that has normal methods with 'Async'-suffix
const suffix = 'Promise';
const keys = [
    'access',
    'readFile',
    'close',
    'open',
    'read',
    'write',
    'rename',
    'truncate',
    'ftruncate',
    'rmdir',
    'fdatasync',
    'fsync',
    'mkdir',
    'readdir',
    'fstat',
    'lstat',
    'stat',
    'readlink',
    'symlink',
    'link',
    'unlink',
    'fchmod',
    'lchmod',
    'chmod',
    'lchown',
    'fchown',
    'chown',
    'utimes',
    'futimes',
    'writeFile',
    'appendFile',
    'realpath',
    'mkdtemp',
    "copyFile",
    "copyPath"
];


fs.copyFile = function(srcPath, tarPath, callback) {
    var rs = fs.createReadStream(srcPath)
    rs.on('error', function(err) {
        if (err) {
            console.log('read error', srcPath)
        }
        callback && callback(err)
    })

    var ws = fs.createWriteStream(tarPath)
    ws.on('error', function(err) {
        if (err) {
            console.log('write error', tarPath)
        }
        callback && callback(err)
    })
    ws.on('close', function(ex) {
        callback && callback(ex)
    })

    rs.pipe(ws)
}

fs.copyPath = function(srcDir, tarDir, callback) {
    fs.readdir(srcDir, function(err, files) {
        var count = 0
        var checkEnd = function() {
            ++count == files.length && callback && callback()
        }

        if (err) {
            checkEnd()
            return
        }

        files.forEach(function(file) {
            var srcPath = path.join(srcDir, file)
            var tarPath = path.join(tarDir, file)

            fs.stat(srcPath, function(err, stats) {
                if (stats.isDirectory()) {
                    console.log('mkdir', tarPath)
                    fs.mkdir(tarPath, function(err) {
                        if (err) {
                            console.log(err)
                            return
                        }

                        fs.copyFolder(srcPath, tarPath, checkEnd)
                    })
                } else {
                    fs.copyFile(srcPath, tarPath, checkEnd)
                }
            })
        })
        //为空时直接回调
        files.length === 0 && callback && callback()
    })
}

keys.forEach(key => {
    fs[key + suffix] = function () {
        return new Promise((resolve, reject) => {
            fs[key].apply(fs, Array.prototype.slice.apply(arguments).concat((err, data) => err ? reject(err) : resolve(data)));
        });
    };
});

var no_error_keys = [
    "exists"
]

no_error_keys.forEach(key => {
    fs[key + suffix] = function () {
        return new Promise((resolve, reject) => {
            fs[key].apply(fs, Array.prototype.slice.apply(arguments).concat((data) => resolve(data)));
        });
    };
});

module.exports = fs;

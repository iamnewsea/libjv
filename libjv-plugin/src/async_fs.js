/**
 * Created by udi on 17-7-14.
 */
'use strict';

const fs = require('fs');
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
    'mkdtemp'
];

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
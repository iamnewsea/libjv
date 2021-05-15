/**
 * Created by udi on 17-7-14.
 */
'use strict';

const async_file = require('fs');
const suffix = 'Async';
const keys = [
    'access',
    'exists',
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
    async_file[key + suffix] = function() {
        return new Promise((resolve, reject) => {
            async_file[key].apply(async_file, Array.prototype.slice.apply(arguments).concat((err, data) => err ? reject(err) : resolve(data)));
        });
    };
});

module.exports = async_file;
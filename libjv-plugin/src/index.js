var hi = require("./hi")
var token = require("./token")
var dlg_iframe = require("./dlg_iframe")
require('./async_fs')

class LibjvPlugin {
    constructor(options) {
        this.options = options || {};
    }

    apply(compiler) {
        compiler.hooks.emit.tapAsync('LibjvPlugin', (compilation, callback) => {
            var list = [];
            if (this.options.hi !== false) {
                list.push(hi);
            }

            if (this.options.token !== false) {
                list.push(token);
            }

            if (this.options.dlgIframe !== false) {
                list.push(dlg_iframe);
            }

            var set_count = 0;
            list.forEach(it => {
                it(compilation, it => {
                    set_count++;
                    if (list.length == set_count) {
                        callback();
                    }
                });
            })
        })
    }
}

module.exports = LibjvPlugin

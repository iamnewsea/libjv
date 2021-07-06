var hi = require("./hi")
var dlg_iframe = require("./dlg_iframe")

class LibjvPlugin {
    constructor(options) {
        this.options = options;
    }

    apply(compiler) {
        compiler.hooks.emit.tapAsync('LibjvPlugin', (compilation, callback) => {
            if (this.options.hi !== false) {
                return hi(compilation, callback);
            }

            if( this.options.dlgIframe !== false){
                return dlg_iframe(compilation, callback);
            }

            callback();
        })
    }
}

module.exports = LibjvPlugin
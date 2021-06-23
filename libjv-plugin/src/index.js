var hi = require("./hi")

class LibjvPlugin {
    constructor(options) {
        this.options = options;
    }

    apply(compiler) {
        compiler.hooks.emit.tapAsync('LibjvPlugin', (compilation, callback) => {
            if (this.options.hi) {
                return hi(compilation, callback);
            }

            callback();
        })
    }
}

module.exports = LibjvPlugin
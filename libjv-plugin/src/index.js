var hi = require("./hi")

class LibjvPlugin {
    options;

    constructor(options) {
        this.options = options;
    }

    apply(compiler) {
        // 在emit阶段插入钩子函数
        compiler.hooks.run.tapPromise('LibjvPlugin', (compilation) =>  {
            return hi(compilation,this.options);
        });
    }
}

module.exports = LibjvPlugin
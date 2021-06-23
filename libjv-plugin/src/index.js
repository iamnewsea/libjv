var hi = require("./hi")

class LibjvPlugin {
    apply(compiler){
        compiler.hooks.emit.tapAsync('LibjvPlugin', (compilation, callback)=>{
            hi(compilation,callback);
        })
    }
}
module.exports = LibjvPlugin
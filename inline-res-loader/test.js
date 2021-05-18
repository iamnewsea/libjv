var cheerio = require('./src/index');

var source = cheerio.call({resourcePath: "/abc"}, "<template>" +
    "<inline-res src='./abc' ref='def'/>" +
    "<inline-res src='./abc2' ref='def2'/>" +
    "<inline-res src='./abc3' ref='def3'/>" +
    "</template><style>aaaaa</style><script>scccc</script>")

console.log(source);
var cheerio = require('./src/index');
var path = require("path");



var source = cheerio.call({resourcePath: "D:\\code\\libjv\\inline-res-loader\\test.js"}, "<template>a" +
    "<inline-res src='./abc' ref='def'/>" +

    "b</template><style>aaaaa</style><script>scccc</script>")

console.log(source);
module.exports = {
    // 修改 src 为 examples
    // pages: {
    //   index: {
    //     entry: 'examples/main.js',
    //     template: 'public/index.html',
    //     filename: 'index.html'
    //   }
    // },
    configureWebpack: config => {
        externals = {
            libjv: "libjv",
            vue: 'Vue',
            'element-ui': 'ELEMENT',
        }

        config.devtool = process.env.NODE_ENV == 'development' ? 'source-map' : ''


        config.performance = {
            hints: 'warning',
            //入口起点的最大体积 整数类型（以byte为单位 1200k）
            maxEntrypointSize: 1_200_000,
            //生成文件的最大体积 整数类型（以byte为单位 1200k）
            maxAssetSize: 1_200_000,
            //只给出 js 文件的性能提示
            assetFilter: function (assetFilename) {
                return assetFilename.endsWith('.js')
            }
        };
    },
    css: {extract: false},
    productionSourceMap: false
}

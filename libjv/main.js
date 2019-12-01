//module.exports = require('./lib/libjv');sss

import vue_chk from "./lib/vue-chk"
// import vue_city from "./lib/vue-city"
import file_upload from "./lib/file-upload"

//必须这样写, 如果写成 Object.assign({}, vue_chk, vue_city, file_upload); enum.js 扩展不了 jv.
export default Object.assign(vue_chk, vue_city, file_upload);
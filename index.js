//module.exports = require('./lib/libjv');

import vue_chk from "./lib/vue-chk"
import vue_city from "./lib/vue-city"
import file_upload from "./lib/file-upload"

export default Object.assign({},vue_chk, vue_city, file_upload);
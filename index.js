//module.exports = require('./lib/libjv');

import vue_init from "./lib/vue-init"
import vue_city from "./lib/vue-city"
import file_upload from "./lib/file-upload"

export default Object.assign({}, vue_init, vue_city, file_upload);
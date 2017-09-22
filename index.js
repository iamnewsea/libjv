//module.exports = require('./lib/libjv');

import jv_init from "./lib/vue-init"
import vue_city from "./lib/vue-city"
import file_upload from "./lib/file-upload"

export default Object.assign(jv_init, vue_city, file_upload);
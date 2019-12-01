"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _vueChk = require("./lib/vue-chk");

var _vueChk2 = _interopRequireDefault(_vueChk);

var _fileUpload = require("./lib/file-upload");

var _fileUpload2 = _interopRequireDefault(_fileUpload);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//必须这样写, 如果写成 Object.assign({}, vue_chk, vue_city, file_upload); enum.js 扩展不了 jv.
//module.exports = require('./lib/libjv');sss

exports.default = Object.assign(_vueChk2.default, _fileUpload2.default);
// import vue_city from "./lib/vue-city"

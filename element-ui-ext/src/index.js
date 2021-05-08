/* Automatically generated by './build/bin/build-entry.js' */

import c from '../packages/c.vue';
import e from '../packages/e.vue';
import sect from '../packages/sect.vue';
import kv from '../packages/kv.vue';
import selector from '../packages/selector.vue';
import my_list from '../packages/my-list.vue';
import input_list from '../packages/input-list.vue';
import input_table from '../packages/input-table.vue';
import my_ref from '../packages/my-ref.vue';
import my_text from '../packages/my-text.vue';

// import Upload1 from '../packages/upload1.vue';
import upload from '../packages/upload.vue';
import my_city from '../packages/my-city.vue';
import number_input from '../packages/number-input.vue';
import number_range from '../packages/number-range.vue';

import image_edit from '../packages/image-edit.vue';

//引入即可
import "./jv_vue"


import "./base.scss"
import "./ext.scss"
import "./menu.scss"

import Col from "../packages/col"
import Row from "../packages/row"

const js_components = [
    Col, Row
]
js_components.forEach(component => {
    component.install = function (Vue) {
        Vue.component(component.name, component);
    };
})

const components = [
    c, e,
    sect,
    kv,
    selector,
    my_list,
    input_list,
    input_table,
    my_ref,
    my_text,
    // Upload1,
    upload,
    my_city,
    number_input,
    number_range,
    image_edit,
    ...js_components
];

// var components_export = {};

import menu from "./right-menu"

const install = function (Vue, opts = {}) {
    components.forEach(component => {
        // components_export[component.name] = component;
        Vue.component(component.name, component);
    });

    menu.install(Vue);
};

/* istanbul ignore if */
if (typeof window !== 'undefined' && window.Vue) {
    install(window.Vue);
}

// components_export["jv"] = jv;

// components_export["install"] = install;
// module.exports = components_export;
// module.exports.default = module.exports;

export default install
// export default {install}



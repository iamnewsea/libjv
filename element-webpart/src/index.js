/* Automatically generated by './build/bin/build-entry.js' */

import refBrand from '../packages/brand/ref-brand.vue';

import orderList from '../packages/order/order-list.vue';
import orderDetail from '../packages/order/order-detail.vue';

import productList from '../packages/product/product-list.vue';
import productDetail from '../packages/product/product-detail.vue';


const components = [
  refBrand,
  orderList,
  orderDetail,
  productList,
  productDetail
];

var components_export = {};

const install = function (Vue, opts = {}) {
  components.map(component => {
    components_export[component.name] = component;
    Vue.component(component.name, component);
  });


  const ELEMENT = {};
  ELEMENT.size = opts.size || '';
};

/* istanbul ignore if */
if (typeof window !== 'undefined' && window.Vue) {
  install(window.Vue);
}
;

components_export["install"] = install;
module.exports = components_export;
module.exports.default = module.exports;

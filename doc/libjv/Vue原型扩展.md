
## 扩展了 Vue 原型的以下方法：

1. $loadQuery: 根据当前url保存页面查询条件
2. $saveQuery：根据当前url 加载页面查询条件 
3. $resetData: 重置当前页面的数值。
4. chk_item： 单项数据校验。
5. chk： 整体数据校验。
6. $getVModelData ： 查找dom下第一个绑定 v-model 的值.返回结构 { vnode : v-model 对象, value : v-model 的值, data }
7. $getBindExpression： 获取绑定表达式
7. $RecursionVNode:  递归查找 vnode
8. $Closest: 按组件名向上查找
9. $done: 事件， 调用该事件后，将触发 jv.vue_spa_render_event = "render-event" 事件。
10. 
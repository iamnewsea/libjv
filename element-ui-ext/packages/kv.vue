<template>
  <div class="kv">
    <div class="k">
      <template v-if="label">
        {{label}}
      </template>
      <template v-else>
        <slot name="k"></slot>
      </template>
    </div>

    <sect class="v" @chked="chked" ref="v">
      <slot></slot>
    </sect>
  </div>
</template>
<script>
    /**
     * 用法：
     * <kv :label> <input /> </kv>
     * <kv> <template slot="k"> 姓名 </template> <input /> </kv>
     */
    import sect from "./sect"

    export default {
        components: {sect},
        name: "kv",
        props: {
            label: {
                type: String, default: () => ""
            }
        },
        data() {
            return {
                // tooltip: "", effect: jv.chk_effect || "dark", placement: jv.chk_placement || "top-end"
            };
        },
        mounted() {
            this.$nextTick(() => {
                var el = this.$el;
                var chk_dom = el.querySelector("[chk]");
                if (chk_dom && chk_dom.getAttribute("chk")) {
                    el.classList.add("must");
                }
            });
        },
        computed: {
            slotk() {
                return !!this.$scopedSlots.k;
            },
            // slot_k_tail() {
            //     var ks = this.$slots.k;
            //     if (!ks) return "";
            //     var html = "";
            //     ks.recursion(it => it.children, (item, index) => {
            //         html += item.text || "";
            //     });
            //
            //
            //     var c = html[html.length - 1];
            //     if (c && c != ':' && c != '：') {
            //         return "：";
            //     }
            //     return "";
            // },
            // label_tail() {
            //     var html = (this.label || "").trim();
            //     var c = html[html.length - 1];
            //     if (c && c != ':' && c != '：') {
            //         return "：";
            //     }
            //     return "";
            // }
        },
        methods: {
            chked(e) {
                var tooltip = e.detail.result ? '' : (e.detail.msg || e.detail.detail);
                var v = this.$refs.v.$el;
                this.$nextTick(() => {
                    var msg_dom;
                    for (var it of v.children) {
                        if (it.classList.contains("chk-msg")) {
                            msg_dom = it;
                            break;
                        }
                    }

                    if (!tooltip) {
                        if (msg_dom) {
                            v.removeChild(msg_dom);
                        }

                        return;
                    }

                    if (!msg_dom) {
                        msg_dom = document.createElement("div");
                        msg_dom.classList.add("chk-msg");
                        v.append(msg_dom)
                    }

                    msg_dom.innerHTML = tooltip;
                });

            },
        }
    }
</script>
<style>

  .kv {
    display: flex;
    padding: 10px;
  }

  .must .k:before {
    content: "*";
    color: red;
  }

  /*.kv > * {*/
  /*  display: flex;*/
  /*  align-items: center; !*垂直居中*!*/
  /*}*/

  /**
  tinymce显示错乱
   */
  /*.kv *{*/
  /*  flex:1;*/
  /*}*/

  .kv > .k {
    justify-content: flex-end;
    text-align: right;
    flex: 3;
  }

  .kv > .k:first-child:after {
    content: "：";
    display: inline-block;
  }

  .kv > .v {
    flex: 7;
    justify-content: flex-start;
  }


  .v > *:first-child {
    max-width: 600px;
  }

  .chk-msg {
    color: red;
    padding: 0 5px;
  }

  .link {
    color: #007aff;
    text-decoration: underline;
    cursor: pointer;
  }

  html input.chk-error, html .chk-error input {
    background-color: #f4dfeb4d;
    border: dashed 1px deeppink;
  }

</style>

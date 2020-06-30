<template>
  <div class="kv">
    <template v-if="label">
        <span class="k">
          {{label}}
        </span>
    </template>

    <template v-else-if="slotk">
      <slot name="k"></slot>
    </template>


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
            // this.$nextTick(() => {
            //     if (this.$refs.tooltip) {
            //         this.$refs.tooltip.$refs.popper.ondblclick = (e) => {
            //             this.tooltip = "";
            //         }
            //     }
            // });
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

  .kv > * {
    display: flex;
    align-items: center; /*垂直居中*/
  }

  /**
  tinymce显示错乱
   */
  /*.kv *{*/
  /*  flex:1;*/
  /*}*/

  .kv > *:first-child {
    justify-content: flex-end;
    text-align: right;
    flex: 3;
  }

  .kv > *:first-child:after {
    content: "：";
    display: inline-block;
  }

  .kv > *:last-child {
    flex: 7;
    justify-content: flex-start;
  }


  .important {
    zoom: 1.2;
  }

  .important .v, .important .v * {
    color: red;
  }

  .kv .v>*:first-child{
    max-width:400px;
  }

  .chk-msg{
    color: red;
    padding:0 4px;
  }

</style>

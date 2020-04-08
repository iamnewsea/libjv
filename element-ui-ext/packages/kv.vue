<template>
  <div class="kv">
    <template v-if="label">
        <span class="k">
          {{label}}{{label_tail}}
        </span>
    </template>

    <template v-else-if="slotk">
      <slot name="k"></slot>
      {{slot_k_tail}}
    </template>

    <span class="v">
        <el-tooltip ref="tooltip" :effect="effect" :manual="true" :value="!!tooltip" :content="tooltip"
                    @chked="e=>tooltip = e.detail.result ? '': ( e.detail.msg || e.detail.detail)"
                    :placement="placement">
          <slot></slot>
        </el-tooltip>
    </span>

  </div>
</template>
<script>
    /**
     * 用法：
     * <kv :label> <input /> </kv>
     * <kv> <template slot="k"> 姓名 </template> <input /> </kv>
     */
    export default {
        name: "kv",
        props: {
            label: {type: String, default: ""},
            effect: {type: String, default: "dark"},
            placement: {type: String, default: "top-end"}
        },
        data() {
            return {tooltip: ""};
        },
        mounted() {
            this.$nextTick(() => {
                if (this.$refs.tooltip) {
                    this.$refs.tooltip.$refs.popper.ondblclick = (e) => {
                        this.tooltip = "";
                    }
                }
            });
        },
        computed: {
            slotk() {
                return !!this.$scopedSlots.k;
            },
            slot_k_tail() {
                var ks = this.$slots.k;
                if (!ks) return "";
                var html = "";
                ks.recursion(it => it.children, (item, index) => {
                    html += item.text || "";
                });


                var c = html[html.length - 1];
                if (c && c != ':' && c != '：') {
                    return "：";
                }
                return "";
            },
            label_tail() {
                var html = (this.label || "").trim();
                var c = html[html.length - 1];
                if (c && c != ':' && c != '：') {
                    return "：";
                }
                return "";
            }
        }
    }
</script>

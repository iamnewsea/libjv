<template>
    <div class="kv" v-bind="$attrs" v-on="$listeners">
        <div class="k" v-if="label"> {{ label }}</div>
        <slot name="k" v-else></slot>
        <sect class="v sect">
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
        //     var el = this.$el;
        //     var chk_dom = el.querySelector("[chk]");
        //     if (chk_dom && chk_dom.getAttribute("chk")) {
        //         el.classList.add("must");
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
        // chked(e) {
        //     var tooltip = e.detail.result ? '' : (e.detail.msg || e.detail.detail);
        //     var v = this.$refs.v.$el;
        //     this.$nextTick(() => {
        //         var msg_dom;
        //         for (var it of v.children) {
        //             if (it.classList.contains("chk-msg")) {
        //                 msg_dom = it;
        //                 break;
        //             }
        //         }
        //
        //         if (!tooltip) {
        //             if (msg_dom) {
        //                 v.removeChild(msg_dom);
        //             }
        //
        //             return;
        //         }
        //
        //         if (!msg_dom) {
        //             msg_dom = document.createElement("div");
        //             msg_dom.classList.add("chk-msg");
        //             v.append(msg_dom)
        //         }
        //
        //         msg_dom.innerHTML = tooltip;
        //     });
        //
        // },
    }
}
</script>
<style>

.kv {
    display: flex;
    padding: 8px;
}

.kv.must .k:before {
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
    white-space: nowrap;
    flex-wrap: nowrap;
    display: flex;
    align-items: center;
    margin: 6px auto;
}

.kv > .k:first-child:after {
    content: "：";
    display: inline-block;
}

.kv > .v {
    flex: 7;
    justify-content: flex-start;
    flex-wrap: wrap;
    display: flex;
    align-items: center;
}


.v > *:first-child {
    max-width: 600px;
}

.chk-msg {
    color: red;
    padding: 1px 0 5px;
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

<style>

.important {
    zoom: 1.2;
}

.important .v, .important .v * {
    color: red;
}

.link {
    color: #007aff;
    text-decoration: underline;
    cursor: pointer;
}

html input {
    letter-spacing: 2px;
}

.error {
    margin: 20px;
    padding: 20px;
    color: red;
    font-size: large;
}


fieldset {
    border: 1px solid gray;
    padding: 10px;
    margin-bottom: 10px;
    position: relative;
}

legend {
    border: solid 1px gray;
    padding: 2px 10px;
    margin-left: 10px;
}


@keyframes fade_in {
    from {
        margin-top: 200px;
        opacity: 0;
    }
    to {
        margin-top: 0;
        opacity: 1;
    }
}

@keyframes fade_out {
    from {
        margin-top: 0;
        opacity: 1;
    }
    to {
        margin-top: -200px;
        opacity: 0;
    }
}

.fade_in {
    animation: fade_in 1s;
    margin-top: 0;
    opacity: 1;
}

.fade_out {
    animation: fade_out 1s;
    margin-top: -200px;
    opacity: 0;
}


@-webkit-keyframes bounce {
    0%, 100% {
        -webkit-transform: scale(0.0)
    }
    50% {
        -webkit-transform: scale(1.0)
    }
}

@keyframes bounce {
    0%, 100% {
        transform: scale(0.0);
    }
    50% {
        transform: scale(1.0);
    }
}

@keyframes loading {
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
}


@keyframes context-menu-show {
    from {
        opacity: 0;
        visibility: hidden;
    }
    to {
        opacity: 1;
        visibility: visible;
    }
}

@keyframes context-menu-hide {
    from {
        opacity: 1;
        visibility: visible;
    }
    to {
        opacity: 0;
        visibility: hidden;
    }
}

.context-menu-show {
    animation: context-menu-show 100ms;
    animation-fill-mode: forwards;
}

.context-menu-hide {
    animation: context-menu-hide 100ms;
    animation-fill-mode: forwards;
}

</style>

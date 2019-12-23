<template>
  <div
    @dragstart.prevent
    :class="[
      'el-input-number',
      inputNumberSize ? 'el-input-number--' + inputNumberSize : '',
      { 'is-disabled': inputNumberDisabled },
      { 'is-without-controls': !controls },
      { 'is-controls-right': controlsAtRight }
    ]">
    <span
      class="el-input-number__decrease"
      role="button"
      v-if="controls"
      v-repeat-click="decrease"
      :class="{'is-disabled': minDisabled}"
      @keydown.enter="decrease">
      <i :class="`el-icon-${controlsAtRight ? 'arrow-down' : 'minus'}`"></i>
    </span>
    <span
      class="el-input-number__increase"
      role="button"
      v-if="controls"
      v-repeat-click="increase"
      :class="{'is-disabled': maxDisabled}"
      @keydown.enter="increase">
      <i :class="`el-icon-${controlsAtRight ? 'arrow-up' : 'plus'}`"></i>
    </span>
    <slot :text="currentText" :value="currentValue"></slot>
    <el-input
      ref="input"
      :class="{'my-number-input':true, hideInput: hasSlot}"
      :value="currentValue"
      :disabled="inputNumberDisabled"
      :size="inputNumberSize"
      :max="max"
      :min="min"
      :name="name"
      :label="label"
      @keydown.up.native.prevent="increase"
      @keydown.down.native.prevent="decrease"
      @blur="handleBlur"
      @focus="handleFocus"
      @change="handleInputChange">
      <template slot="prepend" v-if="$slots.prepend">
        <slot name="prepend"></slot>
      </template>
      <template slot="append" v-if="$slots.append">
        <slot name="append"></slot>
      </template>
    </el-input>
  </div>
</template>
<script>
    import inputNumber from 'element-ui/lib/input-number'

    export default {
        extends: inputNumber,
        name: 'my-number-input',
        props: {
            // readOnly: {type: Boolean, default: false}, //inputNumberDisabled
            map: {
                type: Object
            }
        },
        data() {
            return {hasSlot: false}
        },
        computed: {
            currentText() {
                return this.map && this.currentValue in this.map ? this.map[this.currentValue] : this.currentValue;
            }
        },
        mounted() {

            this.hasSlot = this.$refs.input && this.$refs.input.$el.previousElementSibling.className != "el-input-number__increase";
        }
    }
</script>
<style>
  .my-number-input.hideInput input, .my-number-input.hideInput input::selection {
    background-color: transparent;
    color: transparent;
  }
</style>

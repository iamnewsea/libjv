<template>
  <div style="display:flex;">
    <my-number-input size="small" :min="min" :max="max" :map="map" :inputNumberDisabled="readOnly" v-model="rangeValue[0]" @change="change1">
      <template slot-scope="props">
        <span style="position: absolute;left: 50px;top: 2px;z-index: 9;">{{ props.text }}</span>
      </template>
    </my-number-input>
    <span style="margin:auto 10px;">到</span>
    <my-number-input size="small" :map="map" :min="min" :max="max" :inputNumberDisabled="readOnly" v-model="rangeValue[1]" @change="change2">
      <template slot-scope="props">
        <span style="position: absolute;left: 50px;top: 2px;z-index: 9;">{{ props.text }}</span>
      </template>
    </my-number-input>
  </div>
</template>
<script>
  import MyNumberInput from "./number-input.vue"

  export default {
    components: {MyNumberInput},
    name: "number-range",
    props: {
      map: {
        type: Object, default: function () {
          return {}
        }
      },
        readOnly:{type:Boolean , default:false} ,
        min: {type: Number, default: 0},
      max: {type: Number, default: 100},
      value: {
        type: Array, default: function () {
          return [0, 0]
        }
      }
    },
    data() {
      return {
        rangeValue: Object.assign([], this.value)
      };
    },
    watch: {
      value(val) {
        if (jv.dataEquals(val, this.rangeValue)) {
          return;
        }

        this.rangeValue = Object.assign([], this.value);
      }
    },
    methods: {
      change1(value) {
        if (value > this.rangeValue[1]) {
          this.rangeValue[0] = this.rangeValue[1];
          this.$nextTick(it=>{
            this.rangeValue = this.rangeValue;
          })
          return;
        }

        this.$emit("input", this.rangeValue);
      },
      change2(value) {
        if (value < this.rangeValue[0]) {
          this.rangeValue[1] = this.rangeValue[0];
          this.$nextTick(it=>{
            this.rangeValue = this.rangeValue;
          });
          return;
        }

        this.$emit("input", this.rangeValue);
      }
    }
  }
</script>

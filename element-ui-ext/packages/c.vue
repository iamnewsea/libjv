<template>
  <span v-bind="$attrs" v-on="$listeners">
    <slot></slot>
  </span>
</template>
<script>
  export default {
    name: "c",
    data() {
      return {};
    }
  }
</script>

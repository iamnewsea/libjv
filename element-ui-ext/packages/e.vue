<template>
  <span v-bind="$attrs" v-on="$listeners">
    <slot></slot>
  </span>
</template>
<script>
  export default {
    name: "e",
    data() {
      return {};
    }
  }
</script>

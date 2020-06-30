<template>
  <span v-bind="[attrs]">
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

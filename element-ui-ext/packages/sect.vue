<template>
  <div v-bind="[attrs]">
    <slot></slot>
  </div>
</template>
<script>
  export default {
    name: "sect",
    data() {
      return {};
    }
  }
</script>

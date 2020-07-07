<template>
  <div v-bind="$attrs" v-on="$listeners">
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

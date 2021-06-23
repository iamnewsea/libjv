<template>
    <div>
        {{ html }}
    </div>
</template>
<script>
export default {
    name: "v-code",
    data() {
        return {};
    },
    computed: {
        html() {
            return this.$slots.default;
        }
    }
}
</script>

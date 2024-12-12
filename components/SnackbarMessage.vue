<template>
  <v-snackbar
    v-model="internalShow"
    :timeout="timeout"
    :color="color"
    top
    right
  >
    {{ message }}
  </v-snackbar>
</template>

<script setup>
const props = defineProps({
  message: { type: String, default: "" },
  color: { type: String, default: "success" },
  timeout: { type: Number, default: 3000 },
  show: { type: Boolean, default: false },
});

const emits = defineEmits(["update:show"]);

const internalShow = ref(props.show);

watch(
  () => props.show,
  (val) => {
    internalShow.value = val;
  }
);

// När snackbaren stängs (antingen pga timeout eller användaren)
watch(internalShow, (val) => {
  if (!val) emits("update:show", false);
});
</script>

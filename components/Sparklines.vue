<!-- components/Sparklines.vue -->
<template>
    <svg :width="width" :height="height">
      <polyline
        :points="points"
        :stroke="color"
        fill="none"
        :stroke-width="lineWidth"
        :stroke-linecap="'round'"
        :stroke-linejoin="'round'"
      />
    </svg>
  </template>
  
  <script setup>
  import { computed } from 'vue';
  
  const props = defineProps({
    modelValue: {
      type: Array,
      default: () => [],
    },
    color: {
      type: String,
      default: 'black',
    },
    width: {
      type: [String, Number],
      default: 300,
    },
    height: {
      type: [String, Number],
      default: 75,
    },
    lineWidth: {
      type: [String, Number],
      default: 2,
    },
    smooth: {
      type: Boolean,
      default: false,
    },
    showLabels: {
      type: Boolean,
      default: false,
    },
  });
  
  const points = computed(() => {
    if (!props.modelValue.length) return '';
    const max = Math.max(...props.modelValue);
    const min = Math.min(...props.modelValue);
    const range = max - min || 1; // Prevent division by zero
    const step = props.width / (props.modelValue.length - 1);
    return props.modelValue
      .map((value, index) => {
        const x = index * step;
        const y = props.height - ((value - min) / range) * props.height;
        return `${x},${y}`;
      })
      .join(' ');
  });
  </script>
  
  <style scoped>
  /* Optional: Add any Sparklines-specific styles here */
  </style>
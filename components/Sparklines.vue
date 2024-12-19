<!-- components/Sparklines.vue -->
<template>
  <svg :width="width" :height="height">
    <polyline
      v-if="modelValue.length > 0"
      :points="computedPoints"
      :stroke="color"
      :stroke-width="lineWidth"
      fill="none"
    />
    <text
      v-else
      x="50%"
      y="50%"
      dominant-baseline="middle"
      text-anchor="middle"
      fill="grey"
      font-size="14"
    >
      No Data
    </text>
  </svg>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  modelValue: {
    type: Array,
    required: true,
  },
  color: {
    type: String,
    default: 'blue',
  },
  width: {
    type: Number,
    default: 300,
  },
  height: {
    type: Number,
    default: 75,
  },
  lineWidth: {
    type: Number,
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
  type: {
    type: String,
    default: 'trend',
  },
});

const computedPoints = computed(() => {
  if (props.modelValue.length === 0) return '';

  // Example: Simple linear plotting based on data
  const max = Math.max(...props.modelValue);
  const min = Math.min(...props.modelValue);
  const range = max - min || 1; // Prevent division by zero
  const stepX = props.width / (props.modelValue.length - 1);

  return props.modelValue
    .map((value, index) => {
      const x = index * stepX;
      const y = props.height - ((value - min) / range) * props.height;
      return `${x},${y}`;
    })
    .join(' ');
});
</script>

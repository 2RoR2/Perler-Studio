<template>
  <div v-if="enabled" class="cursor-layer" aria-hidden="true">
    <div
      class="cursor-aurora"
      :style="{
        transform: `translate3d(${glowX}px, ${glowY}px, 0)`
      }"
    ></div>
    <div
      class="cursor-bead-wrap"
      :style="{
        transform: `translate3d(${cursorX}px, ${cursorY}px, 0)`
      }"
    >
      <div class="cursor-bead">
        <span class="cursor-bead-gloss"></span>
        <span class="cursor-bead-core"></span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from "vue";

const enabled = ref(false);
const cursorX = ref(-100);
const cursorY = ref(-100);
const glowX = ref(-180);
const glowY = ref(-180);

let frameId = 0;
let targetX = -100;
let targetY = -100;
let glowTargetX = -180;
let glowTargetY = -180;

function handleMove(event) {
  targetX = event.clientX - 18;
  targetY = event.clientY - 18;
  glowTargetX = event.clientX - 140;
  glowTargetY = event.clientY - 140;
}

function handleLeave() {
  targetX = -100;
  targetY = -100;
  glowTargetX = -260;
  glowTargetY = -260;
}

function tick() {
  cursorX.value += (targetX - cursorX.value) * 0.34;
  cursorY.value += (targetY - cursorY.value) * 0.34;
  glowX.value += (glowTargetX - glowX.value) * 0.14;
  glowY.value += (glowTargetY - glowY.value) * 0.14;
  frameId = window.requestAnimationFrame(tick);
}

onMounted(() => {
  const media = window.matchMedia("(pointer: fine)");

  enabled.value = media.matches;

  if (!media.matches) {
    return;
  }

  window.addEventListener("mousemove", handleMove);
  window.addEventListener("mouseleave", handleLeave);
  frameId = window.requestAnimationFrame(tick);
});

onBeforeUnmount(() => {
  window.removeEventListener("mousemove", handleMove);
  window.removeEventListener("mouseleave", handleLeave);

  if (frameId) {
    window.cancelAnimationFrame(frameId);
  }
});
</script>

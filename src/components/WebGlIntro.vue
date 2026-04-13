<template>
  <div class="opening-screen">
    <div class="opening-inner">
      <div class="opening-glow opening-glow-one" aria-hidden="true"></div>
      <div class="opening-glow opening-glow-two" aria-hidden="true"></div>
      <div class="opening-glow opening-glow-three" aria-hidden="true"></div>

      <div class="opening-copy text-center">
        <div class="opening-center">
          <img
            :src="logo"
            alt="Perler Beads Studio logo"
            class="opening-logo"
          />
          <div class="opening-wordmark" aria-hidden="true">
            <span class="opening-word opening-word-perler">PERLER</span>
            <span class="opening-word opening-word-beads">BEADS</span>
            <span class="opening-word opening-word-studio">STUDIO</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted } from "vue";
import openingSoundEffect from "../audio/opening_sound_effect.mp3";
import logo from "../images/logo.png";

const emit = defineEmits(["complete"]);

let loadingTimerId = 0;
let openingAudio = null;
let removeUnlockListeners = null;
let hasStartedSequence = false;

function cleanupUnlockListeners() {
  if (removeUnlockListeners) {
    removeUnlockListeners();
    removeUnlockListeners = null;
  }
}

function startOpeningSequence() {
  if (hasStartedSequence) {
    return;
  }

  hasStartedSequence = true;

  if (loadingTimerId) {
    window.clearTimeout(loadingTimerId);
  }

  loadingTimerId = window.setTimeout(() => {
    emit("complete");
  }, 2200);
}

function tryPlayOpeningAudio() {
  if (!openingAudio) {
    return Promise.resolve(false);
  }

  return openingAudio.play().then(() => {
    cleanupUnlockListeners();
    return true;
  }).catch(() => false);
}

onMounted(() => {
  openingAudio = new Audio(openingSoundEffect);
  openingAudio.preload = "auto";
  openingAudio.volume = 0.7;
  openingAudio.load();

  startOpeningSequence();
  tryPlayOpeningAudio();

  const unlockAudio = () => {
    tryPlayOpeningAudio();
  };

  window.addEventListener("pointerdown", unlockAudio, { once: true });
  window.addEventListener("keydown", unlockAudio, { once: true });
  removeUnlockListeners = () => {
    window.removeEventListener("pointerdown", unlockAudio);
    window.removeEventListener("keydown", unlockAudio);
  };

});

onBeforeUnmount(() => {
  if (loadingTimerId) {
    window.clearTimeout(loadingTimerId);
  }

  hasStartedSequence = false;
  cleanupUnlockListeners();

  if (openingAudio) {
    openingAudio.pause();
    openingAudio.currentTime = 0;
  }
});
</script>

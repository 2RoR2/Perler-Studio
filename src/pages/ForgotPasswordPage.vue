<template>
  <div class="page-block">
    <div class="page-intro row g-4 align-items-end">
      <div class="col-12 col-lg-7">
        <p class="hero-kicker">Account access</p>
        <h1 class="page-title">FORGOT PASSWORD</h1>
        <p class="page-copy">
          Enter your account email to start password recovery for your Perler Beads Studio account.
        </p>
      </div>
    </div>

    <div class="row g-4 mt-2 align-items-stretch">
      <div class="col-12 col-xl-7">
        <section class="auth-card rounded-5 p-4 p-lg-5 h-100">
          <p v-if="statusMessage" class="auth-status">{{ statusMessage }}</p>
          <p v-if="errorMessage" class="auth-error">{{ errorMessage }}</p>

          <form class="auth-form mt-4" @submit.prevent="submitForm">
            <label class="booking-field">
              <span>Email</span>
              <input v-model="email" type="email" placeholder="yourname@example.com" />
              <small class="auth-field-hint">Email must be lowercase.</small>
            </label>

            <button
              class="btn btn-dark btn-lg rounded-pill px-4 mt-3"
              type="submit"
              :disabled="isSubmitting || !canSubmit"
            >
              {{ isSubmitting ? "Checking Account..." : "Send Reset Instructions" }}
            </button>
          </form>

          <p class="auth-helper mt-4 mb-0">
            Remembered your password?
            <RouterLink to="/login">Login here</RouterLink>
          </p>
        </section>
      </div>

      <div class="col-12 col-xl-5">
        <section class="auth-side rounded-5 p-4 p-lg-5 h-100">
          <p class="pattern-label">Recovery help</p>
          <h2 class="pattern-title">Reset your access</h2>
          <p class="pattern-copy">
            Use the same lowercase email you used during signup. If the account exists, the backend will confirm the recovery request.
          </p>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";

const email = ref("");
const errorMessage = ref("");
const statusMessage = ref("");
const isSubmitting = ref(false);

const emailIsLowercase = computed(() => email.value === email.value.toLowerCase());
const canSubmit = computed(() => Boolean(email.value.trim()) && emailIsLowercase.value);

async function submitForm() {
  errorMessage.value = "";
  statusMessage.value = "";
  isSubmitting.value = true;

  try {
    if (!emailIsLowercase.value) {
      throw new Error("Email must be lowercase.");
    }

    const response = await fetch("/api/forgot-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email: email.value.trim().toLowerCase()
      })
    });

    const result = await response.json();

    if (!response.ok || !result.ok) {
      throw new Error(result.message || "Could not start password recovery.");
    }

    statusMessage.value = result.message;
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : "Could not start password recovery.";
  } finally {
    isSubmitting.value = false;
  }
}
</script>

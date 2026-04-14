<template>
  <div class="page-block">
    <div class="page-intro row g-4 align-items-end">
      <div class="col-12 col-lg-7">
        <p class="hero-kicker">Account access</p>
        <h1 class="page-title">RESET PASSWORD</h1>
        <p class="page-copy">
          Choose a new password for your account using the reset link sent to your email.
        </p>
      </div>
    </div>

    <div class="row g-4 mt-2 align-items-stretch">
      <div class="col-12 col-xl-7">
        <section class="auth-card rounded-5 p-4 p-lg-5 h-100">
          <p v-if="statusMessage" class="auth-status">{{ statusMessage }}</p>
          <p v-if="errorMessage" class="auth-error">{{ errorMessage }}</p>

          <div v-if="isCheckingToken" class="booking-history-empty mt-4">
            Validating reset link...
          </div>

          <form v-else class="auth-form mt-4" @submit.prevent="submitForm">
            <label class="booking-field">
              <span>Account Email</span>
              <input :value="accountEmail" type="email" readonly />
            </label>

            <label class="booking-field">
              <span>New Password</span>
              <input v-model="password" type="password" placeholder="Create new password" />
            </label>

            <div class="auth-password-rules">
              <p class="auth-password-title mb-2">Password requirements</p>
              <p :class="passwordChecks.length ? 'auth-password-pass' : 'auth-password-fail'">
                8 or more characters
              </p>
              <p :class="passwordChecks.uppercase ? 'auth-password-pass' : 'auth-password-fail'">
                At least 1 uppercase letter
              </p>
              <p :class="passwordChecks.lowercase ? 'auth-password-pass' : 'auth-password-fail'">
                At least 1 lowercase letter
              </p>
              <p :class="passwordChecks.number ? 'auth-password-pass' : 'auth-password-fail'">
                At least 1 number
              </p>
              <p :class="passwordChecks.special ? 'auth-password-pass' : 'auth-password-fail'">
                At least 1 special character
              </p>
            </div>

            <button
              class="btn btn-dark btn-lg rounded-pill px-4 mt-3"
              type="submit"
              :disabled="isSubmitting || !canSubmit"
            >
              {{ isSubmitting ? "Resetting Password..." : "Reset Password" }}
            </button>
          </form>

          <p class="auth-helper mt-4 mb-0">
            Back to account access?
            <RouterLink to="/login">Login here</RouterLink>
          </p>
        </section>
      </div>

      <div class="col-12 col-xl-5">
        <section class="auth-side rounded-5 p-4 p-lg-5 h-100">
          <p class="pattern-label">Secure reset</p>
          <h2 class="pattern-title">Finish the password change</h2>
          <p class="pattern-copy">
            This reset page works only with a valid email link. Once you submit a new password, the token is marked as used.
          </p>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();
const token = computed(() => String(route.query.token || ""));
const accountEmail = ref("");
const password = ref("");
const errorMessage = ref("");
const statusMessage = ref("");
const isSubmitting = ref(false);
const isCheckingToken = ref(true);

const passwordChecks = computed(() => ({
  length: password.value.length >= 8,
  uppercase: /[A-Z]/.test(password.value),
  lowercase: /[a-z]/.test(password.value),
  number: /\d/.test(password.value),
  special: /[^A-Za-z\d]/.test(password.value)
}));

const canSubmit = computed(() =>
  Boolean(token.value) &&
  Boolean(accountEmail.value) &&
  Object.values(passwordChecks.value).every(Boolean)
);

async function validateToken() {
  errorMessage.value = "";
  statusMessage.value = "";
  isCheckingToken.value = true;

  try {
    if (!token.value) {
      throw new Error("Missing reset token.");
    }

    const response = await fetch(`/api/reset-password/validate?token=${encodeURIComponent(token.value)}`);
    const result = await response.json();

    if (!response.ok || !result.ok) {
      throw new Error(result.message || "Could not validate reset token.");
    }

    accountEmail.value = result.email;
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : "Could not validate reset token.";
  } finally {
    isCheckingToken.value = false;
  }
}

async function submitForm() {
  errorMessage.value = "";
  statusMessage.value = "";
  isSubmitting.value = true;

  try {
    const response = await fetch("/api/reset-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        token: token.value,
        password: password.value
      })
    });

    const result = await response.json();

    if (!response.ok || !result.ok) {
      throw new Error(result.message || "Could not reset password.");
    }

    statusMessage.value = result.message;
    password.value = "";
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : "Could not reset password.";
  } finally {
    isSubmitting.value = false;
  }
}

onMounted(() => {
  validateToken();
});
</script>

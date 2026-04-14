<template>
  <div class="page-block">
    <div class="page-intro row g-4 align-items-end">
      <div class="col-12 col-lg-7">
        <p class="hero-kicker">Account access</p>
        <h1 class="page-title">LOGIN</h1>
        <p class="page-copy">
          Log in to continue browsing store products, booking studio sessions,
          and using the pattern tools.
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
              <input v-model="form.email" type="email" placeholder="yourname@example.com" />
              <small class="auth-field-hint">Email must be lowercase.</small>
            </label>

            <label class="booking-field">
              <span>Password</span>
              <input v-model="form.password" type="password" placeholder="Enter password" />
            </label>

            <button
              class="btn btn-dark btn-lg rounded-pill px-4 mt-3"
              type="submit"
              :disabled="isSubmitting || !canSubmit"
            >
              {{ isSubmitting ? "Logging In..." : "Login" }}
            </button>
          </form>

          <p class="auth-helper mt-4 mb-0">
            Need an account?
            <RouterLink to="/signup">Create one here</RouterLink>
          </p>
          <p class="auth-helper mt-2 mb-0">
            Forgot your password?
            <RouterLink to="/forgot-password">Reset it here</RouterLink>
          </p>
        </section>
      </div>

      <div class="col-12 col-xl-5">
        <section class="auth-side rounded-5 p-4 p-lg-5 h-100">
          <p class="pattern-label">Account panel</p>
          <h2 class="pattern-title">{{ currentUser ? "You are signed in" : "Welcome back" }}</h2>
          <p class="pattern-copy">
            {{ currentUser
              ? `${currentUser.name} is currently signed in from the database-backed account system.`
              : "Use your account to log in through the backend and unlock store and studio features." }}
          </p>

          <div v-if="currentUser" class="auth-user mt-4">
            <strong>{{ currentUser.name }}</strong>
            <span>{{ currentUser.email }}</span>
          </div>

          <button
            v-if="currentUser"
            class="btn btn-light btn-lg rounded-pill px-4 mt-4"
            type="button"
            @click="handleLogout"
          >
            Logout
          </button>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from "vue";
import { useAuth } from "../modules/useAuth";

const { currentUser, login, logout } = useAuth();

const errorMessage = ref("");
const statusMessage = ref("");
const isSubmitting = ref(false);
const form = reactive({
  email: "",
  password: ""
});

const emailIsLowercase = computed(() => form.email === form.email.toLowerCase());
const canSubmit = computed(() => Boolean(form.email.trim()) && Boolean(form.password) && emailIsLowercase.value);

async function submitForm() {
  errorMessage.value = "";
  statusMessage.value = "";
  isSubmitting.value = true;

  try {
    if (!emailIsLowercase.value) {
      throw new Error("Email must be lowercase.");
    }

    await login(form);
    statusMessage.value = "Logged in successfully.";
    form.password = "";
  } catch (error) {
    errorMessage.value = error.message;
  } finally {
    isSubmitting.value = false;
  }
}

function handleLogout() {
  logout();
  statusMessage.value = "Logged out successfully.";
}
</script>

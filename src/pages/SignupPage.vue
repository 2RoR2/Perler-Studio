<template>
  <div class="page-block">
    <div class="page-intro row g-4 align-items-end">
      <div class="col-12 col-lg-7">
        <p class="hero-kicker">Account access</p>
        <h1 class="page-title">SIGN UP</h1>
        <p class="page-copy">
          Create a separate account page for new users who want to shop beads,
          reserve studio sessions, and use the pattern generator.
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
              <span>Name</span>
              <input v-model="form.name" type="text" placeholder="Your full name" />
            </label>

            <label class="booking-field">
              <span>Email</span>
              <input v-model="form.email" type="email" placeholder="you@example.com" />
            </label>

            <label class="booking-field">
              <span>Password</span>
              <input v-model="form.password" type="password" placeholder="Create password" />
            </label>

            <button class="btn btn-dark btn-lg rounded-pill px-4 mt-3" type="submit">
              Create Account
            </button>
          </form>

          <p class="auth-helper mt-4 mb-0">
            Already have an account?
            <RouterLink to="/login">Login here</RouterLink>
          </p>
        </section>
      </div>

      <div class="col-12 col-xl-5">
        <section class="auth-side rounded-5 p-4 p-lg-5 h-100">
          <p class="pattern-label">Account panel</p>
          <h2 class="pattern-title">{{ currentUser ? "Account ready" : "Create your account" }}</h2>
          <p class="pattern-copy">
            {{ currentUser
              ? `${currentUser.name} has just created an account on this browser.`
              : "Sign up to get a simple browser-based account for this project UI." }}
          </p>

          <div v-if="currentUser" class="auth-user mt-4">
            <strong>{{ currentUser.name }}</strong>
            <span>{{ currentUser.email }}</span>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from "vue";
import { useAuth } from "../modules/useAuth";

const { currentUser, signUp } = useAuth();

const errorMessage = ref("");
const statusMessage = ref("");
const form = reactive({
  name: "",
  email: "",
  password: ""
});

function submitForm() {
  errorMessage.value = "";
  statusMessage.value = "";

  try {
    if (!form.name.trim()) {
      throw new Error("Please enter your name.");
    }

    signUp(form);
    statusMessage.value = "Account created successfully.";
    form.password = "";
  } catch (error) {
    errorMessage.value = error.message;
  }
}
</script>

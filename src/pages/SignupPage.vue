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
              <input v-model="form.name" type="text" placeholder="Yourname Surname" />
              <small class="auth-field-hint">Name must start with a capital letter.</small>
            </label>

            <label class="booking-field">
              <span>Email</span>
              <input v-model="form.email" type="email" placeholder="yourname@example.com" />
              <small class="auth-field-hint">Email must be lowercase.</small>
            </label>

            <label class="booking-field">
              <span>Password</span>
              <input v-model="form.password" type="password" placeholder="Create password" />
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
              {{ isSubmitting ? "Creating Account..." : "Create Account" }}
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
              ? `${currentUser.name} has just created a database-backed account.`
              : "Sign up to create an account stored in the backend database for this project." }}
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
import { computed, reactive, ref } from "vue";
import { useAuth } from "../modules/useAuth";

const { currentUser, signUp } = useAuth();

const errorMessage = ref("");
const statusMessage = ref("");
const isSubmitting = ref(false);
const form = reactive({
  name: "",
  email: "",
  password: ""
});

const nameStartsWithCapital = computed(() => /^[A-Z]/.test(form.name.trim()));
const emailIsLowercase = computed(() => form.email === form.email.toLowerCase());

const passwordChecks = computed(() => ({
  length: form.password.length >= 8,
  uppercase: /[A-Z]/.test(form.password),
  lowercase: /[a-z]/.test(form.password),
  number: /\d/.test(form.password),
  special: /[^A-Za-z\d]/.test(form.password)
}));

const canSubmit = computed(() =>
  Boolean(form.name.trim()) &&
  Boolean(form.email.trim()) &&
  Boolean(form.password) &&
  nameStartsWithCapital.value &&
  emailIsLowercase.value &&
  Object.values(passwordChecks.value).every(Boolean)
);

async function submitForm() {
  errorMessage.value = "";
  statusMessage.value = "";
  isSubmitting.value = true;

  try {
    if (!form.name.trim()) {
      throw new Error("Please enter your name.");
    }

    if (!nameStartsWithCapital.value) {
      throw new Error("Name must start with a capital letter.");
    }

    if (!emailIsLowercase.value) {
      throw new Error("Email must be lowercase.");
    }

    if (!Object.values(passwordChecks.value).every(Boolean)) {
      throw new Error(
        "Password must be at least 8 characters and include an uppercase letter, lowercase letter, number, and special character."
      );
    }

    await signUp(form);
    statusMessage.value = "Account created successfully.";
    form.password = "";
  } catch (error) {
    errorMessage.value = error.message;
  } finally {
    isSubmitting.value = false;
  }
}
</script>

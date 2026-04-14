<template>
  <div class="topbar d-flex justify-content-between align-items-center flex-wrap gap-3">
    <div class="brand-mark">
      <img
        :src="logo"
        alt="Perler Beads Studio logo"
        class="brand-logo"
      />
      <div>
        <p class="meta-line mb-0">Perler Beads Studio</p>
        <p class="meta-sub mb-0">Pattern planning workspace</p>
      </div>
    </div>

    <div class="d-flex align-items-center flex-wrap gap-2">
      <nav class="d-flex align-items-center gap-2 text-uppercase small fw-semibold">
        <RouterLink to="/" class="top-pill nav-link-pill">Homepage</RouterLink>
        <RouterLink to="/gallery" class="top-pill nav-link-pill">Ideas</RouterLink>
        <RouterLink to="/store" class="top-pill nav-link-pill">Store</RouterLink>
        <RouterLink to="/booking" class="top-pill nav-link-pill">Booking</RouterLink>
        <RouterLink to="/patterns" class="top-pill nav-link-pill">Steps</RouterLink>
      </nav>

      <div class="auth-actions d-flex align-items-center gap-2">
        <template v-if="currentUser">
          <div class="account-pill">
            <strong>{{ currentUser.name }}</strong>
            <span>{{ currentUser.email }}</span>
          </div>
          <button class="top-pill nav-link-pill account-logout" type="button" @click="logout">
            Logout
          </button>
        </template>
        <template v-else>
          <RouterLink to="/login" class="auth-link auth-link-login">Login</RouterLink>
          <RouterLink to="/signup" class="auth-link auth-link-signup">Sign Up</RouterLink>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import logo from "../images/logo.png";
import { useAuth } from "../modules/useAuth";

const { currentUser, logout } = useAuth();
</script>

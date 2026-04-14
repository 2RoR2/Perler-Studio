import { computed, ref } from "vue";

const CURRENT_USER_KEY = "perler-studio-current-user";

const currentUser = ref(loadCurrentUser());

function loadCurrentUser() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return JSON.parse(window.localStorage.getItem(CURRENT_USER_KEY) || "null");
  } catch {
    return null;
  }
}

function persistCurrentUser() {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser.value));
  }
}

export function useAuth() {
  const isAuthenticated = computed(() => Boolean(currentUser.value));

  function normalizeEmail(email) {
    return String(email || "").trim().toLowerCase();
  }

  async function signUp({ name, email, password }) {
    const response = await fetch("/api/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: name.trim(),
        email: normalizeEmail(email),
        password
      })
    });

    const result = await response.json();

    if (!response.ok || !result.ok) {
      throw new Error(result.message || "Could not create account.");
    }

    currentUser.value = result.user;
    persistCurrentUser();
  }

  async function login({ email, password }) {
    const response = await fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email: normalizeEmail(email),
        password
      })
    });

    const result = await response.json();

    if (!response.ok || !result.ok) {
      throw new Error(result.message || "Could not log in.");
    }

    currentUser.value = result.user;
    persistCurrentUser();
  }

  function logout() {
    currentUser.value = null;
    persistCurrentUser();
  }

  return {
    currentUser,
    isAuthenticated,
    signUp,
    login,
    logout
  };
}

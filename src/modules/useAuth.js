import { computed, ref } from "vue";

const USERS_KEY = "perler-studio-users";
const CURRENT_USER_KEY = "perler-studio-current-user";

const users = ref(loadUsers());
const currentUser = ref(loadCurrentUser());

function loadUsers() {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    return JSON.parse(window.localStorage.getItem(USERS_KEY) || "[]");
  } catch {
    return [];
  }
}

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

function persistUsers() {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(USERS_KEY, JSON.stringify(users.value));
  }
}

function persistCurrentUser() {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser.value));
  }
}

export function useAuth() {
  const isAuthenticated = computed(() => Boolean(currentUser.value));

  function signUp({ name, email, password }) {
    const normalizedEmail = email.trim().toLowerCase();

    if (users.value.some((user) => user.email === normalizedEmail)) {
      throw new Error("An account with this email already exists.");
    }

    const nextUser = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      name: name.trim(),
      email: normalizedEmail,
      password
    };

    users.value = [...users.value, nextUser];
    persistUsers();

    currentUser.value = {
      id: nextUser.id,
      name: nextUser.name,
      email: nextUser.email
    };
    persistCurrentUser();
  }

  function login({ email, password }) {
    const normalizedEmail = email.trim().toLowerCase();
    const foundUser = users.value.find(
      (user) => user.email === normalizedEmail && user.password === password
    );

    if (!foundUser) {
      throw new Error("Incorrect email or password.");
    }

    currentUser.value = {
      id: foundUser.id,
      name: foundUser.name,
      email: foundUser.email
    };
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

import { defineStore } from "pinia";

interface User {
  nickname: string;
  id: string;
  avatar: string;
}

export const useUserStore = defineStore("user", {
  state: () => ({
    user: null as User | null,
  }),
  actions: {
    setUser(user: User) {
      this.user = user;
      localStorage.setItem("user", JSON.stringify(user));
    },
    clearUser() {
      this.user = null;
      localStorage.removeItem("user");
      // localStorage.clear(); // 清空本地缓存（根据实际业务调整）
    },
    loadFromStorage() {
      const stored = localStorage.getItem("user");
      if (stored) {
        this.user = JSON.parse(stored);
      }
    },
  },
});

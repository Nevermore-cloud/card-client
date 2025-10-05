<template>
  <div class="login-page">
    <!-- 背景装饰 -->
    <div class="login-bg"></div>

    <!-- 未登录：显示登录表单 -->
    <div v-if="!userStore.user" class="login-card">
      <h2 class="title">知卡 登录</h2>

      <!-- 输入框 -->
      <van-field
        v-model="nickname"
        label="昵称"
        placeholder="请输入昵称"
        clearable
      />
      <van-field
        v-model="password"
        label="密码"
        type="password"
        placeholder="请输入密码"
        clearable
      />

      <!-- 登录按钮 -->
      <van-button
        round
        block
        type="primary"
        class="login-btn"
        :loading="loading"
        :disabled="loading"
        @click="handleLogin"
      >
        登录
      </van-button>

      <!-- 提示 -->
      <p class="hint">
        测试账号：{{ mockUser.nickname + " / " + mockUser.password }}
      </p>
    </div>

    <!-- 已登录：显示提示和退出按钮 -->
    <div v-else class="login-card logged-in">
      <h2 class="title">已登录</h2>
      <div class="user-info">
        <img class="avatar" :src="userStore.user.avatar" alt="avatar" />
        <p class="nickname">{{ userStore.user.nickname }}</p>
      </div>
      <van-button
        round
        block
        type="danger"
        class="logout-btn"
        @click="handleLogout"
      >
        退出登录
      </van-button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { showToast } from "vant";
import { useRouter } from "vue-router";
import { useUserStore } from "@/stores/user";
import { delay } from "@/utils/delay"; // 你已有的延迟工具函数

const router = useRouter();
const userStore = useUserStore();

// 表单数据
const nickname = ref("");
const password = ref("");
const loading = ref(false); // 登录按钮的加载状态

// 模拟账号
const mockUser = ref({
  id: "10005",
  nickname: "Nevermore",
  password: "123456",
  avatar: "https://via.placeholder.com/80x80.png?text=N",
});

const handleLogin = async () => {
  if (loading.value) return;
  loading.value = true;

  await delay(300); // 模拟请求延迟

  if (
    nickname.value === mockUser.value.nickname.trim() &&
    password.value === mockUser.value.password.trim()
  ) {
    userStore.setUser({
      nickname: mockUser.value.nickname,
      id: mockUser.value.id,
      avatar: mockUser.value.avatar,
    });
    showToast("登录成功");
    router.push("/mine");
  } else {
    showToast("账号或密码错误");
  }

  loading.value = false;
};

const handleLogout = () => {
  userStore.clearUser();
  showToast("已退出登录");
  router.push("/login");
};
</script>

<style lang="scss" scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #2c3e50, #34495e);

  .login-bg {
    position: absolute;
    width: 100%;
    height: 100%;
    background: url("https://via.placeholder.com/600x800.png?text=Card+BG")
      no-repeat center/cover;
    opacity: 0.15;
    z-index: 0;
  }

  .login-card {
    z-index: 1;
    width: 75%;
    max-width: 400px;
    padding: 24px;
    border-radius: 16px;
    background: #fff;
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.2);
    text-align: center;

    .title {
      font-size: 22px;
      margin-bottom: 20px;
      font-weight: bold;
      color: #333;
    }

    .login-btn,
    .logout-btn {
      margin-top: 20px;
    }

    .hint {
      margin-top: 12px;
      font-size: 13px;
      color: #999;
    }
  }

  .logged-in {
    .user-info {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin: 20px 0;

      .avatar {
        width: 64px;
        height: 64px;
        border-radius: 50%;
        border: 1px solid #ddd;
        margin-bottom: 8px;
      }
      .nickname {
        font-size: 18px;
        font-weight: 600;
        color: #333;
      }
    }
  }
}
</style>

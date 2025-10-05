<template>
  <div class="user-center">
    <!-- 顶部用户信息 -->
    <div class="user-header">
      <div class="avatar-wrapper">
        <img class="avatar" :src="user.avatar" alt="avatar" />
      </div>
      <div class="user-info">
        <h3 class="nickname">{{ user.nickname }}</h3>
        <p class="uid">ID: {{ user.id }}</p>
      </div>
    </div>

    <!-- 功能入口 -->
    <van-cell-group>
      <van-cell
        title="我的卡组"
        icon="apps-o"
        is-link
        @click="goTo('/my-decks')"
      />
      <van-cell
        title="我的卡牌库"
        icon="cluster-o"
        is-link
        @click="goTo('/cards')"
      />
      <van-cell
        title="预设卡组"
        icon="cluster-o"
        is-link
        @click="goTo('/presets')"
      />
    </van-cell-group>

    <!-- 退出登录按钮 -->
    <div class="logout-btn">
      <van-button type="danger" block round @click="logout">
        退出登录
      </van-button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { showConfirmDialog, showToast } from "vant";
import { useUserStore } from "@/stores/user";

const router = useRouter();
const userStore = useUserStore();

// 模拟用户信息，后续可从 store / API 获取
const user = ref({
  id: "10001",
  nickname: "Nevermore",
  password: "123456",
  avatar:
    "https://img0.baidu.com/it/u=1680419096,4023464813&fm=253&fmt=auto&app=138&f=JPEG?w=450&h=450",
});

const goTo = (path: string) => {
  router.push(path);
};

const logout = async () => {
  try {
    await showConfirmDialog({
      title: "确认退出",
      message: "确定要退出登录吗？",
    });
    // 这里执行退出逻辑
    userStore.clearUser();
    showToast("已退出登录");
    router.replace("/login"); // 跳转到登录页
  } catch {
    // 用户取消，不做操作
  }
};
</script>

<style lang="scss" scoped>
.user-center {
  min-height: 100vh;
  background: #f7f8fa;
  padding-bottom: var(--van-tabbar-height);

  .user-header {
    display: flex;
    align-items: center;
    padding: 16px;
    background: #fff;

    .avatar-wrapper {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      overflow: hidden; // 让超出的图片被裁剪
      border: 1px solid #ddd;
      display: flex;
      align-items: center;
      justify-content: center;

      .avatar {
        width: 100%;
        height: 100%;
        object-fit: cover; // 保证填充
      }
    }

    .user-info {
      flex: 1;

      .nickname {
        font-size: 18px;
        margin: 0 0 4px;
      }
      .uid {
        font-size: 14px;
        color: #888;
      }
    }
  }

  .logout-btn {
    margin: 20px 16px;
  }
}
</style>

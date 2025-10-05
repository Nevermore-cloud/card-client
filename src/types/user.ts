export interface UserType {
  id: number; // 用户唯一标识
  username: string; // 用户名（展示用）
  password: string; // 密码（MVP 阶段可明文存，但正式版要哈希）
  email?: string; // 邮箱（可选，用于找回/绑定）

  avatar?: string; // 头像 URL
  role?: "user" | "admin"; // 角色，预留权限系统
  createdAt?: string; // 注册时间
  updatedAt?: string; // 最近修改时间

  // MVP 可选，未来扩展
  bio?: string; // 简介/签名
  phone?: string; // 手机号
  status?: "active" | "banned"; // 账号状态
}

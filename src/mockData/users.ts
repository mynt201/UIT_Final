import type { UserWithPassword } from "../types";

export const MOCK_USERS: UserWithPassword[] = [
  {
    id: "1",
    username: "admin",
    email: "admin@example.com",
    password: "admin123",
    role: "admin",
    fullName: "Quản trị viên",
    phone: "0123456789",
    address: "TP.HCM",
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString(),
  },
  {
    id: "2",
    username: "user1",
    email: "user1@example.com",
    password: "user123",
    role: "user",
    fullName: "Người dùng 1",
    phone: "0987654321",
    address: "TP.HCM",
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString(),
  },
];



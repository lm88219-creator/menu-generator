import crypto from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const ADMIN_COOKIE_NAME = "uu_admin_session";

type AdminCredentials = {
  username: string;
  password: string;
  secret: string;
};

function readEnv(name: string) {
  return String(process.env[name] ?? "").trim();
}

function hasUnsafeFallback(creds: AdminCredentials) {
  return (
    creds.username === "admin" ||
    creds.password === "12345678" ||
    creds.secret === "change-this-secret"
  );
}

export function getAdminCredentials(): AdminCredentials {
  const credentials = {
    username: readEnv("ADMIN_USERNAME") || "admin",
    password: readEnv("ADMIN_PASSWORD") || "12345678",
    secret: readEnv("ADMIN_SECRET") || "change-this-secret",
  };

  if (process.env.NODE_ENV === "production" && hasUnsafeFallback(credentials)) {
    throw new Error("缺少安全的管理員環境變數，請設定 ADMIN_USERNAME、ADMIN_PASSWORD、ADMIN_SECRET");
  }

  return credentials;
}

function signValue(username: string, password: string, secret: string) {
  return crypto.createHash("sha256").update(`${username}|${password}|${secret}`).digest("hex");
}

export function createAdminSessionToken() {
  const { username, password, secret } = getAdminCredentials();
  return signValue(username, password, secret);
}

export function validateAdminLogin(username: string, password: string) {
  const creds = getAdminCredentials();
  return username === creds.username && password === creds.password;
}

export async function isAdminAuthenticated() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value ?? "";
  return Boolean(token) && token === createAdminSessionToken();
}

export async function requireAdmin() {
  const ok = await isAdminAuthenticated();
  if (!ok) redirect("/login");
}

export async function setAdminSession() {
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE_NAME, createAdminSessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
  });
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(0),
  });
}

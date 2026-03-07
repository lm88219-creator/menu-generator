import { setAdminSession, validateAdminLogin } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const username = String(body.username ?? "").trim();
    const password = String(body.password ?? "").trim();

    if (!validateAdminLogin(username, password)) {
      return Response.json({ error: "帳號或密碼錯誤" }, { status: 401 });
    }

    await setAdminSession();
    return Response.json({ success: true });
  } catch {
    return Response.json({ error: "登入失敗" }, { status: 500 });
  }
}

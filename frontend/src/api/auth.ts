export async function login(email: string, password: string) {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error("Login failed");
  return res.json();
}

export async function logout() {
  const res = await fetch("/api/auth/logout", {
    method: "POST",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Logout failed");
}

export async function getCurrentUser() {
  const res = await fetch("/api/auth/me", {
    credentials: "include",
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `/api/auth/me responded ${res.status}${text ? `: ${text}` : ""}`,
    );
  }
  return res.json();
}

export async function signup(
  email: string,
  password: string,
  fullName: string,
  studentId?: string,
) {
  const userData = {
    email,
    password,
    fullName,
    ...(studentId?.trim() ? { studentId: studentId.trim() } : {}),
  };

  const res = await fetch("/api/auth/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(userData),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.error ?? "Signup failed");
  }

  return res.json();
}

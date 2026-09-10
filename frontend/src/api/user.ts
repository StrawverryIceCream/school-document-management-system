interface UpdateUserBody {
  fullName?: string;
  studentId?: string | null;
  role?: "student" | "teacher" | "admin" | "staff";
  email?: string;
}

export async function getAllUsers() {
  const res = await fetch("/api/users", {
    credentials: "include",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `/api/users responded ${res.status}${text ? `: ${text}` : ""}`,
    );
  }

  return res.json();
}

export async function getUserById(id: string) {
  const res = await fetch(`/api/users/${id}`, {
    credentials: "include",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `/api/users/${id} responded ${res.status}${text ? `: ${text}` : ""}`,
    );
  }

  return res.json();
}

export async function updateUserById(id: string, data: UpdateUserBody) {
  const res = await fetch(`/api/users/${id}`, {
    credentials: "include",
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `/api/users/${id} update failed ${res.status}${text ? `: ${text}` : ""}`,
    );
  }
}

export async function deleteUserById(id: string) {
  const res = await fetch(`/api/users/${id}`, {
    credentials: "include",
    method: "DELETE",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `/api/users/${id} delete failed ${res.status}${text ? `: ${text}` : ""}`,
    );
  }
  return res.json();
}

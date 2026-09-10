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
import { useEffect, useState } from "react";

export interface CurrentUser {
  userId: string;
  email: string;
  name: string;
}

export function useCurrentUser() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        setUser(data.user || null);
      } catch (err) {
        setError("Failed to fetch user");
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const logout = async () => {
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (res.ok) {
        setUser(null);
        window.location.href = "/auth/signin";
      }
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return { user, loading, error, logout };
}

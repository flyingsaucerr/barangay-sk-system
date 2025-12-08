import { useState, useEffect } from "react";

export function useAuth() {
  // This is just a mock for now, replace later with real auth logic
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Example: Check localStorage for a saved user
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  return { user, setUser };
}

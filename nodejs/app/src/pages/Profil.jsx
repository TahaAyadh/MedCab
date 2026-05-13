import { useEffect, useState } from "react";
import { getCurrentUser } from "../api/auth";

function ProfilePage() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const data = await getCurrentUser();
        setUser(data);
      } catch (error) {
        console.error("Failed to load user:", error);
      }
    };

    loadUser();
  }, []);

  if (!user) return <p>Loading...</p>;

  return (
    <div>
      <h1>{user.username}</h1>
      <p>{user.email}</p>
    </div>
  );
}

export default ProfilePage;
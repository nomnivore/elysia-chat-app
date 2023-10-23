import { ChatBox } from "@/components/ChatBox";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/authStore";
import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export function Home() {
  const [user, isAuthed] = useAuthStore((store) => [
    store.user,
    store.isAuthed,
  ]);

  const navigate = useNavigate();
  // if not signed in, redirect to /login
  useEffect(() => {
    if (!isAuthed()) navigate({ to: "/login", replace: true });
  }, [isAuthed, navigate]);

  return (
    <div className="px-4">
      {user ? (
        <>
          <h1 className="text-xl">Hello, {user.name}!</h1>
          <ChatBox />
        </>
      ) : (
        <Button asChild variant="outline" size="lg" className=" my-6 text-lg">
          <Link to="/register">Please Login to get started</Link>
        </Button>
      )}
    </div>
  );
}

export default Home;

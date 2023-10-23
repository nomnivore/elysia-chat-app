import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/authStore";
import { Link, Outlet, useNavigate } from "@tanstack/react-router";

export function Layout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  return (
    <>
      <div className="flex w-full flex-col items-center border-b px-4">
        <nav className="grid w-full grid-cols-2 py-2 lg:grid-cols-3">
          <div className="hidden flex-grow lg:inline"></div>
          <div className="flex flex-grow flex-col items-center">
            <Button variant="link" className="text-2xl font-semibold" asChild>
              <Link to="/">Mini Chat</Link>
            </Button>
          </div>
          <div className="flex flex-grow items-center justify-end space-x-4">
            {user && (
              <>
                <div className="text-sm text-gray-600">{user.name}</div>
                <Button
                  variant="outline"
                  onClick={() => {
                    logout();
                    navigate({ to: "/" });
                  }}
                >
                  Logout
                </Button>
              </>
            )}
          </div>
        </nav>
      </div>
      <Outlet />
    </>
  );
}

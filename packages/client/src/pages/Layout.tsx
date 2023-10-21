import { Button } from "@/components/ui/button";
import { Link, Outlet } from "@tanstack/react-router";

export function Layout() {
  return (
    <>
      <div className="flex flex-col items-center border-b px-4">
        <nav className="flex items-center space-x-4 py-2 lg:space-x-6">
          <Button variant="link" className="text-2xl font-semibold" asChild>
            <Link to="/">Elysia Chat</Link>
          </Button>
        </nav>
      </div>
      <Outlet />
    </>
  );
}

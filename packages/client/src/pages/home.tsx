import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";

export function Home() {
  // if not signed in, redirect to /register

  return (
    <div className="px-4">
      <Button asChild variant="outline" size="lg" className=" my-6 text-lg">
        <Link to="/register">Please Login to get started</Link>
      </Button>
    </div>
  );
}

export default Home;

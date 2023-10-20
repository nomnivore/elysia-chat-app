import {
  RootRoute,
  Route,
  Router,
  RouterProvider,
} from "@tanstack/react-router";
import Home from "./pages/home";
import Register from "./pages/register";

const root = new RootRoute();
const indexRoute = new Route({
  getParentRoute: () => root,
  path: "/",
  component: Home,
});
const registerRoute = new Route({
  getParentRoute: () => root,
  path: "/register",
  component: Register,
});

const routeTree = root.addChildren([indexRoute, registerRoute]);

const router = new Router({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

function App() {
  return <RouterProvider router={router} />;
}

export default App;

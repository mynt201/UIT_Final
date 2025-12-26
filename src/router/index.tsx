import { createBrowserRouter } from "react-router-dom";
import { authRoutes, adminRoutes, userRoutes } from "./routes";

export const router = createBrowserRouter([
  ...authRoutes,
  ...adminRoutes,
  ...userRoutes,
]);

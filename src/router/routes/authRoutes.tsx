import type { RouteObject } from "react-router-dom";
import Login from "../../pages/Login";
import { LOGIN_PATH } from "../routePath";

export const authRoutes: RouteObject[] = [
  {
    path: LOGIN_PATH,
    element: <Login />,
  },
];

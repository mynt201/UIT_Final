import type { RouteObject } from "react-router-dom";
import Login from "../../pages/Login";
import Register from "../../pages/Register";
import { LOGIN_PATH, REGISTER_PATH } from "../routePath";

export const authRoutes: RouteObject[] = [
  {
    path: LOGIN_PATH,
    element: <Login />,
  },
  {
    path: REGISTER_PATH,
    element: <Register />,
  },
];

import type { RouteObject } from "react-router-dom";
import { PublicLayout, RequireAuth } from "../../components";
import PageView from "../../pages/PageView/Index";
import RiskReportPage from "../../pages/RiskReport/Index";
import UserProfilePage from "../../pages/UserProfile/Index";
import SettingsPage from "../../pages/Settings/Index";
import { HOME_PATH } from "../routePath";

export const userRoutes: RouteObject[] = [
  {
    path: HOME_PATH,
    element: <PublicLayout />,
    children: [
      {
        index: true,
        element: <PageView />,
      },
      {
        path: "risk-report",
        element: (
          <RequireAuth>
            <RiskReportPage />
          </RequireAuth>
        ),
      },
      {
        path: "profile",
        element: (
          <RequireAuth>
            <UserProfilePage />
          </RequireAuth>
        ),
      },
      {
        path: "settings",
        element: (
          <RequireAuth>
            <SettingsPage />
          </RequireAuth>
        ),
      },
    ],
  },
];

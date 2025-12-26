import type { RouteObject } from "react-router-dom";
import { MainLayout, RoleGuard } from "../../components";
import PageView from "../../pages/PageView/Index";
import RiskReportPage from "../../pages/RiskReport/Index";
import UserProfilePage from "../../pages/UserProfile/Index";
import SettingsPage from "../../pages/Settings/Index";
import { HOME_PATH } from "../routePath";

export const userRoutes: RouteObject[] = [
  {
    path: HOME_PATH,
    element: (
      <RoleGuard allowRoles={["user", "admin"]}>
        <MainLayout />
      </RoleGuard>
    ),
    children: [
      {
        index: true,
        element: <PageView />,
      },
      {
        path: "risk-report",
        element: <RiskReportPage />,
      },
      {
        path: "profile",
        element: <UserProfilePage />,
      },
      {
        path: "settings",
        element: <SettingsPage />,
      },
    ],
  },
];

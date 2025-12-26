import type { RouteObject } from "react-router-dom";
import { AdminLayout, RoleGuard } from "../../components";
import DashboardPage from "../../pages/Dashboard/Index";
import DataManagementPage from "../../pages/DataManagement/Index";
import UserManagementPage from "../../pages/UserManagement/Index";
import StatisticsPage from "../../pages/Statistics/Index";
import { ADMIN_PATH } from "../routePath";

export const adminRoutes: RouteObject[] = [
  {
    path: ADMIN_PATH,
    element: (
      <RoleGuard allowRoles={["admin"]}>
        <AdminLayout />
      </RoleGuard>
    ),
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: "data-management",
        element: <DataManagementPage />,
      },
      {
        path: "users",
        element: <UserManagementPage />,
      },
      {
        path: "statistics",
        element: <StatisticsPage />,
      },
    ],
  },
];

import type { RouteObject } from 'react-router-dom';
import { AdminLayout, RoleGuard } from '../../components';
import DashboardPage from '../../pages/Dashboard/Index';
import DataManagementPage from '../../pages/DataManagement/Index';
import UserManagementPage from '../../pages/UserManagement/Index';
import StatisticsPage from '../../pages/Statistics/Index';
import { ADMIN_PATH } from '../routePath';
import PageView from '../../pages/PageView/Index';
import RiskReportPage from '../../pages/RiskReport/Index';
import UserProfilePage from '../../pages/UserProfile/Index';
import SettingsPage from '../../pages/Settings/Index';

export const adminRoutes: RouteObject[] = [
  {
    path: ADMIN_PATH,
    element: (
      <RoleGuard requiredRole='admin'>
        <AdminLayout />
      </RoleGuard>
    ),
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: 'data-management',
        element: <DataManagementPage />,
      },
      {
        path: 'users',
        element: <UserManagementPage />,
      },
      {
        path: 'statistics',
        element: <StatisticsPage />,
      },
      {
        path: 'map-view',
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

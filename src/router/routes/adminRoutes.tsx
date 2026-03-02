import type { RouteObject } from 'react-router-dom';
import { Navigate } from 'react-router-dom';
import { AdminLayout, RoleGuard } from '../../components';
import { ADMIN_ROLES } from '../../constants/roles';
import DataManagementPage from '../../pages/DataManagement/Index';
import IndicatorManagementPage from '../../pages/IndicatorManagement/Index';
import UserManagementPage from '../../pages/UserManagement/Index';
import { ADMIN_PATH, ADMIN_PAGE_VIEW_PATH, ADMIN_RISK_ASSESSMENT_MANAGEMENT_PATH } from '../routePath';
import PageView from '../../pages/PageView/Index';
import RiskReportPage from '../../pages/RiskReport/Index';
import RiskAssessmentManagementPage from '../../pages/RiskAssessmentManagement/Index';
import UserProfilePage from '../../pages/UserProfile/Index';
import SettingsPage from '../../pages/Settings/Index';

export const adminRoutes: RouteObject[] = [
  {
    path: ADMIN_PATH,
    element: (
      <RoleGuard requiredRole={ADMIN_ROLES}>
        <AdminLayout />
      </RoleGuard>
    ),
    children: [
      {
        index: true,
        element: <Navigate to={ADMIN_PAGE_VIEW_PATH} replace />,
      },
      {
        path: 'data-management',
        element: <DataManagementPage />,
      },
      {
        path: 'indicator-management',
        element: <IndicatorManagementPage />,
      },
      {
        path: 'users',
        element: <UserManagementPage />,
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
        path: "risk-assessment-management",
        element: <RiskAssessmentManagementPage />,
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

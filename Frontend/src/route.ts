import { createBrowserRouter } from 'react-router-dom';
import { AppLayout } from './app/components/AppLayout';
import Dashboard from "./app/pages/Dashboard";
import { Accounts } from './app/pages/Accounts';
import { Policies } from './app/pages/Policies';
import { Claims } from './app/pages/Claims';
import { Reports } from './app/pages/Reports';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: AppLayout,
    children: [
      { index: true, Component: Dashboard },
      { path: 'accounts', Component: Accounts },
      { path: 'policies', Component: Policies },
      { path: 'claims', Component: Claims },
      { path: 'reports', Component: Reports },
    ],
  },
]);

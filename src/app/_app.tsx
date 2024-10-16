import * as Layout from './layout';
import * as Navbar from '~/components/Navbar';
import * as Dashboard from './pages/dashboard/page';
import * as Endpoints from './pages/endpoints/page';
import Logs from './pages/logs/page';
import * as Settings from './pages/settings/page';
import About from './pages/about/page';

import * as EndpointEdit from './pages/endpoints/components/endpoint-edit/page';

export default {
  path: '/',
  loader: Layout.loader,
  element: <Layout.Page />, // Use Layout as the wrapper
  children: [
    {
      path: 'dashboard',
      loader: Dashboard.loader,
      element: <Dashboard.Page />,
    },
    {
      path: 'endpoints/*',
      element: <Endpoints.Page />,
      children: [
        {
          path: 'add',
        },
        {
          path: 'edit/:id',
        },
      ],
    },
    {
      path: 'logs',
      element: <Logs />,
    },
    {
      path: 'settings',
      loader: Settings.loader,
      element: <Settings.Page />,
      children: [
        {
          path: 'inbounds',
          // loader: Settings.V2rayConfigure.Inbounds.loader,
          // element: <Settings.V2rayConfigure.Inbounds.Page />,
        },
      ],
    },
    {
      path: 'about',
      element: <About />,
    },
  ],
};

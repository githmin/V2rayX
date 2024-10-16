import App from '~/App';
import { Login, Register } from '~/app/auth/page';
import _app from '~/app/_app';
import { Navigate } from 'react-router-dom';

export default {
  path: '/',
  children: [
    {
      index: true,
      element: <Navigate to={localStorage.getItem('userId') ? 'dashboard' : '/login'} replace />,
    },
    {
      path: 'login',
      element: (
        <div className="flex h-screen flex-row items-center justify-center">
          <Login />
        </div>
      ),
    },
    {
      path: 'register',
      element: (
        <div className="flex h-screen flex-row items-center justify-center">
          <Register />
        </div>
      ),
    },
    {
      ..._app,
    },
  ],
};

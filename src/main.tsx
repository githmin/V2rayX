import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { HashRouter, createHashRouter, RouterProvider } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';

import './index.css';
// boilerplate components
import Providers from './Providers';
// for internationalization (translations)
import './translations/i18n';
// 1. import `NextUIProvider` component
import { NextUIProvider } from '@nextui-org/react';
import routes from './routes';

const router = createHashRouter([routes]);

const root = createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <html lang="en" className="">
      <NextUIProvider>
        <Providers>
          <RouterProvider router={router} />
          <Toaster
            reverseOrder={false}
            position="top-right"
            toastOptions={{
              className: 'dark:bg-[#121212] dark:text-white',
            }}
          />
        </Providers>
      </NextUIProvider>
    </html>
  </React.StrictMode>,
);

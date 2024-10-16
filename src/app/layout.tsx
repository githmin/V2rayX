import { Outlet } from 'react-router-dom';
import * as Navbar from '~/components/Navbar';
import { handleThemeChange } from '~/lib';
import { queryAppearance } from '~/app/api';

export const loader = async () => {
  const Nav = await Navbar.loader();
  const appearance = await queryAppearance({ userId: localStorage.getItem('userId')! });
  handleThemeChange(appearance.theme);
  return { Nav };
};

export function Page() {
  return (
    <div className="flex h-screen flex-row">
      <div className="mx-8 my-auto">
        <Navbar.MainNav />
      </div>
      <main className="mx-auto my-auto mr-8 flex-grow">
        <Outlet />
      </main>
    </div>
  );
}

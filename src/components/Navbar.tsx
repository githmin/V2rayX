import React, { useState, useEffect } from 'react';
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Link,
  Button,
  Card,
  CardHeader,
  CardBody,
  DropdownItem,
  DropdownTrigger,
  Dropdown,
  DropdownMenu,
  Avatar,
} from '@nextui-org/react';
import { useTranslation } from 'react-i18next';
import { queryUser, updateAppState } from '~/app/api';
import { Navigate, useLoaderData } from 'react-router-dom';
import { useSetState } from '@mantine/hooks';
import { User } from '~/app/api/types';
import { useNavigate } from 'react-router-dom';

type MenuItemType = { label: string; path: string; icon: string; isFolded: boolean };

const menuData: Array<MenuItemType> = [
  {
    label: 'Dashboard',
    path: '/dashboard',
    icon: 'i-feather-home',
    isFolded: true,
  },
  {
    label: 'Servers',
    path: '/endpoints',
    icon: 'i-feather-list',
    isFolded: true,
  },
  {
    label: 'Logs',
    path: '/logs',
    icon: 'i-feather-file-text',
    isFolded: true,
  },
  {
    label: 'Settings',
    path: '/settings',
    icon: 'i-feather-sliders',
    isFolded: true,
  },
  {
    label: 'About',
    path: '/about',
    icon: 'i-feather-info',
    isFolded: true,
  },
];

const MenuItem = ({ label, path, icon, isFolded }: MenuItemType) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  return (
    <Button
      className="max-w-[610px] border-none bg-background/60 dark:bg-default-100/50"
      onClick={() => navigate(path)}
    >
      <div className="flex flex-row items-center justify-center gap-2">
        <span className={icon}></span>
        {isFolded || <p>{t(label)}</p>}
      </div>
    </Button>
  );
};

export const loader = async () => {
  const users = await queryUser({ userId: localStorage.getItem('userId')! });
  return users;
};

const AvatarButton = () => {
  const [user, setUser] = useState<User>({
    UserId: '',
    UserName: '',
    Password: '',
  });
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const users = await queryUser({ userId: localStorage.getItem('userId')! });
        setUser(users[0]);
      } catch (error) {
      } finally {
      }
    };

    fetchData();
  }, []);

  return (
    <Dropdown placement="right-start" backdrop="blur">
      <DropdownTrigger>
        <Avatar
          isBordered
          as="button"
          className="transition-transform"
          name={user.UserName}
          size="md"
        />
      </DropdownTrigger>
      <DropdownMenu
        aria-label="Profile Actions"
        variant="flat"
        className="dark:bg-[#121212] dark:text-white"
      >
        <DropdownItem key="profile" className="h-14 gap-2">
          <p className="font-semibold">{t('Signed in as')}</p>
          <p className="font-semibold">{user.UserName}</p>
        </DropdownItem>
        <DropdownItem key="settings">My Settings</DropdownItem>
        <DropdownItem key="team_settings">Team Settings</DropdownItem>
        <DropdownItem key="analytics">Analytics</DropdownItem>
        <DropdownItem key="system">System</DropdownItem>
        <DropdownItem key="configurations">Configurations</DropdownItem>
        <DropdownItem
          key="help_and_feedback"
          onClick={() => {
            navigate('/about');
          }}
        >
          Help & Feedback
        </DropdownItem>
        <DropdownItem
          key="logout"
          color="danger"
          onClick={() => {
            updateAppState({ userId: localStorage.getItem('userId')!, data: { LoginState: 0 } });
            localStorage.removeItem('userId');
            navigate('/login');
          }}
        >
          Log Out
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
};

export const MainNav = ({ isFolded = true }: { isFolded?: boolean }) => {
  const [isFold, setIsFold] = useState(isFolded);
  return (
    <div className="flex flex-col items-center justify-center gap-8">
      <AvatarButton />
      <nav className="flex flex-col items-start justify-center gap-8 px-2">
        {menuData
          .map((item) => ({ ...item, isFolded: isFold }))
          .map((item, idx) => {
            return <MenuItem {...item} key={idx} />;
          })}
      </nav>
      {
        <div className="fixed bottom-8">
          <Button
            isIconOnly
            color="warning"
            variant="faded"
            aria-label="Take a photo"
            onClick={() => {
              setIsFold(!isFold);
            }}
          >
            <span className={`i-feather-arrow-${!isFolded ? 'left' : 'right'}`} />
          </Button>
        </div>
      }
    </div>
  );
};

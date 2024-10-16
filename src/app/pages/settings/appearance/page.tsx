import { Card, CardHeader, CardBody, CardFooter, Divider, Link, Image } from '@nextui-org/react';
import { Listbox, ListboxItem } from '@nextui-org/react';
import { Select, SelectItem } from '@nextui-org/react';
import { Checkbox } from '@nextui-org/checkbox';
import { Switch } from '@nextui-org/switch';
import { Chip } from '@nextui-org/react';
import { Input } from '@nextui-org/react';
import { Tooltip } from '@nextui-org/tooltip';
import { Tabs, Tab } from '@nextui-org/react';

import { useTranslation } from 'react-i18next';
import { useLoaderData, useRevalidator } from 'react-router-dom';
import { queryAppearance, updateAppearance } from '~/app/api';

export const loader = async () => {
  const userId = localStorage.getItem('userId')!;
  const res = await queryAppearance({ userId });
  return res;
};

const handleThemeChange = (theme: string) => {
  // On page load or when changing themes, best to add inline in `head` to avoid FOUC
  // if (
  //   localStorage.theme === 'dark' ||
  //   (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
  // ) {
  //   document.documentElement.classList.add('dark');
  // } else {
  //   document.documentElement.classList.remove('dark');
  // }
  if (theme === 'light') {
    document.documentElement.classList.remove('dark');
  } else if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  }

  // Whenever the user explicitly chooses light mode
  localStorage.theme = 'light';

  // Whenever the user explicitly chooses dark mode
  localStorage.theme = 'dark';

  // Whenever the user explicitly chooses to respect the OS preference
  localStorage.removeItem('theme');
};

export const Page = () => {
  const userId = localStorage.getItem('userId')!;
  const data = useLoaderData();
  const revalidator = useRevalidator();

  const { theme, font, hideTrayBar } = data.Appearance;
  const { t, i18n } = useTranslation();
  const animals = [
    { key: 'cat', label: 'Cat' },
    { key: 'dog', label: 'Dog' },
    { key: 'elephant', label: 'Elephant' },
    { key: 'lion', label: 'Lion' },
    { key: 'tiger', label: 'Tiger' },
    { key: 'giraffe', label: 'Giraffe' },
    { key: 'dolphin', label: 'Dolphin' },
    { key: 'penguin', label: 'Penguin' },
    { key: 'zebra', label: 'Zebra' },
    { key: 'shark', label: 'Shark' },
    { key: 'whale', label: 'Whale' },
    { key: 'otter', label: 'Otter' },
    { key: 'crocodile', label: 'Crocodile' },
  ];

  return (
    <div>
      <Card className="py-4">
        <CardHeader className="flex-col items-start px-4 pb-0 pt-2">
          <p className="text-tiny font-bold uppercase">{t('Appearance')}</p>
        </CardHeader>
        <CardBody className="overflow-visible py-2">
          <Listbox aria-label="Actions">
            <ListboxItem key="new">
              <div className="flex flex-row items-center justify-between">
                <div>{t('Application Theme')}</div>
                <div className="flex flex-wrap gap-4">
                  <Tabs
                    key="solid"
                    variant="solid"
                    aria-label="Tabs variants"
                    selectedKey={theme}
                    onSelectionChange={(v: 'light' | 'dark' | 'system') => {
                      handleThemeChange(v);
                      updateAppearance({ userId, appearance: { theme: v, font, hideTrayBar } });
                      revalidator.revalidate();
                    }}
                  >
                    <Tab key="light" title="Light" />
                    <Tab key="dark" title="Dark" />
                    <Tab key="system" title="Follow System" />
                  </Tabs>
                </div>
              </div>
            </ListboxItem>
            <ListboxItem key="new">
              <div className="flex flex-row items-center justify-between">
                <div>{t('Font families')}</div>
                <Select
                  color="primary"
                  className="max-w-xs"
                  selectedKeys={[font]}
                  onChange={(e) => {
                    updateAppearance({
                      userId,
                      appearance: { theme, font: e.target.value, hideTrayBar },
                    });
                    revalidator.revalidate();
                  }}
                >
                  {animals.map((animal) => (
                    <SelectItem key={animal.key}>{t(animal.label)}</SelectItem>
                  ))}
                </Select>
              </div>
            </ListboxItem>
            <ListboxItem key="new">
              <Tooltip content="Enable Follow Allow you to control dark or light mode.">
                <div className="flex flex-row items-center justify-between">
                  <div>{t('Hide Tray Bar')}</div>

                  <Switch
                    defaultSelected
                    aria-label="Automatic updates"
                    isSelected={hideTrayBar}
                    onValueChange={(v) => {
                      updateAppearance({
                        userId,
                        appearance: { theme, font, hideTrayBar: v },
                      });
                      revalidator.revalidate();
                    }}
                  />
                </div>
              </Tooltip>
            </ListboxItem>
          </Listbox>
        </CardBody>
      </Card>
    </div>
  );
};

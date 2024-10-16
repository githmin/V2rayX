import { Card, CardHeader, CardBody, CardFooter, Divider, Link, Image } from '@nextui-org/react';
import { Listbox, ListboxItem } from '@nextui-org/react';
import { Select, SelectItem } from '@nextui-org/react';
import { Checkbox } from '@nextui-org/checkbox';
import { Switch } from '@nextui-org/switch';
import { Chip } from '@nextui-org/react';
import { Input } from '@nextui-org/react';
import { Tooltip } from '@nextui-org/tooltip';
import { useTranslation } from 'react-i18next';
import { queryGeneralSettings, updateGeneralSettings, Types } from '~/app/api';
import { useLoaderData, useRevalidator } from 'react-router-dom';

export const loader = async () => {
  const userId = localStorage.getItem('userId')!;
  const data = await queryGeneralSettings({ userId });
  return data;
};

export const Page = () => {
  const data = useLoaderData();
  const {
    allowSystemNotifications,
    autoStartProxy,
    dashboardPopWhenStart,
    applicationLogsFolder,
    v2rayLogsFolder,
    language,
  } = data.General as Types.GeneralSettings;
  const { t, i18n } = useTranslation();
  const languages = Object.keys(i18n.options.resources);
  const lang = i18n.resolvedLanguage;
  const userId = localStorage.getItem('userId')!;
  const revalidator = useRevalidator();

  return (
    <div>
      <Card className="py-4">
        <CardHeader className="flex-col items-start px-4 pb-0 pt-2">
          <p className="text-tiny font-bold uppercase">{t('General')}</p>
        </CardHeader>
        <CardBody className="overflow-visible py-2">
          <Listbox aria-label="Actions">
            <ListboxItem key="new">
              <div className="flex flex-row items-center justify-between">
                <div>{t('Allow System Notification')}</div>
                <Switch
                  defaultSelected
                  aria-label="Automatic updates"
                  isSelected={allowSystemNotifications}
                  onValueChange={(v) => {
                    updateGeneralSettings({
                      userId: localStorage.getItem('userId')!,
                      general: {
                        allowSystemNotifications: v,
                        autoStartProxy,
                        dashboardPopWhenStart,
                        applicationLogsFolder,
                        v2rayLogsFolder,
                        language,
                      },
                    });
                    revalidator.revalidate();
                  }}
                />
              </div>
            </ListboxItem>
            <ListboxItem key="new">
              <div className="flex flex-row items-center justify-between">
                <div>{t('Auto-Start Proxy')}</div>
                <Switch
                  defaultSelected
                  aria-label="Automatic updates"
                  isSelected={autoStartProxy}
                  onValueChange={(v) => {
                    updateGeneralSettings({
                      userId: localStorage.getItem('userId')!,
                      general: {
                        allowSystemNotifications,
                        autoStartProxy: v,
                        dashboardPopWhenStart,
                        applicationLogsFolder,
                        v2rayLogsFolder,
                        language: lang!,
                      },
                    });
                    revalidator.revalidate();
                  }}
                />
              </div>
            </ListboxItem>
            <ListboxItem key="new">
              <div className="flex flex-row items-center justify-between">
                <div>{t('Dashboard Pop Up When Started')}</div>
                <Switch
                  defaultSelected
                  aria-label="Automatic updates"
                  isSelected={dashboardPopWhenStart}
                  onValueChange={(v) => {
                    updateGeneralSettings({
                      userId: localStorage.getItem('userId')!,
                      general: {
                        allowSystemNotifications,
                        autoStartProxy,
                        dashboardPopWhenStart: v,
                        applicationLogsFolder,
                        v2rayLogsFolder,
                        language: lang!,
                      },
                    });
                    revalidator.revalidate();
                  }}
                />
              </div>
            </ListboxItem>
            <ListboxItem key="new">
              <div className="flex flex-row items-center justify-between">
                <div>{t('Current language')}</div>
                <Select
                  color="primary"
                  className="max-w-xs"
                  selectedKeys={[lang!]}
                  onChange={(e) => {
                    i18n.changeLanguage(e.target.value);
                    updateGeneralSettings({
                      userId: localStorage.getItem('userId')!,
                      general: {
                        allowSystemNotifications,
                        autoStartProxy,
                        dashboardPopWhenStart,
                        applicationLogsFolder,
                        v2rayLogsFolder,
                        language: e.target.value,
                      },
                    });
                    revalidator.revalidate();
                  }}
                >
                  {languages.map((v) => (
                    <SelectItem key={v}>{t(v)}</SelectItem>
                  ))}
                </Select>
              </div>
            </ListboxItem>
            <ListboxItem key="new">
              <Tooltip content="The Applicaion data generates every day with tags on it. You can check it or attach it for issue description on Github.">
                <div className="flex flex-row items-center justify-between">
                  <div>{t('Application Logs Folder')}</div>
                  <Chip color="secondary">{applicationLogsFolder}</Chip>
                </div>
              </Tooltip>
            </ListboxItem>
            <ListboxItem key="new">
              <Tooltip content="The Folder Path define where v2ray log goes to.Carefully change it.Wrong path may result in V2ray Service stop. (Directory need to be finished with / for Unix/Mac , \ for Windows)">
                <div className="flex flex-row items-center justify-between">
                  <div>{t('V2ray Logs Folder')}</div>
                  <Chip color="secondary">{v2rayLogsFolder}</Chip>
                </div>
              </Tooltip>
            </ListboxItem>
          </Listbox>
        </CardBody>
      </Card>
    </div>
  );
};

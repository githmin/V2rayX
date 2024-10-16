import { Card, CardHeader, CardBody, Image, Button } from '@nextui-org/react';
import { Listbox, ListboxItem } from '@nextui-org/react';
import { RadioGroup, Radio } from '@nextui-org/react';
import { Checkbox } from '@nextui-org/checkbox';
import { Chip } from '@nextui-org/react';
import { useLoaderData, useNavigate, useRevalidator } from 'react-router-dom';
import { testApi, queryDashboard, updateAutoLaunch, updateProxyMode } from '~/app/api';
import * as Types from '~/app/api/types';
import { writeText, readText } from '@tauri-apps/api/clipboard';

import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';

export const loader = async () => {
  const userId = localStorage.getItem('userId')!;
  return await queryDashboard({ userId });
};

export const action = async () => {
  return {
    title: 'V2rayX',
  };
};

export const Page = () => {
  const userId = localStorage.getItem('userId')!;
  const data = useLoaderData() as Types.DashboardData;
  const { t, i18n } = useTranslation();
  const revalidator = useRevalidator();

  return (
    <Card className="min-h-fit py-4">
      <CardHeader className="flex-col items-start px-4 pb-0 pt-2">
        <p className="font-bold uppercase">V2rayX</p>
        <p className="text-default-500">Uptime: 01:01:00</p>
      </CardHeader>
      <CardBody className="overflow-visible py-2">
        <Listbox>
          <ListboxItem key="socks-port">
            <div className="flex flex-row flex-nowrap items-center justify-between text-base">
              <div>Socks {t('Port')}</div>
              <div>
                {data.socksPort.map((inbound) => {
                  return (
                    <Button
                      color="success"
                      endContent={<span className="i-feather-copy" />}
                      className="text-base"
                      onClick={async () => {
                        await writeText(
                          `export http_proxy=socks5://${inbound.listen}:${inbound.port};export https_proxy=socks5://${inbound.listen}:${inbound.port};`,
                        );
                        toast.success(
                          `export http_proxy=socks5://${inbound.listen}:${inbound.port};export https_proxy=socks5://${inbound.listen}:${inbound.port}; Command has been paste to clipboard`,
                        );
                      }}
                    >
                      {inbound.port}
                    </Button>
                  );
                })}
              </div>
            </div>
          </ListboxItem>
          <ListboxItem key="http-port">
            <div className="flex flex-row flex-nowrap items-center justify-between text-base">
              <div>Http {t('Port')}</div>
              <div>
                {data.httpPort.map((inbound) => {
                  return (
                    <Button
                      color="success"
                      endContent={<span className="i-feather-copy" />}
                      className="text-base"
                      onClick={async () => {
                        await writeText(
                          `export http_proxy=http://${inbound.listen}:${inbound.port};export https_proxy=http://${inbound.listen}:${inbound.port};`,
                        );
                        toast.success(
                          `export http_proxy=http://${inbound.listen}:${inbound.port};export https_proxy=http://${inbound.listen}:${inbound.port}; Command has been paste to clipboard`,
                        );
                      }}
                    >
                      {inbound.port}
                    </Button>
                  );
                })}
              </div>
            </div>
          </ListboxItem>
          <ListboxItem
            key="startup"
            className="flex flex-row flex-nowrap items-center justify-between"
          >
            <div className="flex flex-row flex-nowrap items-center justify-between text-base">
              <div>{t('Startup')}</div>
              <Checkbox
                isSelected={data.autoLaunch}
                onValueChange={(isSelected) => {
                  updateAutoLaunch({
                    userId,
                    autoLaunch: isSelected,
                  });
                  revalidator.revalidate();
                }}
              >
                {t('Launch V2rayX at Login')}
              </Checkbox>
            </div>
          </ListboxItem>
          <ListboxItem key="v2ray-core">
            <div className="flex flex-row flex-nowrap items-center justify-between text-base">
              <div>{t('v2ray-core')}</div>
              <Chip color="warning" variant="bordered">
                {data.v2rayCoreVersion}
              </Chip>
            </div>
          </ListboxItem>
          <ListboxItem key="Mode">
            <div className="flex flex-row flex-nowrap items-center justify-between text-base">
              <div>{t('Mode')}</div>
              <RadioGroup
                color="primary"
                value={data.proxyMode}
                onChange={(e) => {
                  updateProxyMode({
                    userId,
                    proxyMode: e.target.value,
                  });
                  revalidator.revalidate();
                }}
              >
                <div className="flex flex-row gap-4">
                  <Radio value="pac">{t('PAC mode')}</Radio>
                  <Radio value="global">{t('Global mode')}</Radio>
                  <Radio value="manual">{t('Manual mode')}</Radio>
                </div>
              </RadioGroup>
            </div>
          </ListboxItem>
        </Listbox>
      </CardBody>
    </Card>
  );
};

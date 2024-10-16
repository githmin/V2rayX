import { Card, CardHeader, CardBody, CardFooter, Divider, Link, Image } from '@nextui-org/react';
import { Listbox, ListboxItem } from '@nextui-org/react';
import { Chip } from '@nextui-org/react';
import { useTranslation } from 'react-i18next';
import { useLoaderData } from 'react-router-dom';
import { queryAppState } from '~/app/api';

export const loader = async () => {
  const userId = localStorage.getItem('userId')!;
  const data = await queryAppState({ userId });
  return {
    V2rayCoreVersion: data[0].V2rayCoreVersion,
  };
};

export const Page = () => {
  const data = useLoaderData();
  const { V2rayCoreVersion } = data.Security;
  const { t, i18n } = useTranslation();
  return (
    <div>
      <Card className="py-4">
        <CardHeader className="flex-col items-start px-4 pb-0 pt-2">
          <p className="text-tiny font-bold uppercase">{t('Security')}</p>
        </CardHeader>
        <CardBody className="overflow-visible py-2">
          <Listbox aria-label="Actions">
            <ListboxItem key="new">
              <div className="flex flex-row items-center justify-between">
                <div>{t('Current V2ray Core version:')}</div>
                <Chip color="primary">{V2rayCoreVersion}</Chip>
              </div>
            </ListboxItem>
          </Listbox>
        </CardBody>
      </Card>
    </div>
  );
};

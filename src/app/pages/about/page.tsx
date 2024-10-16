import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Divider,
  Link,
  Image,
  Button,
} from '@nextui-org/react';
import { Listbox, ListboxItem } from '@nextui-org/react';
import { Select, SelectItem } from '@nextui-org/react';
import { Checkbox } from '@nextui-org/checkbox';
import { Switch } from '@nextui-org/switch';
import { Chip } from '@nextui-org/react';
import { Input } from '@nextui-org/react';
import { Tooltip } from '@nextui-org/tooltip';
import { open } from '@tauri-apps/api/shell';
import { useTranslation } from 'react-i18next';

const Page = () => {
  const { t, i18n } = useTranslation();

  return (
    <div>
      <Card className="py-4">
        <CardBody className="overflow-visible py-8">
          <div className="flex flex-col items-center justify-center gap-8">
            <div>
              <span className="i-custom-v2ray-logo h-32 w-32" />
            </div>
            <p>An all platform (Macos Windows Linux) V2ray client build with Tauri.</p>
            <div className="flex flex-row gap-4">
              <Button onClick={() => {}} color="primary">
                {t('CHECK UPDATE')}
              </Button>
              <Button
                onClick={async () => {
                  await open('https://github.com/shaonhuang/V2rayX');
                }}
                color="primary"
              >
                {t('HOMEPAGE')}
              </Button>
              <Button
                onClick={async () => {
                  await open('https://t.me/V2rayX_electron');
                }}
                color="primary"
              >
                {t('FEEDBACK')}
              </Button>
              <Button
                onClick={async () => {
                  await open('https://github.com/shaonhuang/V2rayX#ii-features');
                }}
                color="primary"
              >
                {t('ROADMAP')}
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default Page;

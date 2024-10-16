import { Card, CardHeader, CardBody, CardFooter, Divider, Link, Image } from '@nextui-org/react';

import * as Security from './security/page';
import * as General from './general/page';
import * as Appearance from './appearance/page';
import * as SystemProxy from './system-proxy/page';
import * as Proxies from './proxies/page';
import * as V2rayConfigure from './v2ray-configure/page';

export const loader = async () => {
  return {
    Security: await Security.loader(),
    General: await General.loader(),
    Appearance: await Appearance.loader(),
    SystemProxy: await SystemProxy.loader(),
    // Proxies: await Proxies.loader(),
    V2rayConfigure: await V2rayConfigure.loader(),
  };
};

export const Page = () => {
  return (
    <div className="flex h-[500px] flex-col gap-8 overflow-scroll overflow-x-hidden">
      <Security.Page />
      <General.Page />
      <Appearance.Page />
      <SystemProxy.Page />
      <Proxies.Page />
      <V2rayConfigure.Page />
    </div>
  );
};

export { Security, General, Appearance, SystemProxy, Proxies, V2rayConfigure };

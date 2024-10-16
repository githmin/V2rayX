import { Accordion, AccordionItem, Avatar, Button } from '@nextui-org/react';
import * as Endpoint from './components/endpoint-item/page';
import * as Edit from './components/endpoint-edit/page';

import {} from '~/app/api';

export const Page = () => {
  const defaultContent =
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.';

  return (
    <div className="flex flex-row items-center justify-start gap-4">
      <div className="flex flex-col items-center justify-center gap-4">
        <Button isIconOnly>
          <span className="i-mdi-youtube-subscription" />
        </Button>
        <Button isIconOnly>
          <span className="i-mdi-link-plus" />
        </Button>
        <Button isIconOnly>
          <span className="i-mdi-qrcode-plus" />
        </Button>
        <Edit.DialogButton type="add" isIconOnly>
          <span className="i-feather-plus" />
        </Edit.DialogButton>
      </div>
      <Accordion selectionMode="multiple" className="flex-grow">
        <AccordionItem
          key="1"
          aria-label="Chung Miller"
          className="rounded-2xl bg-gradient-to-br from-[#FFB457] to-[#FF705B] px-4"
          startContent={
            <Avatar
              isBordered
              color="primary"
              radius="lg"
              icon={<span className="i-mdi-list-box-outline h-6 w-6" />}
              classNames={{
                base: 'bg-gradient-to-br from-[#FFB457] to-[#FF705B]',
                icon: 'text-black/80',
              }}
            />
          }
          subtitle="4 unread messages"
          title="Chung Miller"
        >
          <Endpoint.Page isSelected="true" />
        </AccordionItem>
      </Accordion>
    </div>
  );
};

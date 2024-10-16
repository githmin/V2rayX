import { Accordion, AccordionItem, Avatar, Button, Chip } from '@nextui-org/react';
import * as Share from './share-popover';
import * as More from './more-popover';

export const Page = (props: { id: string; state: boolean; isSelected: boolean }) => {
  const { id, state, isSelected } = props;
  return (
    <div
      className={`m-4 flex flex-row items-center justify-around rounded-2xl p-4 ${isSelected ? 'ring ring-pink-500 ring-offset-1 ring-offset-slate-50 dark:ring-offset-slate-900/50' : ''}`}
    >
      <div className="flex basis-1/2 flex-row items-center">
        <Avatar
          isBordered
          color="primary"
          radius="lg"
          icon={<span className="i-feather-server h-5 w-5" />}
          classNames={{
            base: 'bg-gradient-to-br from-[#FFB457] to-[#FF705B]',
            icon: 'text-black/80',
          }}
        />
        <div className="ml-4 flex flex-col">
          <h1 className="text-lg font-bold">NextUI</h1>
          <p className="text-sm text-gray-500">The NextUI library</p>
        </div>
      </div>
      <Chip color="success" className="basis-1/2">
        Running
      </Chip>
      <div className="ml-auto flex basis-1/4 flex-row flex-nowrap justify-end gap-4">
        <Button isIconOnly color="danger" aria-label="Like">
          <span className="i-feather-play" />
        </Button>
        <Share.ShareButton />
        <More.MoreButton />
      </div>
    </div>
  );
};

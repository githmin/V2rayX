import { Popover, PopoverTrigger, PopoverContent, Button, Input } from '@nextui-org/react';
import { Listbox, ListboxSection, ListboxItem } from '@nextui-org/listbox';
import * as Edit from '../endpoint-edit/page';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function MoreButton() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <Popover placement="top" isOpen={isOpen} onOpenChange={(open) => setIsOpen(open)}>
      <PopoverTrigger>
        <Button onClick={() => setIsOpen(true)}>
          <span className="i-mdi-dots-horizontal" />
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        {(titleProps) => (
          <div className="flex flex-col gap-2 px-1 py-2">
            <Edit.DialogButton
              type="edit"
              onClick={() => {
                setIsOpen(false);
              }}
            >
              <div className="flex flex-row items-center justify-start gap-2">
                <span className="i-feather-edit" />
                <p>Edit</p>
              </div>
            </Edit.DialogButton>
            <Button
              onClick={() => {
                setIsOpen(false);
              }}
            >
              <div className="flex flex-row items-center justify-start gap-2">
                <span className="i-feather-delete" />
                <p>Delete</p>
              </div>
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

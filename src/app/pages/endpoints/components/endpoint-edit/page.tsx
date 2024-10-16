import React, { useState, useRef } from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Switch,
  useDisclosure,
} from '@nextui-org/react';
import * as EditComponent from './components';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NiceModal, { useModal } from '@ebay/nice-modal-react';
import Editor from '@monaco-editor/react';

import {} from '~/app/api';

export const loader = async () => {
  const navigate = useNavigate();
  navigate('endpoints/add');
};

const Dialog = NiceModal.create(({ type }: { type: string }) => {
  const submitRef = useRef();

  const modal = useModal();
  const [mode, setMode] = useState('gui');

  const handleEditorChange = (value) => {
    console.log(value);
  };

  const handleValidSubmit = () => {
    console.log('should close');
  };
  return (
    <Modal
      size="4xl"
      isOpen={modal.visible}
      scrollBehavior="inside"
      onOpenChange={(v) => {
        modal.hide();
      }}
      backdrop="blur"
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">Configure Endpoint</ModalHeader>
            <ModalBody>
              <div className="flex flex-row items-center justify-between">
                <p>{`Mode: ${mode === 'gui' ? 'GUI' : 'Editor'}`}</p>
                <Switch
                  onValueChange={(e) => {
                    setMode(e ? 'editor' : 'gui');
                  }}
                >
                  Advanced
                </Switch>
              </div>
              {mode === 'gui' ? (
                <EditComponent.Page submitRef={submitRef} onValidSubmit={handleValidSubmit} />
              ) : (
                <Editor
                  className="py-2"
                  height="84vh"
                  defaultLanguage="json"
                  defaultValue={`{
  "outbounds": [
  {
   "tag": "Edit your outbounds here and keep outbounds object under outbounds array"
  },
  {
  "protocol": "freedom",
  "settings": {},
  "tag": "direct"
  },
  {
  "protocol": "blackhole",
  "settings": {},
  "tag": "blocked"
  }]
}`}
                  onChange={handleEditorChange}
                />
              )}
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={onClose}>
                Close
              </Button>
              <Button
                color="primary"
                onClick={() => {
                  submitRef.current.click();
                  // onClose();
                }}
              >
                Save
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
});

export const DialogButton = (props: {
  type: 'add' | 'edit';
  onClick?: () => void;
  isIconOnly?: boolean;
  children?: React.ReactNode;
}) => {
  const navigate = useNavigate();
  return (
    <Button
      isIconOnly={props.isIconOnly}
      onClick={() => {
        navigate(`endpoints/${props.type}`);
        props.onClick && props.onClick();
        NiceModal.show(Dialog, { type: props.type });
      }}
    >
      {props.children}
    </Button>
  );
};

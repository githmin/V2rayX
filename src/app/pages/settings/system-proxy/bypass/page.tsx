import React from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Divider,
  Link,
  Image,
  Tabs,
  Tab,
  useDisclosure,
} from '@nextui-org/react';
import { useTranslation } from 'react-i18next';
import { Select, SelectSection, SelectItem } from '@nextui-org/select';

import { Listbox, ListboxItem } from '@nextui-org/react';
import { Checkbox } from '@nextui-org/checkbox';
import { Chip } from '@nextui-org/react';
import { Input } from '@nextui-org/react';
import { Tooltip } from '@nextui-org/tooltip';
import { Navigate, useLoaderData, useRevalidator } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { Controller, type FieldErrors, useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast, { Toaster } from 'react-hot-toast';
import { useEffect, useState } from 'react';
import { queryBypass, updateBypass, Types } from '~/app/api';
import Editor from '@monaco-editor/react';
import { debounce } from 'lodash';
import * as yaml from 'js-yaml';

export const loader = async () => {
  const res = await queryBypass({ userId: localStorage.getItem('userId')! });
  return res;
};

export function Page() {
  const data = useLoaderData();
  const revalidator = useRevalidator();
  const userId = localStorage.getItem('userId')!;

  const { BypassDomains } = data.SystemProxy.Bypass as Types.BypassDomains;
  const navigate = useNavigate();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { t, i18n } = useTranslation();

  const handleEditorChange = debounce((v: string) => {
    try {
      const bypass = yaml.load(v);
      updateBypass({ userId, bypass: JSON.stringify(bypass) });
      toast.success('Save success');
      revalidator.revalidate();
    } catch (e) {
      toast.error('Invalid Yaml format');
    }
    return;
  }, 1000);

  return (
    <>
      <Button
        color="primary"
        onPress={() => {
          onOpen();
        }}
      >
        <span className="i-feather-edit" /> {t('Edit')}
      </Button>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="2xl" backdrop="blur">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">Inbounds settings</ModalHeader>
              <ModalBody className="mb-10 flex w-full flex-col items-center justify-center">
                <Card>
                  <CardBody className="gap-8 p-4">
                    <p className="text-sm text-gray-500">
                      Edit v2ray dns config, which will inject dns item when you start a proxy
                      service.
                    </p>
                    <Editor
                      className="h-48"
                      defaultLanguage="yaml"
                      value={yaml.dump(JSON.parse(BypassDomains))}
                      onChange={(v, event) => handleEditorChange(v as string)}
                    />
                  </CardBody>
                </Card>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}

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
import { Tabs, Tab } from '@nextui-org/react';
import { Textarea } from '@nextui-org/react';
import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { Controller, type FieldErrors, useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast, { Toaster } from 'react-hot-toast';
import { useEffect, useState } from 'react';
import {} from '~/app/api';

const SecuritySchema = z.object({
  serverName: z.string().min(1, { message: 'Server Name is required' }),
  publicKey: z.string().min(1, { message: 'Public Key is required' }),
  shortId: z.string().min(1, { message: 'Short Id is required' }),
  spiderX: z.string().min(1, { message: 'Spider X is required' }),
});

type SecuritySchema = z.infer<typeof SecuritySchema>;

const resolver = zodResolver(SecuritySchema);

export const Page = ({
  submitRef,
  updateValue,
  passData,
}: {
  submitRef: unknown;
  updateValue: unknown;
  passData: (setValue: Function) => void;
}) => {
  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors },
    setValue,
  } = useForm<SecuritySchema>({
    mode: 'onSubmit',
    resolver,
    defaultValues: {
      inboundId: '',
      serverName: '',
      publicKey: '',
      shortId: '',
      spiderX: '',
    },
  });

  const onSubmit: SubmitHandler<SecuritySchema> = async (data) => {
    try {
      console.log(data, 'reality data');
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <Card>
      <CardBody>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <p>Security</p>
          <Controller
            name="inboundId"
            control={control}
            render={({
              field: { name, value, onChange, onBlur, ref },
              fieldState: { invalid, error },
            }) => <Input ref={ref} name={name} type="text" className="hidden" />}
          />
          <Controller
            name="serverName"
            control={control}
            render={({
              field: { name, value, onChange, onBlur, ref },
              fieldState: { invalid, error },
            }) => (
              <Input
                ref={ref}
                name={name}
                type="text"
                label="Service Name"
                required
                value={value}
                onChange={onChange}
                onBlur={onBlur}
                isInvalid={invalid}
                errorMessage={error?.message}
              />
            )}
          />
          <Controller
            name="publicKey"
            control={control}
            render={({
              field: { name, value, onChange, onBlur, ref },
              fieldState: { invalid, error },
            }) => (
              <Input
                ref={ref}
                name={name}
                type="text"
                label="Public Key"
                required
                value={value}
                onChange={onChange}
                onBlur={onBlur}
                isInvalid={invalid}
                errorMessage={error?.message}
              />
            )}
          />
          <div className="flex flex-row items-center gap-4">
            <Controller
              name="shortId"
              control={control}
              render={({
                field: { name, value, onChange, onBlur, ref },
                fieldState: { invalid, error },
              }) => (
                <Input
                  ref={ref}
                  name={name}
                  type="text"
                  label="Short Id"
                  className="basis-1/2"
                  required
                  value={value}
                  onChange={onChange}
                  onBlur={onBlur}
                  isInvalid={invalid}
                  errorMessage={error?.message}
                />
              )}
            />
            <Controller
              name="spiderX"
              control={control}
              render={({
                field: { name, value, onChange, onBlur, ref },
                fieldState: { invalid, error },
              }) => (
                <Input
                  ref={ref}
                  name={name}
                  type="text"
                  label="Spider X"
                  className="basis-1/2"
                  required
                  value={value}
                  onChange={onChange}
                  onBlur={onBlur}
                  isInvalid={invalid}
                  errorMessage={error?.message}
                />
              )}
            />
          </div>
          <button ref={submitRef} type="submit" style={{ display: 'none' }} />
          <button
            ref={updateValue}
            style={{ display: 'none' }}
            onClick={() => {
              try {
                passData(setValue);
              } catch (e) {
                toast.error(`Failed to update settings due to ${e}.Please contact support.`);
                console.log(e);
              }
            }}
          />
        </form>
      </CardBody>
    </Card>
  );
};

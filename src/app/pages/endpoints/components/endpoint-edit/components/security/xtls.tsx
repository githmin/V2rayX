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
  allowInsecure: z.boolean(),
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
      allowInsecure: false,
    },
  });

  const onSubmit: SubmitHandler<SecuritySchema> = async (data) => {
    try {
      console.log(data, 'vmess data');
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
          <div className="flex flex-row items-center gap-4">
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
                  className="basis-3/4"
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
              name="allowInsecure"
              control={control}
              render={({
                field: { name, value, onChange, onBlur, ref },
                fieldState: { invalid, error },
              }) => (
                <div className="flex flex-grow basis-1/4 flex-row items-center justify-center">
                  <Checkbox
                    ref={ref}
                    name={name}
                    onBlur={onBlur}
                    isInvalid={invalid}
                    isSelected={value}
                    onValueChange={onChange}
                  >
                    Allow Insecure
                  </Checkbox>
                </div>
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

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

const VLessSchema = z.object({
  outboundId: z.string().min(1),
  ip: z.string().min(1, { message: 'IP is required' }),
  port: z
    .number()
    .positive({ message: 'Port is required' })
    .lte(65535, { message: 'this👏is👏too👏big' }),
  uuid: z.string().min(1, { message: 'UUID is required' }),
  flow: z.string().min(1, { message: 'Flow is required' }),
  level: z.number().min(1, { message: 'Level is required' }),
});

type VLessSchema = z.infer<typeof VLessSchema>;

const resolver = zodResolver(VLessSchema);

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
  } = useForm<VLessSchema>({
    mode: 'onSubmit',
    resolver,
    defaultValues: {
      outboundId: '',
      ip: '127.0.0.1',
      port: 443,
      uuid: '',
      flow: '',
      level: 1,
    },
  });

  const onSubmit: SubmitHandler<VLessSchema> = async (data) => {
    try {
      console.log(data, 'vless data');
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <Card>
      <CardBody>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-row items-center justify-start gap-2">
            <div>Endpoint Settings</div>
            <Tooltip
              content={
                <div className="m-2">
                  {`Check this link for configure field details`}
                  <Button
                    isIconOnly
                    className="mx-2"
                    onClick={async () => {
                      await open('https://www.v2fly.org/config/protocols/vmess.html');
                    }}
                  >
                    <span className="i-feather-external-link" />
                  </Button>
                </div>
              }
            >
              <span className="i-mdi-tooltip-help" />
            </Tooltip>
          </div>
          <Controller
            name="outboundId"
            control={control}
            render={({
              field: { name, value, onChange, onBlur, ref },
              fieldState: { invalid, error },
            }) => <Input ref={ref} name={name} type="text" className="hidden" />}
          />
          <div className="flex flex-row items-center gap-4">
            <Controller
              name="ip"
              control={control}
              render={({
                field: { name, value, onChange, onBlur, ref },
                fieldState: { invalid, error },
              }) => (
                <Input
                  ref={ref}
                  name={name}
                  type="text"
                  label="IP"
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
              name="port"
              control={control}
              render={({
                field: { name, value, onChange, onBlur, ref },
                fieldState: { invalid, error },
              }) => (
                <Input
                  ref={ref}
                  name={name}
                  type="number"
                  label="Port"
                  className="basis-1/4"
                  required
                  value={value?.toString()}
                  onChange={(e) => onChange(parseInt(e.target.value))}
                  onBlur={onBlur}
                  isInvalid={invalid}
                  errorMessage={error?.message}
                  placeholder="443"
                  endContent={<span className="i-mdi-ear-hearing" />}
                />
              )}
            />
          </div>
          <Controller
            name="uuid"
            control={control}
            render={({
              field: { name, value, onChange, onBlur, ref },
              fieldState: { invalid, error },
            }) => (
              <Input
                ref={ref}
                name={name}
                label="UUID"
                className="flex-grow"
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
              name="flow"
              control={control}
              render={({
                field: { name, value, onChange, onBlur, ref },
                fieldState: { invalid, error },
              }) => (
                <Input
                  ref={ref}
                  name={name}
                  type="text"
                  label="Flow"
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
              name="level"
              control={control}
              render={({
                field: { name, value, onChange, onBlur, ref },
                fieldState: { invalid, error },
              }) => (
                <Input
                  ref={ref}
                  name={name}
                  className="basis-1/4"
                  type="number"
                  label="Level"
                  disabled
                  required
                  value={value.toString()}
                  onChange={onChange}
                  onBlur={onBlur}
                  isInvalid={invalid}
                  errorMessage={error?.message}
                />
              )}
            />
          </div>
          <button ref={submitRef} type="submit" style={{ display: 'none' }} />
        </form>
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
      </CardBody>
    </Card>
  );
};

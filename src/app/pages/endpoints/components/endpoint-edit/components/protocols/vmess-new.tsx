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
import {
  Controller,
  type FieldErrors,
  useForm,
  SubmitHandler,
  UseFormSetValue,
} from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast, { Toaster } from 'react-hot-toast';
import {
  ReactNode,
  useEffect,
  useState,
  useImperativeHandle,
  forwardRef,
  ForwardRefRenderFunction,
} from 'react';
import { addVmess } from '~/app/api';
import { open } from '@tauri-apps/api/shell';

const algorithmTypes = [
  'auto',
  'aes-256-cfb',
  'aes-128-cfb',
  'chacha20',
  'chacha20-ietf',
  'aes-256-gcm',
  'aes-128-gcm',
].map((algorithm) => ({ key: algorithm, label: algorithm }));

const VMessSchema = z.object({
  outboundId: z.string().min(1),
  ip: z.string().min(1, { message: 'IP is required' }),
  port: z
    .number()
    .positive({ message: 'Port is required' })
    .lte(65535, { message: 'this👏is👏too👏big' }),
  uuid: z.string().min(1, { message: 'UUID is required' }),
  alterId: z
    .number()
    .gte(0, { message: 'this👏is👏too👏small' })
    .lte(65535, { message: 'this👏is👏too👏big' }),
  level: z.number().min(0, { message: 'Level is required' }),
  encryptionAlgorithm: z.string().min(1, { message: 'Encryption Algorithm is required' }),
});

type VMessSchema = z.infer<typeof VMessSchema>;

interface PageProps {
  onValidSubmit: (data: VMessSchema) => void;
  onInvalidSubmit: (errors: any) => void;
}

export interface PageRef {
  submitForm: () => void;
  setFormValue: UseFormSetValue<VMessSchema>;
}

const resolver = zodResolver(VMessSchema);

const PageComponent: ForwardRefRenderFunction<PageRef, PageProps> = (props, ref) => {
  const userId = localStorage.getItem('userId')!;
  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors, isValid },
    setValue,
  } = useForm<VMessSchema>({
    mode: 'onSubmit',
    resolver,
    defaultValues: {
      outboundId: '1123',
      ip: '127.0.0.1',
      port: 443,
      uuid: '',
      alterId: 0,
      level: 1,
      encryptionAlgorithm: 'auto',
    },
  });

  const { t } = useTranslation();

  const onSubmit: SubmitHandler<VMessSchema> = async (data) => {
    try {
      console.log(data, 'vmess data');
      await addVmess({
        userId,
        endpointId: data.outboundId,
        vmess: {
          address: data.ip,
          port: data.port,
          uuid: data.uuid,
          alterId: data.alterId,
          level: data.level,
          security: data.encryptionAlgorithm,
        },
      });
    } catch (e) {
      console.log(e);
    }
  };

  const onError = (errors: any) => {
    props.onInvalidSubmit(errors);
  };

  useImperativeHandle(ref, () => ({
    submitForm: () => {
      handleSubmit(onSubmit, onError)();
    },
    setFormValue: setValue,
  }));

  return (
    <Card>
      <CardBody>
        <form onSubmit={handleSubmit(onSubmit, onError)} className="flex flex-col gap-4">
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
              name="alterId"
              control={control}
              render={({
                field: { name, value, onChange, onBlur, ref },
                fieldState: { invalid, error },
              }) => (
                <Input
                  ref={ref}
                  name={name}
                  type="text"
                  label="Alter Id"
                  className="basis-3/4"
                  required
                  value={value?.toString()}
                  onChange={(e) => onChange(parseInt(e.target.value))}
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
          <div className="flex flex-grow flex-row justify-center">
            <Controller
              name="encryptionAlgorithm"
              control={control}
              render={({
                field: { name, value, onChange, onBlur, ref },
                fieldState: { invalid, error },
              }) => (
                <Select
                  ref={ref}
                  selectedKeys={[value]}
                  onChange={(e) => {
                    e.target.value && onChange(e.target.value);
                  }}
                  onBlur={onBlur}
                  isInvalid={invalid}
                  errorMessage={error?.message}
                  label="Encryption Algorithm"
                  className="max-w-xs"
                  defaultSelectedKeys={['auto']}
                >
                  {algorithmTypes.map((algorithm) => (
                    <SelectItem key={algorithm.key}>{algorithm.label}</SelectItem>
                  ))}
                </Select>
              )}
            />
          </div>
        </form>
      </CardBody>
    </Card>
  );
};

export const Page = forwardRef<PageRef, PageProps>(PageComponent);

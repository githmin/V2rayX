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
import { addTcpStream } from '~/app/api';

const protocols = ['none', 'http'].map((procotol) => ({ key: procotol, label: procotol }));

const TcpSchema = z.discriminatedUnion('type', [
  z.object({
    outboundId: z.string().min(1, { message: 'Outbound ID is required' }),
    type: z.literal('none'),
  }),
  z.object({
    outboundId: z.string().min(1, { message: 'Outbound ID is required' }),
    type: z.literal('http'),
    path: z.string().min(1, { message: 'Request Path is required' }),
    host: z.string().min(1, { message: 'Request Host is required' }),
  }),
]);

type TcpSchema = z.infer<typeof TcpSchema>;

const resolver = zodResolver(TcpSchema);

interface PageProps {
  onValidSubmit: (data: TcpSchema) => void;
  onInvalidSubmit: (errors: any) => void;
}

export interface PageRef {
  submitForm: () => void;
  setFormValue: UseFormSetValue<TcpSchema>;
}

const PageComponent: ForwardRefRenderFunction<PageRef, PageProps> = (props, ref) => {
  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors },
    setValue,
  } = useForm<TcpSchema>({
    mode: 'onSubmit',
    resolver,
    defaultValues: {
      outboundId: '',
      type: 'none',
    },
  });

  const onSubmit: SubmitHandler<TcpSchema> = async (data) => {
    try {
      console.log(data, 'tcp data');
      if (data.type === 'http') {
        // Access data.path and data.host
        console.log('HTTP Data:', data);
        addTcpStream({
          endpointId: data.outboundId,
          tcp: {
            header: data.type,
            requestHost: data?.path ?? null,
            requestPath: data?.host ?? null,
          },
        });
      } else {
        // Type is 'none'; data.path and data.host may not exist
        console.log('Non-HTTP Data:', data);
        addTcpStream({
          endpointId: data.outboundId,
          tcp: {
            header: data.type,
            requestHost: null,
            requestPath: null,
          },
        });
      }
    } catch (e) {
      console.log(e);
    }
  };
  const watchType = watch('type');

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
      <CardBody className="flex flex-col gap-4">
        <p>Stream Setting</p>
        <Controller
          name="outboundId"
          control={control}
          render={({
            field: { name, value, onChange, onBlur, ref },
            fieldState: { invalid, error },
          }) => <Input ref={ref} name={name} type="text" className="hidden" />}
        />
        <form onSubmit={handleSubmit(onSubmit, onError)} className="flex flex-col gap-4">
          <Controller
            name="type"
            control={control}
            render={({
              field: { name, value, onChange, onBlur, ref },
              fieldState: { invalid, error },
            }) => (
              <Select
                ref={ref}
                selectedKeys={[value]}
                label="Type"
                className="max-w-xs"
                defaultSelectedKeys={['none']}
                onChange={(e) => {
                  e.target.value && onChange(e.target.value);
                }}
                onBlur={onBlur}
                isInvalid={invalid}
                errorMessage={error?.message}
              >
                {protocols.map((protocol) => (
                  <SelectItem key={protocol.key}>{protocol.label}</SelectItem>
                ))}
              </Select>
            )}
          />

          {watchType === 'http' && (
            <>
              <Controller
                name="path"
                control={control}
                render={({
                  field: { name, value, onChange, onBlur, ref },
                  fieldState: { invalid, error },
                }) => (
                  <Input
                    ref={ref}
                    name={name}
                    type="text"
                    label="Request Path"
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
              <Controller
                name="host"
                control={control}
                render={({
                  field: { name, value, onChange, onBlur, ref },
                  fieldState: { invalid, error },
                }) => (
                  <Input
                    ref={ref}
                    name={name}
                    type="text"
                    label="Request Host"
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
            </>
          )}
        </form>
      </CardBody>
    </Card>
  );
};

export const Page = forwardRef<PageRef, PageProps>(PageComponent);

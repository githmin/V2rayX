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
import { addHysteria2Stream } from '~/app/api';

const Hysteria2Schema = z.object({
  outboundId: z.string().min(1),
  password: z.string().min(1, { message: 'Password is required' }),
  congestionType: z.string().min(1, { message: 'Congestion Type is required' }),
  congestionUp: z.number().min(1, { message: 'Congestion Upload Speed is required' }),
  congestionDown: z.number().min(1, { message: 'Congestion Download Speed is required' }),
  enableUDP: z.boolean(),
});

type Hysteria2Schema = z.infer<typeof Hysteria2Schema>;

const resolver = zodResolver(Hysteria2Schema);

const congestionType = [
  {
    key: 'bbr',
    label: 'BBR: BBR is recommended in mobile network',
  },
  {
    key: 'Brutal',
    label: 'Brutal: Brutal is recommended with stable bandwidth',
  },
];

interface PageProps {
  onValidSubmit: (data: Hysteria2Schema) => void;
  onInvalidSubmit: (errors: any) => void;
}

export interface PageRef {
  submitForm: () => void;
  setFormValue: UseFormSetValue<Hysteria2Schema>;
}

const PageComponent: ForwardRefRenderFunction<PageRef, PageProps> = (props, ref) => {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors },
    setValue,
  } = useForm<Hysteria2Schema>({
    mode: 'onSubmit',
    resolver,
    defaultValues: {
      outboundId: '',
      password: '',
      enableUDP: false,
      congestionType: 'bbr',
      congestionUp: 50,
      congestionDown: 100,
    },
  });

  const onSubmit: SubmitHandler<Hysteria2Schema> = async (data) => {
    try {
      console.log(data, 'hysteria2 data');
      await addHysteria2Stream({
        endpointId: data.outboundId,
        hysteria2: {
          password: data.password,
          type: data.congestionType,
          uploadSpeed: data.congestionUp,
          downloadSpeed: data.congestionDown,
          enableUDP: data.enableUDP,
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
      console.log('test');
    },
    setFormValue: setValue,
  }));

  return (
    <Card>
      <CardBody>
        <form onSubmit={handleSubmit(onSubmit, onError)} className="flex flex-col gap-4">
          <p>Stream Setting</p>
          <Controller
            name="outboundId"
            control={control}
            render={({
              field: { name, value, onChange, onBlur, ref },
              fieldState: { invalid, error },
            }) => <Input ref={ref} name={name} type="text" className="hidden" />}
          />
          <Controller
            name="password"
            control={control}
            render={({
              field: { name, value, onChange, onBlur, ref },
              fieldState: { invalid, error },
            }) => (
              <Input
                ref={ref}
                name={name}
                label="Password"
                className="basis-1/2"
                description={t('Authentication password: leave blank for no authentication')}
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
              name="congestionType"
              control={control}
              render={({
                field: { name, value, onChange, onBlur, ref },
                fieldState: { invalid, error },
              }) => (
                <Select
                  ref={ref}
                  value={value}
                  onChange={(e) => {
                    e.target.value && onChange(e.target.value);
                  }}
                  onBlur={onBlur}
                  isInvalid={invalid}
                  errorMessage={error?.message}
                  label="Congestion Type"
                  className="basis-1/2 pr-2"
                  selectedKeys={[value]}
                >
                  {congestionType.map((type) => (
                    <SelectItem key={type.key}>{t(type.label)}</SelectItem>
                  ))}
                </Select>
              )}
            />
            <Controller
              name="enableUDP"
              control={control}
              render={({
                field: { name, value, onChange, onBlur, ref },
                fieldState: { invalid, error },
              }) => (
                <Checkbox
                  ref={ref}
                  name={name}
                  className="basis-1/2"
                  required
                  isSelected={value}
                  onChange={onChange}
                  onBlur={onBlur}
                  isInvalid={invalid}
                  onValueChange={onChange}
                >
                  {t('Enable UDP')}
                </Checkbox>
              )}
            />
          </div>
          <div className="flex flex-row items-center gap-4">
            <Controller
              name="congestionUp"
              control={control}
              render={({
                field: { name, value, onChange, onBlur, ref },
                fieldState: { invalid, error },
              }) => (
                <Input
                  ref={ref}
                  name={name}
                  label="Congestion Upload Speed (Mbps)"
                  required
                  value={value.toString()}
                  onChange={onChange}
                  onBlur={onBlur}
                  isInvalid={invalid}
                  errorMessage={error?.message}
                />
              )}
            />
            <Controller
              name="congestionDown"
              control={control}
              render={({
                field: { name, value, onChange, onBlur, ref },
                fieldState: { invalid, error },
              }) => (
                <Input
                  ref={ref}
                  name={name}
                  label="Congestion Download Speed (Mbps)"
                  required
                  value={value?.toString()}
                  onChange={onChange}
                  onBlur={onBlur}
                  isInvalid={invalid}
                  errorMessage={error?.message}
                />
              )}
            />
          </div>
        </form>
      </CardBody>
    </Card>
  );
};

export const Page = forwardRef<PageRef, PageProps>(PageComponent);

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
import { useEffect, useState, useRef } from 'react';
import { addEndpointToLocalsBaseInfo } from '~/app/api';
import { Shadowsocks, VMess, VLess, Trojan, Hysteria2 } from './protocols';
import { Tcp, Kcp, H2, Quic, Ws, Grpc, Hysteria2 as Hysteria2Stream } from './stream';

import { SecurityNone, SecurityTls, SecurityXtls, SecurityReality } from './security/index-new';

import {
  VMess as VMessData,
  VLess as VLessData,
  Trojan as TrojanData,
  Shadowsocks as ShadowsocksData,
  Hysteria2 as Hysteria2Data,
} from '~/lib/protocol';
import { uniqueId } from 'lodash';
import { v7 as uuid } from 'uuid';

const protocolsTypes = ['shadowsocks', 'vmess', 'trojan', 'hysteria2'].map((protocol) => ({
  key: protocol,
  label: protocol.toUpperCase(),
}));

const networks = ['h2', 'kcp', 'quic', 'tcp', 'ws', 'grpc', 'hysteria2'].map((network) => ({
  key: network,
  label: network.toUpperCase(),
}));

const securityTypes = ['none', 'tls'].map((security) => ({
  key: security,
  label: security,
}));

// touch sub component update data from parent component
const useEffectOnNextRender = (callback: React.EffectCallback) => {
  const [scheduled, setScheduled] = useState(false);

  useEffect(() => {
    if (!scheduled) {
      return;
    }

    setScheduled(false);
    callback();
  }, [scheduled]);

  return () => setScheduled(true);
};

export const Page = ({ submitRef }) => {
  const outboundId = uuid();
  const userId = localStorage.getItem('userId')!;
  const [protocols, setProcotols] = useState({
    protocol: 'vmess',
    stream: 'tcp',
    security: 'none',
  });
  const [stream, setStream] = useState('tcp');
  const [security, setSecurity] = useState('none');
  const [url, setUrl] = useState(
    // 'vmess://eyAidiI6IjIiLCAicHMiOiIiLCAiYWRkIjoiNDUuNzcuNzEuMjAzIiwgInBvcnQiOiI0NDMiLCAiaWQiOiI5YmIwNTAyZS1mYjI2LTQyNWEtODZkNC05YmJhNDQxNjdlNTkiLCAiYWlkIjoiMCIsICJuZXQiOiJ3cyIsICJ0eXBlIjoibm9uZSIsICJob3N0IjoiaGloYWNrZXIuc2hvcCIsICJwYXRoIjoiL1FZQXA3VXpjIiwgInRscyI6InRscyIgfQ==',
    // 'ss://YWVzLTI1Ni1nY206ZG9uZ3RhaXdhbmcuY29t@46.17.40.57:11111#www.dongtaiwang.com%E6%B4%9B%E6%9D%89%E7%9F%B6',
    'trojan://pass@remote_host:443?flow=xtls-rprx-origin&security=xtls&sni=sni&host=remote_host#trojan',
  );

  const protocolRef = useRef(null);
  const streamRef = useRef(null);
  const securityRef = useRef(null);
  const scheduleDisplay = useEffectOnNextRender(() => {
    display();
  });
  const [protocolFactory, setProtocolFactory] = useState<any>(new VMessData(''));

  useEffect(() => {
    protocolRef.current?.setFormValue('outboundId', outboundId);
    streamRef.current?.setFormValue('outboundId', outboundId);
    securityRef.current?.setFormValue('outboundId', outboundId);
  }, [protocols.protocol, protocols.stream, protocols.security]);

  const handleShadowsocks = () => {
    const shadowsocksPageRef = protocolRef.current as Shadowsocks.PageRef | null;
    if (!shadowsocksPageRef) {
      return;
    }
    shadowsocksPageRef.setFormValue('outboundId', outboundId);
    shadowsocksPageRef.setFormValue(
      'address',
      protocolFactory.getOutbound().settings.servers[0].address,
    );
    shadowsocksPageRef.setFormValue('port', protocolFactory.getOutbound().settings.servers[0].port);
    shadowsocksPageRef.setFormValue(
      'password',
      protocolFactory.getOutbound().settings.servers[0].password,
    );
    shadowsocksPageRef.setFormValue(
      'encryptionAlgorithm',
      protocolFactory.getOutbound().settings.servers[0].method,
    );
  };

  const handleVMess = () => {
    const vmessPageRef = protocolRef.current as VMess.PageRef | null;
    if (!vmessPageRef) {
      return;
    }
    vmessPageRef.setFormValue('outboundId', outboundId);
    vmessPageRef.setFormValue('ip', protocolFactory.getOutbound().settings.vnext[0].address);
    vmessPageRef.setFormValue('port', protocolFactory.getOutbound().settings.vnext[0].port);
    vmessPageRef.setFormValue('uuid', protocolFactory.getOutbound().settings.vnext[0].users[0].id);
    vmessPageRef.setFormValue(
      'alterId',
      protocolFactory.getOutbound().settings.vnext[0].users[0].alterId,
    );
    vmessPageRef.setFormValue(
      'level',
      protocolFactory.getOutbound().settings.vnext[0].users[0].level,
    );
    vmessPageRef.setFormValue(
      'encryptionAlgorithm',
      protocolFactory.getOutbound().settings.vnext[0].users[0].security,
    );
  };
  const handleTrojan = () => {
    const trojanPageRef = protocolRef.current as Trojan.PageRef | null;
    if (!trojanPageRef) {
      return;
    }

    trojanPageRef.setFormValue('outboundId', outboundId);
    trojanPageRef.setFormValue('ip', protocolFactory.getOutbound().settings.servers[0].address);
    trojanPageRef.setFormValue('port', protocolFactory.getOutbound().settings.servers[0].port);
    trojanPageRef.setFormValue(
      'password',
      protocolFactory.getOutbound().settings.servers[0].password,
    );
  };
  const handleHysteria2 = () => {
    const hysteria2PageRef = protocolRef.current as Hysteria2.PageRef | null;
    if (!hysteria2PageRef) {
      return;
    }
    hysteria2PageRef.setFormValue('outboundId', outboundId);
    hysteria2PageRef.setFormValue(
      'address',
      protocolFactory.getOutbound().settings.servers[0].address,
    );
    hysteria2PageRef.setFormValue('port', protocolFactory.getOutbound().settings.servers[0].port);
  };

  const handleH2 = () => {
    const h2PageRef = protocolRef.current as H2.PageRef | null;
    if (!h2PageRef) {
      return;
    }
    h2PageRef.setFormValue('outboundId', outboundId);
    h2PageRef.setFormValue('path', protocolFactory.getOutbound().streamSettings.httpSettings.path);
    h2PageRef.setFormValue(
      'host',
      protocolFactory.getOutbound().streamSettings.httpSettings.host[0],
    );
  };
  const handleKcp = () => {
    const kcpPageRef = streamRef.current as Kcp.PageRef | null;
    if (!kcpPageRef) {
      return;
    }
    kcpPageRef.setFormValue('outboundId', outboundId);
    kcpPageRef.setFormValue(
      'header',
      protocolFactory.getOutbound().streamSettings.kcpSettings.header.type,
    );
    kcpPageRef.setFormValue('mtu', protocolFactory.getOutbound().streamSettings.kcpSettings.mtu);
    kcpPageRef.setFormValue('tti', protocolFactory.getOutbound().streamSettings.kcpSettings.tti);
    kcpPageRef.setFormValue(
      'uplinkCapacity',
      protocolFactory.getOutbound().streamSettings.kcpSettings.uplinkCapacity,
    );
    kcpPageRef.setFormValue(
      'downlinkCapacity',
      protocolFactory.getOutbound().streamSettings.kcpSettings.downlinkCapacity,
    );
    kcpPageRef.setFormValue(
      'congestion',
      protocolFactory.getOutbound().streamSettings.kcpSettings.congestion,
    );
    kcpPageRef.setFormValue(
      'readBufferSize',
      protocolFactory.getOutbound().streamSettings.kcpSettings.readBufferSize,
    );
    kcpPageRef.setFormValue(
      'writeBufferSize',
      protocolFactory.getOutbound().streamSettings.kcpSettings.writeBufferSize,
    );
  };

  const handleQuic = () => {
    const quicPageRef = streamRef.current as Quic.PageRef | null;
    if (!quicPageRef) {
      return;
    }
    quicPageRef.setFormValue('outboundId', outboundId);
    quicPageRef.setFormValue(
      'security',
      protocolFactory.getOutbound().streamSettings.quicSettings.security,
    );
    quicPageRef.setFormValue('key', protocolFactory.getOutbound().streamSettings.quicSettings.key);
    quicPageRef.setFormValue(
      'header',
      protocolFactory.getOutbound().streamSettings.quicSettings.header.type,
    );
  };

  const handleTcp = () => {
    const tcpPageRef = streamRef.current as Tcp.PageRef | null;
    if (!tcpPageRef) {
      return;
    }
    tcpPageRef.setFormValue('outboundId', outboundId);
    const type = protocolFactory.getOutbound().streamSettings.tcpSettings.header.type;
    tcpPageRef.setFormValue('type', type);
    if (type === 'http') {
      tcpPageRef.setFormValue(
        'host',
        protocolFactory.getOutbound().streamSettings.tcpSettings.header.request.headers.Host[0],
      );
      tcpPageRef.setFormValue(
        'path',
        protocolFactory.getOutbound().streamSettings.tcpSettings.header.request.path[0],
      );
    }
  };

  const handleWs = () => {
    const wsPageRef = streamRef.current as Ws.PageRef | null;
    if (!wsPageRef) {
      return;
    }
    wsPageRef.setFormValue('outboundId', outboundId);
    wsPageRef.setFormValue('path', protocolFactory.getOutbound().streamSettings.wsSettings.path);
    wsPageRef.setFormValue(
      'host',
      protocolFactory.getOutbound().streamSettings.wsSettings.headers.host,
    );
  };
  const handleGrpc = () => {
    const grpcPageRef = streamRef.current as Grpc.PageRef | null;
    if (!grpcPageRef) {
      return;
    }

    grpcPageRef.setFormValue('outboundId', outboundId);
    grpcPageRef.setFormValue(
      'serverName',
      protocolFactory.getOutbound().streamSettings.grpcSettings.serviceName,
    );
  };
  const handleHysteria2Stream = () => {
    const hysteria2StreamRef = streamRef.current as Hysteria2Stream.PageRef | null;
    if (!hysteria2StreamRef) {
      return;
    }

    hysteria2StreamRef.setFormValue('outboundId', outboundId);
    hysteria2StreamRef.setFormValue(
      'password',
      protocolFactory.getOutbound().streamSettings.hysteria2Settings.password,
    );
  };

  const handleTls = () => {
    const securityTlsRef = securityRef.current as SecurityTls.PageRef | null;
    if (!securityTlsRef) {
      return;
    }

    securityTlsRef.setFormValue('outboundId', outboundId);
    securityTlsRef.setFormValue(
      'serverName',
      protocolFactory.getOutbound().streamSettings.tlsSettings.serverName,
    );
    securityTlsRef.setFormValue(
      'allowInsecure',
      protocolFactory.getOutbound().streamSettings.tlsSettings.allowInsecure,
    );
  };

  const display = () => {
    switch (protocols.protocol) {
      case 'vmess':
        handleVMess();
        break;
      case 'shadowsocks':
        handleShadowsocks();
        break;
      case 'trojan':
        handleTrojan();
        break;
      case 'hysteria2':
        handleHysteria2();
        break;
      default:
        break;
    }
    switch (protocols.stream) {
      case 'tcp':
        handleTcp();
        break;
      case 'ws':
        handleWs();
        break;
      case 'grpc':
        handleGrpc();
        break;
      case 'h2':
        handleH2();
        break;
      case 'kcp':
        handleKcp();
        break;
      case 'quic':
        handleQuic();
        break;
      default:
        break;
    }
    switch (protocols.security) {
      case 'tls':
        handleTls();
        break;
    }
  };

  const handleImportUrl = () => {
    let protocol = 'vmess';
    // solve setState async problem caused empty protocolFactory
    let protocolFactory: any = new VMessData('');
    try {
      switch (true) {
        case /^vmess:\/\//i.test(url):
          setProtocolFactory(new VMessData(url));
          protocolFactory = new VMessData(url);
          protocol = 'vmess';
          break;
        case /^ss:\/\//i.test(url):
          setProtocolFactory(new ShadowsocksData(url));
          protocolFactory = new ShadowsocksData(url);
          protocol = 'shadowsocks';
          break;
        case /^trojan:\/\//i.test(url):
          setProtocolFactory(new TrojanData(url));
          protocolFactory = new TrojanData(url);
          protocol = 'trojan';
          break;
        case /^hysteria2:\/\//i.test(url):
          setProtocolFactory(new Hysteria2Data(url));
          protocolFactory = new Hysteria2Data(url);
          protocol = 'hysteria2';
          break;
      }
      // get right protocols value
      setProcotols({
        protocol,
        stream: protocolFactory.getOutbound().streamSettings?.network || 'tcp',
        security: protocolFactory.getOutbound().streamSettings?.security || 'none',
      });

      scheduleDisplay();
      console.log('protocolFactory', protocolFactory);
      toast.success('URL imported');
    } catch (error) {
      console.error(error);
      toast.error('Invalid URL or parsing error. Please report link format to developer.');
    }
  };

  const handleValidSubmit = (data: any) => {
    console.log('Form is valid:', data);
    // Proceed with your logic
  };

  const handleInvalidSubmit = (errors: any) => {
    console.log('Form is invalid:', errors);
    // Handle form errors
  };

  const triggerSubmit = () => {
    protocolRef.current?.submitForm();
    streamRef.current?.submitForm();
    securityRef.current?.submitForm();
  };

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardBody>
          <div className="flex flex-row items-end gap-2">
            <Input
              variant="underlined"
              label="Link"
              isClearable
              value={url}
              onValueChange={setUrl}
            ></Input>
            <Button
              onClick={() => {
                handleImportUrl();
              }}
            >
              <span className="i-mdi-application-import" />
            </Button>
          </div>
        </CardBody>
      </Card>
      <Select
        label="Select a protocol"
        className="w-72 max-w-xs"
        selectedKeys={[protocols.protocol]}
        required
        onChange={(e) => {
          e.target.value && setProcotols({ ...protocols, protocol: e.target.value });
        }}
      >
        {protocolsTypes.map((protocol) => (
          <SelectItem key={protocol.key}>{protocol.label}</SelectItem>
        ))}
      </Select>
      <button
        ref={submitRef}
        onClick={async () => {
          await addEndpointToLocalsBaseInfo({
            userId,
            endpointId: outboundId,
            protocol: protocols.protocol,
          });
          triggerSubmit();
        }}
        style={{ display: 'none' }}
      />

      {
        [
          <Shadowsocks.Page
            ref={protocolRef}
            onValidSubmit={handleValidSubmit}
            onInvalidSubmit={handleInvalidSubmit}
          />,
          <VMess.Page
            ref={protocolRef}
            onValidSubmit={handleValidSubmit}
            onInvalidSubmit={handleInvalidSubmit}
          />,
          <Trojan.Page
            ref={protocolRef}
            onValidSubmit={handleValidSubmit}
            onInvalidSubmit={handleInvalidSubmit}
          />,
          <Hysteria2.Page
            ref={protocolRef}
            onValidSubmit={handleValidSubmit}
            onInvalidSubmit={handleInvalidSubmit}
          />,
        ][protocolsTypes.findIndex((v) => protocols.protocol === v.key)]
      }
      <Select
        label="Stream Type"
        className="max-w-xs"
        required
        defaultSelectedKeys={['tcp']}
        selectedKeys={[protocols.stream]}
        onChange={(e) => {
          e.target.value && setProcotols({ ...protocols, stream: e.target.value });
        }}
      >
        {networks.map((network) => (
          <SelectItem key={network.key}>{network.label}</SelectItem>
        ))}
      </Select>
      {
        [
          <H2.Page
            ref={streamRef}
            onValidSubmit={handleValidSubmit}
            onInvalidSubmit={handleInvalidSubmit}
          />,
          <Kcp.Page
            ref={streamRef}
            onValidSubmit={handleValidSubmit}
            onInvalidSubmit={handleInvalidSubmit}
          />,
          <Quic.Page
            ref={streamRef}
            onValidSubmit={handleValidSubmit}
            onInvalidSubmit={handleInvalidSubmit}
          />,
          <Tcp.Page
            ref={streamRef}
            onValidSubmit={handleValidSubmit}
            onInvalidSubmit={handleInvalidSubmit}
          />,
          <Ws.Page
            ref={streamRef}
            onValidSubmit={handleValidSubmit}
            onInvalidSubmit={handleInvalidSubmit}
          />,
          <Grpc.Page
            ref={streamRef}
            onValidSubmit={handleValidSubmit}
            onInvalidSubmit={handleInvalidSubmit}
          />,
          <Hysteria2Stream.Page
            ref={streamRef}
            onValidSubmit={handleValidSubmit}
            onInvalidSubmit={handleInvalidSubmit}
          />,
        ][networks.findIndex((v) => protocols.stream === v.key)]
      }

      <Select
        label="Security"
        className="max-w-xs"
        defaultSelectedKeys={['none']}
        selectedKeys={[protocols.security]}
        required
        onChange={(e) => {
          e.target.value && setProcotols({ ...protocols, security: e.target.value });
        }}
      >
        {securityTypes.map((security) => (
          <SelectItem key={security.key}>{security.label}</SelectItem>
        ))}
      </Select>
      {
        [
          <></>,
          <SecurityTls.Page
            ref={securityRef}
            onValidSubmit={handleValidSubmit}
            onInvalidSubmit={handleInvalidSubmit}
          />,
        ][securityTypes.findIndex((v) => protocols.security === v.key)]
      }
    </div>
  );
};

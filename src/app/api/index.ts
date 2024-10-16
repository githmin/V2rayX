import Database from 'tauri-plugin-sql-api';
import { v7 as uuid } from 'uuid';
import { encode, decode } from 'js-base64';
import * as Types from './types';
import { appCacheDir, appLogDir, appDataDir } from '@tauri-apps/api/path';
import * as yaml from 'js-yaml';
import _ from 'lodash';
import { enable, isEnabled, disable } from 'tauri-plugin-autostart-api';
import toast from 'react-hot-toast';

async function initDb() {
  // sqlite path:tauri::api::path::BaseDirectory::App
  const db = await Database.load('sqlite:database.db');
  return db;
}

export const testApi = async () => {
  const db = await initDb();
  console.log(`registered for autostart? ${await isEnabled()}`);
};

export const register = async (props: { username: string; password: string }) => {
  const { username, password } = props;
  const db = await initDb();
  const bypassYaml = `
bypass:
  - 127.0.0.1
  - 192.168.0.0/16
  - 10.0.0.0/8
  - FE80::/64
  - ::1
  - FD00::/8,
  - localhost
`;
  const bypassObj = yaml.load(bypassYaml);
  const userId = uuid();

  // Insert user information
  await db.execute(
    `
      INSERT INTO User (UserId, UserName, Password) VALUES (?, ?, ?)
    `,
    [userId, username, encode(password)],
  );

  const appSettingsDefaults = {
    UserId: userId,
    AutoLaunch: 0,
    AllowSystemNotifications: 1,
    AutoStartProxy: 0,
    DashboardPopWhenStart: 1,
    AppLogsFolder: await appLogDir(),
    AutoDownloadAndInstallUpgrades: 1,
    Theme: 'default',
    CustomStyle: 0,
    FollowSystemTheme: 1,
    DarkMode: 0,
    Font: 'Arial',
    HideTrayBar: 0,
    EnhancedTrayIcon: '',
    ProxyMode: 'manual',
    BypassDomains: JSON.stringify(bypassObj),
    LatencyTestUrl: 'http://www.gstatic.com/generate_204',
    LatencyTestTimeout: 3000,
  };

  await db.execute(
    `
      INSERT INTO AppSettings (
        UserId, AutoLaunch, AllowSystemNotifications, AutoStartProxy,
        DashboardPopWhenStart, AppLogsFolder,
        AutoDownloadAndInstallUpgrades, Theme, CustomStyle,
        FollowSystemTheme, DarkMode, Font, HideTrayBar,
        EnhancedTrayIcon, ProxyMode, BypassDomains,
        LatencyTestUrl, LatencyTestTimeout
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    Object.values(appSettingsDefaults),
  );

  // Default settings for AppState
  const appStateDefaults = {
    ServiceRunningState: 0,
    V2rayCoreVersion: '5.17.0',
    AppVersion: '1.0.0',
    UserId: userId,
  };

  await db.execute(
    `
      INSERT INTO AppState (
        ServiceRunningState, V2rayCoreVersion, AppVersion, UserId
      )
      VALUES (?, ?, ?, ?)
    `,
    Object.values(appStateDefaults),
  );

  // Default settings for Inbounds
  const inboundsDefaults = [
    {
      Id: uuid(),
      Listen: '127.0.0.1',
      Port: 10871,
      Protocol: 'http',
      Tag: 'http-inbound',
      Strategy: 'default',
      Refresh: 60,
      Concurrency: 10,
      UserId: userId,
    },
    {
      Id: uuid(),
      Listen: '127.0.0.1',
      Port: 10801,
      Protocol: 'socks',
      Tag: 'socks-inbound',
      Strategy: 'default',
      Refresh: 60,
      Concurrency: 10,
      UserId: userId,
    },
    {
      Id: uuid(),
      Listen: '127.0.0.1',
      Port: 10805,
      Protocol: 'dokodemo-door',
      Tag: 'api',
      Strategy: 'default',
      Refresh: 60,
      Concurrency: 10,
      UserId: userId,
    },
  ];

  inboundsDefaults.forEach(async (inbound) => {
    await db.execute(
      `
        INSERT INTO Inbounds (
          Id, Listen, Port, Protocol, Tag, Strategy, Refresh, Concurrency, UserId
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      Object.values(inbound),
    );
  });
  await db.execute(
    `
      INSERT INTO DNS (
        UserId
      )
      VALUES (?)
    `,
    [userId],
  );
  const localEndpoints = {
    GroupId: uuid(),
    UserId: userId,
    GroupName: 'local-endpoints',
    Remark: 'Local Endpoints',
    Link: '',
    SpeedTestType: 'ping',
  };

  await db.execute(
    `
      INSERT INTO EndpointsGroups (
        GroupId, UserId, GroupName, Remark, Link, SpeedTestType
      )
      VALUES (?, ?, ?, ?, ?, ?)
    `,
    Object.values(localEndpoints),
  );
};

export const login = async (props: { username: string; password: string }) => {
  const { username, password } = props;
  const db = await initDb();
  return await db.select<Array<Types.User>>(
    `
      SELECT * FROM User WHERE UserName = ? AND Password = ?
    `,
    [username, encode(password)],
  );
};

export const updateAppState = async (props: { userId: string; data: Partial<Types.AppState> }) => {
  const db = await initDb();
  const { data, userId } = props;

  // Filter out undefined keys and prepare parts for SQL statement
  const entries = Object.entries(data).filter(([, value]) => value !== undefined);
  if (entries.length === 0) return; // Exit if no data to update

  // Prepare SQL query parts
  const sqlSetParts = entries.map(([key]) => `${key} = ?`).join(', ');
  const sqlValues = entries.map(([, value]) => value);

  // Complete SQL query
  const sqlQuery = `UPDATE AppState SET ${sqlSetParts} WHERE UserId = ?`;

  // Execute the update query
  await db.execute(sqlQuery, [...sqlValues, userId]);
};

export const queryUser = async (props: { userId: string }) => {
  const { userId } = props;
  const db = await initDb();
  return await db.select<Types.User[]>('SELECT * FROM User WHERE UserId = ?', [userId]);
};

export const queryDashboard = async (props: { userId: string }): Promise<Types.DashboardData> => {
  const { userId } = props;
  const db = await initDb();
  const results = await db.select<
    {
      Listen: string;
      Protocol: string;
      Port: string;
      AutoLaunch: number;
      ProxyMode: string;
      V2rayCoreVersion: string;
    }[]
  >(
    `
    SELECT
      i.Listen, i.Protocol, i.Port,
      a.AutoLaunch, a.ProxyMode,
      s.V2rayCoreVersion
    FROM Inbounds i
    JOIN AppSettings a ON i.UserId = a.UserId
    JOIN AppState s ON i.UserId = s.UserId
    WHERE i.UserId = ?
  `,
    [userId],
  );

  const groupedByProtocol = _.groupBy(results, 'Protocol');
  const autoLaunch = results[0]?.AutoLaunch === 1;
  const proxyMode = results[0]?.ProxyMode;
  const v2rayCoreVersion = results[0]?.V2rayCoreVersion;
  return {
    httpPort: groupedByProtocol['http']?.map((p) => ({ listen: p.Listen, port: p.Port })) || [],
    socksPort: groupedByProtocol['socks']?.map((p) => ({ listen: p.Listen, port: p.Port })) || [],
    autoLaunch,
    proxyMode,
    v2rayCoreVersion,
  };
};

export const updateAutoLaunch = async (props: { userId: string; autoLaunch: boolean }) => {
  const db = await initDb();
  await (props.autoLaunch ? enable() : disable());
  await db.execute('UPDATE AppSettings SET AutoLaunch = ? WHERE UserId = ?', [
    props.autoLaunch ? 1 : 0,
    props.userId,
  ]);
};

export const updateProxyMode = async (props: { userId: string; proxyMode: string }) => {
  const db = await initDb();
  await db.execute('UPDATE AppSettings SET ProxyMode = ? WHERE UserId = ?', [
    props.proxyMode,
    props.userId,
  ]);
};

export const queryAppState = async (props: { userId: string }) => {
  const db = await initDb();
  return await db.select<Types.AppState[]>('SELECT * FROM AppState WHERE UserId = ?', [
    props.userId,
  ]);
};

export const queryGeneralSettings = async (props: {
  userId: string;
}): Promise<Types.GeneralSettings> => {
  const db = await initDb();
  const res = await db.select<Types.AppSettings[]>('SELECT * FROM AppSettings WHERE UserId = ?', [
    props.userId,
  ]);
  return {
    autoStartProxy: res[0].AutoStartProxy === 1,
    allowSystemNotifications: res[0].AllowSystemNotifications === 1,
    dashboardPopWhenStart: res[0].DashboardPopWhenStart === 1,
    applicationLogsFolder: res[0].AppLogsFolder,
    v2rayLogsFolder: 'test',
    language: res[0].Language,
  };
};

export const updateGeneralSettings = async (props: {
  userId: string;
  general: Types.GeneralSettings;
}) => {
  const db = await initDb();
  await db.execute(
    'UPDATE AppSettings SET AutoStartProxy = ?,  AllowSystemNotifications = ?, DashboardPopWhenStart = ?, AppLogsFolder = ?, Language = ? WHERE UserId = ?',
    [
      props.general.autoStartProxy ? 1 : 0,
      props.general.allowSystemNotifications ? 1 : 0,
      props.general.dashboardPopWhenStart ? 1 : 0,
      props.general.applicationLogsFolder,
      props.general.language,
      props.userId,
    ],
  );
};

export const queryAppearance = async (props: { userId: string }): Promise<Types.Appearance> => {
  const db = await initDb();
  const res = await db.select<
    { HideTrayBar: number; Font: string; DarkMode: number; FollowSystemTheme: number }[]
  >('SELECT * FROM AppSettings WHERE UserId = ?', [props.userId]);
  return {
    theme: res[0].DarkMode === 1 ? 'dark' : res[0].FollowSystemTheme === 1 ? 'system' : 'light',
    font: res[0].Font,
    hideTrayBar: res[0].HideTrayBar === 1,
  };
};

export const updateAppearance = async (props: { userId: string; appearance: Types.Appearance }) => {
  const appearance = props.appearance;
  const db = await initDb();
  await db.execute(
    'UPDATE AppSettings SET DarkMode = ?, FollowSystemTheme = ?, HideTrayBar = ?, Font = ? WHERE UserId = ?',
    [
      appearance.theme === 'dark' ? 1 : 0,
      appearance.theme === 'system' ? 1 : 0,
      appearance.hideTrayBar ? 1 : 0,
      appearance.font,
      props.userId,
    ],
  );
};

export const queryInboundsSettings = async (props: { userId: string }): Promise<Types.Inbound[]> => {
  const db = await initDb();
  const res = (await db.select('SELECT * FROM Inbounds WHERE UserId = ?', [
    props.userId,
  ])) as Types.Inbound[];
  return res;
};

export const updateInbounds = async (props: {
  userId: string;
  inbounds: Partial<Types.Inbound>[];
}) => {
  const db = await initDb();

  for (const inbound of props.inbounds) {
    // Construct the SQL query dynamically based on provided fields
    const entries = Object.entries(inbound).filter(([key]) => key !== 'UserId' && key !== 'Id');
    if (entries.length === 0) continue; // Skip if no fields to update

    const setClause = entries.map(([key]) => `${key} = ?`).join(', ');
    const values = entries.map(([_, value]) => value);

    const query = `UPDATE Inbounds SET ${setClause} WHERE UserId = ? AND Id = ?;`;
    await db.execute(query, [...values, props.userId, inbound.Id]);
  }
};

export const queryDNS = async (props: { userId: string }): Promise<Types.DNS> => {
  const db = await initDb();
  const res = (await db.select('SELECT * FROM DNS WHERE UserId = ?', [props.userId])) as Types.DNS[];
  return res[0];
};

export const updateDNS = async (props: { userId: string; dns: string }) => {
  const db = await initDb();
  const dns = props.dns;
  db.execute('UPDATE DNS SET Value = ? WHERE UserId = ?', [props.dns, props.userId]);
};

export const queryBypass = async (props: { userId: string }): Promise<Types.BypassDomains> => {
  const db = await initDb();
  const res = (await db.select('SELECT BypassDomains FROM AppSettings WHERE UserId = ?', [
    props.userId,
  ])) as Types.BypassDomains[];
  return res[0];
};

export const updateBypass = async (props: { userId: string; bypass: string }) => {
  const db = await initDb();
  db.execute('UPDATE AppSettings SET BypassDomains = ? WHERE UserId = ?', [
    props.bypass,
    props.userId,
  ]);
};

export const queryPAC = async (props: { userId: string }): Promise<Types.PAC> => {
  const db = await initDb();
  const res = (await db.select('SELECT PAC FROM AppSettings WHERE UserId = ?', [
    props.userId,
  ])) as Types.PAC[];
  return res[0];
};

export const updatePAC = async (props: { userId: string; pac: string }) => {
  const db = await initDb();
  db.execute('UPDATE AppSettings SET PAC = ? WHERE UserId = ?', [props.pac, props.userId]);
};

export const queryEndpointsGroups = async (props: {
  userId: string;
}): Promise<Types.EndpointGroups[]> => {
  const db = await initDb();
  db.select('SELECT * FROM EndpointGroups WHERE UserId = ?', [props.userId]);
};

// initTable
// export async function createAuthTable() {
//   const db = await initDb();
//   await db.execute(`
//     CREATE TABLE IF NOT EXISTS auth (
//       id INTEGER PRIMARY KEY AUTOINCREMENT,
//       userId TEXT NOT NULL,
//       scope TEXT NOT NULL
//     )
//   `);
// }

// // 插入数据
// export async function insertAuth(userId: string, scope: string) {
//   const db = await initDb();
//   await db.execute(
//     `
//     INSERT INTO auth (userId, scope) VALUES (?, ?)
//   `,
//     [userId, scope],
//   );
// }

// // 查询数据
// export async function queryAuth() {
//   const db = await initDb();
//   return await db.select('SELECT * FROM auth');
// }

// // 更新数据
// export async function updateAuth(id: number, userId: string, scope: string) {
//   const db = await initDb();
//   await db.execute(
//     `
//     UPDATE auth SET userId = ?, scope = ? WHERE id = ?
//   `,
//     [userId, scope, id],
//   );
// }

// // 删除数据
// export async function deleteAuth(id: number) {
//   const db = await initDb();
//   await db.execute(
//     `
//     DELETE FROM auth WHERE id = ?
//   `,
//     [id],
//   );
// }
//

export const addEndpointToLocalsBaseInfo = async (props: {
  userId: string;
  endpointId: string;
  protocol: string;
}) => {
  const db = await initDb();
  const res = await db.select<
    {
      GroupId: string;
      GroupName: string;
      Link: string;
      Remark: string;
      SpeedTestType: string;
      UserId: string;
    }[]
  >('SELECT * FROM EndpointsGroups WHERE UserId = ?', [props.userId]);
  console.log(res);
  await db.execute(
    `
    INSERT INTO Endpoints (
    Id,
    Link,
    Remark,
    Latency,
    GroupId,
    SpeedTestType,
    GroupName
    ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      props.endpointId,
      res[0].Link,
      res[0].Remark,
      null,
      res[0].GroupId,
      res[0].SpeedTestType,
      res[0].GroupName,
    ],
  );
  await db.execute(
    `
    INSERT INTO Outbounds (
    OutboundId,
    Protocol,
    Tag
    ) VALUES (?, ?, ?)`,
    [props.endpointId, props.protocol, null],
  );
  const vnextID = uuid();
  // switch (props.protocol) {
  //   case 'vmess':
  //     await db.execute(
  //       `
  //       INSERT INTO VmessVnext (
  //       VnextId,
  //       Address,
  //       Port,
  //       UserId,
  //       OutboundId
  //       ) VALUES (?, ?, ?, ?, ?);
  //       INSERT INTO VmessUsers (
  //       Id,
  //       UUID,
  //       AlterId,
  //       Security,
  //       Level,
  //       VnextId
  //       )`,
  //       [vnextID, data.address, data.port, props.userId, props.endpointId].concat(
  //         uuid(),
  //         data.uuid,
  //         data.alterId,
  //         data.security,
  //         data.level,
  //         vnextID,
  //       ),
  //     );
  //   case 'vless':
  //     await db.execute(
  //       `
  //       INSERT INTO VlessVnext (
  //       VnextId,
  //       Address,
  //       Port,
  //       UserId,
  //       OutboundId
  //       ) VALUES (?, ?, ?, ?, ?);
  //       INSERT INTO VlessUsers (
  //       Id,
  //       UUID,
  //       Encryption,
  //       Level,
  //       VnextId
  //       )`,
  //       [vnextID, data.address, data.port, props.userId, props.endpointId].concat(
  //         uuid(),
  //         data.uuid,
  //         'none',
  //         data.level,
  //         vnextID,
  //       ),
  //     );
  //   case 'trojan':
  //     await db.execute(
  //       `
  //       INSERT INTO TrojanServers (
  //       Id,
  //       Address,
  //       Port,
  //       Password,
  //       Email,
  //       Level,
  //       ) VALUES (?, ?, ?, ?, ?, ?)`,
  //       [uuid(), data.address, data.port, data.password, null, data.level],
  //     );
  // }
  // await db.execute(
  //   `
  //   INSERT INTO StreamSettings (
  //   OutboundId,
  //   Security,
  //   Network ) VALUES (?, ?, ?)
  //   `,
  //   [props.endpointId, props.security, props.stream],
  // );
  // switch (props.stream) {
  //   case 'ws':
  //     await db.execute(
  //       `
  //       INSERT INTO WsSettings (
  //       OutboundId,
  //       Path,
  //       Host) VALUES (?, ?, ?)
  //       `,
  //       [props.endpointId, data.streamPath, data.streamHost],
  //     );
  //   case 'http':
  //     await db.execute(``, []);
  //   case 'quic':
  //     await db.execute(``, []);
  //   case 'grpc':
  //     await db.execute(``, []);
  //   case 'kcp':
  //     await db.execute(``, []);
  //   case 'tcp':
  //     await db.execute(``, []);
  // }
  // switch (props.security) {
  //   case 'none':
  //     await db.execute(``, []);
  //   case 'tls':
  //     await db.execute(
  //       `
  //       INSERT INTO TlsSettings (
  //       OutboundId,
  //       AllowInsecure,
  //       ServerName,
  //       FingerPrint,
  //       `,
  //       [props.endpointId, data.tlsAllowInsecure, data.tlsServerName, null],
  //     );
  // }
};
export const addVmess = async (props: {
  userId: string;
  endpointId: string;
  vmess: {
    address: string;
    port: number;
    uuid: string;
    alterId: number;
    security: string;
    level: number;
  };
}) => {
  const db = await initDb();
  const userId = props.userId;
  const endpointId = props.endpointId;
  const { address, port, alterId, security, level } = props.vmess;
  const vnextId = uuid();
  await db.execute(
    `
    INSERT INTO VmessVnext (
    VnextId,
    Address,
    Port,
    UserId,
    OutboundId
    ) VALUES (?, ?, ?, ?, ?);
    INSERT INTO VmessUsers (
    Id,
    UUID,
    AlterId,
    Security,
    Level,
    VnextId
    ) VALUES (?, ?, ?, ?, ?, ?);`,
    [vnextId, address, port, userId, endpointId].concat(
      uuid(),
      props.vmess.uuid,
      alterId,
      security,
      level,
      vnextId,
    ),
  );
};

export const addShadowsocks = async (props: {
  endpointId: string;
  shadowsocks: {
    address: string;
    port: number;
    method: string;
    password: string;
    level: number;
  };
}) => {
  const db = await initDb();
  const endpointId = props.endpointId;
  const { address, port, method, password, level } = props.shadowsocks;
  await db.execute(
    `
    INSERT INTO Shadowsocks (
    Id,
    Address,
    Port,
    Password,
    Method,
    Level
    ) VALUES (?, ?, ?, ?, ?, ?);
    `,
    [endpointId, address, port, password, method, level],
  );
};

export const addTrojan = async (props: {
  endpointId: string;
  trojan: {
    address: string;
    port: number;
    password: string;
    level: number;
  };
}) => {
  const db = await initDb();
  const endpointId = props.endpointId;
  const { address, port, password, level } = props.trojan;
  await db.execute(
    `
    INSERT INTO TrojanServers(
    Id,
    Address,
    Port,
    Password,
    Level
    ) VALUES (?, ?, ?, ?, ?);
    `,
    [endpointId, address, port, password, level],
  );
};

export const addHysteria2 = async (props: {
  endpointId: string;
  hysteria2: {
    address: string;
    port: number;
  };
}) => {
  const db = await initDb();
  const endpointId = props.endpointId;
  const { address, port } = props.hysteria2;
  await db.execute(
    `
    INSERT INTO Hysteria2(
    Id,
    Address,
    Port
    ) VALUES (?, ?, ?);
    `,
    [endpointId, address, port],
  );
};

export const addHttp2Stream = async (props: {
  endpointId: string;
  http: {
    host: string;
    path: string;
    method: string;
  };
}) => {
  const db = await initDb();
  const endpointId = props.endpointId;
  const { host, path, method } = props.http;
  await db.execute(
    `
    INSERT INTO Hysteria2(
    OutboundId,
    Host,
    Path,
    Method
    ) VALUES (?, ?, ?, ?);
    `,
    [endpointId, host, path, method],
  );
};

export const addKcpStream = async (props: {
  endpointId: string;
  kcp: {
    mtu: number;
    tti: number;
    uplinkCapacity: number;
    downlinkCapacity: number;
    congestion: boolean;
    readBufferSize: number;
    writeBufferSize: number;
    header: string;
  };
}) => {
  const db = await initDb();
  const endpointId = props.endpointId;
  const {
    mtu,
    tti,
    uplinkCapacity,
    downlinkCapacity,
    congestion,
    readBufferSize,
    writeBufferSize,
    header,
  } = props.kcp;
  await db.execute(
    `
    INSERT INTO KcpSettings (
    OutboundId,
    MTU,
    TTI,
    UplinkCapacity,
    DownlinkCapacity,
    Congestion,
    ReadBufferSize,
    WriteBufferSize,
    HeaderType
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
    `,
    [
      endpointId,
      mtu,
      tti,
      uplinkCapacity,
      downlinkCapacity,
      congestion ? 1 : 0,
      readBufferSize,
      writeBufferSize,
      header,
    ],
  );
};

export const addQuicStream = async (props: {
  endpointId: string;
  quic: {
    key: string;
    security: string;
    header: string;
  };
}) => {
  const db = await initDb();
  const endpointId = props.endpointId;
  const { key, security, header } = props.quic;
  await db.execute(
    `
    INSERT INTO Quic (
    OutboundId,
    Key,
    Security,
    HeaderType
    ) VALUES (?, ?, ?, ?);
    `,
    [endpointId, key, security, header],
  );
};

export const addTcpStream = async (props: {
  endpointId: string;
  tcp: {
    header: string;
    requestHost: string | null;
    requestPath: string | null;
  };
}) => {
  const db = await initDb();
  const endpointId = props.endpointId;
  const { header, requestHost, requestPath } = props.tcp;
  await db.execute(
    `
    INSERT INTO TcpSettings (
    OutboundId,
    HeaderType,
    RequestHost,
    RequestPath
    ) VLUES (?, ?, ?, ?)`,
    [endpointId, header, requestHost, requestPath],
  );
};

export const addWebSocketStream = async (props: {
  endpointId: string;
  stream: { path: string; host: string };
}) => {
  const db = await initDb();
  const endpointId = props.endpointId;
  const { path, host } = props.stream;
  await db.execute(
    `
    INSERT INTO WsSettings (
    OutboundId,
    Path,
    Host
    ) VALUES (?, ?, ?)`,
    [endpointId, path, host],
  );
};

export const addGrpcStream = async (props: {
  endpointId: string;
  grpc: { serviceName: string };
}) => {
  const db = await initDb();
  const endpointId = props.endpointId;
  const { serviceName } = props.grpc;
  await db.execute(
    `
    INSERT INTO GrpcSettings (
    OutboundId,
    ServiceName
    ) VALUES (?, ?)`,
    [endpointId, serviceName],
  );
};

export const addHysteria2Stream = async (props: {
  endpointId: string;
  hysteria2: {
    password: string;
    type: string;
    uploadSpeed: number;
    downloadSpeed: number;
    enableUDP: boolean;
  };
}) => {
  const db = await initDb();
  const endpointId = props.endpointId;
  const { password, type, uploadSpeed, downloadSpeed, enableUDP } = props.hysteria2;
  await db.execute(
    `
    INSERT INTO Hysteria2Settings (
    OutboundId,
    Password,
    Type,
    UploadSpeed,
    DownloadSpeed
    EnableUDP
    ) VALUES (?, ?, ?, ?, ?, ?)`,
    [endpointId, password, type, uploadSpeed, downloadSpeed, enableUDP ? 1 : 0],
  );
};

export const addTlsSecurity = async (props: {
  endpointId: string;
  security: { allowInsecure: boolean; serverName: string };
}) => {
  const db = await initDb();
  const endpointId = props.endpointId;
  const { allowInsecure, serverName } = props.security;
  await db.execute(
    `
    INSERT INTO TlsSettings (
    OutboundId,
    AllowInsecure,
    ServerName
    ) VALUES (?, ?, ?)`,
    [endpointId, allowInsecure, serverName],
  );
};

export { Types };

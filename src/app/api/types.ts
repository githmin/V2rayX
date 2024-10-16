export type User = { UserId: string; UserName: string; Password: string };

export interface DashboardData {
  httpPort: { listen: string; port: string }[];
  socksPort: { listen: string; port: string }[];
  autoLaunch: boolean;
  proxyMode: string;
  v2rayCoreVersion: string;
}

export interface AppState {
  ServiceRunningState: number;
  V2rayCoreVersion: string;
  AppVersion: string;
  UserId: string;
  LoginState: number;
}

export interface AppSettings {
  UserId: string;
  AutoLaunch: number;
  AllowSystemNotifications: number;
  AutoStartProxy: number;
  DashboardPopWhenStart: number;
  AppLogsFolder: string;
  AutoDownloadAndInstallUpgrades: number;
  Theme: string;
  CustomStyle: number;
  FollowSystemTheme: number;
  DarkMode: number;
  Font: string;
  HideTrayBar: number;
  EnhancedTrayIcon: string;
  ProxyMode: string;
  BypassDomains: string;
  LatencyTestUrl: string;
  LatencyTestTimeout: number;
  Language: string;
}

export interface GeneralSettings {
  allowSystemNotifications: boolean;
  autoStartProxy: boolean;
  dashboardPopWhenStart: boolean;
  applicationLogsFolder: string;
  v2rayLogsFolder: string;
  language: string;
}

export interface Appearance {
  hideTrayBar: boolean;
  font: string;
  theme: 'light' | 'dark' | 'system';
}

export interface Inbound {
  Listen: string;
  Port: number;
  Protocol: string;
  Tag: string;
  Strategy: string;
  Refresh: number;
  Concurrency: number;
  UserId: string;
  Id: string;
}

export interface DNS {
  UserId: string;
  Value: string;
}

export interface BypassDomains {
  BypassDomains: string;
}

export interface PAC {
  PAC: string;
}

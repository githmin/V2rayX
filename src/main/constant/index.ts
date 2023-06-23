import os from 'os';
import path from 'path';
import { app } from 'electron';
import isDev from 'electron-is-dev';

export const ignoredHosts =
  'FE80::/64, 127.0.0.1/8, ::1, FD00::/8, 192.168.0.0/16, 10.0.0.0/8, localhost';

export const ignoredHosts_win =
  'localhost;127.*;10.*;172.16.*;172.17.*;172.18.*;172.19.*;172.20.*;172.21.*;172.22.*;172.23.*;172.24.*;172.25.*;172.26.*;172.27.*;172.28.*;172.29.*;172.30.*;172.31.*;192.168.*';



const electronAppPath = app.getPath('appData');

export const ssrProtocol = 'ssr';
export const ssProtocol = 'ss';
export const ssPrefix = `${ssProtocol}:`;
export const ssrPrefix = `${ssrProtocol}:`;
export const isInspect = process.env.INSPECT;
export const platform = os.platform();
export const isMacOS = platform === 'darwin';
export const isWindows = platform === 'win32';
export const isLinux = platform === 'linux';
export const packageName = 'shadowsocks-electron';
export const appDataPath = path.join(electronAppPath, packageName);
export const pathRuntime = path.join(appDataPath, 'runtime/');
export const pathExecutable = isDev
  ? app.getAppPath()
  : (
    isMacOS
      ? path.join(path.dirname(app.getPath('exe')), '..')
      : path.dirname(app.getPath('exe'))
  );

export const archMap = new Map([
  ['aarch64', 'arm64'],
  ['x86', 'ia32'],
  ['x64', 'x64'],
  ['ia32', 'ia32'],
  ['arm64', 'arm64']
]);

export const getPathRoot = (p: string) => path.join(appDataPath, p);
export const getPathRuntime = (p: string) => path.join(pathRuntime, p);
export const pacDir = getPathRuntime('pac');
export const binDir = getPathRuntime('bin');
export const globalPacConf = path.resolve(pacDir, "gfwlist.txt");
export const userPacConf = path.resolve(pacDir, "gfwlist-user.txt");

export default {
  packageName,
  platform,
  isInspect,
  isMacOS,
  appDataPath,
  pathRuntime,
  pathExecutable,
  getPathRoot,
  getPathRuntime
};

import '@fontsource/open-sans';
import Mantine from './components/Mantine';
import { TauriProvider } from './tauri/TauriProvider';
import { TitleBar } from './tauri/TitleBar';
import NiceModal from '@ebay/nice-modal-react';

export default function ({ children }: { children: React.ReactNode }) {
  return (
    <TauriProvider>
      <NiceModal.Provider>{children}</NiceModal.Provider>
    </TauriProvider>
  );
}

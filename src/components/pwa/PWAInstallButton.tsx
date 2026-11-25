import { useState } from 'react';
import { Download, Smartphone } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { Modal } from '../ui/Modal';

export function PWAInstallButton({ compact = false }: { compact?: boolean }) {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);

  // Suppress install CTA when already launched in installed standalone PWA mode
  if (isInstalled) {
    return null;
  }

  const handleClick = async () => {
    if (isInstallable) {
      await install();
      return;
    }
    setShowGuide(true);
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className={`inline-flex items-center gap-1.5 rounded-xl border border-[#0070F3] bg-[#0070F3] font-bold text-white shadow-sm shadow-[#0070F3]/25 transition-colors hover:bg-[#005DD1] whitespace-nowrap ${
          compact ? 'px-3 py-1.5 text-xs' : 'px-3.5 py-2 text-xs'
        }`}
      >
        <Download className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        <span>{isIOS ? 'Install on iOS' : 'Install App'}</span>
      </button>

      <Modal
        open={showGuide}
        onClose={() => setShowGuide(false)}
        title={isIOS ? 'Install on iPhone / iPad' : 'Install MediCore 3D on Android'}
        subtitle="Add MediCore 3D directly to your home screen for full-screen offline access."
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-xl border border-[#BFDBFE] bg-[#EFF6FF] p-4">
            <Smartphone className="mt-0.5 h-5 w-5 shrink-0 text-[#0070F3]" />
            {isIOS ? (
              <ol className="space-y-1.5 text-xs font-medium text-[#05080F]">
                <li>
                  1. Open this app directly in <strong>Safari</strong> (not inside an embedded preview frame).
                </li>
                <li>
                  2. Tap the <strong>Share</strong> icon in the Safari toolbar.
                </li>
                <li>
                  3. Scroll down and tap <strong>Add to Home Screen</strong>.
                </li>
              </ol>
            ) : (
              <ol className="space-y-1.5 text-xs font-medium text-[#05080F]">
                <li>
                  1. Open the <strong>Shared App URL</strong> directly in <strong>Google Chrome</strong> on Android (if viewing inside a preview frame, open it in a full browser tab first).
                </li>
                <li>
                  2. Tap Chrome&apos;s <strong>⋮</strong> menu in the top-right corner.
                </li>
                <li>
                  3. Tap <strong>Install app</strong> or <strong>Add to Home screen</strong> to install it with the MediCore 3D icon.
                </li>
              </ol>
            )}
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setShowGuide(false)}
              className="rounded-lg bg-[#0070F3] px-4 py-2 text-xs font-bold text-white hover:bg-[#005DD1]"
            >
              Got it
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}

import { useEffect, useRef, useState, type KeyboardEvent, type MouseEvent, type PointerEvent } from 'react';
import { mdiDeleteOutline, mdiDownloadOutline } from '@mdi/js';
import QRCode from 'qrcode';
import type { SharedListHistoryEntry } from '../types';
import { useI18n } from '../lib/i18n';
import { extractSharedListId } from '../lib/sharedLinks';

type BarcodeDetectorResult = {
  rawValue?: string;
};

type BarcodeDetectorInstance = {
  detect: (source: HTMLVideoElement) => Promise<BarcodeDetectorResult[]>;
};

type BarcodeDetectorConstructor = new (options?: { formats?: string[] }) => BarcodeDetectorInstance;
type SharedInputValidation =
  | { state: 'valid'; listId: string; normalizedValue: string }
  | { state: 'invalid' }
  | { state: 'missing'; listId: string; normalizedValue: string }
  | { state: 'unavailable' };
type ScannerState = 'scanning' | 'ready' | 'missing';
type SharedInputStatus = 'idle' | 'checking' | 'valid' | 'missing' | 'invalid';

type SharedListPanelProps = {
  canUseBackend: boolean;
  canCreateSharedLink: boolean;
  resolvedTheme: 'light' | 'dark';
  shareLink?: string;
  isCreatingShareLink: boolean;
  isRefreshingSharedList: boolean;
  isLoadingSharedList: boolean;
  shareError?: string;
  historyEntries: SharedListHistoryEntry[];
  onCreateSharedLink: () => void;
  onRefreshSharedList: () => void;
  onLoadSharedInput: (value: string) => Promise<boolean>;
  onValidateSharedInput: (value: string) => Promise<SharedInputValidation>;
  onLoadHistoryEntry: (listId: string) => Promise<boolean>;
  onDeleteHistoryEntry: (listId: string) => void;
};

const formatTimestamp = (value: string | undefined, locale: string): string =>
  value ? new Date(value).toLocaleString(locale) : '';

const QR_CANVAS_SIZE = 320;
const QR_LOGO_SIZE = 72;
const HISTORY_CARD_TAP_THRESHOLD_PX = 10;
const appBasePath = import.meta.env.BASE_URL === '/' ? '' : import.meta.env.BASE_URL.replace(/\/$/, '');
const qrLogoPath = (theme: 'light' | 'dark'): string =>
  `${import.meta.env.BASE_URL}${theme === 'dark' ? 'qr-logo-dark.png' : 'qr-logo-light.png'}`;

const loadImage = async (src: string): Promise<HTMLImageElement> =>
  await new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Unable to load image: ${src}`));
    image.src = src;
  });

const createThemedQrDataUrl = async (shareLink: string, theme: 'light' | 'dark'): Promise<string> => {
  const canvas = document.createElement('canvas');
  canvas.width = QR_CANVAS_SIZE;
  canvas.height = QR_CANVAS_SIZE;
  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('Unable to create QR canvas context');
  }

  const palette =
    theme === 'dark'
      ? {
          background: '#182235',
          dots: '#edf2ff',
        }
      : {
          background: '#f9fafc',
          dots: '#18202b',
        };

  context.clearRect(0, 0, QR_CANVAS_SIZE, QR_CANVAS_SIZE);
  context.fillStyle = palette.background;
  context.fillRect(0, 0, QR_CANVAS_SIZE, QR_CANVAS_SIZE);

  const qrCanvas = document.createElement('canvas');
  await QRCode.toCanvas(qrCanvas, shareLink, {
    errorCorrectionLevel: 'H',
    margin: 0,
    width: QR_CANVAS_SIZE,
    color: {
      dark: palette.dots,
      light: palette.background,
    },
  });

  const qrSize = qrCanvas.width;
  const qrOffset = Math.round((QR_CANVAS_SIZE - qrSize) / 2);
  context.drawImage(qrCanvas, qrOffset, qrOffset, qrSize, qrSize);

  const logo = await loadImage(qrLogoPath(theme));
  const logoImageOffset = Math.round((QR_CANVAS_SIZE - QR_LOGO_SIZE) / 2);
  context.drawImage(logo, logoImageOffset, logoImageOffset, QR_LOGO_SIZE, QR_LOGO_SIZE);

  return canvas.toDataURL('image/png');
};

export function SharedListPanel({
  canUseBackend,
  canCreateSharedLink,
  resolvedTheme,
  shareLink,
  isCreatingShareLink,
  isRefreshingSharedList,
  isLoadingSharedList,
  shareError,
  historyEntries,
  onCreateSharedLink,
  onRefreshSharedList,
  onLoadSharedInput,
  onValidateSharedInput,
  onLoadHistoryEntry,
  onDeleteHistoryEntry,
}: SharedListPanelProps) {
  const { locale, messages } = useI18n();
  const [qrDataUrl, setQrDataUrl] = useState<string>();
  const [qrRevealed, setQrRevealed] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scannerMessage, setScannerMessage] = useState<string>();
  const [scannerState, setScannerState] = useState<ScannerState>('scanning');
  const [scannerSupported, setScannerSupported] = useState(false);
  const [sharedInput, setSharedInput] = useState('');
  const [sharedInputStatus, setSharedInputStatus] = useState<SharedInputStatus>('idle');
  const videoRef = useRef<HTMLVideoElement>(null);
  const qrHideTimeoutRef = useRef<number>();
  const historyPointerRef = useRef<{ listId: string; x: number; y: number; moved: boolean } | null>(null);

  useEffect(() => {
    if (qrHideTimeoutRef.current) {
      window.clearTimeout(qrHideTimeoutRef.current);
    }
    setQrRevealed(false);
    setQrModalOpen(false);
  }, [shareLink]);

  useEffect(() => {
    if (qrHideTimeoutRef.current) {
      window.clearTimeout(qrHideTimeoutRef.current);
    }

    if (!qrRevealed || qrModalOpen) {
      return;
    }

    qrHideTimeoutRef.current = window.setTimeout(() => {
      setQrRevealed(false);
    }, 30_000);

    return () => {
      if (qrHideTimeoutRef.current) {
        window.clearTimeout(qrHideTimeoutRef.current);
      }
    };
  }, [qrModalOpen, qrRevealed]);

  useEffect(() => {
    let cancelled = false;

    if (!shareLink) {
      setQrDataUrl(undefined);
      return;
    }

    void createThemedQrDataUrl(shareLink, resolvedTheme)
      .then((value) => {
        if (!cancelled) {
          setQrDataUrl(value);
        }
      })
      .catch((error: unknown) => {
        console.warn('Unable to generate themed QR code.', error);
        if (!cancelled) {
          setQrDataUrl(undefined);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [resolvedTheme, shareLink]);

  useEffect(() => {
    const BarcodeDetectorApi = (window as Window & { BarcodeDetector?: BarcodeDetectorConstructor }).BarcodeDetector;
    setScannerSupported(Boolean(BarcodeDetectorApi && navigator.mediaDevices?.getUserMedia));
  }, []);

  useEffect(() => {
    if (!canUseBackend || !sharedInput.trim()) {
      setSharedInputStatus('idle');
      return;
    }

    let cancelled = false;
    setSharedInputStatus('checking');

    const timeoutId = window.setTimeout(() => {
      void onValidateSharedInput(sharedInput).then((validation) => {
        if (cancelled) return;

        if (validation.state === 'valid') {
          setSharedInputStatus('valid');
          return;
        }

        if (validation.state === 'missing') {
          setSharedInputStatus('missing');
          return;
        }

        if (validation.state === 'invalid') {
          setSharedInputStatus('invalid');
          return;
        }

        setSharedInputStatus('idle');
      });
    }, 220);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [canUseBackend, onValidateSharedInput, sharedInput]);

  useEffect(() => {
    if (!scannerOpen) return;

    const BarcodeDetectorApi = (window as Window & { BarcodeDetector?: BarcodeDetectorConstructor }).BarcodeDetector;
    if (!BarcodeDetectorApi) {
      setScannerMessage(messages.sharing.scannerUnsupported);
      setScannerOpen(false);
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      setScannerMessage(messages.sharing.cameraUnavailable);
      setScannerOpen(false);
      return;
    }

    let stream: MediaStream | undefined;
    let cancelled = false;
    let timeoutId: number | undefined;
    let lastHandledRawValue: string | undefined;

    const stop = () => {
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
      stream?.getTracks().forEach((track) => track.stop());
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };

    const detector = new BarcodeDetectorApi({ formats: ['qr_code'] });

    const scheduleScan = (delay = 300) => {
      timeoutId = window.setTimeout(() => {
        void scan();
      }, delay);
    };

    const scan = async () => {
      if (cancelled || !videoRef.current) return;

      try {
        const results = await detector.detect(videoRef.current);
        const value = results.find((result) => typeof result.rawValue === 'string')?.rawValue?.trim();
        if (!value) {
          scheduleScan();
          return;
        }

        if (value === lastHandledRawValue) {
          scheduleScan();
          return;
        }

        const validation = await onValidateSharedInput(value);
        if (cancelled) return;

        if (validation.state === 'invalid') {
          scheduleScan();
          return;
        }

        if (validation.state === 'unavailable') {
          setScannerMessage(messages.sharing.connectBackendFirst);
          setScannerOpen(false);
          stop();
          return;
        }

        lastHandledRawValue = value;
        setSharedInput(validation.listId);

        if (validation.state === 'missing') {
          setSharedInputStatus('missing');
          setScannerState('missing');
          setScannerMessage(messages.sharing.scannerListMissing);
          timeoutId = window.setTimeout(() => {
            if (cancelled) return;
            setScannerState('scanning');
            setScannerMessage(undefined);
            void scan();
          }, 1200);
          return;
        }

        setSharedInputStatus('valid');
        setScannerState('ready');
        setScannerMessage(messages.sharing.scannerReady);
        timeoutId = window.setTimeout(() => {
          if (cancelled) return;
          setScannerOpen(false);
          setScannerState('scanning');
          setScannerMessage(undefined);
          stop();
        }, 500);
        return;
      } catch {
        // Ignore individual detect failures while the camera is open.
      }

      scheduleScan();
    };

    const start = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: 'environment' },
          },
        });

        if (cancelled || !videoRef.current) {
          stop();
          return;
        }

        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setScannerState('scanning');
        setScannerMessage(undefined);
        void scan();
      } catch {
        setScannerMessage(messages.sharing.scannerOpenFailed);
        setScannerOpen(false);
        stop();
      }
    };

    void start();

    return () => {
      cancelled = true;
      stop();
    };
  }, [
    messages.sharing.cameraUnavailable,
    messages.sharing.connectBackendFirst,
    messages.sharing.scannerListMissing,
    messages.sharing.scannerOpenFailed,
    messages.sharing.scannerReady,
    messages.sharing.scannerUnsupported,
    onValidateSharedInput,
    scannerOpen,
  ]);

  const handleLoadSharedList = async () => {
    const loaded = await onLoadSharedInput(sharedInput);
    if (loaded) {
      setSharedInput('');
      setSharedInputStatus('idle');
      setScannerMessage(undefined);
    }
  };

  const localeCode = locale === 'en' ? 'en-GB' : locale;
  const handleQrCardClick = () => {
    if (!qrRevealed) {
      setQrRevealed(true);
      return;
    }

    if (qrHideTimeoutRef.current) {
      window.clearTimeout(qrHideTimeoutRef.current);
    }
    setQrModalOpen(true);
  };
  const closeQrModal = () => {
    setQrModalOpen(false);
  };
  const closeScanner = () => {
    setScannerOpen(false);
    setScannerState('scanning');
    setScannerMessage(undefined);
  };
  const scannerStatusText =
    scannerState === 'missing'
      ? messages.sharing.scannerListMissing
      : scannerState === 'ready'
        ? messages.sharing.scannerReady
        : messages.sharing.scannerInstructions;
  const showSharedInputTick = sharedInputStatus === 'valid';
  const isActionTarget = (target: EventTarget | null): boolean =>
    target instanceof Element && target.closest('button') !== null;
  const handleHistoryPointerDown = (listId: string, event: PointerEvent<HTMLDivElement>) => {
    if (isActionTarget(event.target)) return;
    historyPointerRef.current = { listId, x: event.clientX, y: event.clientY, moved: false };
  };
  const handleHistoryPointerMove = (listId: string, event: PointerEvent<HTMLDivElement>) => {
    const activePointer = historyPointerRef.current;
    if (!activePointer || activePointer.listId !== listId) return;

    const deltaX = Math.abs(event.clientX - activePointer.x);
    const deltaY = Math.abs(event.clientY - activePointer.y);
    if (deltaX > HISTORY_CARD_TAP_THRESHOLD_PX || deltaY > HISTORY_CARD_TAP_THRESHOLD_PX) {
      historyPointerRef.current = { ...activePointer, moved: true };
    }
  };
  const handleHistoryClick = (listId: string, event: MouseEvent<HTMLDivElement>) => {
    if (isActionTarget(event.target)) return;
    const activePointer = historyPointerRef.current;
    historyPointerRef.current = null;
    if (activePointer?.listId === listId && activePointer.moved) return;
    void onLoadHistoryEntry(listId);
  };
  const handleHistoryPointerCancel = () => {
    historyPointerRef.current = null;
  };
  const handleHistoryKeyDown = (listId: string, event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    void onLoadHistoryEntry(listId);
  };
  const normalizeSharedInput = (value: string): string => {
    const normalized = extractSharedListId(value, appBasePath, window.location.origin);
    return normalized ?? value;
  };

  return (
    <div className="stack">
      {shareLink ? (
        <>
          <div className="field">
            <label htmlFor="shopping-share-link">{messages.labels.sharedLink}</label>
            <div className="inline-row share-link-row">
              <input id="shopping-share-link" className="input" readOnly value={shareLink} />
              <button type="button" className="button" onClick={() => void navigator.clipboard?.writeText(shareLink)}>
                {messages.actions.copy}
              </button>
              <button
                type="button"
                className="button"
                onClick={onRefreshSharedList}
                disabled={isRefreshingSharedList || !canUseBackend}
              >
                {isRefreshingSharedList ? messages.actions.refreshing : messages.actions.refresh}
              </button>
            </div>
          </div>

          {qrDataUrl ? (
            <button
              type="button"
              className={`share-qr-card ${qrRevealed ? '' : 'share-qr-card-blurred'}`.trim()}
              onClick={handleQrCardClick}
            >
              <img className="share-qr-image" src={qrDataUrl} alt={messages.actions.revealQrCode} />
              {!qrRevealed ? <span className="share-qr-overlay">{messages.actions.revealQrCode}</span> : null}
            </button>
          ) : null}
        </>
      ) : canUseBackend ? (
        <button
          type="button"
          className="button button-primary"
          onClick={onCreateSharedLink}
          disabled={isCreatingShareLink || !canCreateSharedLink}
          aria-label={messages.actions.createSharedLink}
          title={messages.actions.createSharedLink}
        >
          {isCreatingShareLink ? messages.actions.creating : messages.actions.createSharedLink}
        </button>
      ) : (
        <div className="empty-state">{messages.pages.edit.sharingUnavailable}</div>
      )}

      {canUseBackend ? (
        <>
          <div className="field">
            <label htmlFor="shared-list-load-input">{messages.sharing.manualLinkLabel}</label>
            <div className="inline-row share-load-row">
              <div className={`shared-input-shell ${showSharedInputTick ? 'shared-input-shell-valid' : ''}`.trim()}>
                <input
                  id="shared-list-load-input"
                  className="input shared-input"
                  value={sharedInput}
                  onChange={(event) => setSharedInput(normalizeSharedInput(event.target.value))}
                  onPaste={(event) => {
                    const pastedText = event.clipboardData.getData('text');
                    const normalized = normalizeSharedInput(pastedText);
                    if (normalized === pastedText) return;
                    event.preventDefault();
                    setSharedInput(normalized);
                  }}
                  placeholder={messages.sharing.manualLinkPlaceholder}
                />
                {showSharedInputTick ? (
                  <span className="shared-input-tick" aria-hidden="true">
                    ✓
                  </span>
                ) : null}
              </div>
              <button
                type="button"
                className="button button-primary"
                onClick={() => void handleLoadSharedList()}
                disabled={isLoadingSharedList || !sharedInput.trim()}
              >
                {messages.actions.loadSharedList}
              </button>
              {scannerSupported ? (
                <button type="button" className="button" onClick={() => setScannerOpen(true)}>
                  {messages.actions.scanQrCode}
                </button>
              ) : null}
            </div>
          </div>
        </>
      ) : null}

      {shareError ? <div className="small-text">{shareError}</div> : null}
      {scannerMessage && !scannerOpen ? <div className="small-text">{scannerMessage}</div> : null}

      <div className="stack">
        <h3 className="title title-xs">{messages.sharing.recentListsTitle}</h3>
        {historyEntries.length === 0 ? (
          <div className="empty-state">{messages.sharing.recentListsEmpty}</div>
        ) : (
          <div className="stack">
            {historyEntries.map((entry) => (
              <div
                key={entry.listId}
                className="shared-history-item"
                role="button"
                tabIndex={0}
                aria-label={messages.actions.loadSharedList}
                title={messages.actions.loadSharedList}
                onKeyDown={(event) => handleHistoryKeyDown(entry.listId, event)}
                onPointerDown={(event) => handleHistoryPointerDown(entry.listId, event)}
                onPointerMove={(event) => handleHistoryPointerMove(entry.listId, event)}
                onPointerCancel={handleHistoryPointerCancel}
                onClick={(event) => handleHistoryClick(entry.listId, event)}
              >
                <div className="stack shared-history-content">
                  <div className="shared-history-title-wrap">
                    <div className="shared-history-title">{entry.itemPreview.join(' · ') || messages.sharing.emptyList}</div>
                  </div>
                  <div className="small-text">
                    {messages.labels.created} {formatTimestamp(entry.createdAt, localeCode)} · {messages.labels.updated}{' '}
                    {formatTimestamp(entry.updatedAt, localeCode)}
                  </div>
                </div>
                <div className="shared-history-actions">
                  <button
                    type="button"
                    className="button button-icon"
                    onClick={(event) => {
                      event.stopPropagation();
                      void onLoadHistoryEntry(entry.listId);
                    }}
                    disabled={isLoadingSharedList || !canUseBackend}
                    aria-label={messages.actions.loadSharedList}
                    title={messages.actions.loadSharedList}
                  >
                    <svg aria-hidden="true" className="button-icon-svg" viewBox="0 0 24 24">
                      <path d={mdiDownloadOutline} fill="currentColor" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    className="button button-icon"
                    onClick={(event) => {
                      event.stopPropagation();
                      onDeleteHistoryEntry(entry.listId);
                    }}
                    aria-label={messages.actions.remove}
                    title={messages.actions.remove}
                  >
                    <svg aria-hidden="true" className="button-icon-svg" viewBox="0 0 24 24">
                      <path d={mdiDeleteOutline} fill="currentColor" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {scannerOpen ? (
        <div className="share-scanner-modal" onClick={closeScanner} role="presentation">
          <div className="share-scanner-dialog stack" onClick={(event) => event.stopPropagation()}>
            <div className="share-scanner-toolbar">
              <h3 className="title title-xs">{messages.actions.scanQrCode}</h3>
              <button type="button" className="button" onClick={closeScanner}>
                {messages.actions.stopScanning}
              </button>
            </div>
            <div className={`share-scanner-frame share-scanner-frame-${scannerState}`}>
              <video ref={videoRef} className="share-scanner-video" muted playsInline />
              <div className="share-scanner-overlay">
                <div className="share-scanner-target" />
              </div>
            </div>
            <div className="share-scanner-status">{scannerStatusText}</div>
          </div>
        </div>
      ) : null}

      {qrModalOpen && qrDataUrl ? (
        <div className="share-scanner-modal" onClick={closeQrModal} role="presentation">
          <div className="share-qr-dialog" onClick={(event) => event.stopPropagation()}>
            <img className="share-qr-image share-qr-image-large" src={qrDataUrl} alt={messages.labels.sharedLink} />
          </div>
        </div>
      ) : null}
    </div>
  );
}

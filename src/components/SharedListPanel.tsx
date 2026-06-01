import { useEffect, useRef, useState, type MouseEvent, type PointerEvent } from 'react';
import { mdiDeleteOutline, mdiDownloadOutline } from '@mdi/js';
import QRCode from 'qrcode';
import type { SharedListHistoryEntry } from '../types';
import { classNames } from '../lib/classNames';
import { useI18n } from '../lib/i18n';
import { extractSharedListId } from '../lib/sharedLinks';
import st from './SharedListPanel.module.scss';
import { p } from '../styles/primitives';

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
type QrRender = {
  logoSrc: string;
  svgDataUrl: string;
};

type SharedListPanelProps = {
  listName: string;
  canUseBackend: boolean;
  canCreateSharedLink: boolean;
  resolvedTheme: 'light' | 'dark';
  shareLink?: string;
  isCreatingShareLink: boolean;
  isRefreshingSharedList: boolean;
  isLoadingSharedList: boolean;
  shareError?: string;
  onCreateSharedLink: () => void;
  onRefreshSharedList: () => void;
  onLoadSharedInput: (value: string) => Promise<boolean>;
  onValidateSharedInput: (value: string) => Promise<SharedInputValidation>;
};

type SharedListHistoryPanelProps = {
  canUseBackend: boolean;
  isLoadingSharedList: boolean;
  historyEntries: SharedListHistoryEntry[];
  onLoadHistoryEntry: (listId: string) => Promise<boolean>;
  onDeleteHistoryEntry: (listId: string) => void;
};

const formatTimestamp = (value: string | undefined, locale: string): string =>
  value ? new Date(value).toLocaleString(locale) : '';

const QR_CANVAS_SIZE = 320;
const HISTORY_CARD_TAP_THRESHOLD_PX = 10;
const appBasePath = import.meta.env.BASE_URL === '/' ? '' : import.meta.env.BASE_URL.replace(/\/$/, '');
const qrLogoPath = (theme: 'light' | 'dark'): string =>
  `${import.meta.env.BASE_URL}${theme === 'dark' ? 'qr-logo-dark.png' : 'qr-logo-light.png'}`;

const createThemedQrRender = async (shareLink: string, theme: 'light' | 'dark'): Promise<QrRender> => {
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

  const svg = await QRCode.toString(shareLink, {
    type: 'svg',
    errorCorrectionLevel: 'H',
    margin: 0,
    width: QR_CANVAS_SIZE,
    color: {
      dark: palette.dots,
      light: palette.background,
    },
  });

  return {
    logoSrc: qrLogoPath(theme),
    svgDataUrl: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
  };
};

export function SharedListPanel({
  listName,
  canUseBackend,
  canCreateSharedLink,
  resolvedTheme,
  shareLink,
  isCreatingShareLink,
  isRefreshingSharedList,
  isLoadingSharedList,
  shareError,
  onCreateSharedLink,
  onRefreshSharedList,
  onLoadSharedInput,
  onValidateSharedInput,
}: SharedListPanelProps) {
  const { messages } = useI18n();
  const [qrRender, setQrRender] = useState<QrRender>();
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
      setQrRender(undefined);
      return;
    }

    void createThemedQrRender(shareLink, resolvedTheme)
      .then((value) => {
        if (!cancelled) {
          setQrRender(value);
        }
      })
      .catch((error: unknown) => {
        console.warn('Unable to generate themed QR code.', error);
        if (!cancelled) {
          setQrRender(undefined);
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
        if (cancelled) { return; }

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
    if (!scannerOpen) { return; }

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
      if (cancelled || !videoRef.current) { return; }

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
        if (cancelled) { return; }

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
            if (cancelled) { return; }
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
          if (cancelled) { return; }
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

  const displayListName = listName.trim();
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
  useEffect(() => {
    if (!scannerOpen && !qrModalOpen) { return; }

    const handleEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key !== 'Escape') { return; }
      if (scannerOpen) {
        closeScanner();
        return;
      }
      closeQrModal();
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [qrModalOpen, scannerOpen]);

  const scannerStatusText =
    scannerState === 'missing'
      ? messages.sharing.scannerListMissing
      : scannerState === 'ready'
        ? messages.sharing.scannerReady
        : messages.sharing.scannerInstructions;
  const showSharedInputTick = sharedInputStatus === 'valid';
  const sharedInputStatusId = 'shared-list-load-status';
  const sharedInputStatusText =
    sharedInputStatus === 'checking'
      ? messages.backendStatus.checking
      : sharedInputStatus === 'valid'
        ? messages.labels.available
        : sharedInputStatus === 'missing'
          ? messages.sharing.loadMissing
          : sharedInputStatus === 'invalid'
            ? messages.sharing.invalidLink
            : '';
  const normalizeSharedInput = (value: string): string => {
    const normalized = extractSharedListId(value, appBasePath, window.location.origin);
    return normalized ?? value;
  };

  return (
    <div className={p.stack}>
      {shareLink ? (
        <>
          {displayListName ? (
            <div className={classNames(st.currentListName, st.sharedCurrentListName)}>{displayListName}</div>
          ) : null}

          <div className={p.field}>
            <label htmlFor={'shopping-share-link'}>{messages.labels.sharedLink}</label>
            <div className={classNames(p.inlineRow, st.linkRow, st.shareLinkRow)}>
              <input id={'shopping-share-link'} className={p.input} readOnly value={shareLink} />
              <button type={'button'} className={p.button} onClick={() => void navigator.clipboard?.writeText(shareLink)}>
                {messages.actions.copy}
              </button>
              <button
                type={'button'}
                className={p.button}
                onClick={onRefreshSharedList}
                disabled={isRefreshingSharedList || !canUseBackend}
              >
                {isRefreshingSharedList ? messages.actions.refreshing : messages.actions.refresh}
              </button>
            </div>
          </div>

          {qrRender ? (
            <button
              type={'button'}
              className={classNames(st.qrCard, st.shareQrCard, qrRevealed ? undefined : st.qrCardBlurred, qrRevealed ? undefined : st.shareQrCardBlurred)}
              onClick={handleQrCardClick}
              aria-label={qrRevealed ? messages.labels.sharedLink : messages.actions.revealQrCode}
            >
              <span className={classNames(st.qrFrame, st.shareQrFrame)}>
                <img className={classNames(st.qrImage, st.shareQrImage)} src={qrRender.svgDataUrl} alt={messages.labels.sharedLink} />
                <img className={classNames(st.qrLogo, st.shareQrLogo)} src={qrRender.logoSrc} alt={''} aria-hidden={'true'} />
              </span>
              {!qrRevealed ? <span className={classNames(st.qrOverlay, st.shareQrOverlay)}>{messages.actions.revealQrCode}</span> : null}
            </button>
          ) : null}
        </>
      ) : canUseBackend ? (
        <button
          type={'button'}
          className={p.buttonPrimary}
          onClick={onCreateSharedLink}
          disabled={isCreatingShareLink || !canCreateSharedLink}
          aria-label={messages.actions.createSharedLink}
          title={messages.actions.createSharedLink}
        >
          {isCreatingShareLink ? messages.actions.creating : messages.actions.createSharedLink}
        </button>
      ) : (
        <div className={p.emptyState}>{messages.pages.edit.sharingUnavailable}</div>
      )}

      {canUseBackend ? (
        <>
          <div className={p.field}>
            <label htmlFor={'shared-list-load-input'}>{messages.sharing.manualLinkLabel}</label>
            <div className={classNames(p.inlineRow, st.loadRow, st.shareLoadRow)}>
              <div className={classNames(st.inputShell, st.sharedInputShell, showSharedInputTick ? st.inputShellValid : undefined, showSharedInputTick ? st.sharedInputShellValid : undefined)}>
                <input
                  id={'shared-list-load-input'}
                  className={classNames(p.input, st.sharedInput, st.sharedInputAlias)}
                  value={sharedInput}
                  aria-describedby={sharedInputStatus !== 'idle' ? sharedInputStatusId : undefined}
                  aria-invalid={sharedInputStatus === 'missing' || sharedInputStatus === 'invalid'}
                  onChange={(event) => setSharedInput(normalizeSharedInput(event.target.value))}
                  onPaste={(event) => {
                    const pastedText = event.clipboardData.getData('text');
                    const normalized = normalizeSharedInput(pastedText);
                    if (normalized === pastedText) { return; }
                    event.preventDefault();
                    setSharedInput(normalized);
                  }}
                  placeholder={messages.sharing.manualLinkPlaceholder}
                />
                {showSharedInputTick ? (
                  <span className={classNames(st.inputTick, st.sharedInputTick)} aria-hidden={'true'}>
                    ✓
                  </span>
                ) : null}
              </div>
              <button
                type={'button'}
                className={p.buttonPrimary}
                onClick={() => void handleLoadSharedList()}
                disabled={isLoadingSharedList || !sharedInput.trim()}
              >
                {messages.actions.loadSharedList}
              </button>
              {scannerSupported ? (
                <button type={'button'} className={p.button} onClick={() => setScannerOpen(true)}>
                  {messages.actions.scanQrCode}
                </button>
              ) : null}
            </div>
          </div>
        </>
      ) : null}

      {sharedInputStatus !== 'idle' ? (
        <div id={sharedInputStatusId} className={p.srOnly} role={'status'} aria-live={'polite'}>
          {sharedInputStatusText}
        </div>
      ) : null}
      {shareError ? <div className={p.smallText} role={'alert'}>{shareError}</div> : null}
      {scannerMessage && !scannerOpen ? (
        <div className={p.smallText} role={'status'} aria-live={'polite'}>
          {scannerMessage}
        </div>
      ) : null}

      {scannerOpen ? (
        <div className={classNames(st.scannerModal, st.shareScannerModal)} onClick={closeScanner} role={'presentation'}>
          <div
            className={classNames(st.scannerDialog, st.shareScannerDialog, p.stack)}
            role={'dialog'}
            aria-modal={'true'}
            aria-labelledby={'share-scanner-title'}
            onClick={(event) => event.stopPropagation()}
          >
            <div className={classNames(st.scannerToolbar, st.shareScannerToolbar)}>
              <h3 id={'share-scanner-title'} className={p.titleXs}>{messages.actions.scanQrCode}</h3>
              <button type={'button'} className={p.button} onClick={closeScanner} autoFocus>
                {messages.actions.stopScanning}
              </button>
            </div>
            <div
              className={classNames(
                st.scannerFrame,
                scannerState === 'scanning' ? st.scannerScanning : undefined,
                scannerState === 'ready' ? st.scannerReady : undefined,
                scannerState === 'missing' ? st.scannerMissing : undefined,
                st.shareScannerFrame,
                st[`shareScannerFrame${scannerState[0].toUpperCase()}${scannerState.slice(1)}`],
              )}
            >
              <video ref={videoRef} className={classNames(st.scannerVideo, st.shareScannerVideo)} muted playsInline aria-label={messages.actions.scanQrCode} />
              <div className={classNames(st.scannerOverlay, st.shareScannerOverlay)}>
                <div className={classNames(st.scannerTarget, st.shareScannerTarget)} />
              </div>
            </div>
            <div className={classNames(st.scannerStatus, st.shareScannerStatus)} role={'status'} aria-live={'polite'}>{scannerStatusText}</div>
          </div>
        </div>
      ) : null}

      {qrModalOpen && qrRender ? (
        <div className={classNames(st.scannerModal, st.shareScannerModal)} onClick={closeQrModal} role={'presentation'}>
          <div
            className={classNames(st.qrDialog, st.shareQrDialog)}
            role={'dialog'}
            aria-modal={'true'}
            aria-label={messages.labels.sharedLink}
            onClick={(event) => event.stopPropagation()}
          >
            <button type={'button'} className={p.button} onClick={closeQrModal} autoFocus>
              {messages.actions.close}
            </button>
            <span className={classNames(st.qrFrame, st.qrFrameLarge, st.shareQrFrame, st.shareQrFrameLarge)}>
              <img className={classNames(st.qrImage, st.shareQrImage)} src={qrRender.svgDataUrl} alt={messages.labels.sharedLink} />
              <img className={classNames(st.qrLogo, st.shareQrLogo)} src={qrRender.logoSrc} alt={''} aria-hidden={'true'} />
            </span>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function SharedListHistoryPanel({
  canUseBackend,
  isLoadingSharedList,
  historyEntries,
  onLoadHistoryEntry,
  onDeleteHistoryEntry,
}: SharedListHistoryPanelProps) {
  const { locale, messages } = useI18n();
  const historyPointerRef = useRef<{ listId: string; x: number; y: number; moved: boolean } | null>(null);
  const isHistoryLoadDisabled = isLoadingSharedList || !canUseBackend;
  const localeCode = locale === 'en' ? 'en-GB' : locale;
  const historyTitle = (entry: SharedListHistoryEntry): string =>
    entry.listName?.trim() || entry.itemPreview.join(' · ') || messages.sharing.emptyList;
  const isActionTarget = (target: EventTarget | null): boolean =>
    target instanceof Element && target.closest('button') !== null;
  const handleHistoryPointerDown = (listId: string, event: PointerEvent<HTMLDivElement>) => {
    if (isHistoryLoadDisabled) { return; }
    if (isActionTarget(event.target)) { return; }
    historyPointerRef.current = { listId, x: event.clientX, y: event.clientY, moved: false };
  };
  const handleHistoryPointerMove = (listId: string, event: PointerEvent<HTMLDivElement>) => {
    const activePointer = historyPointerRef.current;
    if (!activePointer || activePointer.listId !== listId) { return; }

    const deltaX = Math.abs(event.clientX - activePointer.x);
    const deltaY = Math.abs(event.clientY - activePointer.y);
    if (deltaX > HISTORY_CARD_TAP_THRESHOLD_PX || deltaY > HISTORY_CARD_TAP_THRESHOLD_PX) {
      historyPointerRef.current = { ...activePointer, moved: true };
    }
  };
  const handleHistoryClick = (listId: string, event: MouseEvent<HTMLDivElement>) => {
    if (isHistoryLoadDisabled) { return; }
    if (isActionTarget(event.target)) { return; }
    const activePointer = historyPointerRef.current;
    historyPointerRef.current = null;
    if (activePointer?.listId === listId && activePointer.moved) { return; }
    void onLoadHistoryEntry(listId);
  };
  const handleHistoryPointerCancel = () => {
    historyPointerRef.current = null;
  };

  if (historyEntries.length === 0) {
    return <div className={p.emptyState}>{messages.sharing.recentListsEmpty}</div>;
  }

  return (
    <div className={classNames(p.stack, st.historyList, st.sharedHistoryList)}>
      {historyEntries.map((entry) => (
        <div
          key={entry.listId}
          className={classNames(
            st.historyItem,
            st.sharedHistoryItem,
            isHistoryLoadDisabled ? st.historyItemDisabled : undefined,
            isHistoryLoadDisabled ? st.sharedHistoryItemDisabled : undefined,
          )}
          title={isHistoryLoadDisabled ? undefined : messages.actions.loadSharedList}
          aria-disabled={isHistoryLoadDisabled}
          onPointerDown={(event) => handleHistoryPointerDown(entry.listId, event)}
          onPointerMove={(event) => handleHistoryPointerMove(entry.listId, event)}
          onPointerCancel={handleHistoryPointerCancel}
          onClick={(event) => handleHistoryClick(entry.listId, event)}
        >
          <div className={classNames(p.stack, st.historyContent, st.sharedHistoryContent)}>
            <div className={classNames(st.historyTitleWrap, st.sharedHistoryTitleWrap)}>
              <div className={classNames(st.historyTitle, st.sharedHistoryTitle)}>{historyTitle(entry)}</div>
            </div>
            <div className={p.smallText}>
              {messages.labels.created} {formatTimestamp(entry.createdAt, localeCode)} · {messages.labels.updated}{' '}
              {formatTimestamp(entry.updatedAt, localeCode)}
            </div>
          </div>
          <div className={classNames(st.historyActions, st.sharedHistoryActions)}>
            <button
              type={'button'}
              className={p.buttonIcon}
              onClick={(event) => {
                event.stopPropagation();
                if (isHistoryLoadDisabled) { return; }
                void onLoadHistoryEntry(entry.listId);
              }}
              disabled={isHistoryLoadDisabled}
              aria-label={`${messages.actions.loadSharedList}: ${historyTitle(entry)}`}
              title={messages.actions.loadSharedList}
            >
              <svg aria-hidden={'true'} className={p.buttonIconSvg} viewBox={'0 0 24 24'}>
                <path d={mdiDownloadOutline} fill={'currentColor'} />
              </svg>
            </button>
            <button
              type={'button'}
              className={p.buttonIcon}
              onClick={(event) => {
                event.stopPropagation();
                onDeleteHistoryEntry(entry.listId);
              }}
              aria-label={messages.actions.remove}
              title={messages.actions.remove}
            >
              <svg aria-hidden={'true'} className={p.buttonIconSvg} viewBox={'0 0 24 24'}>
                <path d={mdiDeleteOutline} fill={'currentColor'} />
              </svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react';
import type {
  BackendStatus,
  BackendHeartbeatSample,
  BackendOperationStatus,
  ConfigTestResult,
  CountQuantityTestResult,
  CountryConfig,
  DebugEventTestKey,
  DebugNotificationDeliveryPath,
  DebugNotificationResult,
  DebugNotificationTestKey,
  DebugTabKey,
  DebugSettings,
  Item,
  MatcherTestResult,
  MeasurementTestResult,
  StateTestResult,
  StorageTestResult,
  UnitQuantityTestResult,
  VariantTestResult,
} from '../types';
import { Card } from '../components/Card';
import { ParsedItemCard } from '../components/ParsedItemCard';
import { TestResultCard } from '../components/TestResultCard';
import { SectionsPage } from './SectionsPage';
import { useI18n } from '../lib/i18n';
import type { Messages } from '../lib/i18n';

type DebugPageProps = {
  backendStatus: BackendStatus;
  backendOperation: BackendOperationStatus;
  heartbeatSamples: BackendHeartbeatSample[];
  storageMode: 'local' | 'backend';
  notificationsEnabled: boolean;
  notificationPermission: NotificationPermission | 'unsupported';
  debugNotificationResult?: DebugNotificationResult;
  items: Item[];
  config: CountryConfig;
  matcherTests: MatcherTestResult[];
  configTests: ConfigTestResult[];
  countQuantityTests: CountQuantityTestResult[];
  measurementTests: MeasurementTestResult[];
  unitQuantityTests: UnitQuantityTestResult[];
  variantTests: VariantTestResult[];
  storageTests: StorageTestResult[];
  stateTests: StateTestResult[];
  isDebugMode: boolean;
  activeTab: DebugTabKey;
  debugSettings: DebugSettings;
  matcherHasFailures: boolean;
  configHasFailures: boolean;
  countQuantityHasFailures: boolean;
  measurementHasFailures: boolean;
  unitQuantityHasFailures: boolean;
  variantHasFailures: boolean;
  storageHasFailures: boolean;
  stateHasFailures: boolean;
  onRenameItem: (itemId: string, nextRaw: string) => void;
  onToggleItem: (itemId: string) => void;
  onDeleteItem: (itemId: string) => void;
  onDebugModeChange: (enabled: boolean) => void;
  onDebugSettingChange: (key: keyof DebugSettings, enabled: boolean) => void;
  onDebugNotificationTest: (key: DebugNotificationTestKey) => void;
  onDebugEventTest: (key: DebugEventTestKey) => void;
  onDebugTabChange: (tab: DebugTabKey) => void;
  onBackToEdit: () => void;
  onBackToSettings: () => void;
};

const HEARTBEAT_HISTORY_SLOT_COUNT = 36;
const HEARTBEAT_TIMEOUT_LATENCY_MS = 800;
const HEARTBEAT_LATENCY_GRAPH_BASE_MAX_MS = 100;
const HEARTBEAT_LATENCY_GRAPH_STEP_MS = 100;
const HEARTBEAT_LATENCY_TONE_MAX_MS = 250;
const HEARTBEAT_LATENCY_TONES = [
  'excellent',
  'healthy',
  'steady',
  'elevated',
  'slow',
  'strained',
  'critical',
] as const;
const HEARTBEAT_LATENCY_TONE_COLORS: Record<(typeof HEARTBEAT_LATENCY_TONES)[number], string> = {
  excellent: '#16a34a',
  healthy: '#65a30d',
  steady: '#ca8a04',
  elevated: '#f59e0b',
  slow: '#f97316',
  strained: '#ea580c',
  critical: '#dc2626',
};

const backendSummary = (status: BackendStatus, messages: Messages): string => {
  if (status.state === 'connected') { return messages.pages.debug.backendConnected; }
  if (status.state === 'checking') { return messages.pages.debug.backendChecking; }
  if (status.state === 'error') { return messages.pages.debug.backendError; }
  return messages.pages.debug.backendOffline;
};

const debugNotificationKindLabel = (kind: DebugNotificationTestKey, messages: Messages): string => {
  const labels: Record<DebugNotificationTestKey, string> = {
    minimal: messages.pages.debug.eventNotificationMinimalLabel,
    'single-item': messages.pages.debug.eventNotificationSingleLabel,
    'few-items': messages.pages.debug.eventNotificationFewLabel,
    'large-batch': messages.pages.debug.eventNotificationLargeLabel,
    'silent-follow-up': messages.pages.debug.eventNotificationSilentFollowUpLabel,
  };
  return labels[kind];
};

const debugNotificationDeliveryLabel = (path: DebugNotificationDeliveryPath, messages: Messages): string => {
  const labels: Record<DebugNotificationDeliveryPath, string> = {
    blocked: messages.pages.debug.eventNotificationDeliveryBlocked,
    'service-worker': messages.pages.debug.eventNotificationDeliveryServiceWorker,
    page: messages.pages.debug.eventNotificationDeliveryPage,
    failed: messages.pages.debug.eventNotificationDeliveryFailed,
  };
  return labels[path];
};

const debugNotificationStatusLabel = (result: DebugNotificationResult, messages: Messages): string => {
  if (result.status === 'requesting') { return messages.pages.debug.eventNotificationRequesting; }
  if (result.status === 'blocked') { return messages.pages.debug.eventNotificationNotShown; }
  if (result.status === 'failed') { return messages.pages.debug.eventNotificationFailed; }
  return messages.pages.debug.eventNotificationShown;
};

const DebugNotificationResultView = ({
  result,
  messages,
}: {
  result: DebugNotificationResult | undefined;
  messages: Messages;
}) => {
  if (!result) { return <>{messages.pages.debug.unavailable}</>; }

  return (
    <dl className={'debug-kv-list'}>
      <div>
        <dt>{messages.pages.debug.eventNotificationStatusLabel}</dt>
        <dd>{debugNotificationStatusLabel(result, messages)}</dd>
      </div>
      {result.kind ? (
        <div>
          <dt>{messages.pages.debug.eventNotificationKindLabel}</dt>
          <dd>{debugNotificationKindLabel(result.kind, messages)}</dd>
        </div>
      ) : null}
      {result.deliveryPath ? (
        <div>
          <dt>{messages.pages.debug.eventNotificationDeliveryPathLabel}</dt>
          <dd>{debugNotificationDeliveryLabel(result.deliveryPath, messages)}</dd>
        </div>
      ) : null}
      {result.permission ? (
        <div>
          <dt>{messages.pages.debug.eventNotificationPermissionLabel}</dt>
          <dd>{result.permission}</dd>
        </div>
      ) : null}
      {typeof result.secureContext === 'boolean' ? (
        <div>
          <dt>{messages.pages.debug.eventNotificationSecureContextLabel}</dt>
          <dd>{String(result.secureContext)}</dd>
        </div>
      ) : null}
      {typeof result.focus === 'boolean' ? (
        <div>
          <dt>{messages.pages.debug.eventNotificationFocusLabel}</dt>
          <dd>{String(result.focus)}</dd>
        </div>
      ) : null}
      {result.visibility ? (
        <div>
          <dt>{messages.pages.debug.eventNotificationVisibilityLabel}</dt>
          <dd>{result.visibility}</dd>
        </div>
      ) : null}
    </dl>
  );
};

const checkTone = (passed: boolean) => (passed ? ('success' as const) : ('danger' as const));

const backendStateLabel = (status: BackendStatus, messages: Messages) => {
  if (status.state === 'connected') { return messages.backendStatus.connected; }
  if (status.state === 'checking') { return messages.backendStatus.checking; }
  if (status.state === 'error') { return messages.backendStatus.issue; }
  return messages.backendStatus.frontendOnly;
};

const checkLabel = (passed: boolean, messages: Messages) => (passed ? messages.pages.debug.pass : messages.pages.debug.fail);

const databaseAdapterLabel = (status: BackendStatus, messages: Messages) => {
  if (status.database.adapter === 'postgres') { return messages.pages.debug.databaseTypePostgres; }
  if (status.database.adapter === 'json') { return messages.pages.debug.databaseTypeJson; }
  return messages.labels.unknown;
};

const currentDatabaseTypeLabel = (status: BackendStatus, storageMode: 'local' | 'backend', messages: Messages) => {
  if (storageMode === 'local') { return messages.pages.debug.databaseTypeLocalStorage; }
  return databaseAdapterLabel(status, messages);
};

const backendOperationLabel = (operation: BackendOperationStatus, messages: Messages): string => {
  const labels: Record<BackendOperationStatus['state'], string> = {
    idle: messages.pages.debug.backendOperationIdle,
    loading: messages.pages.debug.backendOperationLoading,
    reconnecting: messages.pages.debug.backendOperationReconnecting,
    backend: messages.pages.debug.backendOperationBackend,
    'local-fallback': messages.pages.debug.backendOperationLocalFallback,
    'save-failed': messages.pages.debug.backendOperationSaveFailed,
  };
  return labels[operation.state];
};

const isHeartbeatTimeout = (sample: BackendHeartbeatSample) =>
  sample.state === 'offline' && sample.latencyMs >= HEARTBEAT_TIMEOUT_LATENCY_MS;

const heartbeatLatencyGraphMax = (samples: BackendHeartbeatSample[]) => {
  const maxLatency = Math.max(0, ...samples.map((sample) => sample.latencyMs));
  if (maxLatency <= HEARTBEAT_LATENCY_GRAPH_BASE_MAX_MS) { return HEARTBEAT_LATENCY_GRAPH_BASE_MAX_MS; }

  return (Math.floor(maxLatency / HEARTBEAT_LATENCY_GRAPH_STEP_MS) + 1) * HEARTBEAT_LATENCY_GRAPH_STEP_MS;
};

const heartbeatLatencyAxisTicks = (maxLatencyMs: number) => [0, maxLatencyMs / 2, maxLatencyMs];

const heartbeatLatencyY = (latencyMs: number, maxLatencyMs: number) =>
  (Math.min(latencyMs, maxLatencyMs) / maxLatencyMs) * 100;

type HeartbeatHistorySlot = {
  index: number;
  sample?: BackendHeartbeatSample;
};

const heartbeatHistorySlots = (samples: BackendHeartbeatSample[]): HeartbeatHistorySlot[] => {
  const visibleSamples = samples.slice(-HEARTBEAT_HISTORY_SLOT_COUNT);
  const leadingSlotCount = HEARTBEAT_HISTORY_SLOT_COUNT - visibleSamples.length;
  return Array.from({ length: HEARTBEAT_HISTORY_SLOT_COUNT }, (_, index) => ({
    index,
    sample: visibleSamples[index - leadingSlotCount],
  }));
};

const heartbeatPoint = (slot: HeartbeatHistorySlot, maxLatencyMs: number) => {
  const x = (slot.index / (HEARTBEAT_HISTORY_SLOT_COUNT - 1)) * 100;
  const y = slot.sample && isHeartbeatTimeout(slot.sample)
    ? 100
    : slot.sample ? heartbeatLatencyY(slot.sample.latencyMs, maxLatencyMs) : 50;
  return { x, y };
};

const formatHeartbeatAxisTick = (latencyMs: number) => `${latencyMs}ms`;

const heartbeatLatencyTone = (sample: BackendHeartbeatSample) => {
  if (isHeartbeatTimeout(sample)) { return 'critical'; }

  const toneIndex = Math.min(
    HEARTBEAT_LATENCY_TONES.length - 1,
    Math.floor((sample.latencyMs / HEARTBEAT_LATENCY_TONE_MAX_MS) * HEARTBEAT_LATENCY_TONES.length),
  );
  return HEARTBEAT_LATENCY_TONES[toneIndex];
};

const formatHeartbeatTime = (checkedAt: string) =>
  new Intl.DateTimeFormat(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(new Date(checkedAt));

function DebugSettingSwitch({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint: string;
  checked: boolean;
  onChange: (enabled: boolean) => void;
}) {
  return (
    <label className={'debug-setting-switch'}>
      <span>
        <span className={'debug-setting-label'}>{label}</span>
        <span className={'small-text'}>{hint}</span>
      </span>
      <input
        className={'debug-setting-switch-input'}
        type={'checkbox'}
        role={'switch'}
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
    </label>
  );
}

function DebugEventButton({
  label,
  hint,
  onClick,
}: {
  label: string;
  hint: string;
  onClick: () => void;
}) {
  const { messages } = useI18n();

  return (
    <div className={'debug-setting-switch'}>
      <span>
        <span className={'debug-setting-label'}>{label}</span>
        <span className={'small-text'}>{hint}</span>
      </span>
      <button type={'button'} className={'button button-secondary'} onClick={onClick}>
        {messages.pages.debug.eventTriggerAction}
      </button>
    </div>
  );
}

export function DebugPage({
  backendStatus,
  backendOperation,
  heartbeatSamples,
  storageMode,
  notificationsEnabled,
  notificationPermission,
  debugNotificationResult,
  items,
  config,
  matcherTests,
  configTests,
  countQuantityTests,
  measurementTests,
  unitQuantityTests,
  variantTests,
  storageTests,
  stateTests,
  isDebugMode,
  activeTab,
  debugSettings,
  matcherHasFailures,
  configHasFailures,
  countQuantityHasFailures,
  measurementHasFailures,
  unitQuantityHasFailures,
  variantHasFailures,
  storageHasFailures,
  stateHasFailures,
  onRenameItem,
  onToggleItem,
  onDeleteItem,
  onDebugModeChange,
  onDebugSettingChange,
  onDebugNotificationTest,
  onDebugEventTest,
  onDebugTabChange,
  onBackToEdit,
  onBackToSettings,
}: DebugPageProps) {
  const { messages } = useI18n();
  const [hoveredHeartbeatSampleKey, setHoveredHeartbeatSampleKey] = useState<string | null>(null);
  const [lockedHeartbeatSampleKey, setLockedHeartbeatSampleKey] = useState<string | null>(null);
  const heartbeatHistoryWrapRef = useRef<HTMLDivElement | null>(null);
  const heartbeatHistoryRowRefs = useRef(new Map<string, HTMLTableRowElement>());
  const runtimeLocation =
    typeof window === 'undefined'
      ? null
      : {
          basePath: import.meta.env.BASE_URL,
          host: window.location.host,
          hostname: window.location.hostname,
          origin: window.location.origin,
          protocol: window.location.protocol,
        };
  const debugTabs: Array<{ key: DebugTabKey; label: string }> = [
    { key: 'parsed', label: messages.pages.debug.tabParsed },
    { key: 'state', label: messages.pages.debug.tabState },
    { key: 'backend', label: messages.pages.debug.tabBackend },
    { key: 'config', label: messages.pages.debug.tabConfig },
    { key: 'matcher', label: messages.pages.debug.tabMatcher },
    { key: 'quantity', label: messages.pages.debug.tabQuantity },
    { key: 'measurements', label: messages.pages.debug.tabMeasurements },
    { key: 'weights', label: messages.pages.debug.tabWeights },
    { key: 'variants', label: messages.pages.debug.tabVariants },
    { key: 'layout', label: messages.pages.debug.tabLayout },
    { key: 'sections', label: messages.pages.debug.tabSections },
    { key: 'storage', label: messages.pages.debug.tabStorage },
    { key: 'host', label: messages.pages.debug.tabHost },
    { key: 'events', label: messages.pages.debug.tabEvents },
    { key: 'settings', label: messages.pages.debug.tabSettings },
  ];
  const layoutRows = config.groups.flatMap((group) =>
    group.sections.map((section) => ({
      group,
      section,
    })),
  );
  const layoutSectionCount = layoutRows.length;
  const layoutKeywordCount = layoutRows.reduce((total, row) => total + row.section.keywords.length, 0);
  const measurementModeLabels = {
    metric: messages.labels.measurementModeMetric,
    imperial: messages.labels.measurementModeImperial,
    cooking: messages.labels.measurementModeCooking,
  };
  const latestHeartbeat = heartbeatSamples.at(-1);
  const heartbeatTone = latestHeartbeat?.state ?? backendStatus.state;
  const heartbeatSlots = heartbeatHistorySlots(heartbeatSamples);
  const heartbeatSampleSlots = heartbeatSlots.filter((slot): slot is HeartbeatHistorySlot & { sample: BackendHeartbeatSample } =>
    slot.sample !== undefined,
  );
  const firstHeartbeatSampleSlot = heartbeatSampleSlots[0];
  const recentHeartbeatSamples = heartbeatSampleSlots.map((slot) => slot.sample).reverse();
  const heartbeatGraphMaxLatencyMs = heartbeatLatencyGraphMax(heartbeatSampleSlots.map((slot) => slot.sample));
  const heartbeatAxisTicks = heartbeatLatencyAxisTicks(heartbeatGraphMaxLatencyMs);
  const activeHeartbeatSampleKey = lockedHeartbeatSampleKey ?? hoveredHeartbeatSampleKey;
  const heartbeatLineSegments = heartbeatSampleSlots.slice(1).map((slot, index) => {
    const previousSlot = heartbeatSampleSlots[index];
    const previousPoint = heartbeatPoint(previousSlot, heartbeatGraphMaxLatencyMs);
    const nextPoint = heartbeatPoint(slot, heartbeatGraphMaxLatencyMs);
    const previousTone = heartbeatLatencyTone(previousSlot.sample);
    const nextTone = heartbeatLatencyTone(slot.sample);

    return {
      gradientId: `heartbeat-line-gradient-${previousSlot.index}-${slot.index}`,
      isActive: previousSlot.sample.checkedAt === activeHeartbeatSampleKey || slot.sample.checkedAt === activeHeartbeatSampleKey,
      key: `${slot.sample.checkedAt}-${slot.index}`,
      nextColor: HEARTBEAT_LATENCY_TONE_COLORS[nextTone],
      nextPoint,
      previousColor: HEARTBEAT_LATENCY_TONE_COLORS[previousTone],
      previousPoint,
    };
  });
  const activateHeartbeatSample = (sample: BackendHeartbeatSample) => {
    setHoveredHeartbeatSampleKey(sample.checkedAt);
  };
  const clearActiveHeartbeatSample = () => {
    setHoveredHeartbeatSampleKey(null);
  };
  const lockHeartbeatSample = (sample: BackendHeartbeatSample) => {
    setLockedHeartbeatSampleKey(sample.checkedAt);
  };

  useEffect(() => {
    if (!activeHeartbeatSampleKey) { return; }

    const wrap = heartbeatHistoryWrapRef.current;
    const row = heartbeatHistoryRowRefs.current.get(activeHeartbeatSampleKey);
    if (!wrap || !row) { return; }

    const nextScrollTop = row.offsetTop - (wrap.clientHeight / 2) + (row.clientHeight / 2);
    wrap.scrollTo({
      top: Math.max(0, nextScrollTop),
      behavior: 'smooth',
    });
  }, [activeHeartbeatSampleKey]);

  useEffect(() => {
    if (typeof document === 'undefined') { return undefined; }

    const clearLockedHeartbeatSample = (event: PointerEvent) => {
      const target = event.target;
      if (target instanceof Element && target.closest('.heartbeat-graph-point')) { return; }

      setHoveredHeartbeatSampleKey(null);
      setLockedHeartbeatSampleKey(null);
    };

    document.addEventListener('pointerdown', clearLockedHeartbeatSample);
    return () => document.removeEventListener('pointerdown', clearLockedHeartbeatSample);
  }, []);

  const handleTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const lastIndex = debugTabs.length - 1;
    const nextIndex =
      event.key === 'ArrowRight'
        ? index === lastIndex
          ? 0
          : index + 1
        : event.key === 'ArrowLeft'
          ? index === 0
            ? lastIndex
            : index - 1
          : event.key === 'Home'
            ? 0
            : event.key === 'End'
              ? lastIndex
              : undefined;

    if (nextIndex === undefined) { return; }

    event.preventDefault();
    const nextTab = debugTabs[nextIndex];
    onDebugTabChange(nextTab.key);
    document.getElementById(`debug-tab-${nextTab.key}`)?.focus();
  };

  return (
    <Card
      header={
        <div className={'title-row'}>
          <div>
            <h2 className={'title title-md'}>{messages.pages.debug.title}</h2>
            <p className={'subtitle'}>{messages.pages.debug.subtitle}</p>
          </div>
          <div className={'button-row'}>
            <button type={'button'} className={'button'} onClick={onBackToEdit}>
              {messages.actions.backToEdit}
            </button>
            <button type={'button'} className={'button'} onClick={onBackToSettings}>
              {messages.actions.backToSettings}
            </button>
          </div>
        </div>
      }
      bodyClassName={'stack'}
    >
      <div className={'debug-tablist'} role={'tablist'} aria-label={messages.pages.debug.title}>
        {debugTabs.map((tab, index) => (
          <button
            key={tab.key}
            id={`debug-tab-${tab.key}`}
            type={'button'}
            role={'tab'}
            aria-selected={activeTab === tab.key}
            aria-controls={activeTab === tab.key ? `debug-panel-${tab.key}` : undefined}
            tabIndex={activeTab === tab.key ? 0 : -1}
            className={`button ${activeTab === tab.key ? 'button-active' : ''}`}
            onClick={() => onDebugTabChange(tab.key)}
            onKeyDown={(event) => handleTabKeyDown(event, index)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'parsed' ? (
        <Card
          id={'debug-panel-parsed'}
          role={'tabpanel'}
          aria-labelledby={'debug-tab-parsed'}
          header={
            <>
              <h2 className={'title title-sm'}>{messages.pages.debug.parsedTitle}</h2>
              <p className={'subtitle'}>{messages.pages.debug.parsedSubtitle}</p>
            </>
          }
        >
          <div className={'scroll-region stack'}>
            {items.length === 0 ? (
              <div className={'empty-state'}>{messages.pages.edit.parsedEmpty}</div>
            ) : (
              items.map((item) => (
                <ParsedItemCard
                  key={item.id}
                  item={item}
                  config={config}
                  onRename={onRenameItem}
                  onToggle={onToggleItem}
                  onDelete={onDeleteItem}
                />
              ))
            )}
          </div>
        </Card>
      ) : null}

      {activeTab === 'state' ? (
        <Card
          id={'debug-panel-state'}
          role={'tabpanel'}
          aria-labelledby={'debug-tab-state'}
          header={
            <>
              <h2 className={'title title-sm'}>{messages.pages.debug.stateTitle}</h2>
              <p className={'subtitle'}>{messages.pages.debug.stateSubtitle}</p>
            </>
          }
          bodyClassName={'stack'}
        >
          {stateTests.map((test) => (
            <TestResultCard
              key={test.title}
              title={test.title}
              expected={test.expected}
              actual={test.actual}
              passed={test.passed}
            />
          ))}
          {!stateHasFailures ? <div className={'empty-state'}>{messages.pages.debug.allStatePass}</div> : null}
        </Card>
      ) : null}

      {activeTab === 'backend' ? (
        <Card
          id={'debug-panel-backend'}
          role={'tabpanel'}
          aria-labelledby={'debug-tab-backend'}
          header={
            <>
              <h2 className={'title title-sm'}>{messages.pages.debug.backendTitle}</h2>
              <p className={'subtitle'}>{backendSummary(backendStatus, messages)}</p>
            </>
          }
          bodyClassName={'stack'}
        >
          <div className={`heartbeat-card heartbeat-card-${heartbeatTone}`}>
            <div className={'heartbeat-summary'}>
              <div
                key={latestHeartbeat?.checkedAt ?? 'waiting'}
                className={`heartbeat-pulse heartbeat-pulse-${heartbeatTone}`}
                aria-hidden={'true'}
              >
                <span />
              </div>
              <div>
                <h3 className={'title title-xs'}>{messages.pages.debug.heartbeatTitle}</h3>
                <p className={'small-text'}>{messages.pages.debug.heartbeatSubtitle}</p>
              </div>
            </div>
            <div className={'heartbeat-metrics'} aria-label={messages.pages.debug.heartbeatTitle}>
              <div>
                <span>{messages.pages.debug.heartbeatLastChecked}</span>
                <strong>
                  {latestHeartbeat ? formatHeartbeatTime(latestHeartbeat.checkedAt) : messages.pages.debug.heartbeatWaiting}
                </strong>
              </div>
              <div>
                <span>{messages.pages.debug.heartbeatLatency}</span>
                <strong>{latestHeartbeat ? `${latestHeartbeat.latencyMs}ms` : messages.pages.debug.unavailable}</strong>
              </div>
              <div>
                <span>{messages.labels.state}</span>
                <strong>{backendStateLabel(backendStatus, messages)}</strong>
              </div>
              <div>
                <span>{messages.pages.debug.heartbeatSamples}</span>
                <strong>{heartbeatSamples.length}</strong>
              </div>
              {debugSettings.pauseBackendHeartbeat ? (
                <div>
                  <span>{messages.labels.mode}</span>
                  <strong>{messages.pages.debug.heartbeatPaused}</strong>
                </div>
              ) : null}
            </div>
            <div className={'heartbeat-graph'}>
              <div className={'heartbeat-graph-axis'} aria-hidden={'true'}>
                {heartbeatAxisTicks.map((latencyMs) => (
                  <span
                    key={latencyMs}
                    className={'heartbeat-graph-axis-tick'}
                    style={{ top: `${heartbeatLatencyY(latencyMs, heartbeatGraphMaxLatencyMs)}%` }}
                  >
                    {formatHeartbeatAxisTick(latencyMs)}
                  </span>
                ))}
              </div>
              <svg viewBox={'0 0 100 100'} preserveAspectRatio={'none'} aria-hidden={'true'}>
                <defs>
                  {heartbeatLineSegments.map((segment) => (
                    <linearGradient
                      key={segment.gradientId}
                      id={segment.gradientId}
                      gradientUnits={'userSpaceOnUse'}
                      x1={segment.previousPoint.x}
                      y1={segment.previousPoint.y}
                      x2={segment.nextPoint.x}
                      y2={segment.nextPoint.y}
                    >
                      <stop offset={'0%'} stopColor={segment.previousColor} />
                      <stop offset={'100%'} stopColor={segment.nextColor} />
                    </linearGradient>
                  ))}
                </defs>
                <path className={'heartbeat-graph-grid'} d={'M0 25 H100 M0 50 H100 M0 75 H100'} />
                <line className={'heartbeat-graph-ghost-line'} x1={'0'} y1={'50'} x2={'100'} y2={'50'} />
                {firstHeartbeatSampleSlot && firstHeartbeatSampleSlot.index > 0 ? (
                  <line
                    className={'heartbeat-graph-ghost-line'}
                    x1={heartbeatPoint({ index: firstHeartbeatSampleSlot.index - 1 }, heartbeatGraphMaxLatencyMs).x}
                    y1={'50'}
                    x2={heartbeatPoint(firstHeartbeatSampleSlot, heartbeatGraphMaxLatencyMs).x}
                    y2={heartbeatPoint(firstHeartbeatSampleSlot, heartbeatGraphMaxLatencyMs).y}
                  />
                ) : null}
                {heartbeatLineSegments.map((segment) => (
                  <line
                    key={segment.key}
                    className={`heartbeat-graph-line ${segment.isActive ? 'heartbeat-graph-line-active' : ''}`}
                    style={{ color: segment.nextColor }}
                    stroke={`url(#${segment.gradientId})`}
                    x1={segment.previousPoint.x}
                    y1={segment.previousPoint.y}
                    x2={segment.nextPoint.x}
                    y2={segment.nextPoint.y}
                  />
                ))}
              </svg>
              {heartbeatSlots.map((slot) => {
                const { x, y } = heartbeatPoint(slot, heartbeatGraphMaxLatencyMs);
                const tone = slot.sample ? heartbeatLatencyTone(slot.sample) : 'ghost';
                const isActive = slot.sample?.checkedAt === activeHeartbeatSampleKey;
                if (!slot.sample) {
                  return (
                    <span
                      key={`heartbeat-ghost-${slot.index}`}
                      className={'heartbeat-graph-point heartbeat-graph-point-ghost'}
                      style={{ left: `${x}%`, top: `${y}%` }}
                      aria-hidden={'true'}
                    />
                  );
                }

                const sample = slot.sample;
                return (
                  <button
                    key={`${sample.checkedAt}-${slot.index}`}
                    type={'button'}
                    className={`heartbeat-graph-point heartbeat-graph-point-${tone} ${isActive ? 'heartbeat-graph-point-active' : ''}`}
                    style={{ left: `${x}%`, top: `${y}%` }}
                    aria-label={`${messages.pages.debug.heartbeatLatency}: ${sample.latencyMs}ms, ${messages.pages.debug.heartbeatLastChecked}: ${formatHeartbeatTime(sample.checkedAt)}`}
                    aria-pressed={sample.checkedAt === lockedHeartbeatSampleKey}
                    onMouseEnter={() => activateHeartbeatSample(sample)}
                    onMouseLeave={clearActiveHeartbeatSample}
                    onFocus={() => activateHeartbeatSample(sample)}
                    onBlur={clearActiveHeartbeatSample}
                    onClick={() => lockHeartbeatSample(sample)}
                  >
                    <span className={`heartbeat-graph-tooltip heartbeat-graph-tooltip-${tone}`} role={'tooltip'}>
                      <strong>{sample.latencyMs}ms</strong>
                      <span>{formatHeartbeatTime(sample.checkedAt)}</span>
                    </span>
                  </button>
                );
              })}
            </div>
            <div
              className={'heartbeat-status-strip'}
              aria-hidden={'true'}
            >
              {heartbeatSlots.map((slot) => {
                const { x } = heartbeatPoint(slot, heartbeatGraphMaxLatencyMs);
                return (
                  <span
                    key={slot.sample ? `${slot.sample.checkedAt}-status-${slot.index}` : `heartbeat-status-ghost-${slot.index}`}
                    className={`heartbeat-status-dot heartbeat-status-dot-${slot.sample?.state ?? 'ghost'}`}
                    style={{ '--heartbeat-status-x': `${x}%` } as CSSProperties}
                    title={
                      slot.sample
                        ? `${formatHeartbeatTime(slot.sample.checkedAt)} ${backendStateLabel({ ...backendStatus, state: slot.sample.state }, messages)}`
                        : messages.pages.debug.heartbeatWaiting
                    }
                  />
                );
              })}
            </div>
          </div>
          <div className={'table-wrap'}>
            <table className={'debug-table debug-table-compact'}>
              <caption>{messages.pages.debug.backendOperationTitle}</caption>
              <tbody>
                <tr>
                  <th scope={'row'}>{messages.labels.state}</th>
                  <td>{backendOperationLabel(backendOperation, messages)}</td>
                </tr>
                <tr>
                  <th scope={'row'}>{messages.labels.updated}</th>
                  <td>
                    {backendOperation.updatedAt
                      ? formatHeartbeatTime(backendOperation.updatedAt)
                      : messages.pages.debug.unavailable}
                  </td>
                </tr>
                {backendOperation.detail ? (
                  <tr>
                    <th scope={'row'}>{messages.pages.debug.backendOperationDetail}</th>
                    <td>{backendOperation.detail}</td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
          <div className={'heartbeat-status-history'}>
            <div className={'debug-table-title'} id={'heartbeat-status-history-title'}>
              {messages.pages.debug.heartbeatStatusHistory}
            </div>
            <div className={'table-wrap heartbeat-status-history-wrap'} ref={heartbeatHistoryWrapRef}>
              <table className={'debug-table debug-table-compact'} aria-labelledby={'heartbeat-status-history-title'}>
              <thead>
                <tr>
                  <th scope={'col'}>{messages.pages.debug.heartbeatLastChecked}</th>
                  <th scope={'col'}>{messages.labels.state}</th>
                  <th scope={'col'}>{messages.pages.debug.heartbeatHealth}</th>
                  <th scope={'col'}>{messages.pages.debug.heartbeatDatabase}</th>
                  <th scope={'col'}>{messages.pages.debug.heartbeatAdapter}</th>
                  <th scope={'col'}>{messages.pages.debug.heartbeatLatency}</th>
                </tr>
              </thead>
              <tbody>
                {recentHeartbeatSamples.length === 0 ? (
                  <tr>
                    <td colSpan={6}>{messages.pages.debug.heartbeatWaiting}</td>
                  </tr>
                ) : (
                  recentHeartbeatSamples.map((sample, index) => (
                    <tr
                      key={`${sample.checkedAt}-row-${index}`}
                      ref={(node) => {
                        if (node) {
                          heartbeatHistoryRowRefs.current.set(sample.checkedAt, node);
                        } else {
                          heartbeatHistoryRowRefs.current.delete(sample.checkedAt);
                        }
                      }}
                      className={sample.checkedAt === activeHeartbeatSampleKey ? 'debug-table-row-active' : undefined}
                    >
                      <td>{formatHeartbeatTime(sample.checkedAt)}</td>
                      <td>{backendStateLabel({ ...backendStatus, state: sample.state }, messages)}</td>
                      <td>{checkLabel(sample.healthOk, messages)}</td>
                      <td>{checkLabel(sample.databaseOk, messages)}</td>
                      <td>
                        {sample.adapter
                          ? databaseAdapterLabel({ ...backendStatus, database: { ...backendStatus.database, adapter: sample.adapter } }, messages)
                          : messages.pages.debug.unavailable}
                      </td>
                      <td>{sample.latencyMs}ms</td>
                    </tr>
                  ))
                )}
              </tbody>
              </table>
            </div>
          </div>
          <TestResultCard
            title={messages.pages.debug.databaseTypeTitle}
            expected={messages.pages.debug.databaseTypeExpected}
            actual={currentDatabaseTypeLabel(backendStatus, storageMode, messages)}
            passed={storageMode === 'local' || Boolean(backendStatus.database.adapter)}
            tone={'muted'}
            label={storageMode === 'local' ? messages.pages.debug.databaseTypeLocalStorage : databaseAdapterLabel(backendStatus, messages)}
          />
          <TestResultCard
            title={messages.pages.debug.backendHealthTitle}
            expected={messages.pages.debug.backendHealthExpected}
            actual={
              backendStatus.state === 'connected' || backendStatus.state === 'error'
                ? `${messages.labels.state} ${backendStateLabel(backendStatus, messages)}, ${messages.labels.mode} ${
                    backendStatus.health.mode ?? messages.labels.unknown
                  }`
                : `${messages.labels.state} ${backendStateLabel(backendStatus, messages)}`
            }
            passed={backendStatus.health.ok}
            tone={checkTone(backendStatus.health.ok)}
            label={checkLabel(backendStatus.health.ok, messages)}
          />
          <TestResultCard
            title={messages.pages.debug.databaseTitle}
            expected={messages.pages.debug.databaseExpected}
            actual={
              backendStatus.database.ok
                ? `${messages.labels.available}, ${messages.labels.defaultList} ${
                    backendStatus.database.shoppingListExists ? messages.labels.exists : messages.labels.empty
                  }, ${messages.labels.sharedLists} ${
                    backendStatus.database.sharedListCount ?? 0
                  }, ${messages.labels.countryProfile} ${
                    backendStatus.database.settingsCountryCode ?? messages.labels.unknown
                  }, ${messages.labels.updated} ${backendStatus.database.updatedAt ?? messages.labels.unknown}`
                : `${messages.labels.state} ${backendStateLabel(backendStatus, messages)}`
            }
            passed={backendStatus.database.ok}
            tone={checkTone(backendStatus.database.ok)}
            label={checkLabel(backendStatus.database.ok, messages)}
          />
          <div className={'table-wrap'}>
            <table className={'debug-table'}>
              <tbody>
                <tr>
                  <th scope={'row'}>{messages.pages.debug.appStorageModeLabel}</th>
                  <td>{currentDatabaseTypeLabel(backendStatus, storageMode, messages)}</td>
                </tr>
                <tr>
                  <th scope={'row'}>{messages.pages.debug.backendAdapterLabel}</th>
                  <td>
                    {backendStatus.database.adapter
                      ? databaseAdapterLabel(backendStatus, messages)
                      : messages.pages.debug.unavailable}
                  </td>
                </tr>
                <tr>
                  <th scope={'row'}>{messages.labels.defaultList}</th>
                  <td>
                    {typeof backendStatus.database.shoppingListExists === 'boolean'
                      ? backendStatus.database.shoppingListExists
                        ? messages.labels.exists
                        : messages.labels.empty
                      : messages.pages.debug.unavailable}
                  </td>
                </tr>
                <tr>
                  <th scope={'row'}>{messages.labels.sharedLists}</th>
                  <td>{backendStatus.database.sharedListCount ?? messages.pages.debug.unavailable}</td>
                </tr>
                <tr>
                  <th scope={'row'}>{messages.labels.updated}</th>
                  <td>{backendStatus.database.updatedAt ?? messages.pages.debug.unavailable}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      ) : null}

      {activeTab === 'config' ? (
        <Card
          id={'debug-panel-config'}
          role={'tabpanel'}
          aria-labelledby={'debug-tab-config'}
          header={
            <>
              <h2 className={'title title-sm'}>{messages.pages.debug.configTitle}</h2>
              <p className={'subtitle'}>{messages.pages.debug.configSubtitle}</p>
            </>
          }
          bodyClassName={'stack'}
        >
          {configTests.map((test) => (
            <TestResultCard
              key={test.title}
              title={test.title}
              expected={test.expected}
              actual={test.actual}
              passed={test.passed}
            />
          ))}
          {!configHasFailures ? <div className={'empty-state'}>{messages.pages.debug.allConfigPass}</div> : null}
        </Card>
      ) : null}

      {activeTab === 'matcher' ? (
        <Card
          id={'debug-panel-matcher'}
          role={'tabpanel'}
          aria-labelledby={'debug-tab-matcher'}
          header={
            <>
              <h2 className={'title title-sm'}>{messages.pages.debug.matcherTitle}</h2>
              <p className={'subtitle'}>{messages.pages.debug.matcherSubtitle}</p>
            </>
          }
          bodyClassName={'stack'}
        >
          {matcherTests.map((test) => (
            <TestResultCard
              key={`${test.input}-${test.expectedSection}`}
              title={test.input}
              expected={test.expectedSection}
              actual={test.actualSection}
              passed={test.passed}
            />
          ))}
          {!matcherHasFailures ? <div className={'empty-state'}>{messages.pages.debug.allMatcherPass}</div> : null}
        </Card>
      ) : null}

      {activeTab === 'quantity' ? (
        <Card
          id={'debug-panel-quantity'}
          role={'tabpanel'}
          aria-labelledby={'debug-tab-quantity'}
          header={
            <>
              <h2 className={'title title-sm'}>{messages.pages.debug.quantityTitle}</h2>
              <p className={'subtitle'}>{messages.pages.debug.quantitySubtitle}</p>
            </>
          }
          bodyClassName={'stack'}
        >
          {countQuantityTests.map((test) => (
            <TestResultCard
              key={`${test.input}-${test.expectedName}`}
              title={test.input}
              expected={
                <>
                  {test.expectedName}
                  {` · ${messages.labels.count} ${test.expectedQuantityValue}`}
                </>
              }
              actual={
                <>
                  {test.actualName}
                  {typeof test.actualQuantityValue === 'number'
                    ? ` · ${messages.labels.count} ${test.actualQuantityValue}`
                    : ''}
                </>
              }
              passed={test.passed}
            />
          ))}
          {!countQuantityHasFailures ? <div className={'empty-state'}>{messages.pages.debug.allQuantityPass}</div> : null}
        </Card>
      ) : null}

      {activeTab === 'measurements' ? (
        <Card
          id={'debug-panel-measurements'}
          role={'tabpanel'}
          aria-labelledby={'debug-tab-measurements'}
          header={
            <>
              <h2 className={'title title-sm'}>{messages.pages.debug.measurementTitle}</h2>
              <p className={'subtitle'}>{messages.pages.debug.measurementSubtitle}</p>
            </>
          }
          bodyClassName={'stack'}
        >
          {measurementTests.map((test) => (
            <TestResultCard
              key={`${test.countryCode}-${test.displayMode}-${test.input}`}
              title={`${test.input} · ${test.countryCode.toUpperCase()} · ${test.displayMode}`}
              expected={`${test.expectedQuantity} · display ${test.expectedQuantityDisplay}`}
              actual={`${test.actualQuantity ?? messages.pages.debug.unavailable} · display ${
                test.actualQuantityDisplay ?? messages.pages.debug.unavailable
              }`}
              passed={test.passed}
            />
          ))}
          {!measurementHasFailures ? (
            <div className={'empty-state'}>{messages.pages.debug.allMeasurementPass}</div>
          ) : null}
        </Card>
      ) : null}

      {activeTab === 'weights' ? (
        <Card
          id={'debug-panel-weights'}
          role={'tabpanel'}
          aria-labelledby={'debug-tab-weights'}
          header={
            <>
              <h2 className={'title title-sm'}>{messages.pages.debug.weightTitle}</h2>
              <p className={'subtitle'}>{messages.pages.debug.weightSubtitle}</p>
            </>
          }
          bodyClassName={'stack'}
        >
          {unitQuantityTests.map((test) => (
            <TestResultCard
              key={`${test.input}-${test.expectedName}`}
              title={test.input}
              expected={
                <>
                  {test.expectedName}
                  {` · ${test.expectedQuantity}`}
                  {test.expectedQuantityDisplay ? ` · display ${test.expectedQuantityDisplay}` : ''}
                  {typeof test.expectedQuantityValue === 'number'
                    ? ` · ${messages.labels.count} ${test.expectedQuantityValue}`
                    : ''}
                </>
              }
              actual={
                <>
                  {test.actualName}
                  {test.actualQuantity ? ` · ${test.actualQuantity}` : ''}
                  {test.actualQuantityDisplay && test.actualQuantityDisplay !== test.actualQuantity
                    ? ` · display ${test.actualQuantityDisplay}`
                    : ''}
                  {typeof test.actualQuantityValue === 'number'
                    ? ` · ${messages.labels.count} ${test.actualQuantityValue}`
                    : ''}
                </>
              }
              passed={test.passed}
            />
          ))}
          {!unitQuantityHasFailures ? <div className={'empty-state'}>{messages.pages.debug.allWeightPass}</div> : null}
        </Card>
      ) : null}

      {activeTab === 'variants' ? (
        <Card
          id={'debug-panel-variants'}
          role={'tabpanel'}
          aria-labelledby={'debug-tab-variants'}
          header={
            <>
              <h2 className={'title title-sm'}>{messages.pages.debug.variantTitle}</h2>
              <p className={'subtitle'}>{messages.pages.debug.variantSubtitle}</p>
            </>
          }
          bodyClassName={'stack'}
        >
          {variantTests.map((test) => (
            <TestResultCard
              key={`${test.input}-${test.expectedName}-${test.expectedVariant ?? 'none'}`}
              title={test.input}
              expected={`${test.expectedName}${
                test.expectedVariant ? ` · ${messages.labels.variant} ${test.expectedVariant}` : ''
              } · ${test.expectedSection}`}
              actual={`${test.actualName}${
                test.actualVariant ? ` · ${messages.labels.variant} ${test.actualVariant}` : ''
              } · ${test.actualSection}`}
              passed={test.passed}
            />
          ))}
          {!variantHasFailures ? <div className={'empty-state'}>{messages.pages.debug.allVariantPass}</div> : null}
        </Card>
      ) : null}

      {activeTab === 'storage' ? (
        <Card
          id={'debug-panel-storage'}
          role={'tabpanel'}
          aria-labelledby={'debug-tab-storage'}
          header={
            <>
              <h2 className={'title title-sm'}>{messages.pages.debug.storageTitle}</h2>
              <p className={'subtitle'}>{messages.pages.debug.storageSubtitle}</p>
            </>
          }
          bodyClassName={'stack'}
        >
          {storageTests.map((test) => (
            <TestResultCard
              key={test.title}
              title={test.title}
              expected={test.expected}
              actual={test.actual}
              passed={test.passed}
            />
          ))}
          {!storageHasFailures ? <div className={'empty-state'}>{messages.pages.debug.allStoragePass}</div> : null}
        </Card>
      ) : null}

      {activeTab === 'layout' ? (
        <Card
          id={'debug-panel-layout'}
          role={'tabpanel'}
          aria-labelledby={'debug-tab-layout'}
          header={
            <>
              <h2 className={'title title-sm'}>{messages.pages.debug.layoutTitle}</h2>
              <p className={'subtitle'}>{messages.pages.debug.layoutSubtitle}</p>
            </>
          }
          bodyClassName={'stack'}
        >
          <div className={'table-wrap'}>
            <table className={'debug-table'}>
              <tbody>
                <tr>
                  <th scope={'row'}>{messages.labels.countryProfile}</th>
                  <td>
                    {config.flag} {config.label} ({config.code.toUpperCase()})
                  </td>
                </tr>
                <tr>
                  <th scope={'row'}>{messages.labels.measurementMode}</th>
                  <td>
                    {measurementModeLabels[config.measurement.displayMode]} · {config.measurement.unitSystem}
                  </td>
                </tr>
                <tr>
                  <th scope={'row'}>{messages.labels.group}</th>
                  <td>{config.groups.length}</td>
                </tr>
                <tr>
                  <th scope={'row'}>{messages.labels.section}</th>
                  <td>{layoutSectionCount}</td>
                </tr>
                <tr>
                  <th scope={'row'}>{messages.labels.keywords}</th>
                  <td>{layoutKeywordCount}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className={'table-wrap'}>
            <table className={'debug-table'}>
              <thead>
                <tr>
                  <th scope={'col'}>{messages.labels.order}</th>
                  <th scope={'col'}>{messages.labels.group}</th>
                  <th scope={'col'}>{messages.labels.section}</th>
                  <th scope={'col'}>{messages.labels.keywords}</th>
                </tr>
              </thead>
              <tbody>
                {layoutRows.map(({ group, section }, index) => (
                  <tr key={`${group.key}-${section.key}`}>
                    <td>{index + 1}</td>
                    <td>
                      {group.label}
                      <br />
                      <span className={'muted'}>{group.key}</span>
                    </td>
                    <td>
                      {section.label}
                      <br />
                      <span className={'muted'}>{section.key}</span>
                    </td>
                    <td>
                      {section.keywords.length}
                      {section.keywords.length > 0 ? ` · ${section.keywords.slice(0, 8).join(', ')}` : ''}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : null}

      {activeTab === 'sections' ? (
        <div id={'debug-panel-sections'} role={'tabpanel'} aria-labelledby={'debug-tab-sections'}>
          <SectionsPage config={config} />
        </div>
      ) : null}

      {activeTab === 'events' ? (
        <Card
          id={'debug-panel-events'}
          role={'tabpanel'}
          aria-labelledby={'debug-tab-events'}
          header={
            <>
              <h2 className={'title title-sm'}>{messages.pages.debug.eventsTitle}</h2>
              <p className={'subtitle'}>{messages.pages.debug.eventsSubtitle}</p>
            </>
          }
          bodyClassName={'stack'}
        >
          <div className={'table-wrap'}>
            <table className={'debug-table'}>
              <tbody>
                <tr>
                  <th scope={'row'}>{messages.pages.debug.eventNotificationPermissionLabel}</th>
                  <td>{notificationPermission}</td>
                </tr>
                <tr>
                  <th scope={'row'}>{messages.pages.debug.eventNotificationPreferenceLabel}</th>
                  <td>{String(notificationsEnabled)}</td>
                </tr>
                <tr>
                  <th scope={'row'}>{messages.pages.debug.eventNotificationLastTestLabel}</th>
                  <td>
                    <DebugNotificationResultView
                      result={debugNotificationResult}
                      messages={messages}
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <section className={'debug-event-group stack'}>
            <div>
              <h3 className={'title title-xs'}>{messages.pages.debug.eventsNotificationGroupTitle}</h3>
              <p className={'subtitle'}>{messages.pages.debug.eventsNotificationGroupSubtitle}</p>
            </div>
            <DebugEventButton
              label={messages.pages.debug.eventNotificationMinimalLabel}
              hint={messages.pages.debug.eventNotificationMinimalHint}
              onClick={() => onDebugNotificationTest('minimal')}
            />
            <DebugEventButton
              label={messages.pages.debug.eventNotificationSingleLabel}
              hint={messages.pages.debug.eventNotificationSingleHint}
              onClick={() => onDebugNotificationTest('single-item')}
            />
            <DebugEventButton
              label={messages.pages.debug.eventNotificationFewLabel}
              hint={messages.pages.debug.eventNotificationFewHint}
              onClick={() => onDebugNotificationTest('few-items')}
            />
            <DebugEventButton
              label={messages.pages.debug.eventNotificationLargeLabel}
              hint={messages.pages.debug.eventNotificationLargeHint}
              onClick={() => onDebugNotificationTest('large-batch')}
            />
            <DebugEventButton
              label={messages.pages.debug.eventNotificationSilentFollowUpLabel}
              hint={messages.pages.debug.eventNotificationSilentFollowUpHint}
              onClick={() => onDebugNotificationTest('silent-follow-up')}
            />
          </section>
          <section className={'debug-event-group stack'}>
            <div>
              <h3 className={'title title-xs'}>{messages.pages.debug.eventsToastGroupTitle}</h3>
              <p className={'subtitle'}>{messages.pages.debug.eventsToastGroupSubtitle}</p>
            </div>
            <DebugEventButton
              label={messages.pages.debug.eventToastSuccessLabel}
              hint={messages.pages.debug.eventToastSuccessHint}
              onClick={() => onDebugEventTest('toast-success')}
            />
            <DebugEventButton
              label={messages.pages.debug.eventToastInfoLabel}
              hint={messages.pages.debug.eventToastInfoHint}
              onClick={() => onDebugEventTest('toast-info')}
            />
            <DebugEventButton
              label={messages.pages.debug.eventToastWarningLabel}
              hint={messages.pages.debug.eventToastWarningHint}
              onClick={() => onDebugEventTest('toast-warning')}
            />
            <DebugEventButton
              label={messages.pages.debug.eventToastErrorLabel}
              hint={messages.pages.debug.eventToastErrorHint}
              onClick={() => onDebugEventTest('toast-error')}
            />
            <DebugEventButton
              label={messages.pages.debug.eventToastPlainLabel}
              hint={messages.pages.debug.eventToastPlainHint}
              onClick={() => onDebugEventTest('toast-plain')}
            />
          </section>
          <section className={'debug-event-group stack'}>
            <div>
              <h3 className={'title title-xs'}>{messages.pages.debug.eventsOtherGroupTitle}</h3>
              <p className={'subtitle'}>{messages.pages.debug.eventsOtherGroupSubtitle}</p>
            </div>
            <DebugEventButton
              label={messages.pages.debug.eventPwaInstallNudgeLabel}
              hint={messages.pages.debug.eventPwaInstallNudgeHint}
              onClick={() => onDebugEventTest('pwa-install-nudge')}
            />
            <DebugEventButton
              label={messages.pages.debug.eventSecretAisleLabel}
              hint={messages.pages.debug.eventSecretAisleHint}
              onClick={() => onDebugEventTest('secret-aisle')}
            />
            <DebugEventButton
              label={messages.pages.debug.eventPredatorLabel}
              hint={messages.pages.debug.eventPredatorHint}
              onClick={() => onDebugEventTest('predator')}
            />
          </section>
        </Card>
      ) : null}

      {activeTab === 'settings' ? (
        <Card
          id={'debug-panel-settings'}
          role={'tabpanel'}
          aria-labelledby={'debug-tab-settings'}
          header={
            <>
              <h2 className={'title title-sm'}>{messages.pages.debug.settingsTitle}</h2>
              <p className={'subtitle'}>{messages.pages.debug.settingsSubtitle}</p>
            </>
          }
          bodyClassName={'stack'}
        >
          <DebugSettingSwitch
            label={messages.pages.debug.debugModeLabel}
            hint={messages.pages.debug.debugModeHint}
            checked={isDebugMode}
            onChange={onDebugModeChange}
          />
          <DebugSettingSwitch
            label={messages.pages.debug.forceLocalStorageLabel}
            hint={messages.pages.debug.forceLocalStorageHint}
            checked={debugSettings.forceLocalStorage}
            onChange={(enabled) => onDebugSettingChange('forceLocalStorage', enabled)}
          />
          <DebugSettingSwitch
            label={messages.pages.debug.pauseBackendHeartbeatLabel}
            hint={messages.pages.debug.pauseBackendHeartbeatHint}
            checked={debugSettings.pauseBackendHeartbeat}
            onChange={(enabled) => onDebugSettingChange('pauseBackendHeartbeat', enabled)}
          />
          <DebugSettingSwitch
            label={messages.pages.debug.disableAutoBackendReconnectLabel}
            hint={messages.pages.debug.disableAutoBackendReconnectHint}
            checked={debugSettings.disableAutoBackendReconnect}
            onChange={(enabled) => onDebugSettingChange('disableAutoBackendReconnect', enabled)}
          />
          <DebugSettingSwitch
            label={messages.pages.debug.showPwaInstallPromptsLabel}
            hint={messages.pages.debug.showPwaInstallPromptsHint}
            checked={debugSettings.showPwaInstallPrompts}
            onChange={(enabled) => onDebugSettingChange('showPwaInstallPrompts', enabled)}
          />
          <DebugSettingSwitch
            label={messages.pages.debug.disablePwaSplashLabel}
            hint={messages.pages.debug.disablePwaSplashHint}
            checked={debugSettings.disablePwaSplash}
            onChange={(enabled) => onDebugSettingChange('disablePwaSplash', enabled)}
          />
          <DebugSettingSwitch
            label={messages.pages.debug.disableEasterEggsLabel}
            hint={messages.pages.debug.disableEasterEggsHint}
            checked={debugSettings.disableEasterEggs}
            onChange={(enabled) => onDebugSettingChange('disableEasterEggs', enabled)}
          />
          <DebugSettingSwitch
            label={messages.pages.debug.verboseConsoleDiagnosticsLabel}
            hint={messages.pages.debug.verboseConsoleDiagnosticsHint}
            checked={debugSettings.verboseConsoleDiagnostics}
            onChange={(enabled) => onDebugSettingChange('verboseConsoleDiagnostics', enabled)}
          />
        </Card>
      ) : null}

      {activeTab === 'host' ? (
        <Card
          id={'debug-panel-host'}
          role={'tabpanel'}
          aria-labelledby={'debug-tab-host'}
          header={
            <>
              <h2 className={'title title-sm'}>{messages.pages.debug.runtimeTitle}</h2>
              <p className={'subtitle'}>{messages.pages.debug.runtimeSubtitle}</p>
            </>
          }
        >
          <div className={'stack'}>
            <div className={'table-wrap'}>
              <table className={'debug-table'}>
                <tbody>
                  <tr>
                    <th scope={'row'}>{messages.pages.debug.runtimeHostnameLabel}</th>
                    <td>{runtimeLocation?.hostname || messages.pages.debug.unavailable}</td>
                  </tr>
                  <tr>
                    <th scope={'row'}>{messages.pages.debug.runtimeHostLabel}</th>
                    <td>{runtimeLocation?.host || messages.pages.debug.unavailable}</td>
                  </tr>
                  <tr>
                    <th scope={'row'}>{messages.pages.debug.runtimeOriginLabel}</th>
                    <td>{runtimeLocation?.origin || messages.pages.debug.unavailable}</td>
                  </tr>
                  <tr>
                    <th scope={'row'}>{messages.pages.debug.runtimeProtocolLabel}</th>
                    <td>{runtimeLocation?.protocol || messages.pages.debug.unavailable}</td>
                  </tr>
                  <tr>
                    <th scope={'row'}>{messages.pages.debug.runtimeBasePathLabel}</th>
                    <td>{runtimeLocation?.basePath || messages.pages.debug.unavailable}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </Card>
      ) : null}
    </Card>
  );
}

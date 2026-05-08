import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { COUNTRY_CONFIGS } from '../config/countries';
import { sampleItems, StoryCanvas } from '../components/storyFixtures';
import type { BackendHeartbeatSample, BackendStatus, DebugSettings } from '../types';
import { DebugPage } from './DebugPage';

const now = Date.UTC(2026, 4, 8, 11, 30, 0);

const heartbeatLatencies = [
  42,
  58,
  83,
  121,
  187,
  264,
  138,
  96,
  74,
  312,
  468,
  0,
  61,
  118,
  203,
  352,
  89,
  53,
];

const heartbeatSamples: BackendHeartbeatSample[] = heartbeatLatencies.map((latencyMs, index) => ({
  checkedAt: new Date(now - (heartbeatLatencies.length - index) * 5_000).toISOString(),
  state: latencyMs === 0 ? 'offline' : 'connected',
  healthOk: latencyMs !== 0,
  databaseOk: latencyMs !== 0,
  adapter: latencyMs === 0 ? undefined : 'postgres',
  latencyMs: latencyMs === 0 ? 1_500 : latencyMs,
}));

const backendStatus: BackendStatus = {
  state: 'connected',
  health: { ok: true, mode: 'backend' },
  database: {
    ok: true,
    adapter: 'postgres',
    settingsExists: true,
    settingsCountryCode: 'uk',
    shoppingListExists: true,
    sharedListCount: 2,
    updatedAt: new Date(now).toISOString(),
  },
};

const debugSettings: DebugSettings = {
  forceLocalStorage: false,
  pauseBackendHeartbeat: false,
  disableAutoBackendReconnect: false,
  showPwaInstallPrompts: false,
  disablePwaSplash: false,
  disableEasterEggs: false,
  verboseConsoleDiagnostics: false,
};

const meta = {
  title: 'Pages/DebugPage/Backend',
  component: DebugPage,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    backendStatus,
    backendOperation: { state: 'backend', updatedAt: new Date(now).toISOString() },
    heartbeatSamples,
    storageMode: 'backend',
    notificationsEnabled: true,
    notificationPermission: 'granted',
    items: sampleItems,
    config: COUNTRY_CONFIGS.uk,
    matcherTests: [],
    configTests: [],
    countQuantityTests: [],
    measurementTests: [],
    unitQuantityTests: [],
    variantTests: [],
    storageTests: [],
    stateTests: [],
    isDebugMode: true,
    activeTab: 'backend',
    debugSettings,
    matcherHasFailures: false,
    configHasFailures: false,
    countQuantityHasFailures: false,
    measurementHasFailures: false,
    unitQuantityHasFailures: false,
    variantHasFailures: false,
    storageHasFailures: false,
    stateHasFailures: false,
    onRenameItem: fn(),
    onToggleItem: fn(),
    onDeleteItem: fn(),
    onDebugModeChange: fn(),
    onDebugSettingChange: fn(),
    onDebugNotificationTest: fn(),
    onDebugEventTest: fn(),
    onDebugTabChange: fn(),
    onBackToEdit: fn(),
    onBackToSettings: fn(),
  },
} satisfies Meta<typeof DebugPage>;

export default meta;

type Story = StoryObj<typeof meta>;

const renderDebugPage: Story['render'] = (args) => (
  <StoryCanvas>
    <DebugPage {...args} />
  </StoryCanvas>
);

export const HeartbeatTimeline: Story = {
  render: renderDebugPage,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole('heading', { name: /backend checks/i })).toBeVisible();
    await expect(canvas.getByRole('group', { name: /backend heartbeat/i })).toBeVisible();
    await expect(canvas.getByText('0ms')).toBeVisible();
    await expect(canvas.getByText(/status history/i)).toBeVisible();
    await expect(canvas.getAllByText('offline').length).toBeGreaterThan(0);
  },
};

export const InteractionStates: Story = {
  render: renderDebugPage,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const graphPoint = canvas.getAllByRole('button', { name: /latency:/i }).at(-1);
    const statusPoint = canvas.getAllByRole('button', { name: /state:/i }).at(-1);

    if (!graphPoint || !statusPoint) {
      throw new Error('Expected heartbeat graph and status controls');
    }

    await userEvent.click(graphPoint);
    await expect(graphPoint).toHaveAttribute('aria-pressed', 'true');

    await userEvent.click(statusPoint);
    await expect(statusPoint).toHaveAttribute('aria-pressed', 'true');

    await userEvent.click(canvas.getByText(/status history/i));
    await expect(statusPoint).toHaveAttribute('aria-pressed', 'false');
  },
};

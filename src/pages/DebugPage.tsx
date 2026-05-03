import { useState, type KeyboardEvent } from 'react';
import type {
  BackendStatus,
  ConfigTestResult,
  CountQuantityTestResult,
  CountryConfig,
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
  onBackToEdit: () => void;
  onBackToSettings: () => void;
};

const backendSummary = (status: BackendStatus, messages: Messages): string => {
  if (status.state === 'connected') return messages.pages.debug.backendConnected;
  if (status.state === 'checking') return messages.pages.debug.backendChecking;
  if (status.state === 'error') return messages.pages.debug.backendError;
  return messages.pages.debug.backendOffline;
};

const checkTone = (passed: boolean) => (passed ? ('success' as const) : ('danger' as const));

const backendStateLabel = (status: BackendStatus, messages: Messages) => {
  if (status.state === 'connected') return messages.backendStatus.connected;
  if (status.state === 'checking') return messages.backendStatus.checking;
  if (status.state === 'error') return messages.backendStatus.issue;
  return messages.backendStatus.frontendOnly;
};

const checkLabel = (passed: boolean, messages: Messages) => (passed ? messages.pages.debug.pass : messages.pages.debug.fail);

type DebugTabKey =
  | 'parsed'
  | 'state'
  | 'backend'
  | 'config'
  | 'matcher'
  | 'quantity'
  | 'measurements'
  | 'weights'
  | 'variants'
  | 'layout'
  | 'sections'
  | 'storage';

export function DebugPage({
  backendStatus,
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
  onBackToEdit,
  onBackToSettings,
}: DebugPageProps) {
  const { messages } = useI18n();
  const [activeTab, setActiveTab] = useState<DebugTabKey>('parsed');
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

    if (nextIndex === undefined) return;

    event.preventDefault();
    const nextTab = debugTabs[nextIndex];
    setActiveTab(nextTab.key);
    document.getElementById(`debug-tab-${nextTab.key}`)?.focus();
  };

  return (
    <Card
      header={
        <div className="title-row">
          <div>
            <h2 className="title title-md">{messages.pages.debug.title}</h2>
            <p className="subtitle">{messages.pages.debug.subtitle}</p>
          </div>
          <div className="button-row">
            <button type="button" className="button" onClick={onBackToEdit}>
              {messages.actions.backToEdit}
            </button>
            <button type="button" className="button" onClick={onBackToSettings}>
              {messages.actions.backToSettings}
            </button>
          </div>
        </div>
      }
      bodyClassName="stack"
    >
      <div className="debug-tablist" role="tablist" aria-label={messages.pages.debug.title}>
        {debugTabs.map((tab, index) => (
          <button
            key={tab.key}
            id={`debug-tab-${tab.key}`}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.key}
            aria-controls={`debug-panel-${tab.key}`}
            tabIndex={activeTab === tab.key ? 0 : -1}
            className={`button ${activeTab === tab.key ? 'button-active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
            onKeyDown={(event) => handleTabKeyDown(event, index)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'parsed' ? (
        <Card
          id="debug-panel-parsed"
          role="tabpanel"
          aria-labelledby="debug-tab-parsed"
          header={
            <>
              <h2 className="title title-sm">{messages.pages.debug.parsedTitle}</h2>
              <p className="subtitle">{messages.pages.debug.parsedSubtitle}</p>
            </>
          }
        >
          <div className="scroll-region stack">
            {items.length === 0 ? (
              <div className="empty-state">{messages.pages.edit.parsedEmpty}</div>
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
          id="debug-panel-state"
          role="tabpanel"
          aria-labelledby="debug-tab-state"
          header={
            <>
              <h2 className="title title-sm">{messages.pages.debug.stateTitle}</h2>
              <p className="subtitle">{messages.pages.debug.stateSubtitle}</p>
            </>
          }
          bodyClassName="stack"
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
          {!stateHasFailures ? <div className="empty-state">{messages.pages.debug.allStatePass}</div> : null}
        </Card>
      ) : null}

      {activeTab === 'backend' ? (
        <Card
          id="debug-panel-backend"
          role="tabpanel"
          aria-labelledby="debug-tab-backend"
          header={
            <>
              <h2 className="title title-sm">{messages.pages.debug.backendTitle}</h2>
              <p className="subtitle">{backendSummary(backendStatus, messages)}</p>
            </>
          }
          bodyClassName="stack"
        >
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
        </Card>
      ) : null}

      {activeTab === 'config' ? (
        <Card
          id="debug-panel-config"
          role="tabpanel"
          aria-labelledby="debug-tab-config"
          header={
            <>
              <h2 className="title title-sm">{messages.pages.debug.configTitle}</h2>
              <p className="subtitle">{messages.pages.debug.configSubtitle}</p>
            </>
          }
          bodyClassName="stack"
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
          {!configHasFailures ? <div className="empty-state">{messages.pages.debug.allConfigPass}</div> : null}
        </Card>
      ) : null}

      {activeTab === 'matcher' ? (
        <Card
          id="debug-panel-matcher"
          role="tabpanel"
          aria-labelledby="debug-tab-matcher"
          header={
            <>
              <h2 className="title title-sm">{messages.pages.debug.matcherTitle}</h2>
              <p className="subtitle">{messages.pages.debug.matcherSubtitle}</p>
            </>
          }
          bodyClassName="stack"
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
          {!matcherHasFailures ? <div className="empty-state">{messages.pages.debug.allMatcherPass}</div> : null}
        </Card>
      ) : null}

      {activeTab === 'quantity' ? (
        <Card
          id="debug-panel-quantity"
          role="tabpanel"
          aria-labelledby="debug-tab-quantity"
          header={
            <>
              <h2 className="title title-sm">{messages.pages.debug.quantityTitle}</h2>
              <p className="subtitle">{messages.pages.debug.quantitySubtitle}</p>
            </>
          }
          bodyClassName="stack"
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
          {!countQuantityHasFailures ? <div className="empty-state">{messages.pages.debug.allQuantityPass}</div> : null}
        </Card>
      ) : null}

      {activeTab === 'measurements' ? (
        <Card
          id="debug-panel-measurements"
          role="tabpanel"
          aria-labelledby="debug-tab-measurements"
          header={
            <>
              <h2 className="title title-sm">{messages.pages.debug.measurementTitle}</h2>
              <p className="subtitle">{messages.pages.debug.measurementSubtitle}</p>
            </>
          }
          bodyClassName="stack"
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
            <div className="empty-state">{messages.pages.debug.allMeasurementPass}</div>
          ) : null}
        </Card>
      ) : null}

      {activeTab === 'weights' ? (
        <Card
          id="debug-panel-weights"
          role="tabpanel"
          aria-labelledby="debug-tab-weights"
          header={
            <>
              <h2 className="title title-sm">{messages.pages.debug.weightTitle}</h2>
              <p className="subtitle">{messages.pages.debug.weightSubtitle}</p>
            </>
          }
          bodyClassName="stack"
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
          {!unitQuantityHasFailures ? <div className="empty-state">{messages.pages.debug.allWeightPass}</div> : null}
        </Card>
      ) : null}

      {activeTab === 'variants' ? (
        <Card
          id="debug-panel-variants"
          role="tabpanel"
          aria-labelledby="debug-tab-variants"
          header={
            <>
              <h2 className="title title-sm">{messages.pages.debug.variantTitle}</h2>
              <p className="subtitle">{messages.pages.debug.variantSubtitle}</p>
            </>
          }
          bodyClassName="stack"
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
          {!variantHasFailures ? <div className="empty-state">{messages.pages.debug.allVariantPass}</div> : null}
        </Card>
      ) : null}

      {activeTab === 'storage' ? (
        <Card
          id="debug-panel-storage"
          role="tabpanel"
          aria-labelledby="debug-tab-storage"
          header={
            <>
              <h2 className="title title-sm">{messages.pages.debug.storageTitle}</h2>
              <p className="subtitle">{messages.pages.debug.storageSubtitle}</p>
            </>
          }
          bodyClassName="stack"
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
          {!storageHasFailures ? <div className="empty-state">{messages.pages.debug.allStoragePass}</div> : null}
        </Card>
      ) : null}

      {activeTab === 'layout' ? (
        <Card
          id="debug-panel-layout"
          role="tabpanel"
          aria-labelledby="debug-tab-layout"
          header={
            <>
              <h2 className="title title-sm">{messages.pages.debug.layoutTitle}</h2>
              <p className="subtitle">{messages.pages.debug.layoutSubtitle}</p>
            </>
          }
          bodyClassName="stack"
        >
          <div className="table-wrap">
            <table className="debug-table">
              <tbody>
                <tr>
                  <th scope="row">{messages.labels.countryProfile}</th>
                  <td>
                    {config.flag} {config.label} ({config.code.toUpperCase()})
                  </td>
                </tr>
                <tr>
                  <th scope="row">{messages.labels.measurementMode}</th>
                  <td>
                    {measurementModeLabels[config.measurement.displayMode]} · {config.measurement.unitSystem}
                  </td>
                </tr>
                <tr>
                  <th scope="row">{messages.labels.group}</th>
                  <td>{config.groups.length}</td>
                </tr>
                <tr>
                  <th scope="row">{messages.labels.section}</th>
                  <td>{layoutSectionCount}</td>
                </tr>
                <tr>
                  <th scope="row">{messages.labels.keywords}</th>
                  <td>{layoutKeywordCount}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="table-wrap">
            <table className="debug-table">
              <thead>
                <tr>
                  <th scope="col">{messages.labels.order}</th>
                  <th scope="col">{messages.labels.group}</th>
                  <th scope="col">{messages.labels.section}</th>
                  <th scope="col">{messages.labels.keywords}</th>
                </tr>
              </thead>
              <tbody>
                {layoutRows.map(({ group, section }, index) => (
                  <tr key={`${group.key}-${section.key}`}>
                    <td>{index + 1}</td>
                    <td>
                      {group.label}
                      <br />
                      <span className="muted">{group.key}</span>
                    </td>
                    <td>
                      {section.label}
                      <br />
                      <span className="muted">{section.key}</span>
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
        <div id="debug-panel-sections" role="tabpanel" aria-labelledby="debug-tab-sections">
          <SectionsPage config={config} />
        </div>
      ) : null}
    </Card>
  );
}

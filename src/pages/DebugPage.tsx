import { useState } from 'react';
import type {
  BackendStatus,
  ConfigTestResult,
  CountQuantityTestResult,
  CountryConfig,
  Item,
  MatcherTestResult,
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
  unitQuantityTests: UnitQuantityTestResult[];
  variantTests: VariantTestResult[];
  storageTests: StorageTestResult[];
  stateTests: StateTestResult[];
  matcherHasFailures: boolean;
  configHasFailures: boolean;
  countQuantityHasFailures: boolean;
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
  | 'weights'
  | 'variants'
  | 'sections'
  | 'storage';

export function DebugPage({
  backendStatus,
  items,
  config,
  matcherTests,
  configTests,
  countQuantityTests,
  unitQuantityTests,
  variantTests,
  storageTests,
  stateTests,
  matcherHasFailures,
  configHasFailures,
  countQuantityHasFailures,
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
    { key: 'weights', label: messages.pages.debug.tabWeights },
    { key: 'variants', label: messages.pages.debug.tabVariants },
    { key: 'sections', label: messages.pages.debug.tabSections },
    { key: 'storage', label: messages.pages.debug.tabStorage },
  ];

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
        {debugTabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.key}
            className={`button ${activeTab === tab.key ? 'button-active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'parsed' ? (
        <Card
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

      {activeTab === 'weights' ? (
        <Card
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
                  {typeof test.expectedQuantityValue === 'number'
                    ? ` · ${messages.labels.count} ${test.expectedQuantityValue}`
                    : ''}
                </>
              }
              actual={
                <>
                  {test.actualName}
                  {test.actualQuantity ? ` · ${test.actualQuantity}` : ''}
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

      {activeTab === 'sections' ? <SectionsPage config={config} /> : null}
    </Card>
  );
}

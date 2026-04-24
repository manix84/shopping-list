import type { BackendStatus, MatcherTestResult, QuantityTestResult, StorageTestResult } from '../types';
import { Card } from '../components/Card';
import { TestResultCard } from '../components/TestResultCard';
import { useI18n } from '../lib/i18n';
import type { Messages } from '../lib/i18n';

type DebugPageProps = {
  backendStatus: BackendStatus;
  matcherTests: MatcherTestResult[];
  quantityTests: QuantityTestResult[];
  storageTests: StorageTestResult[];
  matcherHasFailures: boolean;
  quantityHasFailures: boolean;
  storageHasFailures: boolean;
  onBackToEdit: () => void;
  onBackToSettings: () => void;
};

const backendSummary = (status: BackendStatus, messages: Messages): string => {
  if (status.state === 'connected') return messages.pages.debug.backendConnected;
  if (status.state === 'checking') return messages.pages.debug.backendChecking;
  if (status.state === 'error') return messages.pages.debug.backendError;
  return messages.pages.debug.backendOffline;
};

const backendTone = (status: BackendStatus) => {
  if (status.state === 'connected') return 'success' as const;
  if (status.state === 'error') return 'danger' as const;
  return 'muted' as const;
};

const backendStateLabel = (status: BackendStatus, messages: Messages) => {
  if (status.state === 'connected') return messages.backendStatus.connected;
  if (status.state === 'checking') return messages.backendStatus.checking;
  if (status.state === 'error') return messages.backendStatus.issue;
  return messages.backendStatus.frontendOnly;
};

const backendLabel = (status: BackendStatus, messages: Messages) => {
  if (status.state === 'connected') return messages.pages.debug.pass;
  if (status.state === 'error') return messages.pages.debug.fail;
  return messages.pages.debug.unavailable;
};

export function DebugPage({
  backendStatus,
  matcherTests,
  quantityTests,
  storageTests,
  matcherHasFailures,
  quantityHasFailures,
  storageHasFailures,
  onBackToEdit,
  onBackToSettings,
}: DebugPageProps) {
  const { messages } = useI18n();

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
          tone={backendTone(backendStatus)}
          label={backendLabel(backendStatus, messages)}
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
                }, ${messages.labels.updated} ${backendStatus.database.updatedAt ?? messages.labels.unknown}`
              : `${messages.labels.state} ${backendStateLabel(backendStatus, messages)}`
          }
          passed={backendStatus.database.ok}
          tone={backendTone(backendStatus)}
          label={backendLabel(backendStatus, messages)}
        />
      </Card>

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

      <Card
        header={
          <>
            <h2 className="title title-sm">{messages.pages.debug.quantityTitle}</h2>
            <p className="subtitle">{messages.pages.debug.quantitySubtitle}</p>
          </>
        }
        bodyClassName="stack"
      >
        {quantityTests.map((test) => (
          <TestResultCard
            key={`${test.input}-${test.expectedName}`}
            title={test.input}
            expected={
              <>
                {test.expectedName}
                {test.expectedQuantity ? ` · ${test.expectedQuantity}` : ''}
                {typeof test.expectedQuantityValue === 'number'
                  ? ` · ${messages.labels.count} ${test.expectedQuantityValue}`
                  : ''}
              </>
            }
            actual={
              <>
                {test.actualName}
                {test.actualQuantity ? ` · ${test.actualQuantity}` : ''}
                {typeof test.actualQuantityValue === 'number' ? ` · ${messages.labels.count} ${test.actualQuantityValue}` : ''}
              </>
            }
            passed={test.passed}
          />
        ))}
        {!quantityHasFailures ? <div className="empty-state">{messages.pages.debug.allQuantityPass}</div> : null}
      </Card>

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
    </Card>
  );
}

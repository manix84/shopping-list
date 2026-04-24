import type { BackendStatus, MatcherTestResult, QuantityTestResult, StorageTestResult } from '../types';
import { Card } from '../components/Card';
import { TestResultCard } from '../components/TestResultCard';
import { useI18n } from '../lib/i18n';

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

const backendSummary = (status: BackendStatus): string => {
  if (status.state === 'connected') return 'Backend API and database are available.';
  if (status.state === 'checking') return 'Backend status is being checked.';
  if (status.state === 'error') return 'Backend responded, but one or more checks failed.';
  return 'Backend is offline; the app is using frontend-only storage.';
};

const backendTone = (status: BackendStatus) => {
  if (status.state === 'connected') return 'success' as const;
  if (status.state === 'error') return 'danger' as const;
  return 'muted' as const;
};

const backendLabel = (status: BackendStatus, passLabel: string, failLabel: string) => {
  if (status.state === 'connected') return passLabel;
  if (status.state === 'error') return failLabel;
  return 'Unavailable';
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
            <h2 className="title title-sm">Backend checks</h2>
            <p className="subtitle">{backendSummary(backendStatus)}</p>
          </>
        }
        bodyClassName="stack"
      >
        <TestResultCard
          title="Backend health"
          expected="GET /api/health returns OK"
          actual={
            backendStatus.state === 'connected' || backendStatus.state === 'error'
              ? `state ${backendStatus.state}, mode ${backendStatus.health.mode ?? 'unknown'}`
              : `state ${backendStatus.state}`
          }
          passed={backendStatus.health.ok}
          tone={backendTone(backendStatus)}
          label={backendLabel(backendStatus, messages.pages.debug.pass, messages.pages.debug.fail)}
        />
        <TestResultCard
          title="Database"
          expected="GET /api/database/status can read the backend store"
          actual={
            backendStatus.database.ok
              ? `available, default list ${backendStatus.database.shoppingListExists ? 'exists' : 'empty'}, shared lists ${
                  backendStatus.database.sharedListCount ?? 0
                }, updated ${backendStatus.database.updatedAt ?? 'unknown'}`
              : `state ${backendStatus.state}`
          }
          passed={backendStatus.database.ok}
          tone={backendTone(backendStatus)}
          label={backendLabel(backendStatus, messages.pages.debug.pass, messages.pages.debug.fail)}
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
                {typeof test.expectedQuantityValue === 'number' ? ` · count ${test.expectedQuantityValue}` : ''}
              </>
            }
            actual={
              <>
                {test.actualName}
                {test.actualQuantity ? ` · ${test.actualQuantity}` : ''}
                {typeof test.actualQuantityValue === 'number' ? ` · count ${test.actualQuantityValue}` : ''}
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

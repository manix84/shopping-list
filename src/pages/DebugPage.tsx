import type { BackendStatus, MatcherTestResult, QuantityTestResult, StorageTestResult } from '../types';
import { Card } from '../components/Card';
import { TestResultCard } from '../components/TestResultCard';

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

const backendLabel = (status: BackendStatus) => {
  if (status.state === 'connected') return 'Pass';
  if (status.state === 'error') return 'Fail';
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
  return (
    <Card
      header={
        <div className="title-row">
          <div>
            <h2 className="title title-md">Debug tools</h2>
            <p className="subtitle">Self-checks and parser diagnostics live here instead of cluttering the main flow.</p>
          </div>
          <div className="button-row">
            <button className="button" onClick={onBackToEdit}>Back to edit</button>
            <button className="button" onClick={onBackToSettings}>Back to settings</button>
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
          label={backendLabel(backendStatus)}
        />
        <TestResultCard
          title="Database"
          expected="GET /api/database/status can read the backend store"
          actual={
            backendStatus.database.ok
              ? `available, default list ${backendStatus.database.shoppingListExists ? 'exists' : 'empty'}, shared lists ${backendStatus.database.sharedListCount ?? 0}, updated ${backendStatus.database.updatedAt ?? 'unknown'}`
              : `state ${backendStatus.state}`
          }
          passed={backendStatus.database.ok}
          tone={backendTone(backendStatus)}
          label={backendLabel(backendStatus)}
        />
      </Card>

      <Card
        header={
          <>
            <h2 className="title title-sm">Matcher self-checks</h2>
            <p className="subtitle">Lightweight checks so grouping regressions are obvious while building.</p>
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
        {!matcherHasFailures ? <div className="empty-state">All matcher checks are passing.</div> : null}
      </Card>

      <Card
        header={
          <>
            <h2 className="title title-sm">Quantity self-checks</h2>
            <p className="subtitle">Count-style quantities stay as one checkable item, with quantity metadata attached.</p>
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
        {!quantityHasFailures ? <div className="empty-state">All quantity checks are passing.</div> : null}
      </Card>

      <Card
        header={
          <>
            <h2 className="title title-sm">Storage self-checks</h2>
            <p className="subtitle">Record data should round-trip cleanly through local storage and any future database store.</p>
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
        {!storageHasFailures ? <div className="empty-state">All storage checks are passing.</div> : null}
      </Card>
    </Card>
  );
}

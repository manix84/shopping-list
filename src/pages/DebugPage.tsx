import type { MatcherTestResult, QuantityTestResult } from '../types';
import { Card } from '../components/Card';
import { TestResultCard } from '../components/TestResultCard';

type DebugPageProps = {
  matcherTests: MatcherTestResult[];
  quantityTests: QuantityTestResult[];
  matcherHasFailures: boolean;
  quantityHasFailures: boolean;
  onBackToEdit: () => void;
  onBackToSettings: () => void;
};

export function DebugPage({
  matcherTests,
  quantityTests,
  matcherHasFailures,
  quantityHasFailures,
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
    </Card>
  );
}

import type { MatcherTestResult, QuantityTestResult, StorageTestResult } from '../types';
import { Card } from '../components/Card';
import { TestResultCard } from '../components/TestResultCard';
import { useI18n } from '../lib/i18n';

type DebugPageProps = {
  matcherTests: MatcherTestResult[];
  quantityTests: QuantityTestResult[];
  storageTests: StorageTestResult[];
  matcherHasFailures: boolean;
  quantityHasFailures: boolean;
  storageHasFailures: boolean;
  onBackToEdit: () => void;
  onBackToSettings: () => void;
};

export function DebugPage({
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

import { useI18n } from '../lib/i18n';

type DebugLinkProps = {
  onOpen: () => void;
};

export function DebugLink({ onOpen }: DebugLinkProps) {
  const { messages } = useI18n();
  return (
    <div className={'debug-link-row'}>
      <button type={'button'} className={'button button-link'} onClick={onOpen}>
        {messages.actions.openDebugTools}
      </button>
    </div>
  );
}

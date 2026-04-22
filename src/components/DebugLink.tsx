type DebugLinkProps = {
  onOpen: () => void;
};

export function DebugLink({ onOpen }: DebugLinkProps) {
  return (
    <div className="debug-link-row">
      <button className="button button-link" onClick={onOpen}>Open debug tools</button>
    </div>
  );
}

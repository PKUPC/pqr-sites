export function Difficulty({ level }: { level: number }) {
  const label = `难度 ${level}/5`;
  return (
    <span className="difficulty" data-level={level} role="img" aria-label={label} title={label}>
      <span className="difficulty-caption" aria-hidden="true">
        难度
      </span>
      <span className="difficulty-meter" aria-hidden="true">
        {Array.from({ length: 5 }, (_, index) => (
          <span key={index} className={`difficulty-segment${index < level ? ' is-filled' : ''}`} />
        ))}
      </span>
    </span>
  );
}

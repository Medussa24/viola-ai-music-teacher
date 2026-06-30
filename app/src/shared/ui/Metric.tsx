type MetricProps = {
  label: string;
  value: string;
  detail: string;
};

export function Metric({ detail, label, value }: MetricProps) {
  return (
    <div className="metric">
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{detail}</small>
    </div>
  );
}

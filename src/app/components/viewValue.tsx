interface ViewValueProps {
  label: string,
  value: string,
}

const ViewValue = ({ label, value }: ViewValueProps) => {
  return (
    <div className="mb-2">
      <div>{label}</div>
      <div className="font-bold">{value}</div>
    </div>
  );
}

export { ViewValue };

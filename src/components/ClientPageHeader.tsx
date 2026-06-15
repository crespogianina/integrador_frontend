type ClientPageHeaderProps = {
  title: string;
  description: string;
  action?: React.ReactNode;
};

export default function ClientPageHeader({
  title,
  description,
  action,
}: ClientPageHeaderProps) {
  return (
    <div
      className={`rounded-2xl bg-white p-5 shadow ${
        action
          ? "flex flex-wrap items-center justify-between gap-4"
          : ""
      }`}
    >
      <div>
        <h1 className="text-2xl font-bold text-slate-800">{title}</h1>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>
      {action}
    </div>
  );
}

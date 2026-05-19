interface TimePickerProps {
  label: string;
  value: number | null;
  onChange: (minutes: number | null) => void;
}

export default function TimePicker({ label, value, onChange }: TimePickerProps) {
  const hours = value !== null ? Math.floor(value / 60) : '';
  const mins = value !== null ? value % 60 : '';

  function handleHours(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/\D/g, '');
    const h = raw === '' ? 0 : Math.min(parseInt(raw), 99);
    const m = value !== null ? value % 60 : 0;
    const total = h * 60 + m;
    onChange(total === 0 && raw === '' ? null : total);
  }

  function handleMins(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/\D/g, '');
    const m = raw === '' ? 0 : Math.min(parseInt(raw), 59);
    const h = value !== null ? Math.floor(value / 60) : 0;
    const total = h * 60 + m;
    onChange(total === 0 && raw === '' ? null : total);
  }

  const fieldClass =
    'w-16 px-2 py-2.5 text-center rounded-xl border border-black/10 bg-white text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors duration-150';

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-text">{label}</span>
      <div className="flex items-center gap-2">
        <div className="flex flex-col items-center gap-1">
          <input
            type="text"
            inputMode="numeric"
            value={hours}
            onChange={handleHours}
            placeholder="0"
            maxLength={2}
            className={fieldClass}
          />
          <span className="text-xs text-text/40">hr</span>
        </div>
        <span className="text-text/30 font-medium pb-5">:</span>
        <div className="flex flex-col items-center gap-1">
          <input
            type="text"
            inputMode="numeric"
            value={mins}
            onChange={handleMins}
            placeholder="00"
            maxLength={2}
            className={fieldClass}
          />
          <span className="text-xs text-text/40">min</span>
        </div>
      </div>
    </div>
  );
}

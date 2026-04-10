import { TASKS, type TaskCode } from '@/lib/tasks';

export type BadgeData = {
  task_code: TaskCode;
  status: 'pending' | 'completed';
  elapsed_seconds?: number | null;
  bonus_seconds?: number | null;
};

function formatSeconds(value?: number | null) {
  if (value === null || value === undefined) return '—';
  const minutes = Math.floor(value / 60);
  const seconds = value % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

export function BadgeGrid({ items }: { items: BadgeData[] }) {
  return (
    <div className="grid">
      {items.map((item) => {
        const meta = TASKS[item.task_code];
        const isDone = item.status === 'completed';
        return (
          <div key={item.task_code} className={`badge ${isDone ? 'done' : 'pending'}`}>
            <div className="badge-title">{item.task_code}</div>
            <div>{meta.title}</div>
            <div className="muted">{meta.short}</div>
            <div className="muted">
              {item.task_code === 'QR5'
                ? item.bonus_seconds
                  ? `-${item.bonus_seconds}s`
                  : 'Nav bonusa'
                : isDone
                  ? formatSeconds(item.elapsed_seconds ?? 0)
                  : 'Nav pabeigts'}
            </div>
          </div>
        );
      })}
    </div>
  );
}

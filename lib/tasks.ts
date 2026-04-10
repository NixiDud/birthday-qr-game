export type TaskCode = 'QR1' | 'QR2' | 'QR3' | 'QR4' | 'QR5' | 'QR6';

export const TASKS: Record<TaskCode, { title: string; short: string }> = {
  QR1: { title: 'Babuļa smaida', short: 'Samīļo Babuļu un pasaki komplimentu.' },
  QR2: { title: 'Slepenais kods', short: 'Atrodi cilvēku pēc slepenā koda sākuma cipara.' },
  QR3: { title: 'Mīkla', short: 'Atmini mīklu par Bleiku.' },
  QR4: { title: 'Lapenes galdi', short: 'Atbildi, cik galdi ir lapenē.' },
  QR5: { title: 'Laika bonuss', short: 'Griez ratu un noņem sekundes.' },
  QR6: { title: 'Burtu uzdevums', short: 'Saliec teikumu no burtiem.' },
};

export const ALL_TASK_CODES = Object.keys(TASKS) as TaskCode[];

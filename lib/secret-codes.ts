export type SecretCodeEntry = {
  code: string;
  leadingDigit: number;
  orderIndex: number;
};

export const SECRET_CODE_LIBRARY: SecretCodeEntry[] = [
  { code: '18426', leadingDigit: 1, orderIndex: 1 },
  { code: '16385', leadingDigit: 1, orderIndex: 2 },
  { code: '24831', leadingDigit: 2, orderIndex: 3 },
  { code: '29674', leadingDigit: 2, orderIndex: 4 },
  { code: '31582', leadingDigit: 3, orderIndex: 5 },
  { code: '36741', leadingDigit: 3, orderIndex: 6 },
  { code: '42865', leadingDigit: 4, orderIndex: 7 },
  { code: '47193', leadingDigit: 4, orderIndex: 8 },
  { code: '53481', leadingDigit: 5, orderIndex: 9 },
  { code: '58624', leadingDigit: 5, orderIndex: 10 },
  { code: '64275', leadingDigit: 6, orderIndex: 11 },
  { code: '69831', leadingDigit: 6, orderIndex: 12 },
  { code: '71384', leadingDigit: 7, orderIndex: 13 },
  { code: '75926', leadingDigit: 7, orderIndex: 14 },
  { code: '82461', leadingDigit: 8, orderIndex: 15 },
  { code: '87539', leadingDigit: 8, orderIndex: 16 }
];

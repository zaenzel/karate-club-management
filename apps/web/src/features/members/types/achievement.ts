export type AchievementLevel = 'CITY' | 'PROVINCE' | 'NATIONAL' | 'INTERNATIONAL' | 'OTHER';

export const ACHIEVEMENT_LEVEL_LABELS: Record<AchievementLevel, string> = {
  CITY: 'Kota/Kabupaten',
  PROVINCE: 'Provinsi',
  NATIONAL: 'Nasional',
  INTERNATIONAL: 'Internasional',
  OTHER: 'Lainnya',
} as const;

export type Achievement = {
  id: string;
  memberId: string;
  championship: string;
  level: AchievementLevel;
  category: string | null;
  result: string;
  date: string; // YYYY-MM-DD
  location: string | null;
  createdAt: string;
};

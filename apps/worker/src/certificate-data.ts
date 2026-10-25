const MONTHS_ID = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

export function formatDateId(date: Date): string {
  const d = date.getUTCDate();
  const m = MONTHS_ID[date.getUTCMonth()];
  const y = date.getUTCFullYear();
  return `${d} ${m} ${y}`;
}

export function formatGradeText(beltName: string, kyu: number | null, dan: number | null): string {
  const isBlack = beltName.toLowerCase() === 'hitam' || (dan !== null && dan > 0);
  if (isBlack) {
    return `hitam dan ${dan ?? 1}`;
  }
  const kyuText = kyu !== null ? `kyu ${kyu}` : '';
  return `${beltName.toLowerCase()} ${kyuText}`.trim();
}

export interface RawCertificateRecord {
  id: string;
  number: string;
  member: {
    name: string;
    birthPlace: string;
    birthDate: Date;
    branch: {
      name: string;
    };
  };
  examParticipant: {
    exam: {
      date: Date;
      location: string;
    };
    gradeHistory: {
      toBelt: {
        name: string;
      };
      toKyu: any;
      toDan: number | null;
    } | null;
  };
}

export interface CertificateTextValues {
  number: string;
  name: string;
  birth: string;
  branch: string;
  examDate: string;
  examLocation: string;
  grade: string;
}

export function mapCertificateToTexts(record: RawCertificateRecord): CertificateTextValues {
  const birthFormatted = `${record.member.birthPlace}, ${formatDateId(record.member.birthDate)}`;
  const examDateFormatted = formatDateId(record.examParticipant.exam.date);

  const toBeltName = record.examParticipant.gradeHistory?.toBelt.name ?? '';
  const toKyuNumber = record.examParticipant.gradeHistory?.toKyu
    ? Number(record.examParticipant.gradeHistory.toKyu)
    : null;
  const toDanNumber = record.examParticipant.gradeHistory?.toDan ?? null;

  const gradeText = formatGradeText(toBeltName, toKyuNumber, toDanNumber);

  return {
    number: record.number,
    name: record.member.name,
    birth: birthFormatted,
    branch: record.member.branch.name,
    examDate: examDateFormatted,
    examLocation: record.examParticipant.exam.location,
    grade: gradeText,
  };
}

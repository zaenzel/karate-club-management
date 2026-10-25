export function formatCertificateNumber(year: number, sequence: number): string {
  const padded = String(sequence).padStart(5, '0');
  return `C${year}${padded}`;
}

export function parseCertificateNumberSequence(
  certificateNumber: string,
  year: number,
): number | null {
  const prefix = `C${year}`;
  if (!certificateNumber.startsWith(prefix)) {
    return null;
  }
  const seqStr = certificateNumber.slice(prefix.length);
  const num = Number.parseInt(seqStr, 10);
  return Number.isNaN(num) ? null : num;
}

export type CertificateNumberPrismaClient = {
  certificate: {
    findFirst: (args: {
      where: { number: { startsWith: string } };
      orderBy: { number: 'desc' };
      select: { number: true };
    }) => Promise<{ number: string } | null>;
  };
};

export async function getNextCertificateNumber(
  client: CertificateNumberPrismaClient,
  now = new Date(),
): Promise<string> {
  const year = now.getFullYear();
  const prefix = `C${year}`;

  const lastCert = await client.certificate.findFirst({
    where: {
      number: {
        startsWith: prefix,
      },
    },
    orderBy: {
      number: 'desc',
    },
    select: {
      number: true,
    },
  });

  const lastSeq = lastCert ? (parseCertificateNumberSequence(lastCert.number, year) ?? 0) : 0;
  return formatCertificateNumber(year, lastSeq + 1);
}

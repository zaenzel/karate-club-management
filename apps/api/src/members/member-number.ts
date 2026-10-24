export function formatMemberNumber(year: number, sequence: number): string {
  const padded = String(sequence).padStart(5, '0');
  return `M${year}${padded}`;
}

export function parseMemberNumberSequence(memberNumber: string, year: number): number | null {
  const prefix = `M${year}`;
  if (!memberNumber.startsWith(prefix)) {
    return null;
  }
  const seqStr = memberNumber.slice(prefix.length);
  const num = Number.parseInt(seqStr, 10);
  return Number.isNaN(num) ? null : num;
}

export type MemberNumberPrismaClient = {
  member: {
    findFirst: (args: {
      where: { memberNumber: { startsWith: string } };
      orderBy: { memberNumber: 'desc' };
      select: { memberNumber: true };
    }) => Promise<{ memberNumber: string } | null>;
  };
};

export async function getNextMemberNumber(
  client: MemberNumberPrismaClient,
  now = new Date(),
): Promise<string> {
  const year = now.getFullYear();
  const prefix = `M${year}`;

  const lastMember = await client.member.findFirst({
    where: {
      memberNumber: {
        startsWith: prefix,
      },
    },
    orderBy: {
      memberNumber: 'desc',
    },
    select: {
      memberNumber: true,
    },
  });

  const lastSeq = lastMember ? (parseMemberNumberSequence(lastMember.memberNumber, year) ?? 0) : 0;
  return formatMemberNumber(year, lastSeq + 1);
}

'use client';

import Link from 'next/link';
import { ArrowLeft, Building2, Calendar, MapPin, Pencil, Phone, Trash2, User } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

import { formatBirthDate, formatGradeSummary } from '../types/grade';
import { MEMBER_TYPE_LABELS, type Member } from '../types/member';
import { BeltBadge } from './belt-badge';

export type MemberDetailProps = {
  member: Member;
  onDelete: () => void;
  isDeleting?: boolean;
};

export function MemberDetail({ member, onDelete, isDeleting = false }: MemberDetailProps) {
  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/members"
          className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          <span>Kembali ke daftar member</span>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href={`/members/${member.id}/edit`}
            className={buttonVariants({ variant: 'outline', size: 'sm' })}
          >
            <Pencil className="size-3.5" />
            <span>Ubah Data Diri</span>
          </Link>
          <Button variant="destructive" size="sm" onClick={onDelete} disabled={isDeleting}>
            <Trash2 className="size-3.5" />
            <span>{isDeleting ? 'Menghapus…' : 'Hapus Member'}</span>
          </Button>
        </div>
      </div>

      {/* Profile Overview Card */}
      <Card className="overflow-hidden border-border/80 shadow-xs">
        <div className="bg-gradient-to-r from-primary/10 via-accent/30 to-background p-6 md:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <span className="flex size-14 items-center justify-center rounded-2xl bg-primary text-xl font-bold text-primary-foreground shadow-sm">
                <User className="size-7" />
              </span>
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                    {member.name}
                  </h1>
                  <Badge variant="outline" className="font-mono text-xs">
                    {member.memberNumber}
                  </Badge>
                </div>
                <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{MEMBER_TYPE_LABELS[member.type]}</span>
                  <span>&bull;</span>
                  <span>{member.branch?.name}</span>
                </div>
              </div>
            </div>

            {/* Current Grade Badge Display */}
            <div className="flex flex-col sm:items-end">
              <span className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                Tingkatan Saat Ini
              </span>
              <div className="mt-1 flex items-center gap-2">
                <BeltBadge order={member.belt.order} name={member.belt.name} />
                <span className="text-sm font-bold text-foreground">
                  {formatGradeSummary(member.belt.name, member.kyu, member.dan)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <CardContent className="grid gap-6 p-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-1">
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="size-3.5" />
              <span>Tempat, Tanggal Lahir</span>
            </span>
            <p className="text-sm font-medium text-foreground">
              {member.birthPlace}, {formatBirthDate(member.birthDate)}
            </p>
          </div>

          <div className="space-y-1">
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Building2 className="size-3.5" />
              <span>Cabang Dojo</span>
            </span>
            <p className="text-sm font-medium text-foreground">
              {member.branch?.name} ({member.branch?.code})
            </p>
          </div>

          <div className="space-y-1">
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Phone className="size-3.5" />
              <span>Telepon</span>
            </span>
            <p className="text-sm font-medium text-foreground">{member.phone || '-'}</p>
          </div>

          <div className="space-y-1 sm:col-span-2 lg:col-span-1">
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin className="size-3.5" />
              <span>Alamat Domisili</span>
            </span>
            <p className="text-sm font-medium text-foreground">{member.address}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

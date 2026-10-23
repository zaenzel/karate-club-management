export type Branch = {
  id: string;
  code: string;
  name: string;
  city: string;
  address: string | null;
  phone: string | null;
  headCoach: { id: string; name: string } | null;
  memberCount: number;
  createdAt: string;
  updatedAt: string;
};

export type BranchOption = {
  id: string;
  code: string;
  name: string;
};

export type BranchListParams = {
  page?: number;
  pageSize?: number;
  q?: string;
};

export type CreateBranchPayload = {
  code: string;
  name: string;
  city: string;
  address?: string | null;
  phone?: string | null;
  headCoachId?: string | null;
};

export type UpdateBranchPayload = Partial<CreateBranchPayload>;

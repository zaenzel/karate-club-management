import { paginationQuerySchema, toPaginated, toSkipTake } from './pagination.js';

describe('paginationQuerySchema', () => {
  it('memakai default page 1 dan pageSize 20', () => {
    expect(paginationQuerySchema.parse({})).toEqual({ page: 1, pageSize: 20 });
  });

  it('menolak pageSize di atas 100 dan page di bawah 1', () => {
    expect(paginationQuerySchema.safeParse({ pageSize: '101' }).success).toBe(false);
    expect(paginationQuerySchema.safeParse({ page: '0' }).success).toBe(false);
  });
});

describe('toPaginated', () => {
  const query = { page: 1, pageSize: 10 };

  it('totalPages 0 bila tidak ada data', () => {
    expect(toPaginated([], 0, query).meta.totalPages).toBe(0);
  });

  it('totalPages pas bila jumlah data kelipatan pageSize', () => {
    expect(toPaginated([], 20, query).meta.totalPages).toBe(2);
  });

  it('totalPages dibulatkan ke atas bila ada sisa', () => {
    expect(toPaginated(['a'], 21, query)).toEqual({
      data: ['a'],
      meta: { page: 1, pageSize: 10, total: 21, totalPages: 3 },
    });
  });
});

describe('toSkipTake', () => {
  it('menghitung offset dari page', () => {
    expect(toSkipTake({ page: 3, pageSize: 20 })).toEqual({ skip: 40, take: 20 });
  });
});

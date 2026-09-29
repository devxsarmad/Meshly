export function totalPages(total: number, limit: number): number {
  return Math.max(1, Math.ceil(total / limit));
}

import { Container } from '@/components/layout/container';

export default function Loading() {
  return (
    <Container className="py-20">
      <div className="grid gap-6">
        <div className="h-12 w-64 animate-pulse rounded-2xl bg-[#EFEFEF]" />
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-[420px] animate-pulse rounded-[28px] bg-white shadow-sm" />
          ))}
        </div>
      </div>
    </Container>
  );
}

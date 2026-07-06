import Link from 'next/link';

import { Container } from '@/components/layout/container';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <Container className="flex min-h-[70vh] items-center justify-center py-20">
      <div className="max-w-xl space-y-6 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#7A1F2B]">404</p>
        <h1 className="text-5xl font-semibold tracking-tight text-[#1F1F1F]">The page you requested does not exist.</h1>
        <p className="text-lg leading-8 text-[#666666]">The link may be outdated or the content may have moved. Continue browsing the marketplace or return home.</p>
        <div className="flex justify-center gap-3">
          <Button asChild><Link href="/">Return home</Link></Button>
          <Button asChild variant="outline"><Link href="/shop">Browse products</Link></Button>
        </div>
      </div>
    </Container>
  );
}

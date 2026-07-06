'use client';

import { HomepageContent } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export function HomepageContentForm({ content }: { content: HomepageContent }) {
  const router = useRouter();
  const [title, setTitle] = useState(content.title);
  const [status, setStatus] = useState(content.status);
  const [jsonText, setJsonText] = useState(JSON.stringify(content.content, null, 2));
  const [loading, setLoading] = useState(false);

  return (
    <form
      className="space-y-6"
      onSubmit={async (event) => {
        event.preventDefault();
        setLoading(true);
        try {
          const response = await fetch(`/api/homepage/${content.key}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key: content.key, title, status, content: JSON.parse(jsonText) }),
          });
          const result = await response.json();
          if (!response.ok) throw new Error(result.message || 'Unable to update content.');
          toast.success('Homepage content updated.');
          router.refresh();
        } catch (error) {
          toast.error(error instanceof Error ? error.message : 'Unable to update content.');
        } finally {
          setLoading(false);
        }
      }}
    >
      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input id="title" value={title} onChange={(event) => setTitle(event.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Input id="status" value={status} onChange={(event) => setStatus(event.target.value as any)} />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="content">JSON content</Label>
        <Textarea id="content" value={jsonText} onChange={(event) => setJsonText(event.target.value)} className="min-h-[420px] font-mono text-xs" />
      </div>
      <Button disabled={loading}>{loading ? 'Saving...' : 'Save content'}</Button>
    </form>
  );
}
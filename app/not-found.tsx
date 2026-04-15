import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="text-4xl font-bold mb-4">404</h1>
      <p className="text-xl text-muted-foreground mb-8">Page Not Found</p>
      <Button asChild>
        <Link href="/en">Go Home</Link>
      </Button>
    </div>
  );
}





































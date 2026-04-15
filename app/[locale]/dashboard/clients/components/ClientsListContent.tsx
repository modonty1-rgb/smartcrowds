'use client';

import { useEffect, useState } from 'react';
import { listClients, deleteClient } from '@/app/actions/clients/actions';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';

interface ClientItem {
  id: string;
  name: string;
  logoUrl: string;
  websiteUrl?: string | null;
  published: boolean;
  order: number;
}

export function ClientsListContent() {
  const [clients, setClients] = useState<ClientItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const data = await listClients();
      setClients(data as ClientItem[]);
      setLoading(false);
    })();
  }, []);

  async function handleDelete(id: string) {
    const res = await deleteClient(id);
    if ((res as { success?: boolean })?.success) {
      setClients((prev) => prev.filter((c) => c.id !== id));
    }
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Clients</h1>
        <Link href="./clients/new">
          <Button>Add Client</Button>
        </Link>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {clients.map((c) => (
            <div key={c.id} className="border rounded-lg p-4 bg-background">
              <div className="flex items-center justify-center h-20 mb-3">
                <Image
                  src={c.logoUrl}
                  alt={c.name}
                  width={160}
                  height={80}
                  className="object-contain max-h-16 w-auto"
                />
              </div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium truncate" title={c.name}>{c.name}</h3>
                <span className={`text-xs px-2 py-0.5 rounded ${c.published ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                  {c.published ? 'Published' : 'Draft'}
                </span>
              </div>
              <div className="text-xs text-muted-foreground mb-4">Order: {c.order}</div>
              <div className="flex items-center justify-end gap-3">
                <Link href={`./clients/${c.id}/edit`} className="text-sm underline-offset-2 hover:underline">
                  Edit
                </Link>
                <button
                  className="text-sm text-red-600 hover:underline"
                  onClick={() => handleDelete(c.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}



'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface SEOFieldsProps {
  seoTitle?: string;
  seoDescription?: string;
  keywords: string[];
  onSeoTitleChange: (value: string) => void;
  onSeoDescriptionChange: (value: string) => void;
  onKeywordsChange: (keywords: string[]) => void;
}

export function SEOFields({
  seoTitle,
  seoDescription,
  keywords,
  onSeoTitleChange,
  onSeoDescriptionChange,
  onKeywordsChange,
}: SEOFieldsProps) {
  const keywordsString = keywords.join(', ');

  const handleKeywordsChange = (value: string) => {
    const keywordArray = value
      .split(',')
      .map((k) => k.trim())
      .filter((k) => k.length > 0);
    onKeywordsChange(keywordArray);
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="seoTitle">SEO Title (max 60 chars)</Label>
        <Input
          id="seoTitle"
          value={seoTitle || ''}
          onChange={(e) => onSeoTitleChange(e.target.value)}
          maxLength={60}
          placeholder="SEO optimized title"
        />
        <p className="text-xs text-muted-foreground mt-1">
          {seoTitle?.length || 0}/60 characters
        </p>
      </div>

      <div>
        <Label htmlFor="seoDescription">SEO Description (max 160 chars)</Label>
        <Textarea
          id="seoDescription"
          value={seoDescription || ''}
          onChange={(e) => onSeoDescriptionChange(e.target.value)}
          maxLength={160}
          rows={3}
          placeholder="SEO meta description"
        />
        <p className="text-xs text-muted-foreground mt-1">
          {seoDescription?.length || 0}/160 characters
        </p>
      </div>

      <div>
        <Label htmlFor="keywords">Keywords (comma-separated)</Label>
        <Input
          id="keywords"
          value={keywordsString}
          onChange={(e) => handleKeywordsChange(e.target.value)}
          placeholder="keyword1, keyword2, keyword3"
        />
      </div>
    </div>
  );
}























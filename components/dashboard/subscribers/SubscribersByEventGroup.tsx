'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Briefcase, ChevronDown, ChevronUp } from 'lucide-react';
import Image from 'next/image';
import { format } from 'date-fns';
import { useState } from 'react';

interface SubscribersByEventGroupProps {
  eventTitle: string;
  subscribers: Array<{
    id: string;
    name: string;
    mobile: string;
    email: string;
    idNumber: string;
    nationality: {
      nameAr: string;
      nameEn: string;
    } | null;
    age: number;
    idImageUrl: string | null;
    personalImageUrl: string | null;
    createdAt: Date;
    jobRequirement?: {
      id: string;
      job: {
        name: string;
      } | null;
      ratePerDay: number | null;
    } | null;
  }>;
  locale: string;
}

export function SubscribersByEventGroup({
  eventTitle,
  subscribers,
  locale,
}: SubscribersByEventGroupProps) {
  const [isOpen, setIsOpen] = useState(true);
  const isArabic = locale === 'ar';

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CardTitle className="text-lg">{eventTitle}</CardTitle>
                <Badge variant="secondary">
                  {subscribers.length} {isArabic ? 'مشترك' : 'subscriber'}{subscribers.length !== 1 ? (isArabic ? '' : 's') : ''}
                </Badge>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                {isOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent>
            {subscribers.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                {isArabic ? 'لا يوجد مشتركين' : 'No subscribers'}
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                {subscribers.map((subscriber) => (
                  <Card key={subscriber.id}>
                    <CardHeader>
                      <CardTitle className="text-base">{subscriber.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex items-center gap-3">
                        {subscriber.personalImageUrl && (
                          <div className="relative h-16 w-16 rounded-full overflow-hidden bg-muted flex-shrink-0">
                            <Image
                              src={subscriber.personalImageUrl}
                              alt={subscriber.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                        <div className="flex-1 space-y-1 text-sm">
                          <div>
                            <span className="font-medium">{isArabic ? 'الجوال: ' : 'Mobile: '}</span>
                            <span>{subscriber.mobile}</span>
                          </div>
                          <div>
                            <span className="font-medium">{isArabic ? 'البريد: ' : 'Email: '}</span>
                            <span className="text-xs">{subscriber.email}</span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="font-medium">{isArabic ? 'رقم الهوية: ' : 'ID: '}</span>
                          <span>{subscriber.idNumber}</span>
                        </div>
                        <div>
                          <span className="font-medium">{isArabic ? 'الجنسية: ' : 'Nationality: '}</span>
                          <span>{subscriber.nationality ? (isArabic ? subscriber.nationality.nameAr : subscriber.nationality.nameEn) : 'N/A'}</span>
                        </div>
                        <div>
                          <span className="font-medium">{isArabic ? 'العمر: ' : 'Age: '}</span>
                          <span>{subscriber.age}</span>
                        </div>
                        <div>
                          <span className="font-medium">{isArabic ? 'تاريخ: ' : 'Date: '}</span>
                          <span>{format(new Date(subscriber.createdAt), 'PPP')}</span>
                        </div>
                      </div>

                      {subscriber.jobRequirement && (
                        <div className="pt-2 border-t border-border/50">
                          <div className="flex items-center gap-2 mb-1">
                            <Briefcase className="h-3 w-3 text-primary/70" />
                            <span className="text-xs font-medium">{isArabic ? 'الوظيفة: ' : 'Job: '}</span>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {subscriber.jobRequirement.job?.name || 'Unknown Job'}
                            {subscriber.jobRequirement.ratePerDay != null && (
                              <span className="ml-1">
                                — {subscriber.jobRequirement.ratePerDay} {isArabic ? 'ريال/يوم' : 'SAR/day'}
                              </span>
                            )}
                          </Badge>
                        </div>
                      )}

                      {subscriber.idImageUrl && (
                        <div>
                          <span className="text-xs font-medium block mb-1">
                            {isArabic ? 'صورة الهوية: ' : 'ID Image: '}
                          </span>
                          <div className="relative h-24 w-full rounded-md overflow-hidden bg-muted">
                            <Image
                              src={subscriber.idImageUrl}
                              alt={`${subscriber.name} ID`}
                              fill
                              className="object-contain"
                            />
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}


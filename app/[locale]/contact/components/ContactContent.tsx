'use client';

import { useState, useTransition } from 'react';
import { useLocale } from 'next-intl';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Mail, Phone, MapPin } from 'lucide-react';
import facebookSvg from '@/components/icons/facebook.svg';
import instagramSvg from '@/components/icons/instagram.svg';
import linkedinSvg from '@/components/icons/linkedin.svg';
import xSvg from '@/components/icons/icons8-x.svg';
import snapchatSvg from '@/components/icons/snapchat.svg';
import { showSuccessSwal, showErrorSwal } from '@/lib/utils/swal';
import { createContactMessage } from '@/app/actions/contact/actions';

export function ContactContent() {
  const locale = useLocale();
  const [isPending, startTransition] = useTransition();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    startTransition(async () => {
      try {
        await createContactMessage(formData);
        showSuccessSwal(
          locale === 'ar'
            ? 'تم إرسال رسالتك بنجاح. سنتواصل معك قريباً.'
            : 'Your message has been sent successfully. We will contact you soon.',
          locale
        );
        setFormData({ name: '', email: '', phone: '', message: '' });
      } catch (error) {
        showErrorSwal(
          locale === 'ar'
            ? 'حدث خطأ أثناء إرسال الرسالة. يرجى المحاولة مرة أخرى.'
            : 'An error occurred while sending your message. Please try again.',
          locale
        );
      }
    });
  };

  return (
    <main className="min-h-screen">
      <section className="container mx-auto px-4 py-24">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {locale === 'ar' ? 'اتصل بنا' : 'Contact Us'}
          </h1>
          <p className="text-xl text-muted-foreground">
            {locale === 'ar' ? 'تواصل معنا' : 'Get in touch with us'}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>
                {locale === 'ar' ? 'معلومات التواصل' : 'Contact Information'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <Mail className="h-5 w-5 text-primary" />
                <a
                  href="mailto:Info@smartcrowdme.com"
                  className="text-muted-foreground hover:text-primary"
                >
                  Info@smartcrowdme.com
                </a>
              </div>
              <div className="flex items-center gap-4">
                <Phone className="h-5 w-5 text-primary" />
                <a
                  href="tel:0580112052"
                  className="text-muted-foreground hover:text-primary"
                >
                  0580112052
                </a>
              </div>
              <div className="flex items-start gap-4">
                <MapPin className="h-5 w-5 text-primary mt-1" />
                <p className="text-muted-foreground">
                  Al-Rusaifah, Third Ring Road – Al-Sharif Yahya Tower,
                  Makkah
                </p>
              </div>
              <div className="flex gap-4 pt-4">
                {process.env.NEXT_PUBLIC_SOCIAL_FACEBOOK && (
                  <a
                    href={process.env.NEXT_PUBLIC_SOCIAL_FACEBOOK}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary"
                  >
                    <Image src={facebookSvg} alt="Facebook" width={24} height={24} />
                  </a>
                )}
                {process.env.NEXT_PUBLIC_SOCIAL_INSTAGRAM && (
                  <a
                    href={process.env.NEXT_PUBLIC_SOCIAL_INSTAGRAM}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary"
                  >
                    <Image src={instagramSvg} alt="Instagram" width={24} height={24} />
                  </a>
                )}
                {process.env.NEXT_PUBLIC_SOCIAL_LINKEDIN && (
                  <a
                    href={process.env.NEXT_PUBLIC_SOCIAL_LINKEDIN}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary"
                  >
                    <Image src={linkedinSvg} alt="LinkedIn" width={24} height={24} />
                  </a>
                )}
                {process.env.NEXT_PUBLIC_SOCIAL_TWITTER && (
                  <a
                    href={process.env.NEXT_PUBLIC_SOCIAL_TWITTER}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary"
                  >
                    <Image src={xSvg} alt="Twitter/X" width={24} height={24} />
                  </a>
                )}
                {process.env.NEXT_PUBLIC_SOCIAL_SNAPCHAT && (
                  <a
                    href={process.env.NEXT_PUBLIC_SOCIAL_SNAPCHAT}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary"
                  >
                    <Image src={snapchatSvg} alt="Snapchat" width={24} height={24} />
                  </a>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                {locale === 'ar' ? 'أرسل لنا رسالة' : 'Send Us a Message'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">
                    {locale === 'ar' ? 'الاسم' : 'Name'}
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">
                    {locale === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone">
                    {locale === 'ar' ? 'الهاتف' : 'Phone'}
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="message">
                    {locale === 'ar' ? 'الرسالة' : 'Message'}
                  </Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    required
                    rows={5}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isPending}>
                  {isPending
                    ? locale === 'ar'
                      ? 'جاري الإرسال...'
                      : 'Sending...'
                    : locale === 'ar'
                      ? 'إرسال الرسالة'
                      : 'Send Message'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}


import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from '@/lib/routing';
import {
  Car,
  Users,
  Shield,
  ClipboardCheck,
  TrendingUp,
  UserCheck,
} from 'lucide-react';

const services = [
  {
    id: 'traffic-control',
    icon: Car,
    content: {
      ar: {
        title: 'تنظيم حركة المرور',
        sections: [
          {
            heading: 'لماذا يُعد تنظيم حركة المرور أساسياً في نجاح الفعالية؟',
            body:
              'لأن الانطباع الأول يبدأ من لحظة الوصول. ازدحام بسيط أو تأخير في المداخل قد يؤثر سلباً على تجربة الزوار ويُربك سير الحدث بأكمله.',
          },
          {
            heading: 'كيف نُسهم في تسهيل حركة المرور؟',
            body:
              'نقوم بتحليل مداخل ومخارج الموقع مسبقاً، ونوزع الفرق الميدانية وفق خطة مدروسة تضمن انسيابية الدخول والخروج وتقليل الازدحام.',
          },
          {
            heading: 'كيف نختار فريقنا لهذه المهمة؟',
            body:
              'ننتقي أفراداً يتمتعون بسرعة البديهة وضبط النفس والقدرة على اتخاذ قرارات دقيقة تحت الضغط.',
          },
          {
            heading: 'النتيجة النهائية؟',
            body:
              'حركة مرور منظمة، وصول سلس، وانطباع أول إيجابي يعكس احترافية الحدث من بدايته.',
          },
        ],
        cta: 'اكتشف كيف يمكن لفريقنا أن يجعل حركة الوصول إلى فعاليتك أكثر سلاسة وتنظيماً. تواصل معنا لتصميم خطة مخصصة.',
      },
      en: {
        title: 'Traffic Control',
        sections: [
          {
            heading: 'Why is traffic control essential for event success?',
            body:
              'The first impression starts the moment guests arrive. Even minor congestion or delays at entry points can damage the visitor experience and disrupt the entire event.',
          },
          {
            heading: 'How do we streamline traffic flow?',
            body:
              'We analyze entry and exit routes in advance, deploy field teams on a tailored schedule, and keep movement fluid to prevent bottlenecks.',
          },
          {
            heading: 'Who is on our traffic control team?',
            body:
              'We select people with quick judgment, strong composure, and the ability to make precise decisions under pressure.',
          },
          {
            heading: 'The result?',
            body:
              'Organized movement, seamless arrivals, and a positive first impression that reflects the event’s professionalism from the very start.',
          },
        ],
        cta: 'Discover how we can make arrivals smoother—contact us to design a tailored traffic plan.',
      },
    },
  },
  {
    id: 'guidance',
    icon: Users,
    content: {
      ar: {
        title: 'التوجيه والإرشاد',
        sections: [
          {
            heading: 'لماذا تُعد خدمة التوجيه والإرشاد مهمة في الفعاليات؟',
            body:
              'لأنها تشكّل الانطباع الأول للزائر وتحدد مدى سلاسة تجربته منذ لحظة الوصول.',
          },
          {
            heading: 'كيف نسهّل تجربة الزائر في SMART Crowd؟',
            body:
              'نصمم خطط إرشادية دقيقة مدعومة بلوحات واضحة، ونوزّع فرقنا الميدانية في النقاط الحيوية لتقديم المساعدة باحترافية ولطف.',
          },
          {
            heading: 'ما الذي يميّز فريق التوجيه والإرشاد لدينا؟',
            body:
              'نختار الأفراد بناءً على مهارات التواصل وسرعة التصرف والقدرة على التعامل مع مختلف الفئات بروح إيجابية.',
          },
          {
            heading: 'النتيجة النهائية؟',
            body:
              'زائر يتحرك بثقة وراحة، وفعالية تسير بانسيابية وتنظيم راقٍ.',
          },
        ],
        cta: 'اجعل تجربة الزوار في فعاليتك أكثر وضوحاً وسلاسة. تواصل معنا لتطوير خطة إرشاد فعّالة تناسب الحدث.',
      },
      en: {
        title: 'Guidance & Orientation',
        sections: [
          {
            heading: 'Why is guidance critical for events?',
            body:
              'It sets the visitor’s first impression and defines how intuitive their journey feels from arrival onward.',
          },
          {
            heading: 'How do we simplify the visitor experience?',
            body:
              'We design precise orientation plans with clear signage and position field teams at key touchpoints to offer warm, professional support.',
          },
          {
            heading: 'What sets our guidance team apart?',
            body:
              'We recruit for communication skills, quick thinking, and the ability to assist diverse audiences with a positive attitude.',
          },
          {
            heading: 'The result?',
            body:
              'Visitors move confidently and comfortably, while the event runs with elegant organization.',
          },
        ],
        cta: 'Let’s craft a clear, welcoming visitor journey—talk to us about a tailored guidance plan.',
      },
    },
  },
  {
    id: 'security',
    icon: Shield,
    content: {
      ar: {
        title: 'أمن وسلامة',
        sections: [
          {
            heading: 'لماذا يُعد الأمن والسلامة محوراً رئيسياً في كل فعالية؟',
            body:
              'لأن حماية الأرواح والممتلكات مسؤولية لا تُساوم، وهي ما يضمن استمرارية الحدث بثقة وطمأنينة.',
          },
          {
            heading: 'كيف نحقق أعلى معايير السلامة؟',
            body:
              'نُطبق بروتوكولات واضحة تشمل التفتيش الوقائي، مراقبة الحشود، وخطط استجابة للطوارئ بالتنسيق مع الجهات المختصة.',
          },
          {
            heading: 'كيف نجهّز فرقنا الأمنية؟',
            body:
              'يخضع الأفراد لتدريبات مكثفة على تقييم المخاطر، وضبط المواقف، والتعامل الهادئ مع مختلف الحالات.',
          },
          {
            heading: 'النتيجة النهائية؟',
            body:
              'فعالية آمنة، بيئة مطمئنة، وجمهور يشعر أن أمنه أولوية في كل لحظة.',
          },
        ],
        cta: 'امنح جمهورك شعوراً بالطمأنينة من اللحظة الأولى. تواصل معنا لبناء خطة أمن وسلامة متكاملة لحدثك القادم.',
      },
      en: {
        title: 'Security & Safety',
        sections: [
          {
            heading: 'Why is security and safety non-negotiable?',
            body:
              'Protecting lives and property is what keeps events running with confidence and peace of mind.',
          },
          {
            heading: 'How do we reach the highest safety standards?',
            body:
              'We implement clear protocols covering preventive screening, crowd monitoring, and emergency response in coordination with authorities.',
          },
          {
            heading: 'How do we prepare our security teams?',
            body:
              'Our teams undergo intensive training in risk assessment, scenario control, and calm handling of every situation.',
          },
          {
            heading: 'The result?',
            body:
              'A safe event environment and guests who know their wellbeing is the top priority.',
          },
        ],
        cta: 'Give your audience peace of mind from the first moment—partner with us on a comprehensive safety plan.',
      },
    },
  },
  {
    id: 'strategic-planning',
    icon: ClipboardCheck,
    content: {
      ar: {
        title: 'التخطيط الاستراتيجي',
        sections: [
          {
            heading: 'لماذا نبدأ كل فعالية بالتخطيط الاستراتيجي؟',
            body:
              'لأن النجاح لا يحدث صدفة؛ بل نتيجة خطط مدروسة تغطي كل التفاصيل من البداية للنهاية.',
          },
          {
            heading: 'كيف نُخطط بذكاء؟',
            body:
              'نحلل طبيعة الحدث، وموقعه، وعدد الحضور المتوقع، ونبني خطة تشغيلية توازن بين الكفاءة والسلامة والتجربة الإيجابية.',
          },
          {
            heading: 'ما الذي يميز أسلوبنا؟',
            body:
              'نستخدم أدوات تحليل ميدانية وتقارير دقيقة تتيح مراقبة الأداء لحظة بلحظة وتعديل الخطط فورياً إذا لزم الأمر.',
          },
          {
            heading: 'النتيجة النهائية؟',
            body:
              'تنفيذ منظم خالٍ من العشوائية، وفعالية تسير وفق رؤية واضحة ومحكمة.',
          },
        ],
        cta: 'اجعل نجاح فعاليتك يبدأ من الخطة. تواصل معنا لتصميم خطة تشغيلية دقيقة تحقق أهدافك بذكاء واحترافية.',
      },
      en: {
        title: 'Strategic Planning',
        sections: [
          {
            heading: 'Why does every event start with strategic planning?',
            body:
              'Success is never accidental—it’s the result of orchestrated plans that cover every detail end to end.',
          },
          {
            heading: 'How do we plan intelligently?',
            body:
              'We analyze the event type, venue, and expected attendance to create an operational plan balancing efficiency, safety, and experience.',
          },
          {
            heading: 'What makes our approach different?',
            body:
              'We rely on field analytics and real-time reporting tools to monitor performance and adapt instantly when needed.',
          },
          {
            heading: 'The result?',
            body:
              'Organized execution free of randomness—an event that runs according to a clear, disciplined vision.',
          },
        ],
        cta: 'Start your success with a solid plan—let’s design an operational blueprint tailored to your goals.',
      },
    },
  },
  {
    id: 'crowd-management',
    icon: TrendingUp,
    content: {
      ar: {
        title: 'إدارة الحشود',
        sections: [
          {
            heading: 'لماذا تُعد إدارة الحشود مهمة في الفعاليات الكبرى؟',
            body:
              'لأن التعامل مع أعداد كبيرة من الناس يتطلب تخطيطاً دقيقاً لضمان سلامتهم وانسيابية حركتهم.',
          },
          {
            heading: 'كيف نضمن انسيابية الحشود؟',
            body:
              'نعتمد على تحليل تدفق الجمهور ونقاط التجمع، ونوزع فرقنا لتوجيه الحركة وتنظيم المسارات وتجنّب التكدس.',
          },
          {
            heading: 'ما الذي يميزنا في إدارة الحشود؟',
            body:
              'لدينا خبرة عملية في تصميم وتنفيذ سيناريوهات ميدانية تراعي سلوك الجمهور وتتكيف مع المتغيرات اللحظية.',
          },
          {
            heading: 'النتيجة النهائية؟',
            body:
              'فعالية منظمة وآمنة تعكس أعلى معايير الاحتراف في إدارة التجمعات البشرية.',
          },
        ],
        cta: 'اجعل كل لحظة في فعاليتك تسير بانسيابية. تواصل معنا لتصميم خطة ذكية لإدارة الحشود بفعالية وأمان.',
      },
      en: {
        title: 'Crowd Management',
        sections: [
          {
            heading: 'Why is crowd management crucial for large events?',
            body:
              'Managing large audiences demands thoughtful planning to keep them safe and moving smoothly.',
          },
          {
            heading: 'How do we maintain smooth flow?',
            body:
              'We analyze audience movement patterns, place teams to direct traffic, and prevent congestion before it happens.',
          },
          {
            heading: 'What sets our crowd management apart?',
            body:
              'Extensive real-world experience designing and executing field scenarios that respect audience behavior and adapt in real time.',
          },
          {
            heading: 'The result?',
            body:
              'A safe, organized event that reflects top-tier standards in managing large gatherings.',
          },
        ],
        cta: 'Let every moment run smoothly—partner with us on an intelligent, safe crowd management plan.',
      },
    },
  },
  {
    id: 'personal-protection',
    icon: UserCheck,
    content: {
      ar: {
        title: 'الحماية الشخصية',
        sections: [
          {
            heading: 'لماذا تُعتبر الحماية الشخصية خدمة حساسة ومهمة؟',
            body:
              'لأنها تتعلق بسلامة الشخصيات الهامة والمسؤولين، وتتطلب انضباطاً وأمانة ومهارة عالية.',
          },
          {
            heading: 'كيف ننفذ مهام الحماية باحترافية؟',
            body:
              'نبدأ بتقييم شامل للمخاطر والمسارات، ونُعد خطة ميدانية مرنة تضمن الحماية دون تقييد الحركة الطبيعية.',
          },
          {
            heading: 'كيف نختار فريق الحماية؟',
            body:
              'نختار عناصر مؤهلة ذات خبرة ميدانية عالية وقدرة على اتخاذ القرار بسرعة في المواقف الطارئة.',
          },
          {
            heading: 'النتيجة النهائية؟',
            body:
              'بيئة آمنة تحفظ الخصوصية وتمنح الثقة، مع تنفيذ متقن لا يلفت الانتباه بل يحقق الأمان بهدوء واحتراف.',
          },
        ],
        cta: 'إذا كان الحدث يضم شخصيات هامة، فالأمان لا يُترك للصدفة. تواصل معنا لتأمينهم باحترافية وهدوء.',
      },
      en: {
        title: 'Personal Protection',
        sections: [
          {
            heading: 'Why is personal protection sensitive and vital?',
            body:
              'It concerns the safety of VIPs and officials, demanding discipline, discretion, and refined skill.',
          },
          {
            heading: 'How do we protect with professionalism?',
            body:
              'We begin with comprehensive risk assessments and flexible field plans that keep principals safe without restricting their natural movement.',
          },
          {
            heading: 'How do we select our protection specialists?',
            body:
              'We choose highly experienced personnel who can make rapid decisions in critical moments.',
          },
          {
            heading: 'The result?',
            body:
              'A secure environment that preserves privacy and inspires confidence, delivered with quiet, polished execution.',
          },
        ],
        cta: 'Hosting VIPs? Ensure their safety with discreet, professional protection.',
      },
    },
  },
];

interface ServicesContentProps {
  locale: string;
}

export function ServicesContent({ locale }: ServicesContentProps) {
  const isArabic = locale === 'ar';

  return (
    <main className="min-h-screen" dir={isArabic ? 'rtl' : 'ltr'}>
      <section className="container mx-auto px-4 py-24">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {isArabic ? 'خدماتنا' : 'Our Services'}
          </h1>
          <p className="text-xl text-muted-foreground">
            {isArabic
              ? 'حلول شاملة تدعم نجاح فعاليتك من اللحظة الأولى وحتى الختام.'
              : 'Comprehensive solutions that support your event from first impression to finale.'}
          </p>
        </div>

        <div className="space-y-12">
          {services.map((service) => {
            const localized = service.content[isArabic ? 'ar' : 'en'];
            const Icon = service.icon;

            return (
              <section
                key={service.id}
                id={service.id}
                className="scroll-mt-32"
                aria-labelledby={`${service.id}-heading`}
              >
                <Card className="border-border/60 shadow-lg">
                  <CardHeader className="flex flex-col items-center text-center gap-4 pb-0">
                    <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Icon className="h-8 w-8" />
                    </div>
                    <CardTitle
                      id={`${service.id}-heading`}
                      className="text-2xl md:text-3xl font-semibold"
                    >
                      {localized.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-10 pt-8">
                    <div className="grid gap-6 md:grid-cols-2">
                      {localized.sections.map((block, idx) => (
                        <div
                          key={idx}
                          className="rounded-xl bg-muted/40 p-6 shadow-sm hover:shadow-md transition-shadow"
                        >
                          <h3 className="text-lg font-semibold mb-2">
                            {block.heading}
                          </h3>
                          <p className="text-muted-foreground leading-relaxed">
                            {block.body}
                          </p>
                        </div>
                      ))}
                    </div>
                    <div className="rounded-2xl bg-primary/5 p-6 text-center space-y-4">
                      <p className="leading-relaxed text-base md:text-lg">
                        {localized.cta}
                      </p>
                      <Button asChild variant="outline" size="lg" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-colors">
                        <Link href="/contact" locale={locale}>
                          {isArabic ? 'تحدث مع فريقنا' : 'Talk with our team'}
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </section>
            );
          })}
        </div>

        <div className="mt-20 rounded-3xl bg-gradient-to-br from-primary/10 via-primary/5 to-primary/10 p-10 text-center space-y-6 shadow-lg">
          <h2 className="text-3xl font-bold">
            {isArabic ? 'جاهز لرفع جودة فعاليتك؟' : 'Ready to elevate your event?'}
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl mx-auto">
            {isArabic
              ? 'نساعدك على بناء تجربة متكاملة للحضور من لحظة الوصول وحتى الوداع. احجز جلسة استشارية مع فريق SMART Crowd لنبني معاً خطة تنفيذيّة دقيقة.'
              : 'We help you craft a seamless attendee journey—from arrival logistics to the final goodbye. Book a consultation with the SMART Crowd team and build a precise operational plan together.'}
          </p>
          <Button asChild size="lg">
            <Link href="/contact" locale={locale}>
              {isArabic ? 'ابدأ الآن' : 'Start now'}
            </Link>
          </Button>
        </div>
      </section>
    </main>
  );
}


// src/components/vendor/VendorFAQAccordion.tsx
'use client'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

const FAQS: { question: string; answer: string }[] = [
  {
    question: 'How do security deposits work?',
    answer:
      "RentEase collects the security deposit from the renter at checkout and holds it in escrow for the full rental period. If an item comes back damaged or late, you file a claim from your vendor dashboard and the deposit covers it — you're never chasing the renter directly.",
  },
  {
    question: 'Who handles pickup and delivery logistics?',
    answer:
      'You choose per listing: use your own delivery staff, or opt into RentEase Logistics, our network of local delivery partners. Either way, pickup and drop-off windows sync automatically with your order calendar.',
  },
  {
    question: 'What commission does RentEase take?',
    answer:
      'Listing is free. RentEase charges a commission only on completed rentals, deducted automatically before your bi-weekly payout — the rate depends on your category and is shown upfront in your vendor agreement, so there are no surprise deductions.',
  },
  {
    question: 'What happens if a renter damages my item?',
    answer:
      'Report the damage with photos within 48 hours of return through the order page. Our claims team reviews it against the condition report from pickup and settles the claim from the security deposit — most claims resolve within 3 business days.',
  },
  {
    question: 'How long does verification take?',
    answer:
      'Most vendors are verified within 24-48 hours of submitting PAN, address proof, and bank details. You can start drafting listings immediately — they go live automatically the moment verification clears.',
  },
]

export function VendorFAQAccordion() {
  return (
    <section aria-label="Frequently asked questions" className="rounded-lg border border-[#e5e8eb] bg-white p-5 sm:p-6">
      <h3 className="text-base font-semibold text-[#212121]">Common questions from new vendors</h3>
      <Accordion type="single" collapsible className="mt-2">
        {FAQS.map((faq, index) => (
          <AccordionItem key={faq.question} value={`faq-${index}`} className="border-[#e5e8eb]">
            <AccordionTrigger className="text-left text-sm font-medium text-[#212121] hover:text-[#2874F0] hover:no-underline">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent className="text-sm leading-relaxed text-[#5f6874]">
              {faq.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  )
}
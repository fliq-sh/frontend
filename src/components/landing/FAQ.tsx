"use client";

import { useState } from "react";

const faqs = [
  {
    question: "How does billing work with retries?",
    answer:
      "Each execution attempt is one billable unit — including retries. If a job fails and retries 3 times before succeeding, that's 4 executions billed. At $1 per 100k executions, even aggressive retry policies stay very affordable.",
  },
  {
    question: "How fast do jobs fire?",
    answer:
      "Sub-second. Median global dispatch latency is under 10ms from our nearest edge region to your endpoint. We continuously monitor and alert on latency regressions.",
  },
  {
    question: "What happens if my endpoint is down?",
    answer:
      "Fliq retries with exponential backoff up to your configured limit. You see every attempt and its outcome — HTTP status code, response body snippet, duration — in the dashboard.",
  },
  {
    question: "Can it handle 1 million jobs per second?",
    answer:
      "Yes. Fliq is architected to scale horizontally to 1M+ jobs/sec. Contact us for high-throughput onboarding and dedicated capacity planning.",
  },
  {
    question: "Is my data safe?",
    answer:
      "All API traffic is TLS 1.2+. Execution history is stored encrypted at rest. Enterprise plans support running on your own infrastructure so data never leaves your environment.",
  },
  {
    question: "Do I need to change my existing codebase?",
    answer:
      "No. Fliq calls your existing HTTP endpoints. If it accepts a webhook today, it works with Fliq today. No SDK required, no agent to install.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-24 px-4 border-t border-white/10">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight">
            Frequently asked questions
          </h2>
        </div>

        <div className="space-y-2">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="rounded-xl border border-white/10 overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-white/[0.03] transition-colors"
              >
                <span className="font-medium text-sm">{faq.question}</span>
                <span
                  className={`ml-4 flex-shrink-0 text-white/40 transition-transform duration-200 ${
                    openIndex === i ? "rotate-45" : ""
                  }`}
                >
                  +
                </span>
              </button>

              {openIndex === i && (
                <div className="px-5 pb-5">
                  <p className="text-sm text-white/60 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

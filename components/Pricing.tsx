"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

const plans = [
  {
    name: "Pro",
    period: "/mo",
    description: "Everything you need to automate Facebook comments, reply instantly, and capture leads 24/7.",
    features: [
      "Unlimited auto-replies",
      "1 Connected Facebook Page",
      "Priority 24/7 Support",
      "Unlimited analytics history",
      "Export Lead Data",
      "Remove branding",
      "Advanced Chat Flows"
    ],
    highlighted: true
  }
];

export function Pricing() {
  const [price, setPrice] = useState("$15");

  useEffect(() => {
    async function checkLocation() {
      try {
        const res = await fetch("https://get.geojs.io/v1/ip/country.json");
        const data = await res.json();
        if (data.country === "EG") {
          setPrice("100 EGP");
        } else {
          setPrice("$15");
        }
      } catch (error) {
        setPrice("$15");
      }
    }
    checkLocation();
  }, []);

  return (
    <section id="pricing" className="py-24 bg-white dark:bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg text-zinc-600 dark:text-zinc-400">
            Start with a 14-day free trial. No credit card required.
          </p>
        </div>

        <div className="flex justify-center max-w-lg mx-auto">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className={`p-8 w-full rounded-3xl border ${plan.highlighted ? 'border-primary ring-2 ring-primary/20 bg-primary/5 dark:bg-primary/10' : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900'} flex flex-col`}
            >
              <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
              <p className="text-zinc-600 dark:text-zinc-400 text-sm mb-6 min-h-[40px]">{plan.description}</p>
              <div className="mb-6 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold">{price}</span>
                {plan.period && <span className="text-zinc-500">{plan.period}</span>}
              </div>
              <ul className="mb-8 flex-1 space-y-4">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex gap-3 text-sm">
                    <Check className={`w-5 h-5 shrink-0 ${plan.highlighted ? 'text-primary' : 'text-zinc-400'}`} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/register"
                className={`w-full py-4 rounded-xl text-center font-semibold transition-colors ${plan.highlighted ? 'bg-primary hover:bg-primary-hover text-white shadow-lg shadow-primary/20' : 'bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-black dark:text-white'}`}
              >
                Start 14-Day Free Trial
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

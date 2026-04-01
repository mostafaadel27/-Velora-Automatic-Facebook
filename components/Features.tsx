"use client";

import { motion } from "framer-motion";
import { MessageCircle, Zap, Workflow, MousePointerClick, Filter, Magnet } from "lucide-react";

const features = [
  {
    icon: <Filter className="w-6 h-6" />,
    title: "Comment Auto-Replies",
    description: "Automatically send private messages whenever someone comments a specific keyword on your Facebook post."
  },
  {
    icon: <MessageCircle className="w-6 h-6" />,
    title: "Interactive Chat Flows",
    description: "Setup predefined user responses (buttons/quick replies) and map exact answers to them—just like Manychat."
  },
  {
    icon: <MousePointerClick className="w-6 h-6" />,
    title: "No-Code Automation",
    description: "Set up your triggers and conversation flows in minutes without writing a single line of code."
  },
  {
    icon: <Magnet className="w-6 h-6" />,
    title: "Lead Generation",
    description: "Capture prospects directly from their interactions with your posts and turn engagement into predictable revenue."
  },
  {
    icon: <Zap className="w-6 h-6" />,
    title: "Lightning Fast Responses",
    description: "Velora reacts instantly as soon as a comment hits your page, capturing the lead while they are most active."
  },
  {
    icon: <Workflow className="w-6 h-6" />,
    title: "Unlimited Post Tracking",
    description: "Connect as many Facebook posts as you want to a single conversational flow."
  }
];

export function Features() {
  return (
    <section id="features" className="py-24 bg-white dark:bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-sm font-semibold text-primary uppercase tracking-widest mb-3">
            Automation Suite
          </h2>
          <h3 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
            Everything you need to <span className="text-gradient">engage</span>
          </h3>
          <p className="text-lg text-zinc-600 dark:text-zinc-400">
            Velora gives you all the tools to turn your Facebook audience into an automated, highly-converting lead generation machine.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 hover:bg-white dark:hover:bg-zinc-900 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 group"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                {feature.icon}
              </div>
              <h4 className="text-xl font-bold mb-3">{feature.title}</h4>
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

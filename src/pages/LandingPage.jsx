import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Mic, FileSearch, BarChart3, Sparkles, CheckCircle, ChevronDown } from "lucide-react";
import GradientButton from "../components/ui/GradientButton";
import GlassCard from "../components/ui/GlassCard";
import AnimatedCounter from "../components/ui/AnimatedCounter";
import AnimatedAvatar from "../components/avatar/AnimatedAvatar";
import { STATS, TESTIMONIALS, PRICING_PLANS, FAQ_ITEMS } from "../lib/constants";

const FEATURES = [
  { icon: Mic, title: "AI Voice Interviews", desc: "Practice with a realistic AI interviewer that speaks questions and listens to your answers." },
  { icon: FileSearch, title: "ATS Resume Analyzer", desc: "Compare your resume against job descriptions with detailed keyword and skill matching." },
  { icon: BarChart3, title: "Performance Dashboard", desc: "Track scores, progress, and improvement over time with beautiful analytics." },
  { icon: Sparkles, title: "Smart Feedback", desc: "Get comprehensive AI feedback on technical skills, communication, and interview readiness." },
];

export default function LandingPage() {
  return (
    <div className="relative">
      {/* Hero */}
      <section className="min-h-[90vh] flex flex-col items-center justify-center px-4 py-20 relative overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 max-w-4xl w-full text-center"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-500 text-sm font-medium mb-8"
          >
            <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
            AI-Powered Interview Preparation Platform
          </motion.div>

          <h1 className="text-5xl sm:text-7xl font-bold tracking-tight mb-6 leading-tight">
            <span className="text-[var(--text-primary)]">Ace Your Next</span>
            <br />
            <span className="bg-gradient-to-r from-violet-500 via-blue-500 to-cyan-400 bg-clip-text text-transparent">
              Dream Interview
            </span>
          </h1>

          <p className="text-[var(--text-muted)] text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Practice with an intelligent AI interviewer, analyze your resume with ATS scoring, and get actionable feedback — all in one premium platform.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link to="/setup">
              <GradientButton size="lg">
                Start Free Interview <ArrowRight className="w-5 h-5" />
              </GradientButton>
            </Link>
            <Link to="/ats">
              <GradientButton variant="secondary" size="lg">
                <FileSearch className="w-5 h-5" /> Analyze Resume
              </GradientButton>
            </Link>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="flex justify-center"
          >
            <AnimatedAvatar size="lg" state="idle" />
          </motion.div>
        </motion.div>

        <motion.a
          href="#features"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 text-[var(--text-muted)]"
          aria-label="Scroll to features"
        >
          <ChevronDown className="w-6 h-6" />
        </motion.a>
      </section>

      {/* Stats */}
      <section className="px-4 py-16 border-y border-[var(--border)]">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-violet-500 to-blue-500 bg-clip-text text-transparent">
                <AnimatedCounter value={parseInt(stat.value) || 50} suffix={stat.value.replace(/[\d.]/g, "")} />
              </div>
              <p className="text-sm text-[var(--text-muted)] mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="px-4 py-24">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Everything You Need to Succeed</h2>
            <p className="text-[var(--text-muted)] max-w-xl mx-auto">From resume optimization to mock interviews — prepare like a pro.</p>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((f, i) => (
              <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <GlassCard className="p-6 h-full hover" hover>
                  <div className="w-12 h-12 rounded-xl bg-violet-500/15 flex items-center justify-center mb-4">
                    <f.icon className="w-6 h-6 text-violet-500" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
                  <p className="text-sm text-[var(--text-muted)] leading-relaxed">{f.desc}</p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="px-4 py-24 bg-white/[0.02]">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Loved by Job Seekers</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <motion.div key={t.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }}>
                <GlassCard className="p-6">
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-4">"{t.text}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center text-xs font-bold text-white">{t.avatar}</div>
                    <div>
                      <p className="text-sm font-semibold">{t.name}</p>
                      <p className="text-xs text-[var(--text-muted)]">{t.role}</p>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="px-4 py-24">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Simple, Transparent Pricing</h2>
          <p className="text-[var(--text-muted)] text-center mb-12">Start free, upgrade when you're ready.</p>
          <div className="grid md:grid-cols-3 gap-6">
            {PRICING_PLANS.map((plan, i) => (
              <motion.div key={plan.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <GlassCard className={`p-6 h-full relative ${plan.popular ? "ring-2 ring-violet-500/50" : ""}`}>
                  {plan.popular && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-violet-500 text-white text-xs font-semibold">Most Popular</span>
                  )}
                  <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
                  <p className="text-3xl font-bold text-violet-500 mb-6">{plan.price}</p>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
                        <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" /> {f}
                      </li>
                    ))}
                  </ul>
                  <GradientButton variant={plan.popular ? "primary" : "secondary"} className="w-full">{plan.cta}</GradientButton>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="px-4 py-24">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {FAQ_ITEMS.map((item, i) => (
              <motion.details key={i} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="glass-card rounded-xl group">
                <summary className="px-6 py-4 cursor-pointer font-medium flex items-center justify-between list-none">
                  {item.q}
                  <ChevronDown className="w-5 h-5 text-[var(--text-muted)] group-open:rotate-180 transition-transform" />
                </summary>
                <p className="px-6 pb-4 text-sm text-[var(--text-muted)] leading-relaxed">{item.a}</p>
              </motion.details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-24">
        <GlassCard className="max-w-4xl mx-auto p-12 text-center animated-gradient relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Ready to Land Your Dream Job?</h2>
            <p className="text-white/80 mb-8 max-w-lg mx-auto">Start practicing today with our AI-powered interview platform.</p>
            <Link to="/setup">
              <GradientButton size="lg">Get Started Free <ArrowRight className="w-5 h-5" /></GradientButton>
            </Link>
          </div>
        </GlassCard>
      </section>

      {/* Footer */}
      <footer className="px-4 py-12 border-t border-[var(--border)]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-[var(--text-muted)]">© 2026 InterviewCoachAI. All rights reserved.</p>
          <div className="flex gap-6 text-sm text-[var(--text-muted)]">
            <a href="#features" className="hover:text-violet-500 transition-colors">Features</a>
            <a href="#pricing" className="hover:text-violet-500 transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-violet-500 transition-colors">FAQ</a>
            <Link to="/dashboard" className="hover:text-violet-500 transition-colors">Dashboard</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

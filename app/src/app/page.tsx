"use client";

import { FC, useState, useEffect } from "react";
import Link from "next/link";
import { useWallet } from "@solana/wallet-adapter-react";
import { 
  Shield, 
  Lock, 
  Eye, 
  EyeOff,
  ArrowRight,
  CheckCircle,
  ChevronDown,
  Gavel,
  Users,
  Zap,
  Server,
  Key,
  Fingerprint,
  TrendingUp,
  Building2,
  Palette,
  Gem,
  Scale,
  Globe,
  ShieldCheck,
  Cpu,
  Layers
} from "lucide-react";

export default function LandingPage() {
  const { connected } = useWallet();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <HeroSection connected={connected} />

      {/* Trust Indicators */}
      <TrustIndicators />

      {/* How It Works Section */}
      <HowItWorksSection />

      {/* Technology Section */}
      <TechnologySection />

      {/* Features Section */}
      <FeaturesSection />

      {/* Use Cases Section */}
      <UseCasesSection />

      {/* FAQ Section */}
      <FAQSection />

      {/* CTA Section */}
      <CTASection connected={connected} />
    </div>
  );
}

// ==================== ANIMATED ENCRYPTION VISUAL ====================
const EncryptionVisual: FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % 4);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const bids = [
    { label: "Bid A", encrypted: "0x7f3a...8e2d", color: "from-emerald-500/20 to-emerald-500/5" },
    { label: "Bid B", encrypted: "0x2c9b...4f1a", color: "from-blue-500/20 to-blue-500/5" },
    { label: "Bid C", encrypted: "0x9e5d...7c3b", color: "from-purple-500/20 to-purple-500/5" },
    { label: "Bid D", encrypted: "0x1a4f...6d8e", color: "from-amber-500/20 to-amber-500/5" },
  ];

  return (
    <div className="relative">
      {/* Glowing background orb */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-64 h-64 md:w-80 md:h-80 rounded-full bg-gradient-to-br from-accent-500/20 via-accent-600/10 to-transparent blur-3xl" />
      </div>
      
      {/* Central shield */}
      <div className="relative flex items-center justify-center">
        <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-gradient-to-br from-accent-500 to-accent-700 flex items-center justify-center shadow-2xl shadow-accent-500/25">
          <Shield className="w-12 h-12 md:w-16 md:h-16 text-white" />
        </div>
      </div>

      {/* Orbiting encrypted bids */}
      <div className="absolute inset-0 flex items-center justify-center">
        {bids.map((bid, index) => {
          const angle = (index * 90 + activeIndex * 90) % 360;
          const radius = 100;
          const x = Math.cos((angle * Math.PI) / 180) * radius;
          const y = Math.sin((angle * Math.PI) / 180) * radius;
          const isActive = index === activeIndex;
          
          return (
            <div
              key={bid.label}
              className={`absolute transition-all duration-1000 ease-in-out ${
                isActive ? "scale-110 z-10" : "scale-100 opacity-60"
              }`}
              style={{
                transform: `translate(${x}px, ${y}px)`,
              }}
            >
              <div className={`px-3 py-2 rounded-lg bg-gradient-to-r ${bid.color} border border-surface-700/50 backdrop-blur-sm`}>
                <div className="text-xs text-surface-400 mb-0.5">{bid.label}</div>
                <div className="font-mono text-xs text-accent-400">{bid.encrypted}</div>
                <Lock className="w-3 h-3 text-accent-500 absolute -top-1 -right-1" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ==================== HERO SECTION ====================
const HeroSection: FC<{ connected: boolean }> = ({ connected }) => (
  <section className="relative overflow-hidden">
    {/* Complex background */}
    <div className="absolute inset-0 bg-gradient-to-b from-surface-900/80 via-surface-950 to-surface-950" />
    
    {/* Grid pattern */}
    <div 
      className="absolute inset-0 opacity-[0.03]"
      style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
        backgroundSize: "40px 40px",
      }}
    />
    
    {/* Gradient orbs */}
    <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl" />
    <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
    
    <div className="relative container mx-auto px-4 py-20 md:py-28 lg:py-36">
      <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        {/* Text Content */}
        <div className="text-center lg:text-left">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-surface-800/60 border border-surface-700/50 rounded-full px-4 py-2 mb-6 backdrop-blur-sm">
            <div className="w-2 h-2 rounded-full bg-success-500 animate-pulse" />
            <span className="text-surface-300 text-sm">Live on Solana Devnet</span>
          </div>
          
          {/* Headline */}
          <h1 className="heading-1 text-surface-100 mb-6">
            <span className="block">Sealed-Bid Auctions</span>
            <span className="block bg-gradient-to-r from-accent-400 via-accent-500 to-purple-500 bg-clip-text text-transparent">
              Zero Compromise
            </span>
          </h1>
          
          {/* Subheadline */}
          <p className="text-lg md:text-xl text-surface-400 mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed">
            Place encrypted bids that remain invisible to everyone—including validators, 
            other bidders, and even the auction creator. Win on merit, not manipulation.
          </p>
          
          {/* Key Features Pills */}
          <div className="flex flex-wrap gap-3 justify-center lg:justify-start mb-8">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-800/50 border border-surface-700/50 text-sm text-surface-300">
              <Lock className="w-3.5 h-3.5 text-accent-500" />
              End-to-End Encrypted
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-800/50 border border-surface-700/50 text-sm text-surface-300">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              Single Transaction
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-800/50 border border-surface-700/50 text-sm text-surface-300">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              MEV Protected
            </div>
          </div>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
            <Link href="/auctions" className="btn-primary btn-lg group">
              Explore Auctions
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            {connected ? (
              <Link href="/auction/create" className="btn-secondary btn-lg">
                Create Auction
              </Link>
            ) : (
              <span className="text-surface-500 text-sm">
                Connect wallet to create auctions
              </span>
            )}
          </div>
        </div>

        {/* Visual Element */}
        <div className="hidden lg:flex items-center justify-center">
          <div className="relative w-80 h-80">
            <EncryptionVisual />
          </div>
        </div>
      </div>
    </div>
  </section>
);

// ==================== TRUST INDICATORS ====================
const TrustIndicators: FC = () => {
  const stats = [
    { label: "Encryption Standard", value: "AES-256", icon: Lock },
    { label: "Bid Privacy", value: "100%", icon: EyeOff },
    { label: "Settlement", value: "Trustless", icon: CheckCircle },
    { label: "MEV Protection", value: "Full", icon: Shield },
  ];

  return (
    <section className="border-y border-surface-800/50 bg-surface-900/30">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-surface-800/50 mb-3">
                <stat.icon className="w-5 h-5 text-accent-500" />
              </div>
              <div className="text-2xl font-bold text-surface-100 mb-1">{stat.value}</div>
              <div className="text-sm text-surface-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ==================== HOW IT WORKS SECTION ====================
const HowItWorksSection: FC = () => {
  const steps = [
    {
      number: "01",
      title: "Create or Find an Auction",
      description: "Sellers create auctions with a reserve price. Buyers browse active auctions to find items they want.",
      icon: Gavel,
      accent: "from-blue-500 to-cyan-500",
    },
    {
      number: "02",
      title: "Place Encrypted Bids",
      description: "Your bid is encrypted client-side before submission. The encrypted bid is stored on-chain—completely invisible.",
      icon: Lock,
      accent: "from-purple-500 to-pink-500",
    },
    {
      number: "03",
      title: "Winner Determined Privately",
      description: "After bidding ends, encrypted comparison in TEE determines the highest bid without revealing any amounts.",
      icon: EyeOff,
      accent: "from-amber-500 to-orange-500",
    },
    {
      number: "04",
      title: "Settlement & Reveal",
      description: "Only the winner's bid is revealed during settlement. All other bids remain private forever.",
      icon: CheckCircle,
      accent: "from-emerald-500 to-green-500",
    },
  ];

  return (
    <section className="section">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-800/50 border border-surface-700/50 text-sm text-surface-400 mb-4">
            <Layers className="w-4 h-4" />
            Simple Process
          </div>
          <h2 className="heading-2 text-surface-100 mb-4">How ShadowBid Works</h2>
          <p className="text-muted max-w-2xl mx-auto">
            Four simple steps to participate in truly sealed auctions where your bidding strategy stays private.
          </p>
        </div>

        {/* Steps Timeline */}
        <div className="max-w-5xl mx-auto">
          <div className="relative">
            {/* Connection Line */}
            <div className="hidden md:block absolute top-24 left-8 right-8 h-0.5 bg-gradient-to-r from-surface-800 via-surface-700 to-surface-800" />
            
            <div className="grid md:grid-cols-4 gap-8 md:gap-4">
              {steps.map((step, index) => (
                <div key={step.number} className="relative group">
                  {/* Step Card */}
                  <div className="relative bg-surface-900/50 border border-surface-800 rounded-2xl p-6 hover:border-surface-700 transition-all duration-300 hover:-translate-y-1">
                    {/* Icon Container */}
                    <div className="relative mb-6">
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.accent} p-[1px]`}>
                        <div className="w-full h-full rounded-2xl bg-surface-900 flex items-center justify-center">
                          <step.icon className="w-7 h-7 text-surface-100" />
                        </div>
                      </div>
                      {/* Step Number */}
                      <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-surface-800 border border-surface-700 flex items-center justify-center text-xs font-bold text-surface-300">
                        {step.number}
                      </div>
                    </div>

                    {/* Content */}
                    <h3 className="text-lg font-semibold text-surface-100 mb-2">{step.title}</h3>
                    <p className="text-sm text-muted leading-relaxed">{step.description}</p>
                  </div>

                  {/* Arrow (between cards on desktop) */}
                  {index < steps.length - 1 && (
                    <div className="hidden md:flex absolute top-24 -right-4 z-10 w-8 h-8 items-center justify-center">
                      <ArrowRight className="w-4 h-4 text-surface-600" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// ==================== TECHNOLOGY SECTION ====================
const TechnologySection: FC = () => {
  const technologies = [
    {
      name: "Inco Lightning",
      description: "Confidential computing infrastructure enabling encrypted operations inside Trusted Execution Environments (TEE).",
      features: ["Homomorphic Operations", "TEE-Attested Decryption", "Access Control"],
      icon: Cpu,
      gradient: "from-accent-500/20 to-accent-600/5",
    },
    {
      name: "Solana",
      description: "High-performance blockchain providing fast, low-cost settlement for auction transactions.",
      features: ["Sub-second Finality", "Low Transaction Costs", "Scalable Infrastructure"],
      icon: Zap,
      gradient: "from-purple-500/20 to-purple-600/5",
    },
    {
      name: "End-to-End Encryption",
      description: "Client-side encryption ensures bid amounts never exist in plaintext on-chain.",
      features: ["Client-side Encryption", "Encrypted Comparisons", "Selective Disclosure"],
      icon: Key,
      gradient: "from-emerald-500/20 to-emerald-600/5",
    },
  ];

  return (
    <section className="section-alt">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-800/50 border border-surface-700/50 text-sm text-surface-400 mb-4">
            <Server className="w-4 h-4" />
            Powered By
          </div>
          <h2 className="heading-2 text-surface-100 mb-4">Built on Proven Technology</h2>
          <p className="text-muted max-w-2xl mx-auto">
            ShadowBid combines cutting-edge confidential computing with blockchain infrastructure 
            to deliver truly private auctions.
          </p>
        </div>

        {/* Technology Cards */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {technologies.map((tech) => (
            <div
              key={tech.name}
              className="relative group"
            >
              <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${tech.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
              <div className="relative bg-surface-900 border border-surface-800 rounded-2xl p-6 h-full hover:border-surface-700 transition-colors">
                {/* Icon */}
                <div className="w-12 h-12 rounded-xl bg-surface-800 flex items-center justify-center mb-4">
                  <tech.icon className="w-6 h-6 text-accent-500" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-semibold text-surface-100 mb-2">{tech.name}</h3>
                <p className="text-sm text-muted mb-4">{tech.description}</p>

                {/* Features */}
                <ul className="space-y-2">
                  {tech.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-surface-400">
                      <CheckCircle className="w-4 h-4 text-accent-500 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Architecture Diagram Hint */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-6 px-6 py-4 rounded-2xl bg-surface-800/30 border border-surface-700/50">
            <div className="flex items-center gap-2 text-sm text-surface-400">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              Client Encryption
            </div>
            <ArrowRight className="w-4 h-4 text-surface-600" />
            <div className="flex items-center gap-2 text-sm text-surface-400">
              <div className="w-2 h-2 rounded-full bg-accent-500" />
              Solana Storage
            </div>
            <ArrowRight className="w-4 h-4 text-surface-600" />
            <div className="flex items-center gap-2 text-sm text-surface-400">
              <div className="w-2 h-2 rounded-full bg-purple-500" />
              Inco TEE Processing
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// ==================== FEATURES SECTION ====================
const FeaturesSection: FC = () => {
  const features = [
    {
      icon: Lock,
      title: "Complete Bid Privacy",
      description: "Bids are encrypted end-to-end. Even blockchain validators cannot see bid amounts until settlement.",
    },
    {
      icon: Shield,
      title: "Front-Running Proof",
      description: "Encrypted bids eliminate MEV attacks and strategic underbidding that plague traditional auctions.",
    },
    {
      icon: Users,
      title: "Fair Competition",
      description: "Every bidder competes on equal ground with no insider advantages or information asymmetry.",
    },
    {
      icon: Zap,
      title: "Single Transaction",
      description: "No complex commit-reveal schemes. Place your encrypted bid in just one transaction.",
    },
    {
      icon: EyeOff,
      title: "Selective Disclosure",
      description: "Only the winning bid is revealed at settlement. All losing bids stay secret forever.",
    },
    {
      icon: Fingerprint,
      title: "TEE-Attested Settlement",
      description: "Winner determination is verified through trusted execution environment attestation.",
    },
  ];

  return (
    <section className="section">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-800/50 border border-surface-700/50 text-sm text-surface-400 mb-4">
            <ShieldCheck className="w-4 h-4" />
            Why ShadowBid
          </div>
          <h2 className="heading-2 text-surface-100 mb-4">Privacy-First Auctions</h2>
          <p className="text-muted max-w-2xl mx-auto">
            Traditional auctions expose your strategy. ShadowBid keeps your bids completely private 
            throughout the entire auction lifecycle.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group p-6 rounded-2xl bg-surface-900/50 border border-surface-800 hover:border-surface-700 hover:bg-surface-900/80 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-surface-800 group-hover:bg-surface-700/80 flex items-center justify-center mb-4 transition-colors">
                <feature.icon className="w-6 h-6 text-accent-500" />
              </div>
              <h3 className="font-semibold text-surface-100 mb-2">{feature.title}</h3>
              <p className="text-sm text-muted leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ==================== USE CASES SECTION ====================
const UseCasesSection: FC = () => {
  const useCases = [
    {
      icon: Palette,
      title: "NFT Auctions",
      description: "Sell digital art and collectibles without revealing bidder strategies or enabling sniping.",
    },
    {
      icon: Building2,
      title: "Real Estate",
      description: "Property sales where fair market value is determined through genuine sealed bidding.",
    },
    {
      icon: Gem,
      title: "Rare Collectibles",
      description: "High-value items like vintage cards, rare coins, or limited editions auctioned fairly.",
    },
    {
      icon: Scale,
      title: "Government Contracts",
      description: "Procurement auctions where bid privacy prevents corruption and ensures fair competition.",
    },
  ];

  return (
    <section className="section-alt">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-800/50 border border-surface-700/50 text-sm text-surface-400 mb-4">
            <Globe className="w-4 h-4" />
            Applications
          </div>
          <h2 className="heading-2 text-surface-100 mb-4">Real-World Use Cases</h2>
          <p className="text-muted max-w-2xl mx-auto">
            Sealed-bid auctions provide fair price discovery across many industries 
            where bid privacy and fairness are essential.
          </p>
        </div>

        {/* Use Cases Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {useCases.map((useCase) => (
            <div
              key={useCase.title}
              className="text-center p-6 rounded-2xl bg-surface-900/50 border border-surface-800 hover:border-surface-700 transition-colors"
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent-500/20 to-accent-600/5 flex items-center justify-center mx-auto mb-4">
                <useCase.icon className="w-7 h-7 text-accent-500" />
              </div>
              <h3 className="font-semibold text-surface-100 mb-2">{useCase.title}</h3>
              <p className="text-sm text-muted">{useCase.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ==================== FAQ SECTION ====================
const FAQSection: FC = () => {
  const faqs = [
    {
      question: "How are bids kept private?",
      answer: "Bids are encrypted client-side using Inco's encryption SDK before being submitted to the blockchain. The encrypted values are stored as cryptographic handles that can only be processed through Inco's Trusted Execution Environment (TEE). Not even validators can see the actual bid amounts.",
    },
    {
      question: "Can the auction creator see my bid?",
      answer: "No. The auction creator, other bidders, and even blockchain validators cannot see individual bid amounts. Only encrypted handles are stored on-chain. The actual values remain encrypted throughout the entire auction lifecycle.",
    },
    {
      question: "How is the winner determined without revealing bids?",
      answer: "After bidding ends, encrypted comparisons are performed using homomorphic operations (e_ge, e_select) inside the TEE. The highest bid is determined mathematically without decrypting any individual bids. Only the winning amount is revealed during settlement.",
    },
    {
      question: "What happens to losing bids?",
      answer: "Losing bids are never decrypted or revealed—ever. Only the winner receives permission to decrypt their own bid during settlement. All other bids remain permanently encrypted on-chain, preserving complete privacy for all participants.",
    },
    {
      question: "Can I update my bid after placing it?",
      answer: "Yes. You can place multiple bids on the same auction. Each new bid updates your existing encrypted bid, but previous amounts remain hidden. This allows you to adjust your strategy without revealing your bidding history.",
    },
    {
      question: "What makes this different from commit-reveal auctions?",
      answer: "Traditional commit-reveal schemes require two transactions and bidders can choose not to reveal losing bids. ShadowBid uses single-transaction encrypted bids with automatic comparison and settlement. No reveals needed, no griefing possible.",
    },
  ];

  return (
    <section className="section">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="heading-2 text-surface-100 mb-4">Frequently Asked Questions</h2>
          <p className="text-muted max-w-2xl mx-auto">
            Everything you need to know about sealed-bid auctions on ShadowBid.
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="max-w-3xl mx-auto">
          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <FAQItem key={index} question={faq.question} answer={faq.answer} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

const FAQItem: FC<{ question: string; answer: string }> = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-surface-800 rounded-xl overflow-hidden hover:border-surface-700 transition-colors">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 text-left bg-surface-900/50 hover:bg-surface-900/80 transition-colors"
      >
        <span className="font-medium text-surface-100 pr-4">{question}</span>
        <ChevronDown
          className={`w-5 h-5 text-surface-400 transition-transform duration-200 flex-shrink-0 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-200 ${
          isOpen ? "max-h-96" : "max-h-0"
        }`}
      >
        <div className="p-5 pt-0 bg-surface-900/50">
          <p className="text-muted leading-relaxed">{answer}</p>
        </div>
      </div>
    </div>
  );
};

// ==================== CTA SECTION ====================
const CTASection: FC<{ connected: boolean }> = ({ connected }) => (
  <section className="section-alt">
    <div className="container mx-auto px-4">
      <div className="max-w-4xl mx-auto">
        <div className="relative overflow-hidden rounded-3xl">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-accent-600/20 via-surface-900 to-purple-600/20" />
          <div className="absolute inset-0 bg-surface-900/80" />
          
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />
          
          <div className="relative p-10 md:p-14 text-center">
            {/* Icon */}
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-500 to-accent-700 mb-6">
              <Gavel className="w-8 h-8 text-white" />
            </div>

            <h2 className="heading-2 text-surface-100 mb-4">
              Ready to Bid Privately?
            </h2>
            <p className="text-muted mb-8 max-w-xl mx-auto text-lg">
              Join the future of fair auctions. Connect your Solana wallet and experience 
              sealed-bid auctions where your strategy stays secret.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/auctions" className="btn-primary btn-lg group">
                Explore Auctions
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              {connected && (
                <Link href="/auction/create" className="btn-secondary btn-lg">
                  Create Your Auction
                </Link>
              )}
            </div>

            {/* Trust note */}
            <div className="mt-8 flex items-center justify-center gap-6 text-sm text-surface-500">
              <span className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                End-to-End Encrypted
              </span>
              <span className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                MEV Protected
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

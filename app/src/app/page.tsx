"use client";

import { FC, useState } from "react";
import Link from "next/link";
import { useWallet } from "@solana/wallet-adapter-react";
import { 
  Shield, 
  Lock, 
  Eye, 
  EyeOff,
  ArrowRight,
  CheckCircle,
  HelpCircle,
  ChevronDown,
  Gavel,
  Users,
  Zap
} from "lucide-react";

export default function LandingPage() {
  const { connected } = useWallet();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <HeroSection connected={connected} />

      {/* How It Works Section */}
      <HowItWorksSection />

      {/* Features Section */}
      <FeaturesSection />

      {/* FAQ Section */}
      <FAQSection />

      {/* CTA Section */}
      <CTASection connected={connected} />
    </div>
  );
}

// ==================== HERO SECTION ====================
const HeroSection: FC<{ connected: boolean }> = ({ connected }) => (
  <section className="relative overflow-hidden">
    {/* Subtle background pattern */}
    <div className="absolute inset-0 bg-gradient-to-b from-surface-900/50 to-surface-950" />
    <div 
      className="absolute inset-0 opacity-[0.02]"
      style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
        backgroundSize: "32px 32px",
      }}
    />
    
    <div className="relative container mx-auto px-4 py-24 md:py-32 lg:py-40">
      <div className="max-w-3xl mx-auto text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-surface-800/50 border border-surface-700/50 rounded-full px-4 py-2 mb-8">
          <Shield className="w-4 h-4 text-accent-500" />
          <span className="text-surface-300 text-sm">Powered by Inco Confidential Computing</span>
        </div>
        
        {/* Headline */}
        <h1 className="heading-1 text-surface-100 mb-6">
          Sealed-Bid Auctions
          <br />
          <span className="text-accent-500">Without Compromise</span>
        </h1>
        
        {/* Subheadline */}
        <p className="text-xl text-surface-400 mb-10 max-w-2xl mx-auto leading-relaxed">
          Place encrypted bids that no one can see—not even validators. 
          Win fair auctions without front-running or bid manipulation.
        </p>
        
        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/auctions" className="btn-primary btn-lg">
            Browse Auctions
            <ArrowRight className="w-5 h-5" />
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
    </div>
  </section>
);

// ==================== HOW IT WORKS SECTION ====================
const HowItWorksSection: FC = () => {
  const steps = [
    {
      number: "01",
      title: "Create or Find an Auction",
      description: "Sellers create auctions with a reserve price. Buyers browse active auctions to find items they want.",
      icon: Gavel,
    },
    {
      number: "02",
      title: "Place Encrypted Bids",
      description: "Enter your bid amount and it's encrypted client-side. The encrypted bid is stored on-chain—no one can see the amount.",
      icon: Lock,
    },
    {
      number: "03",
      title: "Winner Determined Privately",
      description: "After bidding ends, encrypted comparison determines the highest bid without revealing any amounts.",
      icon: EyeOff,
    },
    {
      number: "04",
      title: "Settlement & Reveal",
      description: "Only the winner's bid is revealed during settlement. Losing bids remain private forever.",
      icon: CheckCircle,
    },
  ];

  return (
    <section className="section-alt">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="heading-2 text-surface-100 mb-4">How It Works</h2>
          <p className="text-muted max-w-2xl mx-auto">
            ShadowBid uses Inco&apos;s confidential computing to enable truly sealed auctions on Solana.
          </p>
        </div>

        {/* Steps */}
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {steps.map((step, index) => (
              <div key={step.number} className="relative">
                <div className="card hover:border-surface-700 transition-colors">
                  {/* Step Number */}
                  <span className="text-5xl font-bold text-surface-800 absolute top-4 right-4">
                    {step.number}
                  </span>
                  
                  {/* Icon */}
                  <div className="w-12 h-12 rounded-xl bg-accent-900/30 border border-accent-700/30 flex items-center justify-center mb-4">
                    <step.icon className="w-6 h-6 text-accent-500" />
                  </div>

                  {/* Content */}
                  <h3 className="heading-3 text-surface-100 mb-2">{step.title}</h3>
                  <p className="text-muted">{step.description}</p>
                </div>
              </div>
            ))}
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
      title: "Complete Privacy",
      description: "Bids are encrypted end-to-end. Even blockchain validators cannot see bid amounts.",
    },
    {
      icon: Shield,
      title: "Front-Running Proof",
      description: "Encrypted bids eliminate MEV attacks and strategic underbidding.",
    },
    {
      icon: Users,
      title: "Fair Competition",
      description: "Every bidder competes on equal ground—no insider advantages.",
    },
    {
      icon: Zap,
      title: "Single Transaction",
      description: "No commit-reveal schemes. Place your bid in one transaction.",
    },
    {
      icon: EyeOff,
      title: "Selective Disclosure",
      description: "Only the winning bid is revealed. Losing bids stay secret forever.",
    },
    {
      icon: CheckCircle,
      title: "Trustless Settlement",
      description: "TEE-attested decryption ensures honest winner determination.",
    },
  ];

  return (
    <section className="section">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="heading-2 text-surface-100 mb-4">Why ShadowBid?</h2>
          <p className="text-muted max-w-2xl mx-auto">
            Traditional auctions expose your strategy. ShadowBid keeps your bids private.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="p-6 rounded-xl border border-surface-800 bg-surface-900/50 hover:border-surface-700 transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-surface-800 flex items-center justify-center mb-4">
                <feature.icon className="w-5 h-5 text-accent-500" />
              </div>
              <h3 className="font-semibold text-surface-100 mb-2">{feature.title}</h3>
              <p className="text-sm text-muted">{feature.description}</p>
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
      answer: "Bids are encrypted client-side using Inco's encryption SDK before being submitted to the blockchain. The encrypted values are stored as cryptographic handles that can only be processed through Inco's Trusted Execution Environment (TEE).",
    },
    {
      question: "Can the auction creator see my bid?",
      answer: "No. The auction creator, other bidders, and even blockchain validators cannot see individual bid amounts. Only encrypted handles are stored on-chain.",
    },
    {
      question: "How is the winner determined?",
      answer: "After bidding ends, encrypted comparisons are performed using homomorphic operations (e_ge, e_select) inside the TEE. The highest bid is determined without decrypting any individual bids.",
    },
    {
      question: "What happens to losing bids?",
      answer: "Losing bids are never decrypted or revealed. Only the winner receives permission to decrypt their own bid during settlement. All other bids remain permanently encrypted.",
    },
    {
      question: "Can I update my bid?",
      answer: "Yes. You can place multiple bids on the same auction. Each new bid updates your existing encrypted bid, but previous amounts remain hidden.",
    },
    {
      question: "What's the minimum auction duration?",
      answer: "The minimum auction duration is 2 minutes (for testing purposes). The maximum duration is 7 days.",
    },
  ];

  return (
    <section className="section-alt">
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
          <div className="space-y-4">
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
    <div className="border border-surface-800 rounded-xl overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 text-left bg-surface-900/50 hover:bg-surface-900 transition-colors"
      >
        <span className="font-medium text-surface-100">{question}</span>
        <ChevronDown
          className={`w-5 h-5 text-surface-400 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      {isOpen && (
        <div className="p-5 pt-0 bg-surface-900/50">
          <p className="text-muted">{answer}</p>
        </div>
      )}
    </div>
  );
};

// ==================== CTA SECTION ====================
const CTASection: FC<{ connected: boolean }> = ({ connected }) => (
  <section className="section">
    <div className="container mx-auto px-4">
      <div className="max-w-3xl mx-auto text-center">
        <div className="bg-gradient-to-br from-surface-800/50 to-surface-900/50 border border-surface-700/50 rounded-2xl p-10 md:p-14">
          <h2 className="heading-2 text-surface-100 mb-4">
            Ready to Bid Privately?
          </h2>
          <p className="text-muted mb-8 max-w-xl mx-auto">
            Connect your Solana wallet and experience fair auctions where your strategy stays secret.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/auctions" className="btn-primary btn-lg">
              Explore Auctions
              <ArrowRight className="w-5 h-5" />
            </Link>
            {connected && (
              <Link href="/auction/create" className="btn-secondary btn-lg">
                Create Your Auction
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  </section>
);

import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  GraduationCap,
  Smartphone,
  FileCheck,
  CreditCard,
  Shield,
  Clock,
  MapPin,
  CheckCircle2,
  Star,
  ChevronRight,
  Menu,
  X,
  Download,
  School,
  Users,
  Receipt,
  Eye,
  Building2,
} from "lucide-react";
import apscoIcon from "@/assets/apsco-icon.png";

const LandingPage = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: "Home", href: "#home" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "For Parents", href: "#for-parents" },
    { label: "For Schools", href: "#for-schools" },
    { label: "Reviews", href: "#reviews" },
    { label: "FAQs", href: "#faqs" },
  ];

  const features = [
    {
      icon: School,
      title: "Online School Applications",
      description: "Apply to multiple schools without physical travel.",
    },
    {
      icon: CreditCard,
      title: "Digital School Fee Payments",
      description: "Pay securely using Mobile Money or card.",
    },
    {
      icon: Eye,
      title: "Application Status Tracking",
      description: "See acceptance or rejection in real time.",
    },
    {
      icon: Receipt,
      title: "Instant PDF Receipts",
      description: "Download official digital receipts anytime.",
    },
    {
      icon: Building2,
      title: "School Profiles",
      description: "View verified schools, fees, and requirements.",
    },
  ];

  const problems = [
    {
      icon: MapPin,
      text: "Traveling long distances just to apply to schools",
    },
    {
      icon: CreditCard,
      text: "Paying money only to get rejected",
    },
    {
      icon: FileCheck,
      text: "Manual school fee payments with no records",
    },
    {
      icon: Clock,
      text: "No transparency after payment",
    },
  ];

  const steps = [
    {
      number: "1",
      title: "Create Account",
      description: "Create an APSCO account in minutes",
    },
    {
      number: "2",
      title: "Browse Schools",
      description: "Browse schools or enter school pay code",
    },
    {
      number: "3",
      title: "Apply & Pay",
      description: "Submit applications and pay securely",
    },
    {
      number: "4",
      title: "Track & Download",
      description: "Track status & download receipts",
    },
  ];

  const testimonials = [
    {
      name: "Sarah Nakamya",
      role: "Parent",
      quote: "APSCO saved me from traveling to 5 different schools. I applied to all of them from my phone!",
      rating: 5,
    },
    {
      name: "David Okello",
      role: "Student",
      quote: "I tracked my application status in real-time. The transparency is amazing.",
      rating: 5,
    },
    {
      name: "Mr. James Ssemwogerere",
      role: "School Administrator",
      quote: "Our application processing time reduced by 70%. APSCO transformed our admissions.",
      rating: 5,
    },
  ];

  const faqs = [
    {
      question: "Is APSCO free for parents?",
      answer: "Yes! APSCO is completely free for parents and students. You only pay the school's application fees directly to the school.",
    },
    {
      question: "Is APSCO secure?",
      answer: "Absolutely. We use bank-grade encryption and all payments go directly to verified school accounts. Your data is protected and never shared.",
    },
    {
      question: "Which schools are on APSCO?",
      answer: "APSCO works with verified schools across Uganda, including top institutions like Uganda Martyrs SS Namugongo. New schools are added regularly.",
    },
    {
      question: "How do I track my application?",
      answer: "After applying, you'll receive real-time updates on your application status through the app. You'll be notified immediately when a decision is made.",
    },
    {
      question: "Can I apply to multiple schools?",
      answer: "Yes! You can apply to as many schools as you want through APSCO, all from a single platform.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <img src={apscoIcon} alt="APSCO" className="h-10 w-10" />
              <span className="text-xl font-bold text-foreground">APSCO</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </nav>

            {/* Desktop CTAs */}
            <div className="hidden lg:flex items-center gap-3">
              <Button variant="outline" asChild>
                <Link to="/auth/login">Log In</Link>
              </Button>
              <Button asChild>
                <Link to="/auth/register">Create School</Link>
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6 text-foreground" />
              ) : (
                <Menu className="h-6 w-6 text-foreground" />
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden py-4 border-t border-border">
              <nav className="flex flex-col gap-4">
                {navLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </a>
                ))}
                <div className="flex flex-col gap-2 pt-4">
                  <Button variant="outline" asChild className="w-full">
                    <Link to="/auth/login">Log In</Link>
                  </Button>
                  <Button asChild className="w-full">
                    <Link to="/auth/register">Create School</Link>
                  </Button>
                </div>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section id="home" className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/30 py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6">
                Apply to Schools—{" "}
                <span className="text-primary">Anytime, Anywhere</span>
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-xl mx-auto lg:mx-0">
                APSCO digitalizes school applications in Uganda, saving families time, money, and stress.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
                <Button size="lg" className="text-base h-12 px-8" asChild>
                  <a href="https://play.google.com/store" target="_blank" rel="noopener noreferrer">
                    <Download className="mr-2 h-5 w-5" />
                    Install APSCO App
                  </a>
                </Button>
                <Button size="lg" variant="outline" className="text-base h-12 px-8" asChild>
                  <a href="#how-it-works">
                    Learn How It Works
                    <ChevronRight className="ml-1 h-5 w-5" />
                  </a>
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Trusted by parents, students, and schools across Uganda
              </p>
              <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                <div className="flex items-center gap-2 bg-card px-4 py-2 rounded-full border border-border">
                  <Shield className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Secure Payments</span>
                </div>
                <div className="flex items-center gap-2 bg-card px-4 py-2 rounded-full border border-border">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  <span className="text-sm font-medium">Official Schools</span>
                </div>
                <div className="flex items-center gap-2 bg-card px-4 py-2 rounded-full border border-border">
                  <Receipt className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Digital Receipts</span>
                </div>
              </div>
            </div>
            <div className="relative flex justify-center lg:justify-end">
              <div className="relative">
                {/* Phone Mockup */}
                <div className="relative z-10 bg-foreground rounded-[3rem] p-3 shadow-2xl">
                  <div className="bg-background rounded-[2.5rem] overflow-hidden w-[280px] h-[580px]">
                    <div className="bg-primary p-6 text-center">
                      <img src={apscoIcon} alt="APSCO" className="h-16 w-16 mx-auto mb-3" />
                      <h3 className="text-primary-foreground font-bold text-lg">APSCO</h3>
                      <p className="text-primary-foreground/80 text-sm">Online Applications</p>
                    </div>
                    <div className="p-4 space-y-3">
                      <div className="bg-muted rounded-xl p-4">
                        <div className="flex items-center gap-3 mb-2">
                          <School className="h-5 w-5 text-primary" />
                          <span className="font-medium text-sm">Browse Schools</span>
                        </div>
                        <p className="text-xs text-muted-foreground">Find verified schools near you</p>
                      </div>
                      <div className="bg-muted rounded-xl p-4">
                        <div className="flex items-center gap-3 mb-2">
                          <FileCheck className="h-5 w-5 text-success" />
                          <span className="font-medium text-sm">Apply Online</span>
                        </div>
                        <p className="text-xs text-muted-foreground">Submit applications instantly</p>
                      </div>
                      <div className="bg-muted rounded-xl p-4">
                        <div className="flex items-center gap-3 mb-2">
                          <CreditCard className="h-5 w-5 text-primary" />
                          <span className="font-medium text-sm">Pay Securely</span>
                        </div>
                        <p className="text-xs text-muted-foreground">Mobile Money & Card</p>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Decorative elements */}
                <div className="absolute -top-6 -right-6 w-24 h-24 bg-primary/20 rounded-full blur-2xl" />
                <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-accent rounded-full blur-2xl" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-16 lg:py-24 bg-muted/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              The Problem APSCO Solves
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We understand the challenges Ugandan families face with school applications
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {problems.map((problem, index) => (
              <div
                key={index}
                className="bg-card rounded-2xl p-6 border border-border shadow-card hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 bg-destructive/10 rounded-xl flex items-center justify-center mb-4">
                  <problem.icon className="h-6 w-6 text-destructive" />
                </div>
                <p className="font-medium text-foreground">{problem.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 lg:py-24 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              One Platform. Everything Education Payments.
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              APSCO brings all your school application needs to one place
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-card rounded-2xl p-6 border border-border shadow-card hover:shadow-md transition-all hover:-translate-y-1"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-16 lg:py-24 bg-muted/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              How APSCO Works
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Get started in 4 simple steps
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {steps.map((step, index) => (
              <div key={index} className="relative text-center">
                <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-primary-foreground">
                  {step.number}
                </div>
                <h3 className="font-semibold text-lg text-foreground mb-2">
                  {step.title}
                </h3>
                <p className="text-muted-foreground text-sm">{step.description}</p>
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-border" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For Parents Section */}
      <section id="for-parents" className="py-16 lg:py-24 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">
                Built for Parents & Students
              </h2>
              <ul className="space-y-4 mb-8">
                {[
                  "Saves transport costs",
                  "No long queues",
                  "Transparent applications",
                  "Secure payments",
                  "Works anywhere in Uganda",
                ].map((benefit, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0" />
                    <span className="text-foreground">{benefit}</span>
                  </li>
                ))}
              </ul>
              <Button size="lg" asChild>
                <a href="https://play.google.com/store" target="_blank" rel="noopener noreferrer">
                  <Smartphone className="mr-2 h-5 w-5" />
                  Install APSCO App
                </a>
              </Button>
            </div>
            <div className="bg-gradient-to-br from-primary/10 to-accent/30 rounded-3xl p-8 lg:p-12">
              <div className="bg-card rounded-2xl p-6 shadow-lg">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">For Families</p>
                    <p className="text-sm text-muted-foreground">Simple & Secure</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span className="text-sm">Application Status</span>
                    <span className="text-xs bg-success/10 text-success px-2 py-1 rounded-full">Accepted</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span className="text-sm">Payment Receipt</span>
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">Downloaded</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* For Schools Section */}
      <section id="for-schools" className="py-16 lg:py-24 bg-muted/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1 bg-gradient-to-br from-primary/10 to-accent/30 rounded-3xl p-8 lg:p-12">
              <div className="bg-card rounded-2xl p-6 shadow-lg">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <GraduationCap className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">School Dashboard</p>
                    <p className="text-sm text-muted-foreground">Manage Everything</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-primary">247</p>
                    <p className="text-xs text-muted-foreground">Applications</p>
                  </div>
                  <div className="bg-muted rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-success">189</p>
                    <p className="text-xs text-muted-foreground">Accepted</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">
                Built for Schools & Institutions
              </h2>
              <ul className="space-y-4 mb-8">
                {[
                  "Receive payments directly",
                  "Manage applications digitally",
                  "Reduce paperwork",
                  "Reach more students",
                  "Advertise your school",
                ].map((benefit, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0" />
                    <span className="text-foreground">{benefit}</span>
                  </li>
                ))}
              </ul>
              <Button size="lg" asChild>
                <Link to="/auth/register">
                  <Building2 className="mr-2 h-5 w-5" />
                  Register Your School
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="reviews" className="py-16 lg:py-24 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              What Users Say About APSCO
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Real stories from parents, students, and school administrators
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-card rounded-2xl p-6 border border-border shadow-card"
              >
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-warning text-warning" />
                  ))}
                </div>
                <p className="text-foreground mb-4 italic">"{testimonial.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-primary font-semibold">
                      {testimonial.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* App Install Section */}
      <section className="py-16 lg:py-24 bg-primary">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-primary-foreground mb-4">
            Get APSCO on Your Phone
          </h2>
          <p className="text-lg text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
            Download the app and start applying to schools today
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              variant="secondary"
              className="text-base h-14 px-8"
              asChild
            >
              <a href="https://play.google.com/store" target="_blank" rel="noopener noreferrer">
                <Smartphone className="mr-2 h-5 w-5" />
                Install on Google Play
              </a>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-base h-14 px-8 bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
              disabled
            >
              <Smartphone className="mr-2 h-5 w-5" />
              App Store — Coming Soon
            </Button>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="py-16 lg:py-24 bg-muted/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Secure, Reliable & Compliant
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Your trust is our priority
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {[
              { icon: Shield, title: "Secure Payments", desc: "Bank-grade encryption" },
              { icon: FileCheck, title: "Data Protection", desc: "Your info stays private" },
              { icon: Building2, title: "Direct to Schools", desc: "Funds go straight to schools" },
              { icon: CheckCircle2, title: "Verified Schools", desc: "All schools are verified" },
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <item.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-1">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faqs" className="py-16 lg:py-24 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Got questions? We have answers
            </p>
          </div>
          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`faq-${index}`}
                  className="bg-card border border-border rounded-2xl px-6 data-[state=open]:shadow-md"
                >
                  <AccordionTrigger className="text-left font-medium hover:no-underline py-5">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-5">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-background py-12 lg:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img src={apscoIcon} alt="APSCO" className="h-10 w-10 invert" />
                <span className="text-xl font-bold">APSCO</span>
              </div>
              <p className="text-background/70 text-sm">
                Digitalizing school applications in Uganda, one family at a time.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-background/70">
                <li><a href="#home" className="hover:text-background transition-colors">Home</a></li>
                <li><a href="#how-it-works" className="hover:text-background transition-colors">How It Works</a></li>
                <li><a href="#for-parents" className="hover:text-background transition-colors">For Parents</a></li>
                <li><a href="#for-schools" className="hover:text-background transition-colors">For Schools</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-background/70">
                <li><a href="#faqs" className="hover:text-background transition-colors">FAQs</a></li>
                <li><a href="#" className="hover:text-background transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-background transition-colors">Help Center</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-background/70">
                <li><a href="#" className="hover:text-background transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-background transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-background/10 pt-8 text-center text-sm text-background/50">
            <p>© {new Date().getFullYear()} APSCO. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

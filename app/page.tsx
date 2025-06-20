"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Code2, Globe, ArrowRight, Github, Star, Play, Sparkles, Terminal, FileText, Palette } from "lucide-react"
import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"
import { CodeSimulation } from "@/components/code-simulation"

export default function LandingPage() {
  const [isHovered, setIsHovered] = useState<string | null>(null)

  const features = [
    {
      icon: <Code2 className="h-6 w-6" />,
      title: "Advanced Code Editor",
      description: "Monaco Editor with IntelliSense, syntax highlighting, and auto-completion for 20+ languages.",
    },
    {
      icon: <Terminal className="h-6 w-6" />,
      title: "Integrated Terminal",
      description: "Built-in terminal with command history and real-time execution feedback.",
    },
    {
      icon: <Globe className="h-6 w-6" />,
      title: "Live Preview",
      description: "Instant preview of your web applications with hot reload and responsive testing.",
    },
    {
      icon: <Palette className="h-6 w-6" />,
      title: "14 Beautiful Themes",
      description: "Light, dark, and 6 color themes with both light and dark variants.",
    },
    {
      icon: <FileText className="h-6 w-6" />,
      title: "File Management",
      description: "Complete file and folder operations with drag-and-drop support.",
    },
    {
      icon: <Sparkles className="h-6 w-6" />,
      title: "AI Assistant",
      description: "Built-in AI coding assistant for code reviews, debugging, and suggestions.",
    },
  ]

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Code2 className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">Modern IDE</span>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            <Link href="#features" className="text-sm hover:text-primary transition-colors">
              Features
            </Link>
            <Link href="#pricing" className="text-sm hover:text-primary transition-colors">
              Pricing
            </Link>
            <Link href="#about" className="text-sm hover:text-primary transition-colors">
              About
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href="/auth">
              <Button variant="outline" size="sm">
                Sign In
              </Button>
            </Link>
            <Link href="/auth">
              <Button size="sm">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <Badge variant="secondary" className="mb-4">
            <Star className="h-3 w-3 mr-1" />
            Now with AI Assistant
          </Badge>

          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Code Anywhere,
            <br />
            Build Everything
          </h1>

          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            A powerful, browser-based IDE with advanced features, AI assistance, and beautiful themes. Start coding
            instantly without any setup.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/auth">
              <Button size="lg" className="text-lg px-8">
                <Play className="mr-2 h-5 w-5" />
                Start Coding Now
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="text-lg px-8">
              <Github className="mr-2 h-5 w-5" />
              View on GitHub
            </Button>
          </div>

          {/* Interactive Code Simulation */}
          <CodeSimulation />
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-muted/20">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything You Need to Code</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Professional development tools, AI assistance, and beautiful themes - all in your browser.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                onMouseEnter={() => setIsHovered(`feature-${index}`)}
                onMouseLeave={() => setIsHovered(null)}
              >
                <CardHeader>
                  <div
                    className={`w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 transition-colors ${
                      isHovered === `feature-${index}` ? "bg-primary text-primary-foreground" : "text-primary"
                    }`}
                  >
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Start Building?</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of developers who are already using Modern IDE to build amazing projects.
          </p>
          <Link href="/auth">
            <Button size="lg" className="text-lg px-12">
              Get Started for Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-12 px-4">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Code2 className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">Modern IDE</span>
            </div>

            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link href="#" className="hover:text-primary transition-colors">
                Privacy Policy
              </Link>
              <Link href="#" className="hover:text-primary transition-colors">
                Terms of Service
              </Link>
              <Link href="#" className="hover:text-primary transition-colors">
                Support
              </Link>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-border/50 text-center text-sm text-muted-foreground">
            © 2024 Modern IDE. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}

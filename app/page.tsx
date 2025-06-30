"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Code2, Globe, ArrowRight, Github, Star, Play, Sparkles, Terminal, FileText, Palette } from "lucide-react"
import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"
import { CodeSimulation } from "@/components/code-simulation"
import { motion, AnimatePresence } from "framer-motion"

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
      <motion.header 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <motion.div 
            className="flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}>
            <motion.div 
              className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center"
              whileHover={{ rotate: 10 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}>
              <Code2 className="h-5 w-5 text-primary-foreground" />
            </motion.div>
            <div className="flex flex-col">
              <span className="text-xl font-bold">Crux.ai</span>
            
            </div>
          </motion.div>

          <nav className="hidden md:flex items-center gap-6">
            {["Features", "Pricing", "About"].map((item, i) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i, duration: 0.5 }}
              >
                <Link href={`#${item.toLowerCase()}`} className="text-sm hover:text-primary transition-colors">
                  {item}
                </Link>
              </motion.div>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.3 }}
            >
              <Link href="/auth">
                <Button variant="outline" size="sm">
                  Sign In
                </Button>
              </Link>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.3 }}
              whileHover={{ scale: 1.05 }}
            >
              <Link href="/auth">
                <Button size="sm">
                  Get Started
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ repeat: Infinity, repeatDelay: 2, duration: 1 }}
                  >
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </motion.div>
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Badge variant="secondary" className="mb-4">
              <motion.div
                animate={{ rotate: [0, 15, 0] }}
                transition={{ repeat: Infinity, repeatDelay: 3, duration: 0.5 }}
              >
                <Star className="h-3 w-3 mr-1" />
              </motion.div>
              Now with AI Assistant
            </Badge>
          </motion.div>

          <motion.h1 
            className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.4 }}
            >
              Code Anywhere,
            </motion.span>
            <br />
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.6 }}
            >
              Build Everything
            </motion.span>
          </motion.h1>

          <motion.p 
            className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.8 }}
          >
            A powerful, browser-based IDE with advanced features, AI assistance, and beautiful themes. Start coding
            instantly without any setup.
          </motion.p>

          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 1 }}
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link href="/auth">
                <Button size="lg" className="text-lg px-8">
                  <motion.div
                    animate={{ rotate: [0, 5, 0] }}
                    transition={{ repeat: Infinity, repeatDelay: 2, duration: 0.5 }}
                  >
                    <Play className="mr-2 h-5 w-5" />
                  </motion.div>
                  Start Coding Now
                </Button>
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button variant="outline" size="lg" className="text-lg px-8">
                <motion.div
                  animate={{ rotate: [0, 10, 0] }}
                  transition={{ repeat: Infinity, repeatDelay: 3, duration: 0.5 }}
                >
                  <Github className="mr-2 h-5 w-5" />
                </motion.div>
                View on GitHub
              </Button>
            </motion.div>
          </motion.div>

          {/* Interactive Code Simulation */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2 }}
          >
            <CodeSimulation />
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-muted/20">
        <div className="container mx-auto max-w-6xl">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything You Need to Code</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Professional development tools, AI assistance, and beautiful themes - all in your browser.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -8 }}
              >
                <Card
                  className="h-full transition-all duration-300 hover:shadow-lg"
                  onMouseEnter={() => setIsHovered(`feature-${index}`)}
                  onMouseLeave={() => setIsHovered(null)}
                >
                  <CardHeader>
                    <motion.div
                      className={`w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 transition-colors ${
                        isHovered === `feature-${index}` ? "bg-primary text-primary-foreground" : "text-primary"
                      }`}
                      whileHover={{ rotate: 5, scale: 1.1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                      <motion.div
                        animate={isHovered === `feature-${index}` ? { scale: [1, 1.2, 1] } : {}}
                        transition={{ duration: 0.5 }}
                      >
                        {feature.icon}
                      </motion.div>
                    </motion.div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <motion.section 
        className="py-20 px-4"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
      >
        <div className="container mx-auto text-center max-w-3xl">
          <motion.h2 
            className="text-3xl md:text-4xl font-bold mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Ready to Start Building?
          </motion.h2>
          <motion.p 
            className="text-xl text-muted-foreground mb-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Join thousands of developers who are already using Crux.ai to build amazing projects.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link href="/auth">
              <Button size="lg" className="text-lg px-12">
                Get Started for Free
                <motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{ repeat: Infinity, repeatDelay: 1.5, duration: 0.8 }}
                >
                  <ArrowRight className="ml-2 h-5 w-5" />
                </motion.div>
              </Button>
            </Link>
          </motion.div>
        </div>
      </motion.section>

      {/* Footer */}
      <motion.footer 
        className="border-t border-border/50 py-12 px-4"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <motion.div 
              className="flex items-center gap-2 mb-4 md:mb-0"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <motion.div 
                className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center"
                whileHover={{ rotate: 10 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <Code2 className="h-5 w-5 text-primary-foreground" />
              </motion.div>
              <div className="flex flex-col">
                <span className="text-xl font-bold">Crux.ai</span>
               
              </div>
            </motion.div>

            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              {["Privacy Policy", "Terms of Service", "Support"].map((item, i) => (
                <motion.div
                  key={item}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 * i, duration: 0.5 }}
                  whileHover={{ y: -2 }}
                >
                  <Link href="#" className="hover:text-primary transition-colors">
                    {item}
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>

          <motion.div 
            className="mt-8 pt-8 border-t border-border/50 text-center text-sm text-muted-foreground"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            © 2025 Crux.ai. All rights reserved. Created by Minku Singh.
          </motion.div>
        </div>
      </motion.footer>
    </div>
  )
}

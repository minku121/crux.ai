"use client"

import React, { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Code2, Github, Mail, Eye, EyeOff, ArrowLeft, Loader2, Sparkles, User, Terminal, Braces, Code } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ThemeToggle } from "@/components/theme-toggle"
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from "framer-motion"
import DotGrid from "@/components/react-bits/dotgrid"
import SplashCursor from "@/components/react-bits/splash-cursor"





export default function AuthPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
  })
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("signin")

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Handle authentication
  const handleAuth = async (type: "signin" | "signup") => {
    setIsLoading(true)
    
    // Simulate authentication delay
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Redirect to get-started page
    router.push("/get-started")
  }


  const handleSocialAuth = async (provider: string) => {
    setIsLoading(true)
    
   
    await new Promise((resolve) => setTimeout(resolve, 1500))

    
    router.push("/get-started")
  }

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      <SplashCursor/>
      <DotGrid />
      
      
     
      
      
      <motion.header 
        className="border-b border-border/50 bg-background/80 backdrop-blur-sm fixed top-0 left-0 right-0 z-50"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link href="/" className="flex items-center gap-2">
              <motion.div
                whileHover={{ x: -3 }}
                whileTap={{ scale: 0.9 }}
              >
                <ArrowLeft className="h-4 w-4" />
              </motion.div>
              <motion.div 
                className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center"
                whileHover={{ rotate: 5 }}
                animate={{ 
                  boxShadow: ["0 0 0 0 rgba(var(--primary), 0.2)", "0 0 0 10px rgba(var(--primary), 0)"],
                }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 2,
                  ease: "easeInOut"
                }}
              >
                <Code2 className="h-5 w-5 text-primary-foreground" />
              </motion.div>
              <motion.span 
                className="text-xl font-bold"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                Crux.ai
              </motion.span>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <ThemeToggle />
          </motion.div>
        </div>
      </motion.header>
      <div className="h-16"></div> {/* Spacer for fixed header */}

      {/* Floating Icons */}
    
     

      {/* Auth Content */}
      <div className="flex-1 flex items-center justify-center p-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full max-w-md"
        >
          <Card className="w-full overflow-hidden">
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent z-0"
              animate={{ 
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{ 
                duration: 8, 
                repeat: Infinity,
                repeatType: "reverse" 
              }}
            />
            
            <motion.div
              className="relative z-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <CardHeader className="text-center">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30, delay: 0.4 }}
                >
                  <CardTitle className="text-2xl flex items-center justify-center gap-2">
                    Welcome to Crux.ai
                    
                  </CardTitle>
                </motion.div>
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <CardDescription>Enter your email below to create your account or sign in</CardDescription>
                </motion.div>
              </CardHeader>

              <CardContent>
                <Tabs 
                  defaultValue="signin" 
                  className="w-full"
                  onValueChange={setActiveTab}
                >
                  <TabsList className="grid w-full grid-cols-2 relative overflow-hidden">
                    <motion.div 
                      className="absolute h-full bg-primary/10 rounded-md z-0"
                      animate={{ x: activeTab === "signin" ? 0 : "100%" }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      style={{ width: "50%" }}
                    />
                    <TabsTrigger value="signin" className="relative z-10">Sign In</TabsTrigger>
                    <TabsTrigger value="signup" className="relative z-10">Sign Up</TabsTrigger>
                  </TabsList>

                  <AnimatePresence mode="wait">
                    <TabsContent value="signin" key="signin-tab-content" className="space-y-4">
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-4"
                      >
                        <motion.div 
                          className="space-y-2"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 }}
                        >
                          <Label htmlFor="signin-email" className="flex items-center gap-2">
                            <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                            Email
                          </Label>
                          <div className="relative overflow-hidden rounded-md">
                            <motion.div 
                              className="absolute bottom-0 left-0 h-0.5 bg-primary/50"
                              initial={{ width: "0%" }}
                              animate={{ width: formData.email ? "100%" : "0%" }}
                              transition={{ duration: 0.3 }}
                            />
                            <Input
                              id="signin-email"
                              name="email"
                              type="email"
                              placeholder="Enter your email"
                              value={formData.email}
                              onChange={handleInputChange}
                              disabled={isLoading}
                              className="border-primary/20 focus-visible:ring-primary/30"
                            />
                          </div>
                        </motion.div>
                        <motion.div 
                          className="space-y-2"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.2 }}
                        >
                          <Label htmlFor="signin-password" className="flex items-center gap-2">
                            {showPassword ? 
                              <EyeOff className="h-3.5 w-3.5 text-muted-foreground" /> :
                              <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                            }
                            Password
                          </Label>
                          <div className="relative overflow-hidden rounded-md">
                            <motion.div 
                              className="absolute bottom-0 left-0 h-0.5 bg-primary/50"
                              initial={{ width: "0%" }}
                              animate={{ width: formData.password ? "100%" : "0%" }}
                              transition={{ duration: 0.3 }}
                            />
                            <Input
                              id="signin-password"
                              name="password"
                              type={showPassword ? "text" : "password"}
                              placeholder="Enter your password"
                              value={formData.password}
                              onChange={handleInputChange}
                              disabled={isLoading}
                              className="border-primary/20 focus-visible:ring-primary/30"
                            />
                            <motion.div
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                onClick={() => setShowPassword(!showPassword)}
                                key="toggle-signin-password"
                              >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </Button>
                            </motion.div>
                          </div>
                        </motion.div>

                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3, type: "spring" }}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Button 
                            className="w-full relative overflow-hidden group" 
                            onClick={() => handleAuth("signin")} 
                            disabled={isLoading}
                          >
                            <motion.div 
                              className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/30 to-primary/0"
                              initial={{ x: "-100%" }}
                              animate={{ x: "200%" }}
                              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                              style={{ opacity: 0.5 }}
                            />
                            {isLoading ? (
                              <>
                                <motion.div
                                  animate={{ rotate: 360 }}
                                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                                  className="mr-2"
                                >
                                  <Loader2 className="h-4 w-4" />
                                </motion.div>
                                Signing In...
                              </>
                            ) : (
                              <>
                                <motion.span
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  transition={{ delay: 0.4 }}
                                >
                                  Sign In
                                </motion.span>
                              </>
                            )}
                          </Button>
                        </motion.div>
                      </motion.div>
                    </TabsContent>

                    <TabsContent value="signup" key="signup-tab-content" className="space-y-4">
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-4"
                      >
                        <motion.div 
                          className="space-y-2"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 }}
                        >
                          <Label htmlFor="signup-name" className="flex items-center gap-2">
                            <motion.div
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ duration: 1.5, delay: 1.5, repeat: 1 }}
                            >
                              <User className="h-3.5 w-3.5 text-muted-foreground" />
                            </motion.div>
                            Full Name
                          </Label>
                          <div className="relative overflow-hidden rounded-md">
                            <motion.div 
                              className="absolute bottom-0 left-0 h-0.5 bg-primary/50"
                              initial={{ width: "0%" }}
                              animate={{ width: formData.name ? "100%" : "0%" }}
                              transition={{ duration: 0.3 }}
                            />
                            <Input
                              id="signup-name"
                              name="name"
                              type="text"
                              placeholder="Enter your full name"
                              value={formData.name}
                              onChange={handleInputChange}
                              disabled={isLoading}
                              className="border-primary/20 focus-visible:ring-primary/30"
                            />
                          </div>
                        </motion.div>

                        <motion.div 
                          className="space-y-2"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.2 }}
                        >
                          <Label htmlFor="signup-email" className="flex items-center gap-2">
                            <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                            Email
                          </Label>
                          <div className="relative overflow-hidden rounded-md">
                            <motion.div 
                              className="absolute bottom-0 left-0 h-0.5 bg-primary/50"
                              initial={{ width: "0%" }}
                              animate={{ width: formData.email ? "100%" : "0%" }}
                              transition={{ duration: 0.3 }}
                            />
                            <Input
                              id="signup-email"
                              name="email"
                              type="email"
                              placeholder="Enter your email"
                              value={formData.email}
                              onChange={handleInputChange}
                              disabled={isLoading}
                              className="border-primary/20 focus-visible:ring-primary/30"
                            />
                          </div>
                        </motion.div>

                        <motion.div 
                          className="space-y-2"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 }}
                        >
                          <Label htmlFor="signup-password" className="flex items-center gap-2">
                            <motion.div
                              animate={{ rotate: [0, 5, 0, -5, 0] }}
                              transition={{ duration: 0.5, delay: 1, repeat: 2 }}
                            >
                              <Eye className="h-3.5 w-3.5 text-muted-foreground cursor-pointer" />
                            </motion.div>
                            Password
                          </Label>
                          <div className="relative overflow-hidden rounded-md">
                            <motion.div 
                              className="absolute bottom-0 left-0 h-0.5 bg-primary/50"
                              initial={{ width: "0%" }}
                              animate={{ width: formData.password ? "100%" : "0%" }}
                              transition={{ duration: 0.3 }}
                            />
                            <Input
                              id="signup-password"
                              name="password"
                              type={showPassword ? "text" : "password"}
                              placeholder="Create a password"
                              value={formData.password}
                              onChange={handleInputChange}
                              disabled={isLoading}
                              className="border-primary/20 focus-visible:ring-primary/30"
                            />
                            <motion.div
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                onClick={() => setShowPassword(!showPassword)}
                                disabled={isLoading}
                                key="toggle-signup-password"
                              >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </Button>
                            </motion.div>
                          </div>
                        </motion.div>

                        <motion.div 
                          className="space-y-2"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.4 }}
                        >
                          <Label htmlFor="signup-confirm-password" className="flex items-center gap-2">
                            <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                            Confirm Password
                          </Label>
                          <div className="relative overflow-hidden rounded-md">
                            <motion.div 
                              className="absolute bottom-0 left-0 h-0.5 bg-primary/50"
                              initial={{ width: "0%" }}
                              animate={{ width: formData.confirmPassword ? "100%" : "0%" }}
                              transition={{ duration: 0.3 }}
                            />
                            <Input
                              id="signup-confirm-password"
                              name="confirmPassword"
                              type="password"
                              placeholder="Confirm your password"
                              value={formData.confirmPassword}
                              onChange={handleInputChange}
                              disabled={isLoading}
                              className="border-primary/20 focus-visible:ring-primary/30"
                            />
                          </div>
                        </motion.div>

                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.5, type: "spring" }}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Button 
                            className="w-full relative overflow-hidden group" 
                            onClick={() => handleAuth("signup")} 
                            disabled={isLoading}
                          >
                            <motion.div 
                              className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/30 to-primary/0"
                              initial={{ x: "-100%" }}
                              animate={{ x: "200%" }}
                              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                              style={{ opacity: 0.5 }}
                            />
                            {isLoading ? (
                              <>
                                <motion.div
                                  animate={{ rotate: 360 }}
                                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                                  className="mr-2"
                                >
                                  <Loader2 className="h-4 w-4" />
                                </motion.div>
                                Creating Account...
                              </>
                            ) : (
                              <>
                                <motion.span
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  transition={{ delay: 0.6 }}
                                >
                                  Create Account
                                </motion.span>
                              </>
                            )}
                          </Button>
                        </motion.div>
                      </motion.div>
                    </TabsContent>
                  </AnimatePresence>
                </Tabs>

                <motion.div 
                  className="mt-6 space-y-2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7, type: "spring" }}
                >
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <motion.div 
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ delay: 0.8, duration: 0.5 }}
                      >
                        <Separator />
                      </motion.div>
                    </div>
                    <motion.div 
                      className="relative flex justify-center text-xs uppercase"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.9 }}
                    >
                      <span className="bg-background px-2 text-muted-foreground">
                        Or continue with
                      </span>
                    </motion.div>
                  </div>

                  <motion.div 
                    className="mt-6 grid grid-cols-2 gap-3"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                  >
                    <motion.div
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        variant="outline"
                        className="w-full relative overflow-hidden group"
                        onClick={() => handleSocialAuth("github")}
                        disabled={isLoading}
                      >
                        <motion.div 
                          className="absolute inset-0 bg-black/5 dark:bg-white/5"
                          initial={{ opacity: 0 }}
                          whileHover={{ opacity: 1 }}
                          transition={{ duration: 0.2 }}
                        />
                        <motion.div
                          animate={{ rotate: [0, 10, 0, -10, 0] }}
                          transition={{ duration: 0.5, delay: 1.2, repeat: 1 }}
                          className="mr-2"
                        >
                          <Github className="h-4 w-4" />
                        </motion.div>
                        GitHub
                      </Button>
                    </motion.div>
                    
                    <motion.div
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        variant="outline"
                        className="w-full relative overflow-hidden group"
                        onClick={() => handleSocialAuth("google")}
                        disabled={isLoading}
                      >
                        <motion.div 
                          className="absolute inset-0 bg-black/5 dark:bg-white/5"
                          initial={{ opacity: 0 }}
                          whileHover={{ opacity: 1 }}
                          transition={{ duration: 0.2 }}
                        />
                        <motion.div
                          animate={{ rotate: [0, 10, 0, -10, 0] }}
                          transition={{ duration: 0.5, delay: 1.4, repeat: 1 }}
                          className="mr-2"
                        >
                          <Mail className="h-4 w-4" />
                        </motion.div>
                        Google
                      </Button>
                    </motion.div>
                  </motion.div>
                </motion.div>
              </CardContent>
            </motion.div>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
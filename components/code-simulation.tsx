"use client"

import { useState, useEffect } from "react"
import { Play, Pause } from "lucide-react"
import { Button } from "@/components/ui/button"

interface CodeToken {
  type:
    | "keyword"
    | "string"
    | "function"
    | "variable"
    | "operator"
    | "bracket"
    | "comment"
    | "jsx"
    | "property"
    | "number"
    | "plain"
  content: string
}

export function CodeSimulation() {
  const [currentStep, setCurrentStep] = useState(0)
  const [displayedCode, setDisplayedCode] = useState("")
  const [isPlaying, setIsPlaying] = useState(true)
  const [charIndex, setCharIndex] = useState(0)

  const codeSteps = [
    // Todo App Steps
    {
      title: "React Todo App",
      filename: "TodoApp.jsx",
      tokens: [
        { type: "keyword", content: "import" },
        { type: "plain", content: " " },
        { type: "variable", content: "React" },
        { type: "operator", content: "," },
        { type: "plain", content: " " },
        { type: "bracket", content: "{" },
        { type: "plain", content: " " },
        { type: "variable", content: "useState" },
        { type: "plain", content: " " },
        { type: "bracket", content: "}" },
        { type: "plain", content: " " },
        { type: "keyword", content: "from" },
        { type: "plain", content: " " },
        { type: "string", content: "'react'" },
        { type: "operator", content: ";" },
        { type: "plain", content: "\n\n" },
        { type: "keyword", content: "function" },
        { type: "plain", content: " " },
        { type: "function", content: "TodoApp" },
        { type: "bracket", content: "()" },
        { type: "plain", content: " " },
        { type: "bracket", content: "{" },
        { type: "plain", content: "\n  " },
        { type: "keyword", content: "const" },
        { type: "plain", content: " " },
        { type: "bracket", content: "[" },
        { type: "variable", content: "todos" },
        { type: "operator", content: "," },
        { type: "plain", content: " " },
        { type: "variable", content: "setTodos" },
        { type: "bracket", content: "]" },
        { type: "plain", content: " " },
        { type: "operator", content: "=" },
        { type: "plain", content: " " },
        { type: "function", content: "useState" },
        { type: "bracket", content: "([]);" },
        { type: "plain", content: "\n\n  " },
        { type: "keyword", content: "return" },
        { type: "plain", content: " " },
        { type: "bracket", content: "(" },
        { type: "plain", content: "\n    " },
        { type: "jsx", content: "<div" },
        { type: "plain", content: " " },
        { type: "property", content: "className" },
        { type: "operator", content: "=" },
        { type: "string", content: '"todo-app"' },
        { type: "jsx", content: ">" },
        { type: "plain", content: "\n      " },
        { type: "jsx", content: "<h1>" },
        { type: "plain", content: "My Todo List" },
        { type: "jsx", content: "</h1>" },
        { type: "plain", content: "\n    " },
        { type: "jsx", content: "</div>" },
        { type: "plain", content: "\n  " },
        { type: "bracket", content: ");" },
        { type: "plain", content: "\n" },
        { type: "bracket", content: "}" },
      ] as CodeToken[],
      preview: `
        <div style="padding: 20px; font-family: -apple-system, BlinkMacSystemFont, sans-serif;">
          <h1 style="color: #333; margin-bottom: 20px; font-size: 24px; font-weight: 600;">My Todo List</h1>
        </div>
      `,
    },
    {
      title: "React Todo App",
      filename: "TodoApp.jsx",
      tokens: [
        { type: "keyword", content: "import" },
        { type: "plain", content: " " },
        { type: "variable", content: "React" },
        { type: "operator", content: "," },
        { type: "plain", content: " " },
        { type: "bracket", content: "{" },
        { type: "plain", content: " " },
        { type: "variable", content: "useState" },
        { type: "plain", content: " " },
        { type: "bracket", content: "}" },
        { type: "plain", content: " " },
        { type: "keyword", content: "from" },
        { type: "plain", content: " " },
        { type: "string", content: "'react'" },
        { type: "operator", content: ";" },
        { type: "plain", content: "\n\n" },
        { type: "keyword", content: "function" },
        { type: "plain", content: " " },
        { type: "function", content: "TodoApp" },
        { type: "bracket", content: "()" },
        { type: "plain", content: " " },
        { type: "bracket", content: "{" },
        { type: "plain", content: "\n  " },
        { type: "keyword", content: "const" },
        { type: "plain", content: " " },
        { type: "bracket", content: "[" },
        { type: "variable", content: "todos" },
        { type: "operator", content: "," },
        { type: "plain", content: " " },
        { type: "variable", content: "setTodos" },
        { type: "bracket", content: "]" },
        { type: "plain", content: " " },
        { type: "operator", content: "=" },
        { type: "plain", content: " " },
        { type: "function", content: "useState" },
        { type: "bracket", content: "([" },
        { type: "plain", content: "\n    " },
        { type: "bracket", content: "{" },
        { type: "plain", content: " " },
        { type: "property", content: "id" },
        { type: "operator", content: ":" },
        { type: "plain", content: " " },
        { type: "number", content: "1" },
        { type: "operator", content: "," },
        { type: "plain", content: " " },
        { type: "property", content: "text" },
        { type: "operator", content: ":" },
        { type: "plain", content: " " },
        { type: "string", content: "'Learn React'" },
        { type: "operator", content: "," },
        { type: "plain", content: " " },
        { type: "property", content: "completed" },
        { type: "operator", content: ":" },
        { type: "plain", content: " " },
        { type: "keyword", content: "false" },
        { type: "plain", content: " " },
        { type: "bracket", content: "}," },
        { type: "plain", content: "\n    " },
        { type: "bracket", content: "{" },
        { type: "plain", content: " " },
        { type: "property", content: "id" },
        { type: "operator", content: ":" },
        { type: "plain", content: " " },
        { type: "number", content: "2" },
        { type: "operator", content: "," },
        { type: "plain", content: " " },
        { type: "property", content: "text" },
        { type: "operator", content: ":" },
        { type: "plain", content: " " },
        { type: "string", content: "'Build todo app'" },
        { type: "operator", content: "," },
        { type: "plain", content: " " },
        { type: "property", content: "completed" },
        { type: "operator", content: ":" },
        { type: "plain", content: " " },
        { type: "keyword", content: "true" },
        { type: "plain", content: " " },
        { type: "bracket", content: "}" },
        { type: "plain", content: "\n  " },
        { type: "bracket", content: "]);" },
        { type: "plain", content: "\n\n  " },
        { type: "keyword", content: "return" },
        { type: "plain", content: " " },
        { type: "bracket", content: "(" },
        { type: "plain", content: "\n    " },
        { type: "jsx", content: "<div" },
        { type: "plain", content: " " },
        { type: "property", content: "className" },
        { type: "operator", content: "=" },
        { type: "string", content: '"todo-app"' },
        { type: "jsx", content: ">" },
        { type: "plain", content: "\n      " },
        { type: "jsx", content: "<h1>" },
        { type: "plain", content: "My Todo List" },
        { type: "jsx", content: "</h1>" },
        { type: "plain", content: "\n      " },
        { type: "jsx", content: "<ul>" },
        { type: "plain", content: "\n        " },
        { type: "bracket", content: "{" },
        { type: "variable", content: "todos" },
        { type: "operator", content: "." },
        { type: "function", content: "map" },
        { type: "bracket", content: "(" },
        { type: "variable", content: "todo" },
        { type: "plain", content: " " },
        { type: "operator", content: "=>" },
        { type: "plain", content: " " },
        { type: "bracket", content: "(" },
        { type: "plain", content: "\n          " },
        { type: "jsx", content: "<li" },
        { type: "plain", content: " " },
        { type: "property", content: "key" },
        { type: "operator", content: "=" },
        { type: "bracket", content: "{" },
        { type: "variable", content: "todo" },
        { type: "operator", content: "." },
        { type: "property", content: "id" },
        { type: "bracket", content: "}>" },
        { type: "bracket", content: "{" },
        { type: "variable", content: "todo" },
        { type: "operator", content: "." },
        { type: "property", content: "text" },
        { type: "bracket", content: "}" },
        { type: "jsx", content: "</li>" },
        { type: "plain", content: "\n        " },
        { type: "bracket", content: "))}" },
        { type: "plain", content: "\n      " },
        { type: "jsx", content: "</ul>" },
        { type: "plain", content: "\n    " },
        { type: "jsx", content: "</div>" },
        { type: "plain", content: "\n  " },
        { type: "bracket", content: ");" },
        { type: "plain", content: "\n" },
        { type: "bracket", content: "}" },
      ] as CodeToken[],
      preview: `
        <div style="padding: 20px; font-family: -apple-system, BlinkMacSystemFont, sans-serif;">
          <h1 style="color: #333; margin-bottom: 20px; font-size: 24px; font-weight: 600;">My Todo List</h1>
          <ul style="list-style: none; padding: 0; margin: 0;">
            <li style="padding: 14px 16px; margin: 8px 0; background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); border-radius: 8px; border-left: 4px solid #28a745; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
              <span style="color: #333; font-weight: 500;">Learn React</span>
            </li>
            <li style="padding: 14px 16px; margin: 8px 0; background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); border-radius: 8px; border-left: 4px solid #6c757d; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
              <span style="color: #6c757d; text-decoration: line-through; font-weight: 500;">Build todo app</span>
            </li>
          </ul>
        </div>
      `,
    },
    // Dashboard App Steps
    {
      title: "React Dashboard",
      filename: "Dashboard.jsx",
      tokens: [
        { type: "keyword", content: "import" },
        { type: "plain", content: " " },
        { type: "variable", content: "React" },
        { type: "operator", content: "," },
        { type: "plain", content: " " },
        { type: "bracket", content: "{" },
        { type: "plain", content: " " },
        { type: "variable", content: "useState" },
        { type: "operator", content: "," },
        { type: "plain", content: " " },
        { type: "variable", content: "useEffect" },
        { type: "plain", content: " " },
        { type: "bracket", content: "}" },
        { type: "plain", content: " " },
        { type: "keyword", content: "from" },
        { type: "plain", content: " " },
        { type: "string", content: "'react'" },
        { type: "operator", content: ";" },
        { type: "plain", content: "\n" },
        { type: "keyword", content: "import" },
        { type: "plain", content: " " },
        { type: "bracket", content: "{" },
        { type: "plain", content: " " },
        { type: "variable", content: "BarChart" },
        { type: "operator", content: "," },
        { type: "plain", content: " " },
        { type: "variable", content: "LineChart" },
        { type: "plain", content: " " },
        { type: "bracket", content: "}" },
        { type: "plain", content: " " },
        { type: "keyword", content: "from" },
        { type: "plain", content: " " },
        { type: "string", content: "'recharts'" },
        { type: "operator", content: ";" },
        { type: "plain", content: "\n\n" },
        { type: "keyword", content: "function" },
        { type: "plain", content: " " },
        { type: "function", content: "Dashboard" },
        { type: "bracket", content: "()" },
        { type: "plain", content: " " },
        { type: "bracket", content: "{" },
        { type: "plain", content: "\n  " },
        { type: "keyword", content: "const" },
        { type: "plain", content: " " },
        { type: "bracket", content: "[" },
        { type: "variable", content: "stats" },
        { type: "operator", content: "," },
        { type: "plain", content: " " },
        { type: "variable", content: "setStats" },
        { type: "bracket", content: "]" },
        { type: "plain", content: " " },
        { type: "operator", content: "=" },
        { type: "plain", content: " " },
        { type: "function", content: "useState" },
        { type: "bracket", content: "(" },
        { type: "bracket", content: "{" },
        { type: "plain", content: "\n    " },
        { type: "property", content: "users" },
        { type: "operator", content: ":" },
        { type: "plain", content: " " },
        { type: "number", content: "12847" },
        { type: "operator", content: "," },
        { type: "plain", content: "\n    " },
        { type: "property", content: "revenue" },
        { type: "operator", content: ":" },
        { type: "plain", content: " " },
        { type: "number", content: "89432" },
        { type: "operator", content: "," },
        { type: "plain", content: "\n    " },
        { type: "property", content: "orders" },
        { type: "operator", content: ":" },
        { type: "plain", content: " " },
        { type: "number", content: "2847" },
        { type: "plain", content: "\n  " },
        { type: "bracket", content: "});" },
        { type: "plain", content: "\n\n  " },
        { type: "keyword", content: "return" },
        { type: "plain", content: " " },
        { type: "bracket", content: "(" },
        { type: "plain", content: "\n    " },
        { type: "jsx", content: "<div" },
        { type: "plain", content: " " },
        { type: "property", content: "className" },
        { type: "operator", content: "=" },
        { type: "string", content: '"dashboard"' },
        { type: "jsx", content: ">" },
        { type: "plain", content: "\n      " },
        { type: "jsx", content: "<h1>" },
        { type: "plain", content: "Analytics Dashboard" },
        { type: "jsx", content: "</h1>" },
        { type: "plain", content: "\n    " },
        { type: "jsx", content: "</div>" },
        { type: "plain", content: "\n  " },
        { type: "bracket", content: ");" },
        { type: "plain", content: "\n" },
        { type: "bracket", content: "}" },
      ] as CodeToken[],
      preview: `
        <div style="padding: 24px; font-family: -apple-system, BlinkMacSystemFont, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 300px;">
          <h1 style="color: white; margin-bottom: 24px; font-size: 28px; font-weight: 700; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">Analytics Dashboard</h1>
        </div>
      `,
    },
    {
      title: "React Dashboard",
      filename: "Dashboard.jsx",
      tokens: [
        { type: "keyword", content: "import" },
        { type: "plain", content: " " },
        { type: "variable", content: "React" },
        { type: "operator", content: "," },
        { type: "plain", content: " " },
        { type: "bracket", content: "{" },
        { type: "plain", content: " " },
        { type: "variable", content: "useState" },
        { type: "operator", content: "," },
        { type: "plain", content: " " },
        { type: "variable", content: "useEffect" },
        { type: "plain", content: " " },
        { type: "bracket", content: "}" },
        { type: "plain", content: " " },
        { type: "keyword", content: "from" },
        { type: "plain", content: " " },
        { type: "string", content: "'react'" },
        { type: "operator", content: ";" },
        { type: "plain", content: "\n\n" },
        { type: "keyword", content: "function" },
        { type: "plain", content: " " },
        { type: "function", content: "Dashboard" },
        { type: "bracket", content: "()" },
        { type: "plain", content: " " },
        { type: "bracket", content: "{" },
        { type: "plain", content: "\n  " },
        { type: "keyword", content: "const" },
        { type: "plain", content: " " },
        { type: "bracket", content: "[" },
        { type: "variable", content: "stats" },
        { type: "operator", content: "," },
        { type: "plain", content: " " },
        { type: "variable", content: "setStats" },
        { type: "bracket", content: "]" },
        { type: "plain", content: " " },
        { type: "operator", content: "=" },
        { type: "plain", content: " " },
        { type: "function", content: "useState" },
        { type: "bracket", content: "(" },
        { type: "bracket", content: "{" },
        { type: "plain", content: "\n    " },
        { type: "property", content: "users" },
        { type: "operator", content: ":" },
        { type: "plain", content: " " },
        { type: "number", content: "12847" },
        { type: "operator", content: "," },
        { type: "plain", content: "\n    " },
        { type: "property", content: "revenue" },
        { type: "operator", content: ":" },
        { type: "plain", content: " " },
        { type: "string", content: "'$89,432'" },
        { type: "operator", content: "," },
        { type: "plain", content: "\n    " },
        { type: "property", content: "orders" },
        { type: "operator", content: ":" },
        { type: "plain", content: " " },
        { type: "number", content: "2847" },
        { type: "operator", content: "," },
        { type: "plain", content: "\n    " },
        { type: "property", content: "growth" },
        { type: "operator", content: ":" },
        { type: "plain", content: " " },
        { type: "string", content: "'+12.5%'" },
        { type: "plain", content: "\n  " },
        { type: "bracket", content: "});" },
        { type: "plain", content: "\n\n  " },
        { type: "keyword", content: "return" },
        { type: "plain", content: " " },
        { type: "bracket", content: "(" },
        { type: "plain", content: "\n    " },
        { type: "jsx", content: "<div" },
        { type: "plain", content: " " },
        { type: "property", content: "className" },
        { type: "operator", content: "=" },
        { type: "string", content: '"dashboard"' },
        { type: "jsx", content: ">" },
        { type: "plain", content: "\n      " },
        { type: "jsx", content: "<h1>" },
        { type: "plain", content: "Analytics Dashboard" },
        { type: "jsx", content: "</h1>" },
        { type: "plain", content: "\n      " },
        { type: "jsx", content: "<div" },
        { type: "plain", content: " " },
        { type: "property", content: "className" },
        { type: "operator", content: "=" },
        { type: "string", content: '"stats-grid"' },
        { type: "jsx", content: ">" },
        { type: "plain", content: "\n        " },
        { type: "jsx", content: "<div" },
        { type: "plain", content: " " },
        { type: "property", content: "className" },
        { type: "operator", content: "=" },
        { type: "string", content: '"stat-card"' },
        { type: "jsx", content: ">" },
        { type: "plain", content: "\n          " },
        { type: "jsx", content: "<h3>" },
        { type: "plain", content: "Total Users" },
        { type: "jsx", content: "</h3>" },
        { type: "plain", content: "\n          " },
        { type: "jsx", content: "<p>" },
        { type: "bracket", content: "{" },
        { type: "variable", content: "stats" },
        { type: "operator", content: "." },
        { type: "property", content: "users" },
        { type: "bracket", content: "}" },
        { type: "jsx", content: "</p>" },
        { type: "plain", content: "\n        " },
        { type: "jsx", content: "</div>" },
        { type: "plain", content: "\n        " },
        { type: "jsx", content: "<div" },
        { type: "plain", content: " " },
        { type: "property", content: "className" },
        { type: "operator", content: "=" },
        { type: "string", content: '"stat-card"' },
        { type: "jsx", content: ">" },
        { type: "plain", content: "\n          " },
        { type: "jsx", content: "<h3>" },
        { type: "plain", content: "Revenue" },
        { type: "jsx", content: "</h3>" },
        { type: "plain", content: "\n          " },
        { type: "jsx", content: "<p>" },
        { type: "bracket", content: "{" },
        { type: "variable", content: "stats" },
        { type: "operator", content: "." },
        { type: "property", content: "revenue" },
        { type: "bracket", content: "}" },
        { type: "jsx", content: "</p>" },
        { type: "plain", content: "\n          " },
        { type: "jsx", content: "<span>" },
        { type: "bracket", content: "{" },
        { type: "variable", content: "stats" },
        { type: "operator", content: "." },
        { type: "property", content: "growth" },
        { type: "bracket", content: "}" },
        { type: "jsx", content: "</span>" },
        { type: "plain", content: "\n        " },
        { type: "jsx", content: "</div>" },
        { type: "plain", content: "\n      " },
        { type: "jsx", content: "</div>" },
        { type: "plain", content: "\n    " },
        { type: "jsx", content: "</div>" },
        { type: "plain", content: "\n  " },
        { type: "bracket", content: ");" },
        { type: "plain", content: "\n" },
        { type: "bracket", content: "}" },
      ] as CodeToken[],
      preview: `
        <div style="padding: 24px; font-family: -apple-system, BlinkMacSystemFont, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 300px;">
          <h1 style="color: white; margin-bottom: 24px; font-size: 28px; font-weight: 700; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">Analytics Dashboard</h1>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px;">
            <div style="background: rgba(255,255,255,0.95); padding: 20px; border-radius: 12px; box-shadow: 0 8px 32px rgba(0,0,0,0.1); backdrop-filter: blur(10px);">
              <h3 style="color: #666; font-size: 14px; font-weight: 600; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 0.5px;">Total Users</h3>
              <p style="color: #333; font-size: 32px; font-weight: 700; margin: 0; background: linear-gradient(135deg, #667eea, #764ba2); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">12,847</p>
            </div>
            <div style="background: rgba(255,255,255,0.95); padding: 20px; border-radius: 12px; box-shadow: 0 8px 32px rgba(0,0,0,0.1); backdrop-filter: blur(10px);">
              <h3 style="color: #666; font-size: 14px; font-weight: 600; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 0.5px;">Revenue</h3>
              <p style="color: #333; font-size: 32px; font-weight: 700; margin: 0 0 4px 0; background: linear-gradient(135deg, #667eea, #764ba2); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">$89,432</p>
              <span style="color: #10b981; font-size: 14px; font-weight: 600; background: rgba(16, 185, 129, 0.1); padding: 2px 8px; border-radius: 12px;">+12.5%</span>
            </div>
          </div>
        </div>
      `,
    },
    // Weather App Steps
    {
      title: "Weather App",
      filename: "WeatherApp.jsx",
      tokens: [
        { type: "keyword", content: "import" },
        { type: "plain", content: " " },
        { type: "variable", content: "React" },
        { type: "operator", content: "," },
        { type: "plain", content: " " },
        { type: "bracket", content: "{" },
        { type: "plain", content: " " },
        { type: "variable", content: "useState" },
        { type: "operator", content: "," },
        { type: "plain", content: " " },
        { type: "variable", content: "useEffect" },
        { type: "plain", content: " " },
        { type: "bracket", content: "}" },
        { type: "plain", content: " " },
        { type: "keyword", content: "from" },
        { type: "plain", content: " " },
        { type: "string", content: "'react'" },
        { type: "operator", content: ";" },
        { type: "plain", content: "\n\n" },
        { type: "keyword", content: "function" },
        { type: "plain", content: " " },
        { type: "function", content: "WeatherApp" },
        { type: "bracket", content: "()" },
        { type: "plain", content: " " },
        { type: "bracket", content: "{" },
        { type: "plain", content: "\n  " },
        { type: "keyword", content: "const" },
        { type: "plain", content: " " },
        { type: "bracket", content: "[" },
        { type: "variable", content: "weather" },
        { type: "operator", content: "," },
        { type: "plain", content: " " },
        { type: "variable", content: "setWeather" },
        { type: "bracket", content: "]" },
        { type: "plain", content: " " },
        { type: "operator", content: "=" },
        { type: "plain", content: " " },
        { type: "function", content: "useState" },
        { type: "bracket", content: "(" },
        { type: "bracket", content: "{" },
        { type: "plain", content: "\n    " },
        { type: "property", content: "city" },
        { type: "operator", content: ":" },
        { type: "plain", content: " " },
        { type: "string", content: "'San Francisco'" },
        { type: "operator", content: "," },
        { type: "plain", content: "\n    " },
        { type: "property", content: "temp" },
        { type: "operator", content: ":" },
        { type: "plain", content: " " },
        { type: "number", content: "72" },
        { type: "operator", content: "," },
        { type: "plain", content: "\n    " },
        { type: "property", content: "condition" },
        { type: "operator", content: ":" },
        { type: "plain", content: " " },
        { type: "string", content: "'Sunny'" },
        { type: "operator", content: "," },
        { type: "plain", content: "\n    " },
        { type: "property", content: "humidity" },
        { type: "operator", content: ":" },
        { type: "plain", content: " " },
        { type: "number", content: "65" },
        { type: "plain", content: "\n  " },
        { type: "bracket", content: "});" },
        { type: "plain", content: "\n\n  " },
        { type: "keyword", content: "return" },
        { type: "plain", content: " " },
        { type: "bracket", content: "(" },
        { type: "plain", content: "\n    " },
        { type: "jsx", content: "<div" },
        { type: "plain", content: " " },
        { type: "property", content: "className" },
        { type: "operator", content: "=" },
        { type: "string", content: '"weather-app"' },
        { type: "jsx", content: ">" },
        { type: "plain", content: "\n      " },
        { type: "jsx", content: "<h1>" },
        { type: "bracket", content: "{" },
        { type: "variable", content: "weather" },
        { type: "operator", content: "." },
        { type: "property", content: "city" },
        { type: "bracket", content: "}" },
        { type: "jsx", content: "</h1>" },
        { type: "plain", content: "\n      " },
        { type: "jsx", content: "<div" },
        { type: "plain", content: " " },
        { type: "property", content: "className" },
        { type: "operator", content: "=" },
        { type: "string", content: '"temperature"' },
        { type: "jsx", content: ">" },
        { type: "plain", content: "\n        " },
        { type: "jsx", content: "<span>" },
        { type: "bracket", content: "{" },
        { type: "variable", content: "weather" },
        { type: "operator", content: "." },
        { type: "property", content: "temp" },
        { type: "bracket", content: "}" },
        { type: "plain", content: "°F" },
        { type: "jsx", content: "</span>" },
        { type: "plain", content: "\n        " },
        { type: "jsx", content: "<p>" },
        { type: "bracket", content: "{" },
        { type: "variable", content: "weather" },
        { type: "operator", content: "." },
        { type: "property", content: "condition" },
        { type: "bracket", content: "}" },
        { type: "jsx", content: "</p>" },
        { type: "plain", content: "\n      " },
        { type: "jsx", content: "</div>" },
        { type: "plain", content: "\n    " },
        { type: "jsx", content: "</div>" },
        { type: "plain", content: "\n  " },
        { type: "bracket", content: ");" },
        { type: "plain", content: "\n" },
        { type: "bracket", content: "}" },
      ] as CodeToken[],
      preview: `
        <div style="padding: 24px; font-family: -apple-system, BlinkMacSystemFont, sans-serif; background: linear-gradient(135deg, #74b9ff 0%, #0984e3 100%); min-height: 300px; color: white; text-align: center;">
          <h1 style="font-size: 32px; font-weight: 700; margin-bottom: 24px; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">San Francisco</h1>
          <div style="background: rgba(255,255,255,0.2); padding: 32px; border-radius: 20px; backdrop-filter: blur(10px); box-shadow: 0 8px 32px rgba(0,0,0,0.1); max-width: 300px; margin: 0 auto;">
            <span style="font-size: 64px; font-weight: 300; display: block; margin-bottom: 8px;">72°F</span>
            <p style="font-size: 20px; font-weight: 500; margin: 0; opacity: 0.9;">☀️ Sunny</p>
            <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.3);">
              <p style="margin: 0; opacity: 0.8; font-size: 16px;">Humidity: 65%</p>
            </div>
          </div>
        </div>
      `,
    },
  ]

  const getTokenColor = (type: CodeToken["type"]): string => {
    switch (type) {
      case "keyword":
        return "#C586C0" // Purple for keywords
      case "string":
        return "#CE9178" // Orange for strings
      case "function":
        return "#DCDCAA" // Yellow for function names
      case "variable":
        return "#9CDCFE" // Light blue for variables
      case "operator":
        return "#D4D4D4" // Light gray for operators
      case "bracket":
        return "#FFD700" // Gold for brackets
      case "comment":
        return "#6A9955" // Green for comments
      case "jsx":
        return "#569CD6" // Blue for JSX tags
      case "property":
        return "#92C5F7" // Light blue for properties
      case "number":
        return "#B5CEA8" // Light green for numbers
      case "plain":
      default:
        return "#D4D4D4" // Default light gray
    }
  }

  // Convert tokens to a single string for smooth character-by-character typing
  const getFullCodeString = (tokens: CodeToken[]): string => {
    return tokens.map((token) => token.content).join("")
  }

  useEffect(() => {
    if (!isPlaying) return

    const currentTokens = codeSteps[currentStep]?.tokens || []
    const fullCode = getFullCodeString(currentTokens)

    if (charIndex < fullCode.length) {
      const timer = setTimeout(() => {
        setDisplayedCode(fullCode.slice(0, charIndex + 1))
        setCharIndex(charIndex + 1)
      }, 15) // Much faster and smoother typing - 15ms per character

      return () => clearTimeout(timer)
    } else {
      // Move to next step after a pause
      const timer = setTimeout(() => {
        if (currentStep < codeSteps.length - 1) {
          setCurrentStep(currentStep + 1)
          setCharIndex(0)
          setDisplayedCode("")
        } else {
          // Reset to beginning
          setCurrentStep(0)
          setCharIndex(0)
          setDisplayedCode("")
        }
      }, 2500) // Shorter pause between steps

      return () => clearTimeout(timer)
    }
  }, [charIndex, currentStep, isPlaying])

  // Function to render code with syntax highlighting
  const renderHighlightedCode = (code: string, tokens: CodeToken[]): JSX.Element => {
    let currentIndex = 0
    const elements: JSX.Element[] = []

    tokens.forEach((token, tokenIndex) => {
      const tokenEnd = currentIndex + token.content.length
      if (currentIndex < code.length) {
        const visibleContent = code.slice(currentIndex, Math.min(tokenEnd, code.length))
        if (visibleContent) {
          elements.push(
            <span key={tokenIndex} style={{ color: getTokenColor(token.type) }} className="whitespace-pre-wrap">
              {visibleContent}
            </span>,
          )
        }
      }
      currentIndex = tokenEnd
    })

    return <>{elements}</>
  }

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const currentStep_data = codeSteps[currentStep]
  const currentPreview = currentStep_data?.preview || ""
  const currentTokens = currentStep_data?.tokens || []

  return (
    <div className="relative max-w-6xl mx-auto">
      <div className="bg-card border border-border rounded-lg overflow-hidden shadow-2xl">
        {/* Window Header */}
        <div className="bg-muted/50 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="ml-4 text-sm text-muted-foreground">
              Modern IDE - {currentStep_data?.filename || "App.jsx"}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground font-medium">{currentStep_data?.title || "React App"}</span>
            <Button variant="ghost" size="sm" onClick={togglePlayPause} className="h-6 w-6 p-0">
              {isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid md:grid-cols-2 min-h-[400px]">
          {/* Code Editor Side */}
          <div className="bg-[#1e1e1e] text-gray-300 p-4 font-mono text-sm overflow-auto">
            <div className="flex items-center gap-2 mb-3 text-xs text-gray-500">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span>{currentStep_data?.filename || "App.jsx"}</span>
            </div>
            <div className="leading-relaxed">
              {renderHighlightedCode(displayedCode, currentTokens)}
              <span className="animate-pulse bg-white w-2 h-5 inline-block ml-1"></span>
            </div>
          </div>

          {/* Preview Side */}
          <div className="bg-white border-l border-border">
            <div className="bg-muted/30 px-4 py-2 border-b border-border/50">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Live Preview</span>
              </div>
            </div>
            <div className="h-full" dangerouslySetInnerHTML={{ __html: currentPreview }} />
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="bg-muted/30 px-4 py-2 border-t border-border/50">
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              {codeSteps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentStep ? "bg-primary animate-pulse scale-125" : "bg-muted-foreground/30"
                  }`}
                />
              ))}
            </div>
            <div className="text-xs text-muted-foreground font-medium">
              {currentStep_data?.title} - Step {currentStep + 1} of {codeSteps.length}
            </div>
          </div>
        </div>
      </div>

      {/* Feature Highlights */}
      <div className="mt-8 grid md:grid-cols-3 gap-4 text-center">
        <div className="p-4 bg-card/50 rounded-lg border border-border/50 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-lg">
          <div className="w-8 h-8 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-2">
            <span className="text-blue-500 text-sm">⚡</span>
          </div>
          <h3 className="font-semibold text-sm mb-1">Live Preview</h3>
          <p className="text-xs text-muted-foreground">See changes instantly as you type</p>
        </div>
        <div className="p-4 bg-card/50 rounded-lg border border-border/50 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-lg">
          <div className="w-8 h-8 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-2">
            <span className="text-green-500 text-sm">🎯</span>
          </div>
          <h3 className="font-semibold text-sm mb-1">Smart Completion</h3>
          <p className="text-xs text-muted-foreground">IntelliSense and auto-completion</p>
        </div>
        <div className="p-4 bg-card/50 rounded-lg border border-border/50 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-lg">
          <div className="w-8 h-8 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto mb-2">
            <span className="text-purple-500 text-sm">🚀</span>
          </div>
          <h3 className="font-semibold text-sm mb-1">Hot Reload</h3>
          <p className="text-xs text-muted-foreground">Instant updates without refresh</p>
        </div>
      </div>
    </div>
  )
}

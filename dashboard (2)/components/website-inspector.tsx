"use client"

import { useState, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Code, Globe, FileCode, Loader2 } from "lucide-react"

export default function WebsiteInspector() {
  const [url, setUrl] = useState("")
  const [currentUrl, setCurrentUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [htmlContent, setHtmlContent] = useState("")
  const [cssContent, setCssContent] = useState("")
  const [jsContent, setJsContent] = useState("")
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const handleInspect = () => {
    if (!url.trim()) return

    try {
      // Format URL
      let formattedUrl = url.trim()
      if (!formattedUrl.startsWith("http://") && !formattedUrl.startsWith("https://")) {
        formattedUrl = "https://" + formattedUrl
      }

      // Basic URL validation
      new URL(formattedUrl)

      setCurrentUrl(formattedUrl)
      setIsLoading(true)

      // Reset content
      setHtmlContent("")
      setCssContent("")
      setJsContent("")

      // In a real implementation, we would need a proxy server to fetch the website content
      // due to CORS restrictions. For this demo, we'll simulate the inspection process.
      setTimeout(() => {
        simulateInspection(formattedUrl)
        setIsLoading(false)
      }, 1500)
    } catch (error) {
      alert("Please enter a valid URL")
    }
  }

  const simulateInspection = (url: string) => {
    // This is a simulated inspection since we can't directly access the content
    // of websites from different origins due to browser security restrictions

    // In a real implementation, this would be done through a proxy server

    // Simulate HTML content
    setHtmlContent(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Example Website</title>
<link rel="stylesheet" href="styles.css">
<script src="script.js" defer></script>
</head>
<body>
<header>
  <nav>
    <ul>
      <li><a href="#">Home</a></li>
      <li><a href="#">About</a></li>
      <li><a href="#">Services</a></li>
      <li><a href="#">Contact</a></li>
    </ul>
  </nav>
</header>

<main>
  <section class="hero">
    <h1>Welcome to ${new URL(url).hostname}</h1>
    <p>This is a simulated view of the website's HTML structure.</p>
    <button class="cta-button">Learn More</button>
  </section>
  
  <section class="features">
    <div class="feature">
      <h2>Feature 1</h2>
      <p>Description of feature 1</p>
    </div>
    <div class="feature">
      <h2>Feature 2</h2>
      <p>Description of feature 2</p>
    </div>
    <div class="feature">
      <h2>Feature 3</h2>
      <p>Description of feature 3</p>
    </div>
  </section>
</main>

<footer>
  <p>&copy; 2023 Example Website. All rights reserved.</p>
</footer>
</body>
</html>`)

    // Simulate CSS content
    setCssContent(`/* Reset styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: Arial, sans-serif;
  line-height: 1.6;
  color: #333;
}

/* Header styles */
header {
  background-color: #f8f9fa;
  padding: 1rem 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

nav ul {
  display: flex;
  justify-content: center;
  list-style: none;
}

nav li {
  margin: 0 1rem;
}

nav a {
  text-decoration: none;
  color: #333;
  font-weight: bold;
}

/* Hero section */
.hero {
  text-align: center;
  padding: 4rem 2rem;
  background-color: #e9ecef;
}

.hero h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.hero p {
  font-size: 1.2rem;
  margin-bottom: 2rem;
  color: #6c757d;
}

.cta-button {
  padding: 0.75rem 1.5rem;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
}

/* Features section */
.features {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
  padding: 4rem 2rem;
}

.feature {
  flex: 0 1 30%;
  text-align: center;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.feature h2 {
  margin-bottom: 1rem;
  color: #343a40;
}

/* Footer */
footer {
  text-align: center;
  padding: 2rem;
  background-color: #343a40;
  color: white;
}`)

    // Simulate JavaScript content
    setJsContent(`// Main JavaScript file
document.addEventListener('DOMContentLoaded', function() {
  console.log('Document loaded');

  // Get elements
  const ctaButton = document.querySelector('.cta-button');
  const features = document.querySelectorAll('.feature');

  // Add event listeners
  if (ctaButton) {
    ctaButton.addEventListener('click', function() {
      alert('Thanks for your interest! This is a simulated button click.');
    });
  }

  // Add hover effects to features
  features.forEach(feature => {
    feature.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-5px)';
      this.style.transition = 'transform 0.3s ease';
    });
    
    feature.addEventListener('mouseleave', function() {
      this.style.transform = 'translateY(0)';
    });
  });

  // Simulate analytics
  console.log('Page viewed: ' + window.location.href);
});

// Utility functions
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Responsive navigation
const toggleMenu = () => {
  const nav = document.querySelector('nav ul');
  if (nav) {
    nav.classList.toggle('active');
  }
};

// Initialize any third-party scripts
console.log('Third-party scripts initialized');`)
  }

  return (
    <div className="flex h-full flex-col">
      <div className="mb-4">
        <div className="flex space-x-2">
          <Input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter website URL to inspect"
            className="flex-1"
          />
          <Button onClick={handleInspect} disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Code className="mr-2 h-4 w-4" />}
            Inspect
          </Button>
        </div>
      </div>

      {currentUrl ? (
        <Tabs defaultValue="preview" className="flex-1">
          <TabsList className="mb-4">
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="html">HTML</TabsTrigger>
            <TabsTrigger value="css">CSS</TabsTrigger>
            <TabsTrigger value="js">JavaScript</TabsTrigger>
          </TabsList>

          <TabsContent value="preview" className="h-[calc(100%-48px)]">
            <div className="flex-1 overflow-hidden rounded border">
              <iframe
                ref={iframeRef}
                src={currentUrl}
                className="h-full w-full"
                sandbox="allow-same-origin allow-scripts allow-forms"
                referrerPolicy="no-referrer"
                title="Website preview"
              />
            </div>
          </TabsContent>

          <TabsContent value="html" className="h-[calc(100%-48px)]">
            <Card className="h-full">
              <CardContent className="p-0">
                <div className="flex h-full flex-col">
                  <div className="flex items-center justify-between border-b bg-muted p-2">
                    <div className="flex items-center">
                      <FileCode className="mr-2 h-4 w-4" />
                      <span className="text-sm font-medium">HTML Structure</span>
                    </div>
                    <div className="text-xs text-gray-500">{isLoading ? "Loading..." : "Simulated view"}</div>
                  </div>
                  <pre className="flex-1 overflow-auto bg-black p-4 font-mono text-xs text-green-400">
                    {htmlContent || "Inspect a website to view its HTML structure"}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="css" className="h-[calc(100%-48px)]">
            <Card className="h-full">
              <CardContent className="p-0">
                <div className="flex h-full flex-col">
                  <div className="flex items-center justify-between border-b bg-muted p-2">
                    <div className="flex items-center">
                      <FileCode className="mr-2 h-4 w-4" />
                      <span className="text-sm font-medium">CSS Styles</span>
                    </div>
                    <div className="text-xs text-gray-500">{isLoading ? "Loading..." : "Simulated view"}</div>
                  </div>
                  <pre className="flex-1 overflow-auto bg-black p-4 font-mono text-xs text-green-400">
                    {cssContent || "Inspect a website to view its CSS styles"}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="js" className="h-[calc(100%-48px)]">
            <Card className="h-full">
              <CardContent className="p-0">
                <div className="flex h-full flex-col">
                  <div className="flex items-center justify-between border-b bg-muted p-2">
                    <div className="flex items-center">
                      <FileCode className="mr-2 h-4 w-4" />
                      <span className="text-sm font-medium">JavaScript Code</span>
                    </div>
                    <div className="text-xs text-gray-500">{isLoading ? "Loading..." : "Simulated view"}</div>
                  </div>
                  <pre className="flex-1 overflow-auto bg-black p-4 font-mono text-xs text-green-400">
                    {jsContent || "Inspect a website to view its JavaScript code"}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      ) : (
        <Card className="flex h-full flex-col items-center justify-center p-6">
          <Globe className="mb-4 h-16 w-16 text-gray-300" />
          <p className="text-center text-gray-500">Enter a website URL above to inspect its code</p>
          <p className="mt-2 text-center text-sm text-gray-400">
            Note: This is a simulated inspector. In a real implementation, a proxy server would be needed to bypass CORS
            restrictions.
          </p>
        </Card>
      )}
    </div>
  )
}


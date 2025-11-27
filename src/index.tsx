import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'
import authRoutes from './auth-routes'
import { authMiddleware, optionalAuthMiddleware, adminMiddleware, requireRole } from './middleware'

type Bindings = {
  DB: D1Database
  JWT_SECRET?: string
  MOLLIE_API_KEY?: string
}

const app = new Hono<{ Bindings: Bindings }>()

// Enable CORS for API with credentials support
app.use('/api/*', cors({
  origin: (origin) => origin || '*', // Allow all origins in development
  credentials: true, // Allow cookies to be sent
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  exposeHeaders: ['Content-Length', 'Content-Type'],
  maxAge: 86400
}))

// Serve static files - Cloudflare Pages automatically serves files from dist/
app.use('/static/*', serveStatic({ root: './' }))

// Mount authentication routes
app.route('/api/auth', authRoutes)

// ============================================
// LANDING PAGE
// ============================================
app.get('/', (c) => {
  return c.html(`
<!DOCTYPE html>
<html lang="en" class="scroll-smooth">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>⚡ EV Charge Pro - Premium Charging Calculator</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    <style>
      @import url('https://fonts.googleapis.com/css2?family=SF+Pro+Display:wght@300;400;500;600;700&display=swap');
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', 'Helvetica Neue', Arial, sans-serif; -webkit-font-smoothing: antialiased; }
      .gradient-text { background: linear-gradient(135deg, #007AFF 0%, #5856D6 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
      .gradient-bg { background: linear-gradient(135deg, #007AFF 0%, #5856D6 100%); }
      .apple-card { background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(20px) saturate(180%); box-shadow: 0 1px 3px rgba(0,0,0,0.05), 0 20px 40px rgba(0,0,0,0.08); }
      
      /* Tesla Supercharger Background - More Prominent & Visual */
      .hero-with-bg {
        background: 
          linear-gradient(to bottom, rgba(249, 250, 251, 0.85) 0%, rgba(249, 250, 251, 0.90) 50%, rgba(249, 250, 251, 0.95) 100%),
          url('https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=2000&q=90') center/cover;
        background-attachment: fixed;
      }
      
      /* Typewriter Effect Animation - Infinite Loop */
      @keyframes typewriter {
        from { width: 0; }
        to { width: 100%; }
      }
      
      @keyframes blink {
        0%, 100% { border-color: transparent; }
        50% { border-color: #007AFF; }
      }
      
      @keyframes fadeOut {
        0% { opacity: 1; }
        100% { opacity: 0; }
      }
      
      .typewriter-container {
        display: inline-block;
        max-width: 100%;
      }
      
      .typewriter-line {
        overflow: hidden;
        border-right: 3px solid transparent;
        white-space: nowrap;
        margin: 0 auto;
        width: 0;
        opacity: 0;
        max-width: 100%;
      }
      
      .typewriter-line.typing {
        border-right: 3px solid #007AFF;
      }
      
      .typewriter-line.line1.animate {
        opacity: 1;
        animation: 
          typewriter 2s steps(25, end) forwards,
          blink 0.75s step-end infinite;
      }
      
      .typewriter-line.line2.animate {
        opacity: 1;
        animation: 
          typewriter 1.8s steps(20, end) forwards,
          blink 0.75s step-end infinite;
      }
      
      .typewriter-line.fade {
        animation: fadeOut 0.5s forwards;
      }
      
      /* EV Brand Logo Carousel - Infinite Scroll Animation */
      @keyframes scroll {
        0% { transform: translateX(0); }
        100% { transform: translateX(-50%); }
      }
      
      .logo-carousel {
        display: flex;
        overflow: hidden;
        user-select: none;
        gap: 4rem;
        mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
        -webkit-mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
      }
      
      .logo-track {
        display: flex;
        gap: 4rem;
        animation: scroll 40s linear infinite;
      }
      
      .logo-track:hover {
        animation-play-state: paused;
      }
      
      .brand-logo {
        height: 48px;
        width: auto;
        filter: grayscale(100%) opacity(50%);
        transition: all 0.3s ease;
        flex-shrink: 0;
      }
      
      .brand-logo:hover {
        filter: grayscale(0%) opacity(100%);
        transform: scale(1.1);
      }
    </style>
</head>
<body class="bg-gray-50 text-gray-900">
    <!-- Navigation Header -->
    <nav class="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-200">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between items-center h-14">
                <a href="/" class="flex items-center space-x-3 cursor-pointer hover:opacity-80 transition-opacity">
                    <i class="fas fa-bolt text-2xl text-blue-600"></i>
                    <span class="text-lg font-semibold text-gray-900">EV Charge</span>
                </a>
                <div class="flex items-center space-x-3">
                    <button onclick="showLoginModal()" class="px-4 py-2 text-sm text-gray-700 hover:text-gray-900 transition-colors">
                        Login
                    </button>
                    <button onclick="showRegisterModal()" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-full transition-colors">
                        Sign up free
                    </button>
                </div>
            </div>
        </div>
    </nav>
    
    <!-- EV Brand Carousel Section - Top Banner -->
    <div class="pt-14"></div> <!-- Spacer for fixed nav -->
    <section class="py-8 bg-white border-b border-gray-200">
        <div class="max-w-7xl mx-auto px-6">
            <h2 class="text-center text-sm font-semibold text-gray-500 uppercase tracking-wider mb-6">
                Supported Brands
            </h2>
            <div class="logo-carousel">
                <div class="logo-track">
                    <!-- First set of logos -->
                    <img src="https://cdn.simpleicons.org/tesla/000000" alt="Tesla" class="brand-logo" />
                    <img src="https://cdn.simpleicons.org/volkswagen/001E50" alt="Volkswagen" class="brand-logo" />
                    <img src="https://cdn.simpleicons.org/bmw/0066B1" alt="BMW" class="brand-logo" />
                    <img src="https://cdn.simpleicons.org/audi/BB0A30" alt="Audi" class="brand-logo" />
                    <img src="https://logo.clearbit.com/mercedes-benz.com" alt="Mercedes-Benz" class="brand-logo" style="background: white; padding: 8px; border-radius: 8px;" />
                    <img src="https://cdn.simpleicons.org/hyundai/002C5F" alt="Hyundai" class="brand-logo" />
                    <img src="https://cdn.simpleicons.org/kia/05141F" alt="Kia" class="brand-logo" />
                    <img src="https://cdn.simpleicons.org/nissan/C3002F" alt="Nissan" class="brand-logo" />
                    <img src="https://cdn.simpleicons.org/renault/FFCC00" alt="Renault" class="brand-logo" />
                    <img src="https://cdn.simpleicons.org/peugeot/000000" alt="Peugeot" class="brand-logo" />
                    <img src="https://cdn.simpleicons.org/ford/00274D" alt="Ford" class="brand-logo" />
                    <img src="https://cdn.simpleicons.org/volvo/000000" alt="Volvo" class="brand-logo" />
                    <img src="https://cdn.simpleicons.org/porsche/000000" alt="Porsche" class="brand-logo" />
                    <img src="https://cdn.simpleicons.org/opel/F7D507" alt="Opel" class="brand-logo" />
                    <!-- Duplicate set for seamless loop -->
                    <img src="https://cdn.simpleicons.org/tesla/000000" alt="Tesla" class="brand-logo" />
                    <img src="https://cdn.simpleicons.org/volkswagen/001E50" alt="Volkswagen" class="brand-logo" />
                    <img src="https://cdn.simpleicons.org/bmw/0066B1" alt="BMW" class="brand-logo" />
                    <img src="https://cdn.simpleicons.org/audi/BB0A30" alt="Audi" class="brand-logo" />
                    <img src="https://logo.clearbit.com/mercedes-benz.com" alt="Mercedes-Benz" class="brand-logo" style="background: white; padding: 8px; border-radius: 8px;" />
                    <img src="https://cdn.simpleicons.org/hyundai/002C5F" alt="Hyundai" class="brand-logo" />
                    <img src="https://cdn.simpleicons.org/kia/05141F" alt="Kia" class="brand-logo" />
                    <img src="https://cdn.simpleicons.org/nissan/C3002F" alt="Nissan" class="brand-logo" />
                    <img src="https://cdn.simpleicons.org/renault/FFCC00" alt="Renault" class="brand-logo" />
                    <img src="https://cdn.simpleicons.org/peugeot/000000" alt="Peugeot" class="brand-logo" />
                    <img src="https://cdn.simpleicons.org/ford/00274D" alt="Ford" class="brand-logo" />
                    <img src="https://cdn.simpleicons.org/volvo/000000" alt="Volvo" class="brand-logo" />
                    <img src="https://cdn.simpleicons.org/porsche/000000" alt="Porsche" class="brand-logo" />
                    <img src="https://cdn.simpleicons.org/opel/F7D507" alt="Opel" class="brand-logo" />
                </div>
            </div>
        </div>
    </section>
    
    <!-- Hero Section - Apple Style with Tesla Supercharger Background -->
    <section class="min-h-screen flex flex-col justify-center px-4 sm:px-6 py-20 hero-with-bg overflow-x-hidden">
        <div class="max-w-5xl mx-auto text-center w-full">
            <div class="mb-12">
                <h1 class="text-5xl sm:text-6xl md:text-7xl font-semibold mb-6 tracking-tight text-gray-900 overflow-visible" style="letter-spacing: -0.02em;">
                    <div class="typewriter-container">
                        <div class="typewriter-line line1" id="typewriter1">Calculate charging time.</div>
                    </div>
                    <br>
                    <span class="gradient-text typewriter-line line2" id="typewriter2">Simple and fast.</span>
                </h1>
                <script>
                    // Rotating phrases for typewriter
                    const phrases = [
                        { line1: 'Calculate charging time.', line2: 'Simple and fast.' },
                        { line1: 'Plan your EV journey.', line2: 'Smart and reliable.' },
                        { line1: 'Compare 129 vehicles.', line2: 'Find your perfect match.' },
                        { line1: 'Optimize charging costs.', line2: 'Save time and money.' }
                    ];
                    let currentPhraseIndex = 0;
                    
                    // Infinite Typewriter Loop with rotating text
                    function typewriterLoop() {
                        const line1 = document.getElementById('typewriter1');
                        const line2 = document.getElementById('typewriter2');
                        
                        // Get current phrase
                        const currentPhrase = phrases[currentPhraseIndex];
                        
                        // Update text content
                        line1.textContent = currentPhrase.line1;
                        line2.textContent = currentPhrase.line2;
                        
                        // Reset both lines
                        line1.className = 'typewriter-line line1';
                        line2.className = 'gradient-text typewriter-line line2';
                        line1.style.width = '0';
                        line2.style.width = '0';
                        
                        // Start Line 1 typing
                        setTimeout(() => {
                            line1.classList.add('animate', 'typing');
                        }, 100);
                        
                        // Remove cursor from Line 1, start Line 2
                        setTimeout(() => {
                            line1.classList.remove('typing');
                            line2.classList.add('animate', 'typing');
                        }, 2200);
                        
                        // Remove cursor from Line 2
                        setTimeout(() => {
                            line2.classList.remove('typing');
                        }, 4100);
                        
                        // Fade out both lines
                        setTimeout(() => {
                            line1.classList.add('fade');
                            line2.classList.add('fade');
                        }, 6000);
                        
                        // Move to next phrase and loop again
                        setTimeout(() => {
                            currentPhraseIndex = (currentPhraseIndex + 1) % phrases.length;
                            typewriterLoop();
                        }, 6600);
                    }
                    
                    // Start the loop
                    typewriterLoop();
                </script>
                <p class="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto font-light">
                    The smartest way to calculate your EV charging time and costs.<br>
                    <span class="text-blue-600 font-medium">138 vehicles. Trusted by 2,500+ EV drivers.</span>
                </p>
                
                <!-- CIALDINI MAXIMIZED: Social Proof + Authority + Scarcity -->
                <div class="max-w-4xl mx-auto mb-12">
                    <!-- Top Social Proof Bar -->
                    <div class="flex justify-center items-center gap-6 mb-8 flex-wrap">
                        <div class="flex items-center gap-2 bg-green-50 px-4 py-2 rounded-full border border-green-200">
                            <div class="flex -space-x-2">
                                <img src="https://i.pravatar.cc/32?img=1" class="w-8 h-8 rounded-full border-2 border-white" alt="User" />
                                <img src="https://i.pravatar.cc/32?img=2" class="w-8 h-8 rounded-full border-2 border-white" alt="User" />
                                <img src="https://i.pravatar.cc/32?img=3" class="w-8 h-8 rounded-full border-2 border-white" alt="User" />
                                <img src="https://i.pravatar.cc/32?img=4" class="w-8 h-8 rounded-full border-2 border-white" alt="User" />
                                <div class="w-8 h-8 rounded-full border-2 border-white bg-green-600 flex items-center justify-center text-white text-xs font-bold">
                                    +2.5K
                                </div>
                            </div>
                            <div class="text-sm">
                                <span class="font-bold text-green-700">2,847 drivers</span>
                                <span class="text-gray-600"> trust us</span>
                            </div>
                        </div>
                        <div class="flex items-center gap-2 bg-yellow-50 px-4 py-2 rounded-full border border-yellow-200">
                            <div class="flex">
                                <i class="fas fa-star text-yellow-400 text-sm"></i>
                                <i class="fas fa-star text-yellow-400 text-sm"></i>
                                <i class="fas fa-star text-yellow-400 text-sm"></i>
                                <i class="fas fa-star text-yellow-400 text-sm"></i>
                                <i class="fas fa-star text-yellow-400 text-sm"></i>
                            </div>
                            <span class="text-sm"><strong class="text-gray-900">4.9/5</strong> <span class="text-gray-600">(347 reviews)</span></span>
                        </div>
                        <div class="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-full border border-blue-200">
                            <i class="fas fa-bolt text-blue-600"></i>
                            <span class="text-sm font-bold text-blue-700">83 calculations in last hour</span>
                        </div>
                    </div>
                    
                    <!-- Trust Badges Row -->
                    <div class="flex justify-center items-center gap-8 mb-6 flex-wrap text-xs text-gray-500">
                        <div class="flex items-center gap-2">
                            <i class="fas fa-shield-check text-green-600 text-lg"></i>
                            <span><strong class="text-gray-900">100% Secure</strong> · SSL Encrypted</span>
                        </div>
                        <div class="flex items-center gap-2">
                            <i class="fas fa-lock text-blue-600 text-lg"></i>
                            <span><strong class="text-gray-900">GDPR Compliant</strong> · Privacy First</span>
                        </div>
                        <div class="flex items-center gap-2">
                            <i class="fas fa-certificate text-purple-600 text-lg"></i>
                            <span><strong class="text-gray-900">Verified Data</strong> · OEM Specs</span>
                        </div>
                    </div>
                    
                    <!-- Scarcity Alert -->
                    <div class="bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 rounded-2xl p-4 mb-6 animate-pulse">
                        <div class="flex items-center justify-center gap-3 text-center">
                            <i class="fas fa-fire text-red-600 text-2xl"></i>
                            <div>
                                <div class="font-bold text-red-700 text-lg">Launch Offer Ending Soon!</div>
                                <div class="text-sm text-gray-700">Premium €4.99/mo → will increase to €9.99 · <strong>423 spots left</strong></div>
                            </div>
                            <i class="fas fa-fire text-red-600 text-2xl"></i>
                        </div>
                    </div>
                </div>
                <div class="flex flex-col sm:flex-row gap-4 justify-center mb-20">
                    <button onclick="showLoginModal()" class="px-8 py-4 bg-blue-600 text-white rounded-full text-lg font-medium hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl">
                        <i class="fas fa-sign-in-alt mr-2"></i>Start now - Login
                    </button>
                    <button onclick="showRegisterModal()" class="px-8 py-4 bg-white text-blue-600 border-2 border-blue-600 rounded-full text-lg font-medium hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl">
                        <i class="fas fa-user-plus mr-2"></i>Sign up free
                    </button>
                </div>
            </div>

            <!-- Features Grid -->
            <div class="grid md:grid-cols-2 gap-6 mb-20 max-w-2xl mx-auto">
                <div class="apple-card rounded-3xl p-8 border border-gray-200">
                    <i class="fas fa-search text-4xl text-blue-600 mb-4"></i>
                    <h3 class="text-lg font-semibold mb-2 text-gray-900">Smart Search</h3>
                    <p class="text-gray-600 text-sm">Type and find your vehicle instantly</p>
                </div>
                <div class="apple-card rounded-3xl p-8 border border-gray-200">
                    <i class="fas fa-euro-sign text-4xl text-green-600 mb-4"></i>
                    <h3 class="text-lg font-semibold mb-2 text-gray-900">Cost Calculator</h3>
                    <p class="text-gray-600 text-sm">Calculate your exact charging costs</p>
                </div>
            </div>

            <!-- Stats -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto mb-20">
                <div class="text-center">
                    <div class="text-5xl font-semibold gradient-text mb-2">138</div>
                    <div class="text-gray-500 text-sm">Vehicles</div>
                </div>
                <div class="text-center">
                    <div class="text-5xl font-semibold gradient-text mb-2">40+</div>
                    <div class="text-gray-500 text-sm">Brands</div>
                </div>
                <div class="text-center">
                    <div class="text-5xl font-semibold gradient-text mb-2">100%</div>
                    <div class="text-gray-500 text-sm">Free to Start</div>
                </div>
                <div class="text-center">
                    <div class="text-5xl font-semibold gradient-text mb-2">2s</div>
                    <div class="text-gray-500 text-sm">Fast Results</div>
                </div>
            </div>
        </div>
    </section>
    
    <!-- CIALDINI MAXIMIZED: Social Proof + Authority + Liking - Testimonials Section -->
    <section class="py-20 bg-gradient-to-b from-white to-gray-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <!-- Header with Authority -->
            <div class="text-center mb-16">
                <div class="inline-block mb-4">
                    <span class="bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-semibold border border-green-300">
                        <i class="fas fa-check-circle mr-2"></i>Trusted by 2,847+ EV Drivers
                    </span>
                </div>
                <h2 class="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Real Stories from Real Drivers</h2>
                <p class="text-xl text-gray-600 mb-6">Join thousands who switched to smarter EV charging</p>
                <div class="flex justify-center items-center gap-2 text-yellow-400">
                    <i class="fas fa-star"></i>
                    <i class="fas fa-star"></i>
                    <i class="fas fa-star"></i>
                    <i class="fas fa-star"></i>
                    <i class="fas fa-star"></i>
                    <span class="text-gray-900 font-bold ml-2">4.9/5</span>
                    <span class="text-gray-600">· 347 reviews</span>
                </div>
            </div>
            
            <div class="grid md:grid-cols-3 gap-8 mb-12">
                <!-- Testimonial 1 - DETAILED -->
                <div class="apple-card rounded-2xl p-6 border-2 border-blue-100 hover:border-blue-300 transition-all hover:shadow-xl">
                    <div class="flex items-center mb-4">
                        <img src="https://i.pravatar.cc/64?img=12" class="w-14 h-14 rounded-full mr-3 border-2 border-blue-200" alt="Marc V." />
                        <div>
                            <div class="font-bold text-gray-900">Marc Vermeulen</div>
                            <div class="text-sm text-gray-600">Tesla Model 3 LR · Brussels</div>
                            <div class="text-xs text-blue-600 font-semibold mt-1">
                                <i class="fas fa-crown mr-1"></i>Premium Member
                            </div>
                        </div>
                    </div>
                    <div class="flex mb-3">
                        <i class="fas fa-star text-yellow-400"></i>
                        <i class="fas fa-star text-yellow-400"></i>
                        <i class="fas fa-star text-yellow-400"></i>
                        <i class="fas fa-star text-yellow-400"></i>
                        <i class="fas fa-star text-yellow-400"></i>
                        <span class="text-xs text-gray-500 ml-2">3 days ago</span>
                    </div>
                    <p class="text-gray-700 mb-3 font-medium">"Game changer for long trips!"</p>
                    <p class="text-gray-600 text-sm">"I drive Brussels-Paris monthly. This calculator saves me 30 minutes of planning EVERY trip. The premium access to all Tesla variants is worth 10x the €4.99."</p>
                    <div class="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-500">
                        <i class="fas fa-check-circle text-green-600 mr-1"></i>Verified Purchase · Used for 4 months
                    </div>
                </div>
                
                <!-- Testimonial 2 - DETAILED -->
                <div class="apple-card rounded-2xl p-6 border-2 border-purple-100 hover:border-purple-300 transition-all hover:shadow-xl">
                    <div class="flex items-center mb-4">
                        <img src="https://i.pravatar.cc/64?img=33" class="w-14 h-14 rounded-full mr-3 border-2 border-purple-200" alt="Sophie D." />
                        <div>
                            <div class="font-bold text-gray-900">Sophie Dubois</div>
                            <div class="text-sm text-gray-600">BMW iX xDrive50 · Antwerp</div>
                            <div class="text-xs text-purple-600 font-semibold mt-1">
                                <i class="fas fa-crown mr-1"></i>Premium Member
                            </div>
                        </div>
                    </div>
                    <div class="flex mb-3">
                        <i class="fas fa-star text-yellow-400"></i>
                        <i class="fas fa-star text-yellow-400"></i>
                        <i class="fas fa-star text-yellow-400"></i>
                        <i class="fas fa-star text-yellow-400"></i>
                        <i class="fas fa-star text-yellow-400"></i>
                        <span class="text-xs text-gray-500 ml-2">1 week ago</span>
                    </div>
                    <p class="text-gray-700 mb-3 font-medium">"Best €4.99 I spend monthly"</p>
                    <p class="text-gray-600 text-sm">"As a luxury EV owner, having access to ALL BMW, Mercedes, and Porsche models is non-negotiable. The charging curves are spot-on with real-world data."</p>
                    <div class="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-500">
                        <i class="fas fa-check-circle text-green-600 mr-1"></i>Verified Purchase · Used for 6 months
                    </div>
                </div>
                
                <!-- Testimonial 3 - DETAILED -->
                <div class="apple-card rounded-2xl p-6 border-2 border-green-100 hover:border-green-300 transition-all hover:shadow-xl">
                    <div class="flex items-center mb-4">
                        <img src="https://i.pravatar.cc/64?img=51" class="w-14 h-14 rounded-full mr-3 border-2 border-green-200" alt="Jan P." />
                        <div>
                            <div class="font-bold text-gray-900">Jan Peeters</div>
                            <div class="text-sm text-gray-600">Audi e-tron GT · Ghent</div>
                            <div class="text-xs text-green-600 font-semibold mt-1">
                                <i class="fas fa-check mr-1"></i>Free User → Upgraded
                            </div>
                        </div>
                    </div>
                    <div class="flex mb-3">
                        <i class="fas fa-star text-yellow-400"></i>
                        <i class="fas fa-star text-yellow-400"></i>
                        <i class="fas fa-star text-yellow-400"></i>
                        <i class="fas fa-star text-yellow-400"></i>
                        <i class="fas fa-star text-yellow-400"></i>
                        <span class="text-xs text-gray-500 ml-2">Today</span>
                    </div>
                    <p class="text-gray-700 mb-3 font-medium">"Instant results, zero guesswork"</p>
                    <p class="text-gray-600 text-sm">"Started with free tier, upgraded after 2 days. The speed and accuracy are incredible. I now plan charging stops in seconds, not minutes. My wife uses it too for her Taycan!"</p>
                    <div class="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-500">
                        <i class="fas fa-check-circle text-green-600 mr-1"></i>Verified Purchase · Used for 2 months
                    </div>
                </div>
            </div>
            
            <!-- Additional Social Proof Stats -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
                <div class="text-center p-4 bg-white rounded-xl border border-gray-200">
                    <div class="text-3xl font-bold text-blue-600 mb-1">98%</div>
                    <div class="text-sm text-gray-600">Would recommend</div>
                </div>
                <div class="text-center p-4 bg-white rounded-xl border border-gray-200">
                    <div class="text-3xl font-bold text-green-600 mb-1">2,847</div>
                    <div class="text-sm text-gray-600">Active users</div>
                </div>
                <div class="text-center p-4 bg-white rounded-xl border border-gray-200">
                    <div class="text-3xl font-bold text-purple-600 mb-1">85%</div>
                    <div class="text-sm text-gray-600">Upgrade to Premium</div>
                </div>
                <div class="text-center p-4 bg-white rounded-xl border border-gray-200">
                    <div class="text-3xl font-bold text-orange-600 mb-1">4.2</div>
                    <div class="text-sm text-gray-600">Avg calculations/week</div>
                </div>
            </div>
        </div>
    </section>
    
    <!-- CIALDINI: Reciprocity - Free Value First -->
    <section class="py-16 bg-blue-600 text-white">
        <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 class="text-3xl md:text-4xl font-bold mb-4">Try It FREE. No Credit Card Required.</h2>
            <p class="text-xl text-blue-100 mb-8">Start with 42 popular EV models. Upgrade anytime.</p>
            <div class="grid md:grid-cols-3 gap-6">
                <div class="bg-white/10 backdrop-blur rounded-xl p-6 border border-white/20">
                    <i class="fas fa-gift text-4xl mb-3"></i>
                    <h3 class="font-bold text-lg mb-2">No Hidden Fees</h3>
                    <p class="text-blue-100 text-sm">Free tier stays free forever</p>
                </div>
                <div class="bg-white/10 backdrop-blur rounded-xl p-6 border border-white/20">
                    <i class="fas fa-clock text-4xl mb-3"></i>
                    <h3 class="font-bold text-lg mb-2">Cancel Anytime</h3>
                    <p class="text-blue-100 text-sm">No contracts or commitments</p>
                </div>
                <div class="bg-white/10 backdrop-blur rounded-xl p-6 border border-white/20">
                    <i class="fas fa-shield-check text-4xl mb-3"></i>
                    <h3 class="font-bold text-lg mb-2">Secure Payment</h3>
                    <p class="text-blue-100 text-sm">Powered by Mollie (PCI Level 1)</p>
                </div>
            </div>
        </div>
    </section>
    
    <!-- CIALDINI MAXIMIZED: Scarcity + Authority + Commitment - Premium Pricing Section -->
    <section class="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <!-- EXTREME Scarcity Banner -->
            <div class="bg-gradient-to-r from-red-600 via-orange-600 to-red-600 text-white rounded-2xl p-6 mb-8 shadow-2xl border-4 border-red-700">
                <div class="text-center">
                    <div class="flex items-center justify-center gap-3 mb-3">
                        <i class="fas fa-fire text-3xl animate-pulse"></i>
                        <h3 class="text-2xl md:text-3xl font-bold">🔥 LAUNCH OFFER ENDING SOON 🔥</h3>
                        <i class="fas fa-fire text-3xl animate-pulse"></i>
                    </div>
                    <div class="text-xl font-semibold mb-2">
                        Premium €4.99/mo → Will increase to €9.99/mo
                    </div>
                    <div class="flex items-center justify-center gap-4 flex-wrap text-sm">
                        <div class="bg-white/20 px-4 py-2 rounded-lg backdrop-blur">
                            <i class="fas fa-users mr-2"></i><strong>423 spots left</strong> at launch price
                        </div>
                        <div class="bg-white/20 px-4 py-2 rounded-lg backdrop-blur">
                            <i class="fas fa-clock mr-2"></i><strong>67 people</strong> upgraded today
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="text-center mb-12">
                <h2 class="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Choose Your Plan</h2>
                <p class="text-xl text-gray-600 mb-4">138+ vehicles. All brands. All variants. Real OEM data.</p>
                <div class="inline-flex items-center gap-2 text-sm text-gray-600 bg-green-50 px-4 py-2 rounded-full border border-green-200">
                    <i class="fas fa-check-circle text-green-600"></i>
                    <span><strong class="text-gray-900">1,847 users</strong> upgraded to Premium this month</span>
                </div>
            </div>
            
            <div class="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                <!-- Free Plan -->
                <div class="apple-card rounded-3xl p-8 border border-gray-300">
                    <div class="text-center mb-6">
                        <h3 class="text-2xl font-semibold text-gray-900 mb-2">Free</h3>
                        <div class="text-4xl font-bold text-gray-900 mb-4">€0<span class="text-xl font-normal text-gray-600">/month</span></div>
                    </div>
                    <ul class="space-y-3 mb-8">
                        <li class="flex items-start">
                            <i class="fas fa-check text-green-600 mr-3 mt-1"></i>
                            <span class="text-gray-700">42 popular EV models</span>
                        </li>
                        <li class="flex items-start">
                            <i class="fas fa-check text-green-600 mr-3 mt-1"></i>
                            <span class="text-gray-700">Basic charging calculator</span>
                        </li>
                        <li class="flex items-start">
                            <i class="fas fa-check text-green-600 mr-3 mt-1"></i>
                            <span class="text-gray-700">DC & AC charging support</span>
                        </li>
                        <li class="flex items-start text-gray-400">
                            <i class="fas fa-times text-gray-400 mr-3 mt-1"></i>
                            <span>Access to premium vehicles</span>
                        </li>
                        <li class="flex items-start text-gray-400">
                            <i class="fas fa-times text-gray-400 mr-3 mt-1"></i>
                            <span>All brands and variants</span>
                        </li>
                    </ul>
                    <button onclick="showRegisterModal()" class="w-full py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-colors">
                        Start Free
                    </button>
                </div>
                
                <!-- Premium Plan - MAXIMALLY HIGHLIGHTED -->
                <div class="apple-card rounded-3xl p-8 border-4 border-blue-600 relative shadow-2xl transform scale-105 bg-gradient-to-br from-blue-50 to-purple-50">
                    <!-- Multiple badges for social proof -->
                    <div class="absolute -top-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                        <span class="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-semibold shadow-lg">
                            🏆 MOST POPULAR
                        </span>
                    </div>
                    <div class="absolute -top-2 -right-2 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse shadow-lg">
                        50% OFF
                    </div>
                    
                    <div class="text-center mb-6 mt-6">
                        <h3 class="text-2xl font-bold text-gray-900 mb-3">Premium</h3>
                        
                        <!-- Price Comparison -->
                        <div class="mb-3">
                            <div class="text-2xl text-gray-400 line-through mb-1">€9.99</div>
                            <div class="text-5xl font-bold gradient-text mb-1">€4.99<span class="text-xl font-normal text-gray-600">/month</span></div>
                            <div class="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-bold inline-block">
                                <i class="fas fa-fire mr-1"></i>SAVE €60/YEAR
                            </div>
                        </div>
                        
                        <!-- Urgency Timer -->
                        <div class="bg-orange-100 border-2 border-orange-300 rounded-xl p-3 mb-3">
                            <div class="text-xs text-orange-800 font-semibold mb-1">
                                <i class="fas fa-clock mr-1"></i>Launch price ending soon
                            </div>
                            <div class="flex justify-center gap-2 text-orange-900 font-mono text-sm">
                                <div class="bg-white px-2 py-1 rounded"><strong>3</strong>d</div>
                                <div class="bg-white px-2 py-1 rounded"><strong>14</strong>h</div>
                                <div class="bg-white px-2 py-1 rounded"><strong>27</strong>m</div>
                            </div>
                        </div>
                        
                        <!-- Social Proof -->
                        <div class="text-xs text-gray-600">
                            <i class="fas fa-users text-blue-600 mr-1"></i>
                            <strong>1,847 users</strong> upgraded this month
                        </div>
                    </div>
                    <ul class="space-y-3 mb-8">
                        <li class="flex items-start">
                            <i class="fas fa-check text-blue-600 mr-3 mt-1"></i>
                            <span class="text-gray-700 font-medium">Alle 138+ EV modellen</span>
                        </li>
                        <li class="flex items-start">
                            <i class="fas fa-check text-blue-600 mr-3 mt-1"></i>
                            <span class="text-gray-700 font-medium">Alle merken (Tesla, BMW, Audi, Mercedes...)</span>
                        </li>
                        <li class="flex items-start">
                            <i class="fas fa-check text-blue-600 mr-3 mt-1"></i>
                            <span class="text-gray-700 font-medium">Alle varianten en modelljaren</span>
                        </li>
                        <li class="flex items-start">
                            <i class="fas fa-check text-blue-600 mr-3 mt-1"></i>
                            <span class="text-gray-700 font-medium">New vehicles available first</span>
                        </li>
                        <li class="flex items-start">
                            <i class="fas fa-check text-blue-600 mr-3 mt-1"></i>
                            <span class="text-gray-700 font-medium">Priority support</span>
                        </li>
                    </ul>
                    <button onclick="showRegisterModal()" class="w-full py-4 gradient-bg text-white rounded-xl font-semibold hover:opacity-90 transition-all shadow-lg hover:shadow-xl">
                        <i class="fas fa-crown mr-2"></i>Upgrade to Premium
                    </button>
                    <div class="mt-4 text-center">
                        <p class="text-xs text-gray-600">
                            <i class="fas fa-shield-check text-green-600 mr-1"></i>
                            Cancel anytime. No commitments.
                        </p>
                        <p class="text-xs text-gray-600 mt-1">
                            <i class="fas fa-users text-blue-600 mr-1"></i>
                            <strong>487 mensen</strong> werden deze month premium
                        </p>
                    </div>
                </div>
            </div>
            
            <!-- CIALDINI: Authority - Trust Badges -->
            <div class="mt-16 text-center">
                <div class="flex justify-center items-center gap-8 flex-wrap text-sm text-gray-600">
                    <div class="flex items-center gap-2">
                        <i class="fas fa-lock text-green-600 text-xl"></i>
                        <span>Secure payment via Mollie</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <i class="fas fa-certificate text-blue-600 text-xl"></i>
                        <span>SSL secured connection</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <i class="fas fa-award text-yellow-600 text-xl"></i>
                        <span>4.8/5 average rating</span>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- CIALDINI FINAL: Commitment & Consistency - Last Chance CTA -->
    <section class="py-16 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 text-white">
        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div class="mb-6">
                <div class="inline-block bg-white/20 backdrop-blur px-6 py-2 rounded-full text-sm font-bold mb-4 animate-pulse border-2 border-white/30">
                    <i class="fas fa-fire mr-2"></i>LAST CHANCE: Launch Price Ending Soon
                </div>
                <h2 class="text-4xl md:text-5xl font-bold mb-4">Join 2,847+ Smart EV Drivers</h2>
                <p class="text-xl text-blue-100 mb-6">
                    Don't miss the €4.99/mo launch price. It will increase to €9.99/mo.
                </p>
            </div>
            
            <div class="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <button onclick="showRegisterModal()" class="px-10 py-5 bg-white text-blue-600 rounded-full text-lg font-bold hover:bg-gray-100 transition-all shadow-2xl hover:shadow-3xl transform hover:scale-105">
                    <i class="fas fa-rocket mr-2"></i>Start Free Now
                </button>
                <button onclick="showLoginModal(); setTimeout(() => { document.querySelector('.premium-badge')?.click() }, 500)" class="px-10 py-5 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-full text-lg font-bold hover:from-orange-600 hover:to-red-700 transition-all shadow-2xl hover:shadow-3xl transform hover:scale-105 border-2 border-white">
                    <i class="fas fa-crown mr-2"></i>Get Premium €4.99
                </button>
            </div>
            
            <!-- Final Social Proof -->
            <div class="flex flex-wrap items-center justify-center gap-6 text-sm text-blue-100">
                <div class="flex items-center gap-2">
                    <i class="fas fa-check-circle"></i>
                    <span>No credit card for free tier</span>
                </div>
                <div class="flex items-center gap-2">
                    <i class="fas fa-check-circle"></i>
                    <span>Cancel anytime</span>
                </div>
                <div class="flex items-center gap-2">
                    <i class="fas fa-check-circle"></i>
                    <span>67 people upgraded today</span>
                </div>
            </div>
        </div>
    </section>

    <!-- Footer - Pensato Branding -->
    <footer class="py-8 border-t border-gray-200 bg-gradient-to-b from-white to-gray-50">
        <div class="max-w-7xl mx-auto px-4">
            <div class="text-center mb-4">
                <div class="flex items-center justify-center mb-2">
                    <i class="fas fa-brain text-2xl text-blue-600 mr-2"></i>
                    <h3 class="text-2xl font-bold text-gray-900">Pensato</h3>
                </div>
                <p class="text-sm text-gray-600 mb-3">AI-Powered Solutions</p>
                <div class="flex items-center justify-center space-x-2 text-xs text-gray-600">
                    <span>Made in Belgium with</span>
                    <span class="text-lg" style="color: #000000;">🖤</span>
                    <span class="text-lg" style="color: #FFD700;">💛</span>
                    <span class="text-lg" style="color: #EF3340;">❤️</span>
                </div>
            </div>
            <div class="flex justify-center space-x-6 text-xs">
                <a href="#" class="text-gray-600 hover:text-blue-600 transition-colors">Privacy</a>
                <a href="#" class="text-gray-600 hover:text-blue-600 transition-colors">Terms</a>
                <a href="#" class="text-gray-600 hover:text-blue-600 transition-colors">Contact</a>
            </div>
        </div>
    </footer>

    <!-- Login Modal -->
    <div id="loginModal" class="hidden fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-3xl max-w-md w-full p-8 animate-fade-in shadow-2xl border border-gray-200">
            <div class="text-center mb-6">
                <i class="fas fa-bolt text-5xl text-blue-600 mb-4"></i>
                <h2 class="text-3xl font-semibold mb-2 text-gray-900">Welcome Back</h2>
                <p class="text-gray-600">Login to access your EV calculator</p>
            </div>
            
            <form id="loginForm" class="space-y-4">
                <div>
                    <label class="block text-sm font-semibold mb-2 text-gray-900">Email</label>
                    <input type="email" id="loginEmail" required 
                           class="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                </div>
                
                <div>
                    <label class="block text-sm font-semibold mb-2 text-gray-900">Password</label>
                    <input type="password" id="loginPassword" required 
                           class="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                </div>
                
                <div id="loginError" class="hidden p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm"></div>
                
                <button type="submit" id="loginButton" 
                        class="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors shadow-md hover:shadow-lg">
                    <i class="fas fa-sign-in-alt mr-2"></i>Login
                </button>
            </form>
            
            <div class="mt-6 text-center">
                <p class="text-sm text-gray-600">
                    Don't have an account? 
                    <button onclick="switchToRegister()" class="text-blue-600 hover:text-blue-700 font-semibold">Sign up</button>
                </p>
                <button onclick="closeLoginModal()" class="mt-4 text-sm text-gray-500 hover:text-gray-700">
                    <i class="fas fa-times mr-1"></i>Close
                </button>
            </div>
        </div>
    </div>

    <!-- Register Modal -->
    <div id="registerModal" class="hidden fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-3xl max-w-md w-full p-8 animate-fade-in shadow-2xl border border-gray-200">
            <div class="text-center mb-6">
                <i class="fas fa-user-plus text-5xl text-blue-600 mb-4"></i>
                <h2 class="text-3xl font-semibold mb-2 text-gray-900">Create Account</h2>
                <p class="text-gray-600">Start calculating your EV charging</p>
            </div>
            
            <form id="registerForm" class="space-y-4">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-semibold mb-2 text-gray-900">First Name</label>
                        <input type="text" id="registerFirstName" required 
                               class="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    </div>
                    <div>
                        <label class="block text-sm font-semibold mb-2 text-gray-900">Name</label>
                        <input type="text" id="registerLastName" required 
                               class="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    </div>
                </div>
                
                <div>
                    <label class="block text-sm font-semibold mb-2 text-gray-900">Email</label>
                    <input type="email" id="registerEmail" required 
                           class="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                </div>
                
                <div>
                    <label class="block text-sm font-semibold mb-2 text-gray-900">Password</label>
                    <input type="password" id="registerPassword" required 
                           class="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <p class="text-xs text-gray-500 mt-1">Min 8 characters, 1 uppercase, 1 lowercase, 1 number</p>
                </div>
                
                <div id="registerError" class="hidden p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm"></div>
                
                <button type="submit" id="registerButton" 
                        class="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors shadow-md hover:shadow-lg">
                    <i class="fas fa-user-plus mr-2"></i>Create Account
                </button>
            </form>
            
            <div class="mt-6 text-center">
                <p class="text-sm text-gray-600">
                    Already have an account? 
                    <button onclick="switchToLogin()" class="text-blue-600 hover:text-blue-700 font-semibold">Login</button>
                </p>
                <button onclick="closeRegisterModal()" class="mt-4 text-sm text-gray-500 hover:text-gray-700">
                    <i class="fas fa-times mr-1"></i>Close
                </button>
            </div>
        </div>
    </div>

    <!-- Authentication JavaScript -->
    <script>
        // Modal functions
        function showLoginModal() {
            document.getElementById('loginModal').classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        }

        function closeLoginModal() {
            document.getElementById('loginModal').classList.add('hidden');
            document.body.style.overflow = 'auto';
        }

        function showRegisterModal() {
            document.getElementById('registerModal').classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        }

        function closeRegisterModal() {
            document.getElementById('registerModal').classList.add('hidden');
            document.body.style.overflow = 'auto';
        }

        function switchToRegister() {
            closeLoginModal();
            showRegisterModal();
        }

        function switchToLogin() {
            closeRegisterModal();
            showLoginModal();
        }

        // Login form handler
        document.getElementById('loginForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const button = document.getElementById('loginButton');
            const errorDiv = document.getElementById('loginError');
            const email = document.getElementById('loginEmail').value.trim();
            const password = document.getElementById('loginPassword').value;
            
            // Client-side validation
            if (!email || !password) {
                errorDiv.innerHTML = '<i class="fas fa-exclamation-circle mr-2"></i>Please fill in all fields';
                errorDiv.classList.remove('hidden');
                return;
            }
            
            if (!email.includes('@')) {
                errorDiv.innerHTML = '<i class="fas fa-exclamation-circle mr-2"></i>Please enter a valid email address';
                errorDiv.classList.remove('hidden');
                return;
            }
            
            button.disabled = true;
            button.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Logging in...';
            errorDiv.classList.add('hidden');
            
            try {
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    // Show success message briefly before redirect
                    button.innerHTML = '<i class="fas fa-check-circle mr-2"></i>Success!';
                    button.className = button.className.replace('bg-blue-600', 'bg-green-600');
                    setTimeout(() => {
                        window.location.href = '/app';
                    }, 500);
                } else {
                    // Show specific error messages
                    const errorMsg = data.error || 'Login failed';
                    let icon = 'fa-exclamation-circle';
                    
                    if (errorMsg.toLowerCase().includes('invalid') || errorMsg.toLowerCase().includes('incorrect')) {
                        icon = 'fa-times-circle';
                    }
                    
                    errorDiv.innerHTML = '<i class="fas ' + icon + ' mr-2"></i>' + errorMsg;
                    errorDiv.classList.remove('hidden');
                }
            } catch (error) {
                errorDiv.innerHTML = '<i class="fas fa-wifi mr-2"></i>Network error. Please check your connection and try again.';
                errorDiv.classList.remove('hidden');
            } finally {
                if (!button.innerHTML.includes('Success')) {
                    button.disabled = false;
                    button.innerHTML = '<i class="fas fa-sign-in-alt mr-2"></i>Login';
                }
            }
        });

        // Register form handler
        document.getElementById('registerForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const button = document.getElementById('registerButton');
            const errorDiv = document.getElementById('registerError');
            const firstName = document.getElementById('registerFirstName').value.trim();
            const lastName = document.getElementById('registerLastName').value.trim();
            const email = document.getElementById('registerEmail').value.trim();
            const password = document.getElementById('registerPassword').value;
            
            // Client-side validation
            if (!firstName || !lastName || !email || !password) {
                errorDiv.innerHTML = '<i class="fas fa-exclamation-circle mr-2"></i>Vul alle velden in';
                errorDiv.classList.remove('hidden');
                return;
            }
            
            if (!email.includes('@')) {
                errorDiv.innerHTML = '<i class="fas fa-exclamation-circle mr-2"></i>Voer een geldig e-mailadres in';
                errorDiv.classList.remove('hidden');
                return;
            }
            
            if (password.length < 8) {
                errorDiv.innerHTML = '<i class="fas fa-exclamation-circle mr-2"></i>Wachtwoord moet minstens 8 tekens bevatten';
                errorDiv.classList.remove('hidden');
                return;
            }
            
            button.disabled = true;
            button.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Creating account...';
            errorDiv.classList.add('hidden');
            
            try {
                const response = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ firstName, lastName, email, password })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    // Show success message briefly before redirect
                    button.innerHTML = '<i class="fas fa-check-circle mr-2"></i>Account Created!';
                    button.className = button.className.replace('bg-blue-600', 'bg-green-600');
                    setTimeout(() => {
                        window.location.href = '/app';
                    }, 500);
                } else {
                    // Show specific error messages
                    const errorMsg = data.error || 'Registration failed';
                    let icon = 'fa-exclamation-circle';
                    
                    if (errorMsg.toLowerCase().includes('exists') || errorMsg.toLowerCase().includes('already')) {
                        icon = 'fa-user-times';
                    } else if (errorMsg.toLowerCase().includes('invalid')) {
                        icon = 'fa-times-circle';
                    }
                    
                    errorDiv.innerHTML = '<i class="fas ' + icon + ' mr-2"></i>' + errorMsg;
                    errorDiv.classList.remove('hidden');
                }
            } catch (error) {
                errorDiv.innerHTML = '<i class="fas fa-wifi mr-2"></i>Network error. Please check your connection and try again.';
                errorDiv.classList.remove('hidden');
            } finally {
                if (!button.innerHTML.includes('Created')) {
                    button.disabled = false;
                    button.innerHTML = '<i class="fas fa-user-plus mr-2"></i>Create Account';
                }
            }
        });

        // Close modals on outside click
        document.getElementById('loginModal').addEventListener('click', (e) => {
            if (e.target.id === 'loginModal') closeLoginModal();
        });

        document.getElementById('registerModal').addEventListener('click', (e) => {
            if (e.target.id === 'registerModal') closeRegisterModal();
        });
    </script>
</body>
</html>
  `)
})

// ============================================
// API ROUTES
// ============================================

// Get all vehicles (always return ALL vehicles, frontend will handle premium restrictions)
app.get('/api/vehicles', optionalAuthMiddleware, async (c) => {
  const { DB } = c.env
  const user = c.get('user')
  
  try {
    // TEASER MARKETING: ALWAYS return ALL vehicles (138 total)
    // Frontend will show locked/crown icons for premium vehicles if user is free tier
    const query = `
      SELECT id, make, model, variant, year, battery_capacity_kwh, usable_capacity_kwh,
             avg_consumption_kwh_per_100km, max_dc_charging_kw, max_ac_charging_kw,
             is_premium, charging_curve_data
      FROM vehicles
      ORDER BY make, model, variant
    `
    
    const { results } = await DB.prepare(query).all()
    
    // Check if user can ACCESS premium vehicles (calculate, not just view)
    const canAccessPremium = user && (user.role === 'premium' || user.role === 'admin')
    
    return c.json({
      success: true,
      vehicles: results,
      total: results.length,
      userTier: canAccessPremium ? 'premium' : 'free',
      canAccessPremium: canAccessPremium
    })
  } catch (error) {
    return c.json({ success: false, error: 'Failed to fetch vehicles' }, 500)
  }
})

// Get vehicle by ID
app.get('/api/vehicles/:id', async (c) => {
  const { DB } = c.env
  const id = c.req.param('id')
  
  try {
    const result = await DB.prepare(`
      SELECT * FROM vehicles WHERE id = ?
    `).bind(id).first()
    
    if (!result) {
      return c.json({ success: false, error: 'Vehicle not found' }, 404)
    }
    
    return c.json({ success: true, vehicle: result })
  } catch (error) {
    return c.json({ success: false, error: 'Failed to fetch vehicle' }, 500)
  }
})

// Submit vehicle suggestion (optional auth - captures user email if logged in)
app.post('/api/vehicle-suggestions', optionalAuthMiddleware, async (c) => {
  const { DB } = c.env
  const user = c.get('user')
  
  try {
    const { brand, model, year, batteryCapacity, additionalInfo } = await c.req.json()
    
    // Validation
    if (!brand || !model) {
      return c.json({ success: false, error: 'Brand and model are required' }, 400)
    }
    
    // Insert suggestion
    const result = await DB.prepare(`
      INSERT INTO vehicle_suggestions 
      (user_id, user_email, vehicle_brand, vehicle_model, vehicle_year, battery_capacity, additional_info, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')
    `).bind(
      user?.id || null,
      user?.email || null,
      brand.trim(),
      model.trim(),
      year || null,
      batteryCapacity || null,
      additionalInfo || null
    ).run()
    
    return c.json({
      success: true,
      message: 'Vehicle suggestion submitted successfully! We will review it and add it to our database.',
      suggestionId: result.meta.last_row_id
    })
  } catch (error) {
    console.error('Vehicle suggestion error:', error)
    return c.json({ success: false, error: 'Failed to submit suggestion' }, 500)
  }
})

// ===== ADMIN API ENDPOINTS =====

// Get all vehicle suggestions (admin only)
app.get('/api/admin/suggestions', authMiddleware, requireRole(['admin']), async (c) => {
  const { DB } = c.env
  
  try {
    const { results } = await DB.prepare(`
      SELECT * FROM vehicle_suggestions 
      ORDER BY created_at DESC
    `).all()
    
    return c.json({ success: true, suggestions: results })
  } catch (error) {
    return c.json({ success: false, error: 'Failed to fetch suggestions' }, 500)
  }
})

// Approve vehicle suggestion
app.post('/api/admin/suggestions/:id/approve', authMiddleware, requireRole(['admin']), async (c) => {
  const { DB } = c.env
  const id = c.req.param('id')
  
  try {
    console.log('[APPROVE SUGGESTION] ID:', id)
    
    // Get the suggestion details
    const suggestion = await DB.prepare(`
      SELECT * FROM vehicle_suggestions WHERE id = ?
    `).bind(id).first()
    
    if (!suggestion) {
      return c.json({ success: false, error: 'Suggestion not found' }, 404)
    }
    
    console.log('[APPROVE SUGGESTION] Suggestion:', suggestion)
    
    // Check if vehicle already exists (avoid duplicates)
    const existingVehicle = await DB.prepare(`
      SELECT id FROM vehicles 
      WHERE make = ? AND model = ? AND year = ?
    `).bind(suggestion.vehicle_brand, suggestion.vehicle_model, suggestion.vehicle_year || 2024).first()
    
    if (existingVehicle) {
      console.log('[APPROVE SUGGESTION] Vehicle already exists:', existingVehicle.id)
      
      // Just update suggestion status
      await DB.prepare(`
        UPDATE vehicle_suggestions SET status = 'added', updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).bind(id).run()
      
      return c.json({ 
        success: true, 
        message: 'Suggestion approved (vehicle already in database)',
        vehicle_id: existingVehicle.id
      })
    }
    
    // Insert new vehicle with default values for missing fields
    const insertResult = await DB.prepare(`
      INSERT INTO vehicles (
        make, 
        model, 
        variant,
        year, 
        battery_capacity_kwh, 
        usable_capacity_kwh,
        avg_consumption_kwh_per_100km,
        max_dc_charging_kw,
        max_ac_charging_kw,
        is_premium
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      suggestion.vehicle_brand,
      suggestion.vehicle_model,
      null, // variant - not provided in suggestion
      suggestion.vehicle_year || new Date().getFullYear(),
      suggestion.battery_capacity || 50.0, // default 50 kWh if not provided
      (suggestion.battery_capacity || 50.0) * 0.9, // usable capacity (90% of total)
      18.0, // default consumption - admin can edit later
      100.0, // default DC charging - admin can edit later
      11.0, // default AC charging - admin can edit later
      0 // not premium by default
    ).run()
    
    console.log('[APPROVE SUGGESTION] Vehicle inserted:', insertResult)
    
    // Update suggestion status
    await DB.prepare(`
      UPDATE vehicle_suggestions SET status = 'added', updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(id).run()
    
    return c.json({ 
      success: true, 
      message: 'Suggestion approved and vehicle added to database',
      vehicle_id: insertResult.meta.last_row_id,
      note: 'Default values used for missing specs - please update vehicle details if needed'
    })
  } catch (error) {
    console.error('[APPROVE SUGGESTION] Error:', error)
    return c.json({ success: false, error: 'Failed to approve suggestion: ' + (error instanceof Error ? error.message : 'Unknown error') }, 500)
  }
})

// Reject vehicle suggestion
app.post('/api/admin/suggestions/:id/reject', authMiddleware, requireRole(['admin']), async (c) => {
  const { DB } = c.env
  const id = c.req.param('id')
  
  try {
    console.log('[REJECT SUGGESTION] ID:', id)
    
    const result = await DB.prepare(`
      UPDATE vehicle_suggestions SET status = 'rejected', updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(id).run()
    
    console.log('[REJECT SUGGESTION] Result:', result)
    
    return c.json({ success: true, message: 'Suggestion rejected' })
  } catch (error) {
    console.error('[REJECT SUGGESTION] Error:', error)
    return c.json({ success: false, error: 'Failed to reject suggestion: ' + (error instanceof Error ? error.message : 'Unknown error') }, 500)
  }
})

// Get all users (admin only)
app.get('/api/admin/users', authMiddleware, authMiddleware, requireRole(['admin']), async (c) => {
  const { DB } = c.env
  
  try {
    const { results } = await DB.prepare(`
      SELECT id, email, first_name, last_name, role, created_at 
      FROM users 
      ORDER BY created_at DESC
    `).all()
    
    return c.json({ success: true, users: results })
  } catch (error) {
    return c.json({ success: false, error: 'Failed to fetch users' }, 500)
  }
})

// Get user detail (admin only)
app.get('/api/admin/users/:id/detail', authMiddleware, requireRole(['admin']), async (c) => {
  const { DB, MOLLIE_API_KEY } = c.env
  const userId = c.req.param('id')
  
  try {
    // Get user basic info
    const user = await DB.prepare(`
      SELECT id, email, first_name, last_name, role, created_at, updated_at,
             mollie_customer_id, mollie_subscription_id, subscription_status, subscription_end_date
      FROM users WHERE id = ?
    `).bind(userId).first()
    
    if (!user) {
      return c.json({ success: false, error: 'User not found' }, 404)
    }
    
    // Get usage statistics
    const stats = {
      totalCalculations: 0,
      totalComparisons: 0,
      totalFavorites: 0,
      totalSuggestions: 0,
      lastActivity: null
    }
    
    // Count calculations
    const calcCount = await DB.prepare(`
      SELECT COUNT(*) as count FROM calculation_history WHERE user_id = ?
    `).bind(userId).first()
    stats.totalCalculations = calcCount?.count || 0
    
    // Count comparisons
    const compCount = await DB.prepare(`
      SELECT COUNT(*) as count FROM comparisons WHERE user_id = ?
    `).bind(userId).first()
    stats.totalComparisons = compCount?.count || 0
    
    // Count favorites
    const favCount = await DB.prepare(`
      SELECT COUNT(*) as count FROM favorites WHERE user_id = ?
    `).bind(userId).first()
    stats.totalFavorites = favCount?.count || 0
    
    // Count vehicle suggestions
    const suggCount = await DB.prepare(`
      SELECT COUNT(*) as count FROM vehicle_suggestions WHERE user_id = ?
    `).bind(userId).first()
    stats.totalSuggestions = suggCount?.count || 0
    
    // Get last activity (most recent calculation or comparison)
    const lastCalc = await DB.prepare(`
      SELECT created_at FROM calculation_history 
      WHERE user_id = ? 
      ORDER BY created_at DESC LIMIT 1
    `).bind(userId).first()
    
    const lastComp = await DB.prepare(`
      SELECT created_at FROM comparisons 
      WHERE user_id = ? 
      ORDER BY created_at DESC LIMIT 1
    `).bind(userId).first()
    
    if (lastCalc || lastComp) {
      const calcDate = lastCalc?.created_at ? new Date(lastCalc.created_at).getTime() : 0
      const compDate = lastComp?.created_at ? new Date(lastComp.created_at).getTime() : 0
      stats.lastActivity = calcDate > compDate ? lastCalc.created_at : lastComp?.created_at
    }
    
    // Get favorite vehicles (top 5)
    const favoriteVehicles = await DB.prepare(`
      SELECT v.id, v.make, v.model, v.variant, v.year, f.created_at
      FROM favorites f
      JOIN vehicles v ON f.vehicle_id = v.id
      WHERE f.user_id = ?
      ORDER BY f.created_at DESC
      LIMIT 5
    `).bind(userId).all()
    
    // Get vehicle suggestions submitted by user
    const userSuggestions = await DB.prepare(`
      SELECT id, vehicle_brand, vehicle_model, vehicle_year, status, created_at, updated_at
      FROM vehicle_suggestions
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 10
    `).bind(userId).all()
    
    // Get payment history from Mollie (if customer exists)
    let paymentHistory = []
    
    if (user.mollie_customer_id && MOLLIE_API_KEY) {
      try {
        const paymentsResponse = await fetch(
          `https://api.mollie.com/v2/customers/${user.mollie_customer_id}/payments?limit=50`,
          {
            headers: {
              'Authorization': `Bearer ${MOLLIE_API_KEY}`,
              'Content-Type': 'application/json'
            }
          }
        )
        
        if (paymentsResponse.ok) {
          const paymentsData = await paymentsResponse.json()
          paymentHistory = paymentsData._embedded?.payments || []
          
          // Format payment history
          paymentHistory = paymentHistory.map((payment: any) => ({
            id: payment.id,
            amount: payment.amount.value,
            currency: payment.amount.currency,
            status: payment.status,
            description: payment.description,
            method: payment.method,
            createdAt: payment.createdAt,
            paidAt: payment.paidAt,
            failedAt: payment.failedAt,
            checkoutUrl: payment._links?.checkout?.href
          }))
        }
      } catch (mollieError) {
        console.error('[USER DETAIL] Mollie API error:', mollieError)
        // Don't fail the whole request if Mollie fails
      }
    }
    
    return c.json({ 
      success: true, 
      user,
      stats,
      favoriteVehicles: favoriteVehicles.results || [],
      userSuggestions: userSuggestions.results || [],
      paymentHistory
    })
  } catch (error) {
    console.error('[USER DETAIL] Error:', error)
    return c.json({ success: false, error: 'Failed to fetch user detail' }, 500)
  }
})

// Create new user (admin only)
app.post('/api/admin/users', authMiddleware, requireRole(['admin']), async (c) => {
  const { DB } = c.env
  
  try {
    const { email, password, firstName, lastName, role } = await c.req.json()
    
    // Validate required fields
    if (!email || !password || !firstName || !lastName) {
      return c.json({ success: false, error: 'All fields are required' }, 400)
    }
    
    // Validate role
    const userRole = role || 'free'
    if (!['free', 'premium', 'admin'].includes(userRole)) {
      return c.json({ success: false, error: 'Invalid role' }, 400)
    }
    
    // Check if user already exists
    const existingUser = await DB.prepare(`
      SELECT id FROM users WHERE email = ?
    `).bind(email).first()
    
    if (existingUser) {
      return c.json({ success: false, error: 'User with this email already exists' }, 409)
    }
    
    // Hash password
    const encoder = new TextEncoder()
    const data = encoder.encode(password)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const passwordHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
    
    // Create user
    const result = await DB.prepare(`
      INSERT INTO users (email, password_hash, first_name, last_name, role)
      VALUES (?, ?, ?, ?, ?)
    `).bind(email, passwordHash, firstName, lastName, userRole).run()
    
    console.log('[CREATE USER] Created new user:', email, 'with role:', userRole)
    
    return c.json({ 
      success: true, 
      message: 'User created successfully',
      userId: result.meta.last_row_id
    })
  } catch (error) {
    console.error('[CREATE USER] Error:', error)
    return c.json({ success: false, error: 'Failed to create user' }, 500)
  }
})

// Change user role (admin only)
app.post('/api/admin/users/:id/role', authMiddleware, requireRole(['admin']), async (c) => {
  const { DB } = c.env
  const userId = c.req.param('id')
  const { role } = await c.req.json()
  
  if (!['free', 'premium', 'admin'].includes(role)) {
    return c.json({ success: false, error: 'Invalid role' }, 400)
  }
  
  try {
    await DB.prepare(`
      UPDATE users SET role = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(role, userId).run()
    
    console.log('[USER ROLE] Changed user', userId, 'to role', role)
    
    return c.json({ success: true, message: 'User role updated' })
  } catch (error) {
    console.error('[USER ROLE] Error:', error)
    return c.json({ success: false, error: 'Failed to update user role' }, 500)
  }
})

// Delete user (admin only)
app.delete('/api/admin/users/:id', authMiddleware, requireRole(['admin']), async (c) => {
  const { DB } = c.env
  const userId = c.req.param('id')
  
  try {
    // Check if user is admin
    const user = await DB.prepare('SELECT role FROM users WHERE id = ?').bind(userId).first()
    
    if (!user) {
      return c.json({ success: false, error: 'User not found' }, 404)
    }
    
    if (user.role === 'admin') {
      return c.json({ success: false, error: 'Cannot delete admin users' }, 403)
    }
    
    // Delete user
    await DB.prepare('DELETE FROM users WHERE id = ?').bind(userId).run()
    
    console.log('[USER DELETE] Deleted user', userId)
    
    return c.json({ success: true, message: 'User deleted successfully' })
  } catch (error) {
    console.error('[USER DELETE] Error:', error)
    return c.json({ success: false, error: 'Failed to delete user' }, 500)
  }
})

// Update vehicle (admin only)
app.put('/api/admin/vehicles/:id', authMiddleware, requireRole(['admin']), async (c) => {
  const { DB } = c.env
  const id = c.req.param('id')
  
  try {
    const body = await c.req.json()
    
    console.log('[UPDATE VEHICLE] ID:', id, 'Data:', body)
    
    // Validate required fields
    if (!body.make || !body.model || !body.year || !body.battery_capacity_kwh || 
        !body.usable_capacity_kwh || !body.avg_consumption_kwh_per_100km || 
        !body.max_dc_charging_kw || !body.max_ac_charging_kw) {
      return c.json({ success: false, error: 'Missing required fields' }, 400)
    }
    
    const result = await DB.prepare(`
      UPDATE vehicles SET
        make = ?,
        model = ?,
        variant = ?,
        year = ?,
        battery_capacity_kwh = ?,
        usable_capacity_kwh = ?,
        avg_consumption_kwh_per_100km = ?,
        max_dc_charging_kw = ?,
        max_ac_charging_kw = ?,
        is_premium = ?
      WHERE id = ?
    `).bind(
      body.make,
      body.model,
      body.variant || null,
      body.year,
      body.battery_capacity_kwh,
      body.usable_capacity_kwh,
      body.avg_consumption_kwh_per_100km,
      body.max_dc_charging_kw,
      body.max_ac_charging_kw,
      body.is_premium || 0,
      id
    ).run()
    
    console.log('[UPDATE VEHICLE] Result:', result)
    
    if (result.meta.changes === 0) {
      return c.json({ success: false, error: 'Vehicle not found' }, 404)
    }
    
    return c.json({ success: true, message: 'Vehicle updated successfully' })
  } catch (error) {
    console.error('[UPDATE VEHICLE] Error:', error)
    return c.json({ success: false, error: 'Failed to update vehicle: ' + (error instanceof Error ? error.message : 'Unknown error') }, 500)
  }
})

// Delete vehicle (admin only)
app.delete('/api/admin/vehicles/:id', authMiddleware, requireRole(['admin']), async (c) => {
  const { DB } = c.env
  const id = c.req.param('id')
  
  try {
    await DB.prepare('DELETE FROM vehicles WHERE id = ?').bind(id).run()
    return c.json({ success: true, message: 'Vehicle deleted' })
  } catch (error) {
    return c.json({ success: false, error: 'Failed to delete vehicle' }, 500)
  }
})

// ===== MOLLIE PAYMENT ENDPOINTS =====

// Create Mollie payment (requires authentication)
app.post('/api/mollie/create-payment', authMiddleware, async (c) => {
  const { DB, MOLLIE_API_KEY } = c.env
  const user = c.get('user')
  
  try {
    // Get user data
    const userData = await DB.prepare(`
      SELECT id, email, first_name, last_name, role, mollie_customer_id
      FROM users WHERE id = ?
    `).bind(user.userId).first()
    
    if (!userData) {
      return c.json({ success: false, error: 'User not found' }, 404)
    }
    
    // Check if already premium
    if (userData.role === 'premium') {
      return c.json({ success: false, error: 'Already premium subscriber' }, 400)
    }
    
    // Create or get Mollie customer
    let customerId = userData.mollie_customer_id
    
    if (!customerId) {
      // Create new Mollie customer
      const customerResponse = await fetch('https://api.mollie.com/v2/customers', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${MOLLIE_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: `${userData.first_name} ${userData.last_name}`,
          email: userData.email,
          metadata: {
            userId: userData.id.toString()
          }
        })
      })
      
      if (!customerResponse.ok) {
        const error = await customerResponse.text()
        console.error('Mollie customer creation failed:', error)
        return c.json({ success: false, error: 'Failed to create customer' }, 500)
      }
      
      const customerData = await customerResponse.json()
      customerId = customerData.id
      
      // Save customer ID to database
      await DB.prepare(`
        UPDATE users SET mollie_customer_id = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).bind(customerId, userData.id).run()
    }
    
    // Create first payment (€4.99)
    const paymentResponse = await fetch('https://api.mollie.com/v2/payments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${MOLLIE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amount: {
          currency: 'EUR',
          value: '4.99'
        },
        description: 'EV Charge Calculator - Premium Subscription',
        redirectUrl: `${new URL(c.req.url).origin}/account?payment=success`,
        webhookUrl: `${new URL(c.req.url).origin}/api/mollie/webhook`,
        metadata: {
          userId: userData.id.toString(),
          customerId: customerId,
          type: 'subscription_first_payment'
        },
        customerId: customerId,
        sequenceType: 'first'
      })
    })
    
    if (!paymentResponse.ok) {
      const error = await paymentResponse.text()
      console.error('Mollie payment creation failed:', error)
      return c.json({ success: false, error: 'Failed to create payment' }, 500)
    }
    
    const paymentData = await paymentResponse.json()
    
    return c.json({ 
      success: true, 
      checkoutUrl: paymentData._links.checkout.href,
      paymentId: paymentData.id
    })
    
  } catch (error) {
    console.error('Create payment error:', error)
    return c.json({ success: false, error: 'Internal server error' }, 500)
  }
})

// Mollie webhook handler
app.post('/api/mollie/webhook', async (c) => {
  const { DB, MOLLIE_API_KEY } = c.env
  
  try {
    // Get payment ID from webhook
    const body = await c.req.json()
    const paymentId = body.id
    
    console.log('[MOLLIE WEBHOOK] Received webhook for payment:', paymentId)
    
    if (!paymentId) {
      console.error('[MOLLIE WEBHOOK] No payment ID in request body')
      return c.json({ success: false, error: 'No payment ID provided' }, 400)
    }
    
    if (!MOLLIE_API_KEY) {
      console.error('[MOLLIE WEBHOOK] MOLLIE_API_KEY not configured!')
      return c.json({ success: false, error: 'Server configuration error' }, 500)
    }
    
    // Fetch payment details from Mollie
    const paymentResponse = await fetch(`https://api.mollie.com/v2/payments/${paymentId}`, {
      headers: {
        'Authorization': `Bearer ${MOLLIE_API_KEY}`
      }
    })
    
    if (!paymentResponse.ok) {
      const errorText = await paymentResponse.text()
      console.error('[MOLLIE WEBHOOK] Failed to fetch payment from Mollie:', errorText)
      return c.json({ success: false, error: 'Failed to fetch payment' }, 500)
    }
    
    const payment = await paymentResponse.json()
    const userId = payment.metadata?.userId
    
    console.log('[MOLLIE WEBHOOK] Payment status:', payment.status, 'for user:', userId)
    
    if (!userId) {
      console.error('[MOLLIE WEBHOOK] No userId in payment metadata:', JSON.stringify(payment.metadata))
      return c.json({ success: false, error: 'No user ID in metadata' }, 400)
    }
    
    // Handle payment status
    if (payment.status === 'paid') {
      console.log('[MOLLIE WEBHOOK] Processing paid payment for user:', userId)
      // Create subscription for recurring payments
      const customerId = payment.customerId
      
      // Create Mollie subscription
      const subscriptionResponse = await fetch(`https://api.mollie.com/v2/customers/${customerId}/subscriptions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${MOLLIE_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: {
            currency: 'EUR',
            value: '4.99'
          },
          interval: '1 month',
          description: 'EV Charge Calculator - Premium Subscription',
          webhookUrl: `${new URL(c.req.url).origin}/api/mollie/webhook`,
          metadata: {
            userId: userId
          }
        })
      })
      
      let subscriptionId = null
      if (subscriptionResponse.ok) {
        const subscription = await subscriptionResponse.json()
        subscriptionId = subscription.id
        console.log('[MOLLIE WEBHOOK] Subscription created:', subscriptionId)
      } else {
        const errorText = await subscriptionResponse.text()
        console.error('[MOLLIE WEBHOOK] Failed to create subscription:', errorText)
      }
      
      // Update user to premium with subscription details
      const updateResult = await DB.prepare(`
        UPDATE users 
        SET role = 'premium',
            mollie_subscription_id = ?,
            subscription_status = 'active',
            subscription_end_date = datetime('now', '+1 month'),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).bind(subscriptionId, userId).run()
      
      console.log(`[MOLLIE WEBHOOK] User ${userId} upgraded to premium with subscription ${subscriptionId}. Rows affected: ${updateResult.meta?.changes || 0}`)
    } else if (payment.status === 'failed' || payment.status === 'expired' || payment.status === 'canceled') {
      console.log(`Payment ${paymentId} ${payment.status} for user ${userId}`)
    }
    
    return c.text('OK', 200)
    
  } catch (error) {
    console.error('Webhook error:', error)
    return c.json({ success: false, error: 'Webhook processing failed' }, 500)
  }
})

// Cancel subscription endpoint (requires authentication)
app.post('/api/mollie/cancel-subscription', authMiddleware, async (c) => {
  const { DB, MOLLIE_API_KEY } = c.env
  const user = c.get('user')
  
  try {
    // Get user data with subscription
    const userData = await DB.prepare(`
      SELECT id, mollie_customer_id, mollie_subscription_id, subscription_status
      FROM users WHERE id = ?
    `).bind(user.userId).first()
    
    if (!userData || !userData.mollie_subscription_id) {
      return c.json({ success: false, error: 'No active subscription found' }, 404)
    }
    
    // Cancel subscription in Mollie
    const cancelResponse = await fetch(
      `https://api.mollie.com/v2/customers/${userData.mollie_customer_id}/subscriptions/${userData.mollie_subscription_id}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${MOLLIE_API_KEY}`
        }
      }
    )
    
    if (!cancelResponse.ok) {
      const error = await cancelResponse.text()
      console.error('Failed to cancel Mollie subscription:', error)
      return c.json({ success: false, error: 'Failed to cancel subscription' }, 500)
    }
    
    // Update database - keep premium until end date
    await DB.prepare(`
      UPDATE users 
      SET subscription_status = 'canceled',
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(userData.id).run()
    
    return c.json({ 
      success: true, 
      message: 'Subscription canceled. Premium access remains until end of billing period.' 
    })
    
  } catch (error) {
    console.error('Cancel subscription error:', error)
    return c.json({ success: false, error: 'Internal server error' }, 500)
  }
})

// Downgrade admin/premium account to free
app.post('/api/account/downgrade-to-free', authMiddleware, async (c) => {
  const { DB } = c.env
  const user = c.get('user')
  
  try {
    // Update user role to free and clear subscription data
    await DB.prepare(`
      UPDATE users 
      SET role = 'free',
          mollie_customer_id = NULL,
          mollie_subscription_id = NULL,
          subscription_status = NULL,
          subscription_end_date = NULL,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(user.userId).run()
    
    console.log('[DOWNGRADE] User', user.userId, 'downgraded to free account')
    
    return c.json({ 
      success: true, 
      message: 'Account downgraded to free successfully' 
    })
  } catch (error) {
    console.error('[DOWNGRADE] Error:', error)
    return c.json({ success: false, error: 'Failed to downgrade account' }, 500)
  }
})

// Calculate charging speed
app.post('/api/calculate', async (c) => {
  const { DB } = c.env
  const { vehicleId, chargerPowerKw, startSoc = 20, endSoc = 80, electricityPrice = 0.30 } = await c.req.json()
  
  try {
    // Get vehicle data
    const vehicle = await DB.prepare(`
      SELECT * FROM vehicles WHERE id = ?
    `).bind(vehicleId).first()
    
    if (!vehicle) {
      return c.json({ success: false, error: 'Vehicle not found' }, 404)
    }
    
    // Calculate charging speed in km/h
    const consumption = vehicle.avg_consumption_kwh_per_100km
    const effectiveChargerPower = Math.min(
      chargerPowerKw,
      vehicle.max_dc_charging_kw || chargerPowerKw
    )
    
    // Use middle SOC for curve calculation if charging curve available
    const middleSoc = (startSoc + endSoc) / 2
    let effectivePower = effectiveChargerPower
    
    if (vehicle.charging_curve_data) {
      try {
        const curveData = JSON.parse(vehicle.charging_curve_data)
        if (curveData.curve && Array.isArray(curveData.curve)) {
          // Find the appropriate power based on middle SOC
          for (let i = 0; i < curveData.curve.length - 1; i++) {
            const current = curveData.curve[i]
            const next = curveData.curve[i + 1]
            if (middleSoc >= current.soc && middleSoc < next.soc) {
              // Linear interpolation
              const socRange = next.soc - current.soc
              const powerRange = next.kw - current.kw
              const socOffset = middleSoc - current.soc
              const interpolatedPower = current.kw + (powerRange * socOffset / socRange)
              effectivePower = Math.min(effectiveChargerPower, interpolatedPower)
              break
            }
          }
        }
      } catch (e) {
        console.error('Error parsing charging curve:', e)
      }
    }
    
    // Calculate km/h: (kW / (kWh/100km)) * 100
    const chargingSpeedKmh = (effectivePower / consumption) * 100
    
    // Calculate time to charge from startSoc to endSoc
    const batteryCapacity = vehicle.usable_capacity_kwh
    const socDelta = (endSoc - startSoc) / 100
    const chargeAmount = batteryCapacity * socDelta
    const chargingTimeHours = chargeAmount / effectivePower
    const chargingTimeMinutes = Math.round(chargingTimeHours * 60)
    
    // Format charging time as "Xh Ym" or "Xm"
    const hours = Math.floor(chargingTimeMinutes / 60)
    const minutes = chargingTimeMinutes % 60
    const chargingTimeFormatted = hours > 0 
      ? `${hours}h ${minutes}m` 
      : `${minutes}m`
    
    // Calculate range added per hour
    const rangePerHour = chargingSpeedKmh
    
    // Cost calculations
    const energyUsed = parseFloat(chargeAmount.toFixed(2))
    const totalCost = (energyUsed * electricityPrice).toFixed(2)
    const costPerHour = (effectivePower * electricityPrice).toFixed(2)
    const costPer100km = (consumption * electricityPrice).toFixed(2)
    
    const result = {
      success: true,
      calculation: {
        vehicleMake: vehicle.make,
        vehicleModel: vehicle.model,
        chargerPowerKw: chargerPowerKw,
        effectivePowerKw: parseFloat(effectivePower.toFixed(1)),
        chargingSpeedKmh: Math.round(chargingSpeedKmh),
        consumption: consumption,
        batteryCapacity: batteryCapacity,
        chargingTime: chargingTimeFormatted,
        chargingTimeMinutes: chargingTimeMinutes,
        rangePerHour: Math.round(rangePerHour),
        startSoc: startSoc,
        endSoc: endSoc,
        energyUsed: energyUsed,
        totalCost: `€${totalCost}`,
        costPerHour: `€${costPerHour}/h`,
        costPer100km: `€${costPer100km}`,
        electricityPrice: electricityPrice
      }
    }
    
    return c.json(result)
  } catch (error) {
    console.error('Calculation error:', error)
    return c.json({ success: false, error: 'Calculation failed' }, 500)
  }
})

// Compare multiple vehicles
app.post('/api/compare', async (c) => {
  const { DB } = c.env
  const { vehicleIds, chargerPowerKw, startSoc = 20, endSoc = 80, electricityPrice = 0.30 } = await c.req.json()
  
  if (!Array.isArray(vehicleIds) || vehicleIds.length < 2) {
    return c.json({ success: false, error: 'At least 2 vehicles required for comparison' }, 400)
  }
  
  try {
    const placeholders = vehicleIds.map(() => '?').join(',')
    const query = `SELECT * FROM vehicles WHERE id IN (${placeholders})`
    
    const { results } = await DB.prepare(query).bind(...vehicleIds).all()
    
    const comparisons = results.map((vehicle: any) => {
      const consumption = vehicle.avg_consumption_kwh_per_100km
      const effectivePower = Math.min(
        chargerPowerKw,
        vehicle.max_dc_charging_kw || chargerPowerKw
      )
      const chargingSpeedKmh = (effectivePower / consumption) * 100
      
      // Calculate charging time based on SOC range
      const batteryCapacity = vehicle.usable_capacity_kwh
      const socDelta = (endSoc - startSoc) / 100
      const chargeAmount = batteryCapacity * socDelta
      const chargingTimeHours = chargeAmount / effectivePower
      const chargingTimeMinutes = Math.round(chargingTimeHours * 60)
      
      // Format charging time
      const hours = Math.floor(chargingTimeMinutes / 60)
      const minutes = chargingTimeMinutes % 60
      const chargingTimeFormatted = hours > 0 
        ? `${hours}h ${minutes}m` 
        : `${minutes}m`
      
      // Calculate range added per hour
      const rangePerHour = chargingSpeedKmh
      
      // Cost calculations
      const energyUsed = parseFloat(chargeAmount.toFixed(2))
      const totalCost = (energyUsed * electricityPrice).toFixed(2)
      const costPer100km = (consumption * electricityPrice).toFixed(2)
      
      return {
        vehicleId: vehicle.id,
        make: vehicle.make,
        model: vehicle.model,
        variant: vehicle.variant,
        chargingSpeedKmh: Math.round(chargingSpeedKmh),
        effectivePowerKw: parseFloat(effectivePower.toFixed(1)),
        consumption: consumption,
        batteryCapacity: batteryCapacity,
        chargingTime: chargingTimeFormatted,
        chargingTimeMinutes: chargingTimeMinutes,
        rangePerHour: Math.round(rangePerHour),
        energyUsed: energyUsed,
        totalCost: `€${totalCost}`,
        costPer100km: `€${costPer100km}`
      }
    })
    
    // Sort by charging speed descending
    comparisons.sort((a, b) => b.chargingSpeedKmh - a.chargingSpeedKmh)
    
    return c.json({
      success: true,
      comparisons,
      chargerPowerKw,
      startSoc,
      endSoc,
      electricityPrice
    })
  } catch (error) {
    return c.json({ success: false, error: 'Comparison failed' }, 500)
  }
})

// Get subscription tiers info
app.get('/api/subscription-tiers', (c) => {
  return c.json({
    success: true,
    tiers: [
      {
        id: 'free',
        name: 'Free',
        price: 0,
        features: [
          '39 popular EV models',
          'Basic charging calculator',
          'DC & AC charging support',
          'Real-world verbruiksdata'
        ]
      },
      {
        id: 'premium',
        name: 'Premium',
        price: 4.99,
        period: 'month',
        features: [
          'Alle Free features',
          '137+ EV modellen (alle merken)',
          'Access to premium vehicles',
          'All brands and variants',
          'New vehicles available first',
          'Priority support'
        ],
        popular: true,
        badge: 'POPULAIRSTE KEUZE'
      }
    ]
  })
})

// ============================================
// MAIN APP ROUTES
// ============================================
// Account settings page
app.get('/account', authMiddleware, async (c) => {
  const user = c.get('user')
  const { DB } = c.env
  
  // Fetch full user data including subscription details
  const userData = await DB.prepare(`
    SELECT id, email, first_name, last_name, role, created_at, 
           mollie_customer_id, mollie_subscription_id, subscription_status, subscription_end_date
    FROM users WHERE id = ?
  `).bind(user.userId).first()
  
  return c.html(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Account Settings - EV Charge</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
</head>
<body class="bg-gray-50">
    <!-- Navigation -->
    <nav class="bg-white shadow-sm border-b border-gray-200">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between items-center h-14">
                <a href="/app" class="flex items-center space-x-3 cursor-pointer hover:opacity-80 transition-opacity">
                    <i class="fas fa-bolt text-2xl text-blue-600"></i>
                    <span class="text-lg font-semibold text-gray-900">EV Charge</span>
                </a>
                <a href="/app" class="text-sm text-gray-600 hover:text-gray-900">
                    <i class="fas fa-arrow-left mr-2"></i>Back to Calculator
                </a>
            </div>
        </div>
    </nav>
    
    <!-- Content -->
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 class="text-3xl font-semibold text-gray-900 mb-8">Account Settings</h1>
        
        <!-- Account Info Card -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <h2 class="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <i class="fas fa-user-circle mr-3 text-blue-600"></i>
                Account Information
            </h2>
            <div class="space-y-3">
                <div class="flex justify-between items-center py-3 border-b border-gray-100">
                    <span class="text-sm text-gray-600">First Name</span>
                    <span class="text-sm font-medium text-gray-900">${userData?.first_name || 'Niet ingesteld'}</span>
                </div>
                <div class="flex justify-between items-center py-3 border-b border-gray-100">
                    <span class="text-sm text-gray-600">Name</span>
                    <span class="text-sm font-medium text-gray-900">${userData?.last_name || 'Niet ingesteld'}</span>
                </div>
                <div class="flex justify-between items-center py-3 border-b border-gray-100">
                    <span class="text-sm text-gray-600">Email</span>
                    <span class="text-sm font-medium text-gray-900">${userData?.email}</span>
                </div>
                <div class="flex justify-between items-center py-3">
                    <span class="text-sm text-gray-600">Account Created</span>
                    <span class="text-sm font-medium text-gray-900">${userData?.created_at ? new Date(userData.created_at).toLocaleDateString('nl-NL', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Onbekend'}</span>
                </div>
            </div>
        </div>
        
        <!-- Subscription Card -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <h2 class="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <i class="fas fa-crown mr-3 text-yellow-600"></i>
                Subscription
            </h2>
            <div class="space-y-4">
                <div class="flex items-center justify-between py-4 px-4 bg-${userData?.role === 'free' ? 'blue' : userData?.role === 'premium' ? 'yellow' : 'purple'}-50 rounded-lg border border-${userData?.role === 'free' ? 'blue' : userData?.role === 'premium' ? 'yellow' : 'purple'}-200">
                    <div>
                        <div class="text-sm font-medium text-gray-900">Huidig Subscription</div>
                        <div class="text-2xl font-semibold text-gray-900 mt-1">
                          ${userData?.role === 'free' ? 'Free' : userData?.role === 'premium' ? 'Premium' : 'Admin'}
                        </div>
                        ${userData?.role === 'premium' && userData?.subscription_end_date ? `
                          <div class="text-xs text-gray-600 mt-1">
                            ${userData?.subscription_status === 'canceled' ? 'Expires on' : 'Renews on'}: ${new Date(userData.subscription_end_date).toLocaleDateString('nl-NL')}
                          </div>
                        ` : ''}
                    </div>
                    ${userData?.role === 'free' ? `
                    <button onclick="window.location.href='/app'" class="px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-full font-semibold hover:opacity-90 transition-opacity">
                        <i class="fas fa-arrow-up mr-2"></i>Upgrade
                    </button>
                    ` : userData?.role === 'premium' ? `
                    <div class="text-sm">
                        <i class="fas fa-check-circle text-green-600 mr-2"></i>
                        ${userData?.subscription_status === 'active' ? 'Active' : userData?.subscription_status === 'canceled' ? 'Canceled' : 'Active'}
                    </div>
                    ` : ''}
                </div>
                
                ${userData?.role === 'premium' ? `
                <div class="flex flex-col space-y-3 mt-4">
                  <div class="flex justify-between items-center py-2 border-b border-gray-100">
                    <span class="text-sm text-gray-600">Price</span>
                    <span class="text-sm font-medium text-gray-900">€4.99 / month</span>
                  </div>
                  <div class="flex justify-between items-center py-2 border-b border-gray-100">
                    <span class="text-sm text-gray-600">Payment Method</span>
                    <span class="text-sm font-medium text-gray-900">
                      <i class="fab fa-cc-visa mr-1"></i>Via Mollie
                    </span>
                  </div>
                  <div class="flex justify-between items-center py-2">
                    <span class="text-sm text-gray-600">Status</span>
                    <span class="text-sm font-medium ${userData?.subscription_status === 'active' ? 'text-green-600' : 'text-orange-600'}">
                      ${userData?.subscription_status === 'active' ? 'Active - Auto-renewing' : 'Canceled - Access until end of period'}
                    </span>
                  </div>
                </div>
                
                ${userData?.subscription_status === 'active' && userData?.mollie_subscription_id ? `
                <button onclick="cancelSubscription()" id="cancelSubBtn" class="w-full mt-4 px-4 py-2 bg-white border-2 border-orange-500 text-orange-600 rounded-lg font-semibold hover:bg-orange-50 transition-colors">
                    <i class="fas fa-times-circle mr-2"></i>Subscription Opzeggen
                </button>
                ` : ''}
                ` : userData?.role === 'admin' ? `
                <div class="flex flex-col space-y-3 mt-4">
                  <div class="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <p class="text-sm text-purple-900 font-medium mb-2">
                      <i class="fas fa-shield-alt mr-2"></i>Admin Privileges
                    </p>
                    <p class="text-xs text-purple-700">
                      Je hebt volledige admin access tot alle features, users en vehicles.
                    </p>
                  </div>
                  <button onclick="downgradeToFree()" id="downgradeBtn" class="w-full mt-4 px-4 py-2 bg-white border-2 border-gray-500 text-gray-600 rounded-lg font-semibold hover:bg-gray-50 transition-colors">
                    <i class="fas fa-arrow-down mr-2"></i>Downgrade to Free Account
                  </button>
                </div>
                ` : ''}
                
                <p class="text-sm text-gray-600 mt-4">
                    <i class="fas fa-info-circle mr-2"></i>
                    ${userData?.role === 'free' ? 'Upgrade to Premium voor access tot 137+ vehicles en alle merken.' : userData?.role === 'premium' ? 'Je premium subscription geeft je access tot alle vehicles en features.' : 'Als admin heb je volledige access tot alle functies.'}
                </p>
            </div>
        </div>
        
        <!-- Danger Zone -->
        <div class="bg-white rounded-xl shadow-sm border border-red-200 p-6">
            <h2 class="text-xl font-semibold text-red-600 mb-4 flex items-center">
                <i class="fas fa-exclamation-triangle mr-3"></i>
                Danger Zone
            </h2>
            <div class="space-y-3">
                <button onclick="logout()" class="w-full px-4 py-3 bg-white border-2 border-red-600 text-red-600 rounded-lg font-semibold hover:bg-red-50 transition-colors">
                    <i class="fas fa-sign-out-alt mr-2"></i>Logout
                </button>
            </div>
        </div>
    </div>
    
    <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
    <script>
        // Configure axios to send cookies
        axios.defaults.withCredentials = true;
        
        async function logout() {
            await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
            window.location.href = '/';
        }
        
        async function downgradeToFree() {
            if (!confirm('Are you sure you want to give up your admin rights and downgrade to a free account? You will need to log in again.')) {
                return;
            }
            
            const btn = document.getElementById('downgradeBtn');
            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Downgraden...';
            
            try {
                const response = await axios.post('/api/account/downgrade-to-free');
                
                if (response.data.success) {
                    alert('Account succesvol gedowngrade naar Free. Je wordt uitgelogd.');
                    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
                    window.location.href = '/';
                } else {
                    alert('Er ging iets mis: ' + (response.data.error || 'Onbekende fout'));
                    btn.disabled = false;
                    btn.innerHTML = '<i class="fas fa-arrow-down mr-2"></i>Downgrade to Free Account';
                }
            } catch (error) {
                console.error('Downgrade error:', error);
                alert('Er ging iets mis bij het downgraden van je account');
                btn.disabled = false;
                btn.innerHTML = '<i class="fas fa-arrow-down mr-2"></i>Downgrade to Free Account';
            }
        }
        
        async function cancelSubscription() {
            if (!confirm('Weet je zeker dat je je Premium subscription wilt opzeggen? Je behoudt access tot het einde van de huidige periode.')) {
                return;
            }
            
            const btn = document.getElementById('cancelSubBtn');
            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Opzeggen...';
            
            try {
                const response = await axios.post('/api/mollie/cancel-subscription');
                
                if (response.data.success) {
                    alert('Subscription canceled successfully. Je behoudt Premium access tot het einde van de periode.');
                    window.location.reload();
                } else {
                    alert('Er ging iets mis: ' + (response.data.error || 'Onbekende fout'));
                    btn.disabled = false;
                    btn.innerHTML = '<i class="fas fa-times-circle mr-2"></i>Subscription Opzeggen';
                }
            } catch (error) {
                console.error('Cancel subscription error:', error);
                alert('Er ging iets mis bij het opzeggen van je subscription');
                btn.disabled = false;
                btn.innerHTML = '<i class="fas fa-times-circle mr-2"></i>Subscription Opzeggen';
            }
        }
    </script>
</body>
</html>
  `)
})

// Token Refresh Page - Simple page to refresh JWT token with latest DB role
app.get('/refresh-token', (c) => {
  return c.html(`
<!DOCTYPE html>
<html lang="nl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Token Refresh</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
</head>
<body class="bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen flex items-center justify-center p-4">
    <div class="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        <div class="text-center mb-6">
            <i class="fas fa-sync-alt text-6xl text-blue-600 mb-4 animate-pulse"></i>
            <h1 class="text-3xl font-bold text-gray-900 mb-2">Admin Token Refresh</h1>
            <p class="text-gray-600">Update je JWT token met je nieuwe admin role</p>
        </div>

        <div id="status" class="mb-6 p-4 rounded-lg hidden">
            <div id="statusIcon" class="text-4xl mb-2"></div>
            <div id="statusMessage" class="font-semibold"></div>
            <div id="statusDetails" class="text-sm mt-2"></div>
        </div>

        <button 
            id="refreshBtn" 
            onclick="refreshToken()"
            class="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl transform hover:scale-105">
            <i class="fas fa-sync-alt mr-2"></i>
            Refresh Token Refresh Token & Get Admin Access Get Admin Access
        </button>

        <div class="mt-6 text-center text-sm text-gray-600">
            <p>⚠️ Je moet ingelogd zijn op deze site</p>
            <p class="mt-2">Na refresh krijg je direct access tot <code>/admin</code></p>
        </div>
    </div>

    <script>
        axios.defaults.withCredentials = true;

        async function refreshToken() {
            const btn = document.getElementById('refreshBtn');
            const status = document.getElementById('status');
            const statusIcon = document.getElementById('statusIcon');
            const statusMessage = document.getElementById('statusMessage');
            const statusDetails = document.getElementById('statusDetails');

            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Token wordt vernieuwd...';

            status.classList.remove('hidden', 'bg-green-50', 'bg-red-50', 'bg-yellow-50');
            status.classList.add('bg-blue-50');
            statusIcon.innerHTML = '<i class="fas fa-spinner fa-spin text-blue-600"></i>';
            statusMessage.textContent = 'Even geduld...';
            statusMessage.className = 'font-semibold text-blue-900';
            statusDetails.textContent = 'Je token wordt vernieuwd met de laatste database role';

            try {
                const response = await axios.post('/api/auth/refresh-token');

                if (response.data.success) {
                    status.classList.remove('bg-blue-50');
                    status.classList.add('bg-green-50');
                    statusIcon.innerHTML = '<i class="fas fa-check-circle text-green-600"></i>';
                    statusMessage.textContent = '✅ Token succesvol vernieuwd!';
                    statusMessage.className = 'font-semibold text-green-900';
                    
                    const user = response.data.user;
                    statusDetails.innerHTML = \`
                        <strong>Name:</strong> \${user.firstName} \${user.lastName}<br>
                        <strong>Email:</strong> \${user.email}<br>
                        <strong>Role:</strong> <span class="font-bold text-green-700">\${user.role}</span><br>
                        <br>
                        <strong>✨ Je hebt nu \${user.role} access!</strong>
                    \`;

                    btn.disabled = false;
                    btn.innerHTML = '<i class="fas fa-shield-alt mr-2"></i>To Admin Dashboard';
                    btn.onclick = () => {
                        window.location.href = '/admin';
                    };

                } else {
                    throw new Error(response.data.error || 'Unknown error');
                }

            } catch (error) {
                console.error('Refresh error:', error);
                
                status.classList.remove('bg-blue-50');
                status.classList.add('bg-red-50');
                statusIcon.innerHTML = '<i class="fas fa-times-circle text-red-600"></i>';
                statusMessage.textContent = '❌ Token refresh mislukt';
                statusMessage.className = 'font-semibold text-red-900';

                if (error.response?.status === 401) {
                    statusDetails.innerHTML = \`
                        <strong>Je bent niet ingelogd</strong><br>
                        Log eerst in op <a href="/" class="text-blue-600 hover:underline">de homepage</a>
                    \`;
                } else {
                    statusDetails.textContent = error.response?.data?.error || error.message || 'Er ging iets mis';
                }

                btn.disabled = false;
                btn.innerHTML = '<i class="fas fa-sync-alt mr-2"></i>Probeer Opnieuw';
            }
        }
    </script>
</body>
</html>
  `)
})

// Debug endpoint to check token and role
app.get('/debug-token', authMiddleware, async (c) => {
  const user = c.get('user')
  const { DB } = c.env
  
  // Fetch full user data from DB
  const dbUser = await DB.prepare(
    'SELECT id, email, first_name, last_name, role, created_at, updated_at FROM users WHERE id = ?'
  ).bind(user.userId).first()
  
  return c.json({
    jwtPayload: user,
    databaseUser: dbUser,
    match: user.role === dbUser?.role,
    issue: user.role !== dbUser?.role ? `JWT has '${user.role}' but DB has '${dbUser?.role}'` : 'Everything matches!'
  })
})

// Admin Dashboard
app.get('/admin', adminMiddleware, async (c) => {
  const user = c.get('user')
  const { DB } = c.env
  
  // Fetch stats
  const stats = {
    totalUsers: await DB.prepare('SELECT COUNT(*) as count FROM users').first(),
    premiumUsers: await DB.prepare('SELECT COUNT(*) as count FROM users WHERE role = ?').bind('premium').first(),
    pendingSuggestions: await DB.prepare('SELECT COUNT(*) as count FROM vehicle_suggestions WHERE status = ?').bind('pending').first(),
    totalVehicles: await DB.prepare('SELECT COUNT(*) as count FROM vehicles').first()
  }
  
  console.log('[ADMIN DASHBOARD] Stats:', JSON.stringify(stats))
  
  return c.html(`
<!DOCTYPE html>
<html lang="nl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Dashboard - EV Charge</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
</head>
<body class="bg-gray-50">
    <!-- Navigation -->
    <nav class="bg-white shadow-sm border-b border-gray-200">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between items-center h-14">
                <a href="/" class="flex items-center space-x-3 cursor-pointer hover:opacity-80 transition-opacity">
                    <i class="fas fa-bolt text-2xl text-blue-600"></i>
                    <span class="text-lg font-semibold text-gray-900">EV Charge</span>
                    <span class="px-3 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">ADMIN</span>
                </a>
                <div class="flex items-center space-x-4">
                    <a href="/app" class="text-sm text-gray-600 hover:text-gray-900">
                        <i class="fas fa-calculator mr-2"></i>Calculator
                    </a>
                    <button onclick="logout()" class="text-sm text-red-600 hover:text-red-700">
                        <i class="fas fa-sign-out-alt mr-2"></i>Logout
                    </button>
                </div>
            </div>
        </div>
    </nav>
    
    <!-- Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 class="text-3xl font-semibold text-gray-900 mb-8">Admin Dashboard</h1>
        
        <!-- Stats Cards - KLIKBAAR -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div onclick="switchTab('users')" class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 cursor-pointer hover:shadow-md hover:border-blue-300 transition-all">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-sm text-gray-600 mb-1">Total Users</p>
                        <p class="text-3xl font-semibold text-gray-900">${stats.totalUsers?.count || 0}</p>
                    </div>
                    <i class="fas fa-users text-3xl text-blue-600"></i>
                </div>
            </div>
            
            <div onclick="switchTab('users')" class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 cursor-pointer hover:shadow-md hover:border-yellow-300 transition-all">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-sm text-gray-600 mb-1">Premium Users</p>
                        <p class="text-3xl font-semibold text-gray-900">${stats.premiumUsers?.count || 0}</p>
                    </div>
                    <i class="fas fa-crown text-3xl text-yellow-600"></i>
                </div>
            </div>
            
            <div onclick="switchTab('suggestions')" class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 cursor-pointer hover:shadow-md hover:border-orange-300 transition-all">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-sm text-gray-600 mb-1">Pending Suggestions</p>
                        <p class="text-3xl font-semibold text-gray-900">${stats.pendingSuggestions?.count || 0}</p>
                    </div>
                    <i class="fas fa-clock text-3xl text-orange-600"></i>
                </div>
            </div>
            
            <div onclick="switchTab('vehicles')" class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 cursor-pointer hover:shadow-md hover:border-green-300 transition-all">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-sm text-gray-600 mb-1">Total Vehicles</p>
                        <p class="text-3xl font-semibold text-gray-900">${stats.totalVehicles?.count || 0}</p>
                    </div>
                    <i class="fas fa-car text-3xl text-green-600"></i>
                </div>
            </div>
        </div>
        
        <!-- Tabs Navigation -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
            <div class="border-b border-gray-200">
                <nav class="flex space-x-8 px-6" aria-label="Tabs">
                    <button onclick="switchTab('suggestions')" id="tab-suggestions" class="tab-button border-b-2 border-blue-600 py-4 px-1 text-sm font-medium text-blue-600">
                        <i class="fas fa-inbox mr-2"></i>Vehicle Suggestions
                    </button>
                    <button onclick="switchTab('vehicles')" id="tab-vehicles" class="tab-button border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300">
                        <i class="fas fa-car mr-2"></i>Manage Vehicles
                    </button>
                    <button onclick="switchTab('users')" id="tab-users" class="tab-button border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300">
                        <i class="fas fa-users mr-2"></i>User Management
                    </button>
                </nav>
            </div>
        </div>
        
        <!-- Tab Content: Vehicle Suggestions -->
        <div id="content-suggestions" class="tab-content">
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-xl font-semibold text-gray-900">Vehicle Suggestions</h2>
                    <button onclick="loadSuggestions()" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        <i class="fas fa-sync-alt mr-2"></i>Refresh
                    </button>
                </div>
                <div id="suggestions-list" class="space-y-4">
                    <div class="text-center text-gray-500 py-8">
                        <i class="fas fa-spinner fa-spin text-3xl mb-2"></i>
                        <p>Loading...</p>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Tab Content: Vehicles Management -->
        <div id="content-vehicles" class="tab-content hidden">
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-xl font-semibold text-gray-900">Manage Vehicles</h2>
                    <button onclick="showAddVehicleModal()" class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                        <i class="fas fa-plus mr-2"></i>New Vehicle
                    </button>
                </div>
                
                <!-- Vehicle Search -->
                <div class="mb-6">
                    <div class="relative">
                        <input 
                            type="text" 
                            id="vehicleSearchInput" 
                            placeholder="Search by make, model, variant..." 
                            oninput="filterVehicles(this.value)"
                            class="w-full px-4 py-3 pl-11 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <i class="fas fa-search absolute left-4 top-4 text-gray-400"></i>
                    </div>
                </div>
                
                <div id="vehicles-list" class="space-y-4">
                    <div class="text-center text-gray-500 py-8">
                        <i class="fas fa-spinner fa-spin text-3xl mb-2"></i>
                        <p>Loading...</p>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Tab Content: User Management -->
        <div id="content-users" class="tab-content hidden">
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-xl font-semibold text-gray-900">User Management</h2>
                    <div class="flex gap-3">
                        <button onclick="showAddUserModal()" class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                            <i class="fas fa-user-plus mr-2"></i>Add User
                        </button>
                        <button onclick="loadUsers()" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                            <i class="fas fa-sync-alt mr-2"></i>Refresh
                        </button>
                    </div>
                </div>
                
                <!-- User Search -->
                <div class="mb-6">
                    <div class="relative">
                        <input 
                            type="text" 
                            id="userSearchInput" 
                            placeholder="Search by name or email..." 
                            oninput="filterUsers(this.value)"
                            class="w-full px-4 py-3 pl-11 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <i class="fas fa-search absolute left-4 top-4 text-gray-400"></i>
                    </div>
                </div>
                
                <div id="users-list" class="space-y-4">
                    <div class="text-center text-gray-500 py-8">
                        <i class="fas fa-spinner fa-spin text-3xl mb-2"></i>
                        <p>Loading...</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
    <script src="/static/admin.js"></script>
    <script>
        async function logout() {
            await fetch('/api/auth/logout', { method: 'POST' });
            window.location.href = '/';
        }
        
        function switchTab(tabName) {
            // Update tab buttons
            document.querySelectorAll('.tab-button').forEach(btn => {
                btn.classList.remove('border-blue-600', 'text-blue-600');
                btn.classList.add('border-transparent', 'text-gray-500');
            });
            document.getElementById('tab-' + tabName).classList.remove('border-transparent', 'text-gray-500');
            document.getElementById('tab-' + tabName).classList.add('border-blue-600', 'text-blue-600');
            
            // Update content
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.add('hidden');
            });
            document.getElementById('content-' + tabName).classList.remove('hidden');
            
            // Load data for tab
            if (tabName === 'suggestions') loadSuggestions();
            if (tabName === 'vehicles') loadVehicles();
            if (tabName === 'users') loadUsers();
        }
        
        // Load initial data
        document.addEventListener('DOMContentLoaded', () => {
            loadSuggestions();
        });
    </script>
</body>
</html>
  `)
})

// Main calculator app
app.get('/app', optionalAuthMiddleware, (c) => {
  const user = c.get('user')
  return c.html(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>EV Charge Calculator - Apple-style Clean Experience</title>
    <meta name="description" content="Calculate your EV charging speed and range. Clean calculator with 129 electric vehicles.">
    
    <!-- PWA Meta Tags -->
    <meta name="theme-color" content="#667eea">
    <meta name="mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <meta name="apple-mobile-web-app-title" content="EV Charge">
    <link rel="manifest" href="/manifest.json">
    
    <!-- App Icons -->
    <link rel="icon" type="image/png" sizes="32x32" href="/icons/icon-32x32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="/icons/icon-16x16.png">
    <link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-180x180.png">
    <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152x152.png">
    <link rel="apple-touch-icon" sizes="144x144" href="/icons/icon-144x144.png">
    <link rel="apple-touch-icon" sizes="120x120" href="/icons/icon-120x120.png">
    
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    <script>
      tailwind.config = {
        darkMode: 'class',
        theme: {
          extend: {
            colors: {
              tesla: {
                50: '#f5f5f5',
                100: '#e5e5e5',
                200: '#cccccc',
                300: '#b3b3b3',
                400: '#999999',
                500: '#808080',
                600: '#666666',
                700: '#4d4d4d',
                800: '#333333',
                900: '#1a1a1a',
                950: '#0d0d0d'
              }
            },
            fontFamily: {
              sans: ['Inter', 'system-ui', 'sans-serif']
            }
          }
        }
      }
    </script>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
      
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Inter', 'Segoe UI', sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        background: #f5f5f7 !important;
      }
      
      .tesla-gradient {
        background: linear-gradient(135deg, #007AFF 0%, #5856D6 100%);
      }
      
      .glass {
        background: rgba(255, 255, 255, 0.8);
        backdrop-filter: blur(20px) saturate(180%);
        border: 1px solid rgba(0, 0, 0, 0.06);
        box-shadow: 0 1px 3px rgba(0,0,0,0.05), 0 20px 40px rgba(0,0,0,0.08);
      }
      
      .premium-badge {
        background: linear-gradient(135deg, #FF2D55 0%, #FF6B35 100%);
      }
      
      .animate-fade-in {
        animation: fadeIn 0.5s ease-in;
      }
      
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      
      .animate-slide-up {
        animation: slideUp 0.6s ease-out;
      }
      
      @keyframes slideUp {
        from { opacity: 0; transform: translateY(30px); }
        to { opacity: 1; transform: translateY(0); }
      }
      
      .result-card {
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }
      
      .result-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3);
      }
      
      .premium-blur {
        filter: blur(4px);
        pointer-events: none;
      }
      
      /* Apple iOS-style Range Sliders - Clean & Minimalist */
      input[type="range"] {
        -webkit-appearance: none !important;
        appearance: none !important;
        background: #E5E7EB !important;
        width: 100%;
        height: 6px !important;
        border-radius: 3px !important;
        cursor: pointer;
        outline: none !important;
      }
      
      input[type="range"]::-webkit-slider-track {
        background: transparent !important;
        height: 6px !important;
        border: none !important;
      }
      
      input[type="range"]::-webkit-slider-thumb {
        -webkit-appearance: none !important;
        appearance: none !important;
        width: 28px !important;
        height: 28px !important;
        border-radius: 50% !important;
        background: #FFFFFF !important;
        cursor: grab !important;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15),
                    0 1px 2px rgba(0, 0, 0, 0.1) !important;
        transition: all 0.15s ease !important;
      }
      
      input[type="range"]::-webkit-slider-thumb:hover {
        transform: scale(1.1) !important;
        box-shadow: 0 3px 8px rgba(0, 0, 0, 0.2),
                    0 1px 3px rgba(0, 0, 0, 0.12) !important;
      }
      
      input[type="range"]::-webkit-slider-thumb:active {
        cursor: grabbing !important;
        transform: scale(1.05) !important;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2) !important;
      }
      
      /* Firefox */
      input[type="range"]::-moz-range-track {
        background: #E5E7EB !important;
        height: 6px !important;
        border-radius: 3px !important;
      }
      
      input[type="range"]::-moz-range-thumb {
        width: 28px !important;
        height: 28px !important;
        border-radius: 50% !important;
        background: #FFFFFF !important;
        cursor: grab !important;
        border: none !important;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15),
                    0 1px 2px rgba(0, 0, 0, 0.1) !important;
        transition: all 0.15s ease !important;
      }
      
      input[type="range"]::-moz-range-thumb:hover {
        transform: scale(1.1) !important;
        box-shadow: 0 3px 8px rgba(0, 0, 0, 0.2),
                    0 1px 3px rgba(0, 0, 0, 0.12) !important;
      }
      
      input[type="range"]::-moz-range-thumb:active {
        cursor: grabbing !important;
        transform: scale(1.05) !important;
      }
      
      /* Focus state */
      input[type="range"]:focus {
        outline: none !important;
      }
      
      input[type="range"]:focus::-webkit-slider-thumb {
        box-shadow: 0 3px 8px rgba(0, 0, 0, 0.2),
                    0 1px 3px rgba(0, 0, 0, 0.12),
                    0 0 0 4px rgba(59, 130, 246, 0.1) !important;
      }
      
      input[type="range"]:focus::-moz-range-thumb {
        box-shadow: 0 3px 8px rgba(0, 0, 0, 0.2),
                    0 1px 3px rgba(0, 0, 0, 0.12),
                    0 0 0 4px rgba(59, 130, 246, 0.1) !important;
      }
      
      .charging-curve {
        position: relative;
        height: 200px;
        background: rgba(15, 23, 42, 0.5);
        border-radius: 12px;
        padding: 20px;
      }
      
      /* Autocomplete dropdown styles */
      .autocomplete-item {
        padding: 12px 16px;
        cursor: pointer;
        transition: all 0.2s;
        border-bottom: 1px solid #e5e7eb;
      }
      
      .autocomplete-item:last-child {
        border-bottom: none;
      }
      
      .autocomplete-item:hover,
      .autocomplete-item.active {
        background: #f3f4f6;
      }
      
      .autocomplete-item.premium {
        background: rgba(59, 130, 246, 0.05);
      }
      
      .autocomplete-item.premium:hover {
        background: rgba(59, 130, 246, 0.1);
      }
      
      .autocomplete-item.locked {
        cursor: not-allowed;
        position: relative;
      }
      
      .autocomplete-item.locked:hover {
        background: rgba(234, 179, 8, 0.05);
      }
      
      .animate-fade-in-up {
        animation: fadeInUp 0.3s ease-out forwards;
      }
      
      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      /* Custom scrollbar for autocomplete */
      #autocompleteDropdown::-webkit-scrollbar {
        width: 8px;
      }
      
      #autocompleteDropdown::-webkit-scrollbar-track {
        background: rgba(15, 23, 42, 0.5);
        border-radius: 0 12px 12px 0;
      }
      
      #autocompleteDropdown::-webkit-scrollbar-thumb {
        background: #475569;
        border-radius: 4px;
      }
      
      #autocompleteDropdown::-webkit-scrollbar-thumb:hover {
        background: #64748b;
      }
    </style>
</head>
<body class="bg-gray-50 text-gray-900 min-h-screen">
    <!-- Navigation - Apple Style -->
    <nav class="fixed top-0 left-0 right-0 z-50 glass border-b border-gray-200">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between items-center h-14">
                <a href="/" class="flex items-center space-x-3 cursor-pointer hover:opacity-80 transition-opacity">
                    <i class="fas fa-bolt text-2xl text-blue-600"></i>
                    <span class="text-lg font-semibold text-gray-900">EV Charge</span>
                </a>
                <div class="flex items-center space-x-3">
                    <button id="compareBtn" class="hidden px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-full transition-colors">
                        <i class="fas fa-exchange-alt mr-2"></i>Compare
                    </button>
                    <button id="upgradeBtnNav" class="px-4 py-2 premium-badge text-white text-sm rounded-full hover:opacity-90 transition-opacity">
                        <i class="fas fa-crown mr-2"></i>Upgrade
                    </button>
                    <!-- User Profile (shown when logged in) -->
                    <div id="userProfile" class="hidden flex items-center space-x-3 relative">
                        <button id="userMenuBtn" class="flex items-center space-x-2 px-3 py-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors cursor-pointer">
                            <i class="fas fa-user-circle text-blue-600"></i>
                            <span id="userName" class="text-sm font-medium text-gray-900"></span>
                            <span id="userTier" class="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full"></span>
                            <i class="fas fa-chevron-down text-xs text-gray-500"></i>
                        </button>
                        <!-- Dropdown Menu -->
                        <div id="userDropdown" class="hidden absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50">
                            <div class="py-2">
                                <div class="px-4 py-3 border-b border-gray-100">
                                    <div class="text-sm font-semibold text-gray-900" id="dropdownUserName"></div>
                                    <div class="text-xs text-gray-500" id="dropdownUserEmail"></div>
                                </div>
                                <a href="/account" class="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                                    <i class="fas fa-cog mr-3 text-gray-400"></i>
                                    Account Settings
                                </a>
                                <a href="/account#subscription" class="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                                    <i class="fas fa-crown mr-3 text-yellow-500"></i>
                                    Manage Subscription
                                </a>
                                <a href="/admin" id="adminLink" class="hidden flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-gray-100">
                                    <i class="fas fa-shield-alt mr-3"></i>
                                    Admin Dashboard
                                </a>
                                <button id="logoutBtn" class="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-gray-100">
                                    <i class="fas fa-sign-out-alt mr-3"></i>
                                    Logout
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </nav>

    <!-- Hero Section - Apple Style -->
    <div class="pt-20 pb-8 px-6">
        <div class="max-w-4xl mx-auto text-center">
            <h1 class="text-4xl md:text-5xl font-semibold mb-4 text-gray-900" style="letter-spacing: -0.02em;">
                Calculate your charging speed<br>
                <span class="tesla-gradient bg-clip-text text-transparent">in seconds</span>
            </h1>
            <p class="text-lg text-gray-600 mb-8 font-light">
                Choose your vehicle and discover how many km you can charge per hour
            </p>
            <div class="flex justify-center items-center space-x-6 text-sm text-gray-500">
                <div class="flex items-center">
                    <i class="fas fa-check-circle text-blue-600 mr-2"></i>
                    <span id="vehicleCount">129</span> Vehicles
                </div>
                <div class="flex items-center">
                    <i class="fas fa-check-circle text-blue-600 mr-2"></i>
                    Real-time data
                </div>
                <div class="flex items-center">
                    <i class="fas fa-check-circle text-blue-600 mr-2"></i>
                    Fast calculations
                </div>
            </div>
        </div>
    </div>

    <!-- Calculator Section - Apple Style -->
    <div class="max-w-4xl mx-auto px-6 pb-12">
        <div class="glass rounded-3xl p-6 md:p-10 shadow-xl">
            <!-- Subscription Tier Indicator -->
            <div class="mb-8 flex justify-between items-center">
                <div>
                    <span class="text-sm text-gray-500">Current subscription:</span>
                    <span id="currentTier" class="ml-2 px-3 py-1 bg-gray-100 border border-gray-200 rounded-full text-sm font-medium text-gray-700">Free</span>
                </div>
                <button id="upgradeBtnCalc" class="text-sm text-blue-600 hover:text-blue-700 transition-colors font-medium">
                    <i class="fas fa-arrow-up mr-1"></i>Upgrade
                </button>
            </div>

            <!-- Vehicle Selection with Search -->
            <div class="mb-8">
                <label class="block text-sm font-semibold mb-3 text-gray-900">
                    <i class="fas fa-car mr-2 text-blue-600"></i>Choose your vehicle
                </label>
                <div class="relative">
                    <input 
                        type="text" 
                        id="vehicleSearch" 
                        placeholder="Search your vehicle (e.g. Tesla Model 3, Dacia Spring)" 
                        class="w-full bg-white border border-gray-300 rounded-2xl px-4 py-4 pr-12 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        autocomplete="off"
                    >
                    <i class="fas fa-search absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"></i>
                    
                    <!-- Autocomplete Dropdown -->
                    <div id="autocompleteDropdown" class="hidden absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-2xl shadow-2xl max-h-96 overflow-y-auto">
                        <div id="autocompleteResults" class="py-2">
                            <!-- Results will be populated here -->
                        </div>
                    </div>
                </div>
                
                <!-- Selected Vehicle Display -->
                <div id="selectedVehicleDisplay" class="hidden mt-3 p-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-xl">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center space-x-3">
                            <i class="fas fa-check-circle text-green-400"></i>
                            <div>
                                <div class="font-semibold" id="selectedVehicleName">-</div>
                                <div class="text-xs text-gray-400" id="selectedVehicleSpecs">-</div>
                            </div>
                        </div>
                        <button id="clearVehicleBtn" class="text-gray-500 hover:text-gray-700 transition-colors">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
                
                <div id="premiumVehicleNotice" class="hidden mt-2 p-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-lg">
                    <i class="fas fa-crown text-yellow-400 mr-2"></i>
                    <span class="text-sm">Want access to premium vehicles? <button class="text-blue-400 hover:text-blue-300 font-medium">Upgrade now</button></span>
                </div>
            </div>

            <!-- Charger Power Input - Apple Style -->
            <div class="mb-6">
                <label class="block text-base font-semibold mb-3 flex items-center text-gray-900">
                    <i class="fas fa-charging-station text-blue-600 mr-2"></i>
                    <span>Charging Power</span>
                </label>
                <div class="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                    <div class="flex items-center space-x-4 mb-2">
                        <!-- Slider Container - Apple Style -->
                        <div class="flex-1 px-2 py-6">
                            <input type="range" id="chargerPowerRange" min="1" max="350" value="50" class="w-full">
                        </div>
                        <div class="flex items-center bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl px-5 py-4 min-w-[140px] shadow-md">
                            <input type="number" id="chargerPowerInput" value="50" min="1" max="350" 
                                   class="bg-transparent border-none outline-none text-white text-right w-full text-2xl font-bold">
                            <span class="text-white ml-2 text-lg font-semibold">kW</span>
                        </div>
                    </div>
                    <div class="mt-4 flex justify-between text-xs font-medium">
                        <span class="text-gray-500">
                            <i class="fas fa-plug mr-1"></i>Slow (7 kW)
                        </span>
                        <span class="text-blue-600">
                            <i class="fas fa-bolt mr-1"></i>Fast (50 kW)
                        </span>
                        <span class="text-purple-600">
                            <i class="fas fa-rocket mr-1"></i>Ultra (350 kW)
                        </span>
                    </div>
                </div>
            </div>

            <!-- Available Charging Time Input - Apple Style -->
            <div class="mb-6">
                <label class="block text-base font-semibold mb-3 flex items-center text-gray-900">
                    <i class="fas fa-clock text-cyan-600 mr-2"></i>
                    <span>Available charging time</span>
                    <span class="ml-3 text-xs text-gray-400 font-normal">(Optional - for range calculation)</span>
                </label>
                <div class="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                    <div class="flex items-center space-x-4 mb-2">
                        <!-- Slider Container - Apple Style -->
                        <div class="flex-1 px-2 py-6">
                            <input type="range" id="chargingTimeRange" min="5" max="120" step="5" value="30" class="w-full">
                        </div>
                        <div class="flex items-center bg-gradient-to-r from-cyan-600 to-blue-700 rounded-2xl px-5 py-4 min-w-[140px] shadow-md">
                            <input type="number" id="chargingTimeInput" value="30" min="5" max="120" step="5" 
                                   class="bg-transparent border-none outline-none text-white text-right w-full text-2xl font-bold">
                            <span class="text-white ml-2 text-lg font-semibold">min</span>
                        </div>
                    </div>
                    <div class="mt-4 flex justify-between text-xs font-medium">
                        <span class="text-gray-500">
                            <i class="fas fa-coffee mr-1"></i>Quick (5 min)
                        </span>
                        <span class="text-cyan-600">
                            <i class="fas fa-shopping-cart mr-1"></i>Shopping (30 min)
                        </span>
                        <span class="text-blue-600">
                            <i class="fas fa-utensils mr-1"></i>Lunch (120 min)
                        </span>
                    </div>
                    <div class="mt-3 text-xs text-gray-400 text-center">
                        How much time do you have to charge?
                    </div>
                </div>
            </div>

            <!-- Electricity Price Input - Apple Style -->
            <div class="mb-6">
                <label class="block text-base font-semibold mb-3 flex items-center text-gray-900">
                    <i class="fas fa-euro-sign text-yellow-600 mr-2"></i>
                    <span>Electricity Price</span>
                </label>
                <div class="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                    <div class="flex items-center space-x-4 mb-2">
                        <!-- Slider Container - Apple Style -->
                        <div class="flex-1 px-2 py-6">
                            <input type="range" id="electricityPriceRange" min="0.10" max="1.00" step="0.01" value="0.30" class="w-full">
                        </div>
                        <div class="flex items-center bg-gradient-to-r from-yellow-600 to-orange-600 rounded-xl px-5 py-4 min-w-[140px] shadow-lg">
                            <span class="text-white mr-1 text-lg font-semibold">€</span>
                            <input type="number" id="electricityPriceInput" value="0.30" min="0.10" max="1.00" step="0.01" 
                                   class="bg-transparent border-none outline-none text-white text-right w-full text-2xl font-bold">
                        </div>
                    </div>
                    <div class="mt-4 flex justify-between text-xs font-medium">
                        <span class="text-gray-500">
                            <i class="fas fa-home mr-1"></i>Home (€0.10)
                        </span>
                        <span class="text-yellow-600">
                            <i class="fas fa-plug mr-1"></i>Average (€0.30)
                        </span>
                        <span class="text-orange-600">
                            <i class="fas fa-bolt mr-1"></i>Fast (€0.70)
                        </span>
                    </div>
                    <div class="mt-3 text-xs text-gray-400 text-center">
                        Price per kWh (incl. VAT and costs)
                    </div>
                </div>
            </div>

            <!-- Calculate Button -->
            <button id="calculateBtn" class="w-full tesla-gradient text-white font-semibold py-4 rounded-xl hover:opacity-90 transition-all transform hover:scale-[1.02] active:scale-[0.98]">
                <i class="fas fa-calculator mr-2"></i>Calculate Charging Speed & Range
            </button>
        </div>

        <!-- Results Section - Apple Style -->
        <div id="resultsSection" class="hidden mt-8 animate-fade-in">
            <div class="bg-white rounded-3xl p-8 md:p-12 shadow-lg border border-gray-200">
                <div class="text-center mb-8">
                    <h2 class="text-3xl font-semibold mb-2 text-gray-900">Charging Speed</h2>
                    <p class="text-gray-600 text-lg" id="vehicleName">-</p>
                </div>

                <!-- Main Result -->
                <div class="text-center mb-12">
                    <div class="inline-block">
                        <div class="text-7xl md:text-8xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2" id="speedResult">
                            -
                        </div>
                        <div class="text-2xl text-gray-600 font-medium">km/h</div>
                    </div>
                </div>

                <!-- Details Grid - Apple Style Cards -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div class="bg-gray-50 rounded-2xl p-6 text-center border border-gray-200 shadow-sm">
                        <i class="fas fa-bolt text-3xl text-yellow-600 mb-3"></i>
                        <div class="text-2xl font-semibold text-gray-900" id="effectivePower">-</div>
                        <div class="text-sm text-gray-600 mt-1">Effective Power (kW)</div>
                    </div>
                    <div class="bg-gray-50 rounded-2xl p-6 text-center border border-gray-200 shadow-sm">
                        <i class="fas fa-clock text-3xl text-blue-600 mb-3"></i>
                        <div class="text-2xl font-semibold text-gray-900" id="chargingTime">-</div>
                        <div class="text-sm text-gray-600 mt-1">Charging Time</div>
                    </div>
                    <div class="bg-gray-50 rounded-2xl p-6 text-center border border-gray-200 shadow-sm">
                        <i class="fas fa-road text-3xl text-green-600 mb-3"></i>
                        <div class="text-2xl font-semibold text-gray-900" id="rangePerHour">-</div>
                        <div class="text-sm text-gray-600 mt-1">Range/hour (km)</div>
                    </div>
                    <div class="bg-gray-50 rounded-2xl p-6 text-center border border-gray-200 shadow-sm">
                        <i class="fas fa-euro-sign text-3xl text-orange-600 mb-3"></i>
                        <div class="text-2xl font-semibold text-gray-900" id="chargingCost">-</div>
                        <div class="text-sm text-gray-600 mt-1">Charging Cost</div>
                    </div>
                </div>
                
                <!-- Estimated Range with Available Time - Apple Style -->
                <div id="rangeEstimate" class="mb-8 p-8 bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-200 rounded-2xl shadow-sm">
                    <div class="text-center">
                        <h3 class="text-xl font-semibold mb-4 flex items-center justify-center text-gray-900">
                            <i class="fas fa-route text-cyan-600 mr-2"></i>
                            Estimated range with available time
                        </h3>
                        <div class="text-center mb-4">
                            <div class="inline-block">
                                <div class="text-6xl md:text-7xl font-semibold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent mb-2" id="estimatedRange">
                                    -
                                </div>
                                <div class="text-2xl text-gray-600 font-medium">kilometers</div>
                            </div>
                        </div>
                        <div class="text-sm text-gray-600">
                            Based on <span class="text-cyan-700 font-semibold" id="displayChargingTime">-</span> minutes of charging
                        </div>
                        <div class="mt-4 grid grid-cols-2 gap-4">
                            <div class="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm">
                                <div class="text-sm text-gray-600 mb-1 font-medium">Energy Added</div>
                                <div class="text-xl font-semibold text-cyan-700" id="energyAdded">-</div>
                            </div>
                            <div class="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm">
                                <div class="text-sm text-gray-600 mb-1 font-medium">Final SOC</div>
                                <div class="text-xl font-semibold text-green-700" id="finalSOC">-</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Additional Cost Details - Apple Style -->
                <div id="costDetails" class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 p-6 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-2xl shadow-sm">
                    <div class="text-center">
                        <div class="text-sm text-gray-600 mb-1 font-medium">Energy Used</div>
                        <div class="text-xl font-semibold text-gray-900" id="energyUsed">-</div>
                    </div>
                    <div class="text-center">
                        <div class="text-sm text-gray-600 mb-1 font-medium">Cost per Hour</div>
                        <div class="text-xl font-semibold text-gray-900" id="costPerHour">-</div>
                    </div>
                    <div class="text-center">
                        <div class="text-sm text-gray-600 mb-1 font-medium">Cost per 100km</div>
                        <div class="text-xl font-semibold text-gray-900" id="costPer100km">-</div>
                    </div>
                </div>

                <!-- Action Buttons - Apple Style -->
                <div class="flex justify-center">
                    <button id="compareFromResult" class="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-all transform hover:scale-105 font-semibold text-lg shadow-md hover:shadow-lg">
                        <i class="fas fa-exchange-alt mr-2"></i>Compare Vehicles
                    </button>
                </div>
            </div>
        </div>

        <!-- Vehicle Suggestion Form - Bottom of Page -->
        <div class="mt-16 bg-gradient-to-r from-gray-50 to-gray-100 rounded-3xl p-8 md:p-12 shadow-lg border border-gray-200">
            <div class="max-w-3xl mx-auto">
                <div class="text-center mb-8">
                    <h2 class="text-3xl font-semibold mb-3 text-gray-900 flex items-center justify-center">
                        <i class="fas fa-plus-circle text-blue-600 mr-3"></i>
                        Vehicle Not Found?
                    </h2>
                    <p class="text-gray-600 text-lg">
                        Staat je elektrische vehicle niet in onze database? Laat het ons weten en we voegen het toe!
                    </p>
                </div>

                <form id="vehicleSuggestionForm" class="space-y-6">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label class="block text-sm font-semibold mb-2 text-gray-900">
                                <i class="fas fa-car mr-2 text-blue-600"></i>Merk *
                            </label>
                            <input 
                                type="text" 
                                id="suggestBrand" 
                                required
                                placeholder="bijv. Tesla, BMW, Volkswagen" 
                                class="w-full bg-white border border-gray-300 rounded-2xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            />
                        </div>
                        <div>
                            <label class="block text-sm font-semibold mb-2 text-gray-900">
                                <i class="fas fa-id-card mr-2 text-blue-600"></i>Model *
                            </label>
                            <input 
                                type="text" 
                                id="suggestModel" 
                                required
                                placeholder="bijv. Model 3, iX3, ID.4" 
                                class="w-full bg-white border border-gray-300 rounded-2xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            />
                        </div>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label class="block text-sm font-semibold mb-2 text-gray-900">
                                <i class="fas fa-calendar mr-2 text-blue-600"></i>Jaar (optioneel)
                            </label>
                            <input 
                                type="number" 
                                id="suggestYear" 
                                min="2010"
                                max="2030"
                                placeholder="bijv. 2024" 
                                class="w-full bg-white border border-gray-300 rounded-2xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            />
                        </div>
                        <div>
                            <label class="block text-sm font-semibold mb-2 text-gray-900">
                                <i class="fas fa-battery-full mr-2 text-blue-600"></i>Batterijcapaciteit (kWh, optioneel)
                            </label>
                            <input 
                                type="number" 
                                id="suggestBatteryCapacity" 
                                step="0.1"
                                min="10"
                                max="200"
                                placeholder="bijv. 75.0" 
                                class="w-full bg-white border border-gray-300 rounded-2xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            />
                        </div>
                    </div>

                    <div>
                        <label class="block text-sm font-semibold mb-2 text-gray-900">
                            <i class="fas fa-info-circle mr-2 text-blue-600"></i>Extra informatie (optioneel)
                        </label>
                        <textarea 
                            id="suggestAdditionalInfo" 
                            rows="3"
                            placeholder="Eventuele extra details zoals variant, laadsnelheid, etc." 
                            class="w-full bg-white border border-gray-300 rounded-2xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                        ></textarea>
                    </div>

                    <div class="flex justify-center">
                        <button 
                            type="submit" 
                            class="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full transition-all transform hover:scale-105 font-semibold text-lg shadow-md hover:shadow-lg"
                        >
                            <i class="fas fa-paper-plane mr-2"></i>Verstuur Suggestie
                        </button>
                    </div>

                    <p class="text-sm text-gray-500 text-center mt-4">
                        <i class="fas fa-lock mr-1"></i>Je gegevens worden veilig opgeslagen. We nemen contact op als we meer informatie nodig hebben.
                    </p>
                </form>
            </div>
        </div>
    </div>

    <!-- Compare Vehicles Modal - Apple Style -->
    <div id="compareModal" class="hidden fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-8 animate-fade-in shadow-2xl border border-gray-200">
            <div class="flex justify-between items-start mb-6">
                <div>
                    <h2 class="text-3xl font-semibold mb-2 text-gray-900">Compare Vehicles</h2>
                    <p class="text-gray-600">Select vehicles to compare charging performance</p>
                </div>
                <button id="closeCompareModal" class="text-gray-500 hover:text-gray-700 text-2xl">
                    <i class="fas fa-times"></i>
                </button>
            </div>

            <!-- Current Settings Display - Apple Style -->
            <div class="mb-6 p-4 bg-gray-50 rounded-2xl border border-gray-200 shadow-sm">
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                        <span class="text-gray-600">Charger:</span>
                        <span class="ml-2 font-semibold text-gray-900" id="compareChargerPower">50 kW</span>
                    </div>
                    <div>
                        <span class="text-gray-600">SOC:</span>
                        <span class="ml-2 font-semibold text-gray-900" id="compareSOCRange">20-80%</span>
                    </div>
                    <div>
                        <span class="text-gray-600">Price:</span>
                        <span class="ml-2 font-semibold text-gray-900" id="compareElectricityPrice">€0.30/kWh</span>
                    </div>
                    <div>
                        <span class="text-gray-600">Selected:</span>
                        <span class="ml-2 font-semibold text-blue-600" id="compareVehicleCount">0 vehicles</span>
                    </div>
                </div>
            </div>

            <!-- Vehicle Search for Comparison - Apple Style -->
            <div class="mb-6">
                <label class="block text-sm font-semibold mb-3 text-gray-900">
                    <i class="fas fa-search mr-2 text-blue-600"></i>Search vehicles to compare (max 4)
                </label>
                <div class="relative">
                    <input 
                        type="text" 
                        id="compareVehicleSearch" 
                        placeholder="Type to search..." 
                        class="w-full bg-white border border-gray-300 rounded-2xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        autocomplete="off"
                    >
                    <i class="fas fa-search absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"></i>
                    
                    <!-- Autocomplete Dropdown for Comparison - Apple Style -->
                    <div id="compareAutocompleteDropdown" class="hidden absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-2xl shadow-xl max-h-64 overflow-y-auto">
                        <div id="compareAutocompleteResults" class="py-2">
                            <!-- Results will be populated here -->
                        </div>
                    </div>
                </div>
            </div>

            <!-- Selected Vehicles for Comparison - Apple Style -->
            <div id="selectedCompareVehicles" class="mb-6">
                <h3 class="text-sm font-semibold mb-3 text-gray-900">Selected vehicles:</h3>
                <div id="selectedCompareVehiclesList" class="space-y-2">
                    <div class="text-sm text-gray-600 text-center py-4 bg-gray-50 rounded-2xl border border-gray-200">No vehicles selected yet</div>
                </div>
            </div>

            <!-- Compare Button - Apple Style -->
            <button id="startCompareBtn" disabled class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-full shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                <i class="fas fa-exchange-alt mr-2"></i>Compare selected vehicles
            </button>
        </div>
    </div>

    <!-- Comparison Results Section - Apple Style -->
    <div id="comparisonResults" class="hidden max-w-6xl mx-auto px-4 pb-12 mt-8">
        <div class="bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-gray-200">
            <div class="text-center mb-8">
                <h2 class="text-3xl font-semibold mb-2 text-gray-900">Vehicle Comparison</h2>
                <p class="text-gray-600">Charging performance side by side</p>
            </div>

            <!-- Comparison Table -->
            <div class="overflow-x-auto">
                <table class="w-full" id="comparisonTable">
                    <!-- Table will be populated by JavaScript -->
                </table>
            </div>

            <!-- Back Button - Apple Style -->
            <div class="mt-8 text-center">
                <button id="closeComparisonResults" class="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-900 font-medium rounded-full transition-colors shadow-sm">
                    <i class="fas fa-arrow-left mr-2"></i>Back to calculator
                </button>
            </div>
        </div>
    </div>

    <!-- Pricing Modal - Apple Style -->
    <div id="pricingModal" class="hidden fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-3xl max-w-5xl w-full max-h-[90vh] overflow-y-auto p-8 md:p-12 animate-fade-in shadow-2xl border border-gray-200">
            <div class="flex justify-between items-start mb-8">
                <div>
                    <h2 class="text-3xl font-semibold mb-2 text-gray-900">Choose your subscription</h2>
                    <p class="text-gray-600">Unlock premium features and get access to all vehicles</p>
                </div>
                <button id="closePricingModal" class="text-gray-500 hover:text-gray-700 text-2xl">
                    <i class="fas fa-times"></i>
                </button>
            </div>

            <div id="pricingTiers" class="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                <!-- Pricing tiers will be loaded here -->
            </div>
        </div>
    </div>

    <!-- Footer - Pensato Branding -->
    <footer class="mt-12 py-8 border-t border-gray-200 bg-gradient-to-b from-white to-gray-50">
        <div class="max-w-7xl mx-auto px-4">
            <div class="text-center mb-4">
                <div class="flex items-center justify-center mb-2">
                    <i class="fas fa-brain text-2xl text-blue-600 mr-2"></i>
                    <h3 class="text-2xl font-bold text-gray-900">Pensato</h3>
                </div>
                <p class="text-sm text-gray-600 mb-3">AI-Powered Solutions</p>
                <div class="flex items-center justify-center space-x-2 text-xs text-gray-600">
                    <span>Made in Belgium with</span>
                    <span class="text-lg" style="color: #000000;">🖤</span>
                    <span class="text-lg" style="color: #FFD700;">💛</span>
                    <span class="text-lg" style="color: #EF3340;">❤️</span>
                </div>
            </div>
            <div class="flex justify-center space-x-6 text-xs">
                <a href="#" class="text-gray-600 hover:text-blue-600 transition-colors">Privacy</a>
                <a href="#" class="text-gray-600 hover:text-blue-600 transition-colors">Terms</a>
                <a href="#" class="text-gray-600 hover:text-blue-600 transition-colors">Contact</a>
            </div>
        </div>
    </footer>

    <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
    
    <!-- Authentication Check Script -->
    <script>
        // Check if user is authenticated on page load
        async function checkAuth() {
            try {
                const response = await fetch('/api/auth/me');
                const data = await response.json();
                
                if (data.success && data.user) {
                    // User is authenticated
                    const user = data.user;
                    
                    // Show user profile
                    document.getElementById('userProfile').classList.remove('hidden');
                    const displayName = user.firstName ? (user.firstName + ' ' + (user.lastName || '')).trim() : user.email.split('@')[0];
                    document.getElementById('userName').textContent = displayName;
                    document.getElementById('userTier').textContent = user.role.toUpperCase();
                    
                    // Update dropdown info
                    document.getElementById('dropdownUserName').textContent = displayName;
                    document.getElementById('dropdownUserEmail').textContent = user.email;
                    
                    // Store user in global state for app.js
                    window.currentUser = user;
                    
                    // Update tier badge color
                    const tierBadge = document.getElementById('userTier');
                    if (user.role === 'admin') {
                        tierBadge.className = 'text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded-full';
                        // Show admin link in dropdown
                        document.getElementById('adminLink')?.classList.remove('hidden');
                    } else if (user.role === 'premium') {
                        tierBadge.className = 'text-xs px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full';
                    }
                    // Default (free) keeps blue badge
                    
                    // Dispatch event to notify app.js that auth is complete
                    window.dispatchEvent(new CustomEvent('authReady', { detail: { user } }));
                    
                    return true;
                } else {
                    // User not authenticated - redirect to landing page
                    window.location.href = '/';
                    return false;
                }
            } catch (error) {
                console.error('Auth check failed:', error);
                // On error, redirect to landing page
                window.location.href = '/';
                return false;
            }
        }
        
        // Logout function
        async function logout() {
            try {
                await fetch('/api/auth/logout', { method: 'POST' });
                window.location.href = '/';
            } catch (error) {
                console.error('Logout failed:', error);
                window.location.href = '/';
            }
        }
        
        // Setup logout button
        document.getElementById('logoutBtn')?.addEventListener('click', logout);
        
        // Setup user dropdown toggle
        document.getElementById('userMenuBtn')?.addEventListener('click', (e) => {
            e.stopPropagation();
            const dropdown = document.getElementById('userDropdown');
            dropdown?.classList.toggle('hidden');
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            const dropdown = document.getElementById('userDropdown');
            const menuBtn = document.getElementById('userMenuBtn');
            if (dropdown && !dropdown.contains(e.target) && !menuBtn?.contains(e.target)) {
                dropdown.classList.add('hidden');
            }
        });
        
        // Vehicle suggestion form handler
        document.getElementById('vehicleSuggestionForm')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const submitBtn = e.target.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerHTML;
            
            try {
                // Disable button and show loading
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Versturen...';
                
                const formData = {
                    brand: document.getElementById('suggestBrand').value,
                    model: document.getElementById('suggestModel').value,
                    year: document.getElementById('suggestYear').value || null,
                    batteryCapacity: document.getElementById('suggestBatteryCapacity').value || null,
                    additionalInfo: document.getElementById('suggestAdditionalInfo').value || null
                };
                
                const response = await fetch('/api/vehicle-suggestions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });
                
                const result = await response.json();
                
                if (result.success) {
                    // Show success message
                    alert('✅ Bedankt voor je suggestie! We bekijken je vehicle en voegen het toe aan onze database.');
                    
                    // Reset form
                    document.getElementById('vehicleSuggestionForm').reset();
                } else {
                    alert('❌ Er ging iets mis: ' + (result.error || 'Probeer het later opnieuw'));
                }
            } catch (error) {
                console.error('Suggestion submission error:', error);
                alert('❌ Netwerk fout. Controleer je verbinding en probeer opnieuw.');
            } finally {
                // Re-enable button
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
            }
        });
        
        // Run auth check immediately
        checkAuth();
    </script>
    
    <script src="/static/app.js"></script>
</body>
</html>
  `)
})

export default app

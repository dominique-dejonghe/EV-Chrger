import { Hono } from 'hono'

type Bindings = {
  DB: D1Database
}

const routes = new Hono<{ Bindings: Bindings }>()

// Landing page route
routes.get('/', (c) => {
  return c.html(`
<!DOCTYPE html>
<html lang="nl" class="dark scroll-smooth">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>⚡ EV Charge Pro - De Ultieme Laadcalculator voor Elektrisch Rijden</title>
    <meta name="description" content="Calculate your charging speed, costs and range in seconds. 284+ electric vehicles, real-time tarieven en geavanceerde analytics. Free to use!">
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
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
      
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      
      body {
        font-family: 'Inter', sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }
      
      .gradient-text {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
      
      .gradient-bg {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      }
      
      .glass {
        background: rgba(255, 255, 255, 0.05);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.1);
      }
      
      .premium-badge {
        background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      }
      
      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(30px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      @keyframes float {
        0%, 100% {
          transform: translateY(0px);
        }
        50% {
          transform: translateY(-20px);
        }
      }
      
      .animate-fade-in-up {
        animation: fadeInUp 0.8s ease-out forwards;
      }
      
      .animate-float {
        animation: float 3s ease-in-out infinite;
      }
      
      .hero-gradient {
        background: radial-gradient(ellipse at top, rgba(102, 126, 234, 0.15) 0%, transparent 70%);
      }
    </style>
</head>
<body class="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white min-h-screen">
    <!-- Navigation -->
    <nav class="fixed top-0 left-0 right-0 z-50 glass">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between items-center h-16">
                <a href="/" class="flex items-center space-x-3 cursor-pointer hover:opacity-80 transition-opacity">
                    <i class="fas fa-bolt text-3xl gradient-text"></i>
                    <span class="text-xl font-bold">EV Charge Pro</span>
                </a>
                <div class="hidden md:flex items-center space-x-8">
                    <a href="#features" class="hover:text-blue-400 transition-colors">Features</a>
                    <a href="#pricing" class="hover:text-blue-400 transition-colors">Pricing</a>
                    <a href="#calculator" class="hover:text-blue-400 transition-colors">Calculator</a>
                    <a href="/app" class="px-6 py-2 gradient-bg text-white rounded-lg hover:opacity-90 transition-opacity font-semibold">
                        Start Free →
                    </a>
                </div>
                <button class="md:hidden text-2xl">
                    <i class="fas fa-bars"></i>
                </button>
            </div>
        </div>
    </nav>

    <!-- Hero Section -->
    <section class="relative pt-32 pb-20 px-4 overflow-hidden">
        <div class="hero-gradient absolute inset-0"></div>
        <div class="max-w-7xl mx-auto relative z-10">
            <div class="text-center mb-16 animate-fade-in-up">
                <h1 class="text-5xl md:text-7xl font-black mb-6 leading-tight">
                    Bereken Je EV Laadsnelheid<br>
                    <span class="gradient-text">In Seconden</span>
                </h1>
                <p class="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
                    The most advanced EV charging calculator with 284+ vehicleen, real-time cost calculation and charging curves. 
                    <span class="text-blue-400 font-semibold">100% free to start!</span>
                </p>
                <div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <a href="/app" class="px-8 py-4 gradient-bg text-white rounded-xl text-lg font-bold hover:opacity-90 transition-all transform hover:scale-105 shadow-2xl">
                        <i class="fas fa-rocket mr-2"></i>Start Free - No Account Required
                    </a>
                    <a href="#demo" class="px-8 py-4 glass text-white rounded-xl text-lg font-semibold hover:bg-white/10 transition-all">
                        <i class="fas fa-play-circle mr-2"></i>Bekijk Demo
                    </a>
                </div>
            </div>

            <!-- Stats -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto animate-fade-in-up" style="animation-delay: 0.2s;">
                <div class="text-center">
                    <div class="text-4xl font-bold gradient-text mb-2">284+</div>
                    <div class="text-gray-400">EV Modellen</div>
                </div>
                <div class="text-center">
                    <div class="text-4xl font-bold gradient-text mb-2">39</div>
                    <div class="text-gray-400">Merken</div>
                </div>
                <div class="text-center">
                    <div class="text-4xl font-bold gradient-text mb-2">100%</div>
                    <div class="text-gray-400">Free Start</div>
                </div>
                <div class="text-center">
                    <div class="text-4xl font-bold gradient-text mb-2">2s</div>
                    <div class="text-gray-400">Berekening</div>
                </div>
            </div>
        </div>
    </section>

    <!-- Features Grid -->
    <section id="features" class="py-20 px-4">
        <div class="max-w-7xl mx-auto">
            <div class="text-center mb-16">
                <h2 class="text-4xl md:text-5xl font-bold mb-4">Waarom EV Charge Pro?</h2>
                <p class="text-xl text-gray-400">Alles wat je nodig hebt voor slim elektrisch rijden</p>
            </div>

            <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                <!-- Feature 1 -->
                <div class="glass rounded-2xl p-8 hover:scale-105 transition-transform">
                    <div class="w-16 h-16 gradient-bg rounded-xl flex items-center justify-center mb-6">
                        <i class="fas fa-search text-3xl"></i>
                    </div>
                    <h3 class="text-2xl font-bold mb-4">Smart Search</h3>
                    <p class="text-gray-400">Type en vind direct je vehicle. No more endless scrolling through lists. Keyboard navigation included.</p>
                </div>

                <!-- Feature 2 -->
                <div class="glass rounded-2xl p-8 hover:scale-105 transition-transform">
                    <div class="w-16 h-16 gradient-bg rounded-xl flex items-center justify-center mb-6">
                        <i class="fas fa-chart-line text-3xl"></i>
                    </div>
                    <h3 class="text-2xl font-bold mb-4">Charging Curves</h3>
                    <p class="text-gray-400">Real-world laadcurves per SOC niveau. Zie hoe je laadsnelheid verandert during charging.</p>
                </div>

                <!-- Feature 3 -->
                <div class="glass rounded-2xl p-8 hover:scale-105 transition-transform">
                    <div class="w-16 h-16 gradient-bg rounded-xl flex items-center justify-center mb-6">
                        <i class="fas fa-euro-sign text-3xl"></i>
                    </div>
                    <h3 class="text-2xl font-bold mb-4">Kosten Calculator</h3>
                    <p class="text-gray-400">Calculate exactly what a charging session costs. From home charging to fast chargers - everything transparent.</p>
                </div>

                <!-- Feature 4 -->
                <div class="glass rounded-2xl p-8 hover:scale-105 transition-transform">
                    <div class="w-16 h-16 gradient-bg rounded-xl flex items-center justify-center mb-6">
                        <i class="fas fa-exclamation-triangle text-3xl"></i>
                    </div>
                    <h3 class="text-2xl font-bold mb-4">Smart Warnings</h3>
                    <p class="text-gray-400">Directe waarschuwing wanneer laadpaal vermogen hoger is dan je auto kan accepteren.</p>
                </div>

                <!-- Feature 5 -->
                <div class="glass rounded-2xl p-8 hover:scale-105 transition-transform">
                    <div class="w-16 h-16 gradient-bg rounded-xl flex items-center justify-center mb-6">
                        <i class="fas fa-exchange-alt text-3xl"></i>
                    </div>
                    <h3 class="text-2xl font-bold mb-4">Vergelijk Auto's</h3>
                    <p class="text-gray-400">Side-by-side comparison of charging speeds. Find the fastest charging EV for your situation.</p>
                </div>

                <!-- Feature 6 -->
                <div class="glass rounded-2xl p-8 hover:scale-105 transition-transform">
                    <div class="w-16 h-16 gradient-bg rounded-xl flex items-center justify-center mb-6">
                        <i class="fas fa-database text-3xl"></i>
                    </div>
                    <h3 class="text-2xl font-bold mb-4">Real-World Data</h3>
                    <p class="text-gray-400">Echte verbruiksgegevens, geen WLTP marketing cijfers. Van Tesla tot Dacia - allemaal verified.</p>
                </div>
            </div>
        </div>
    </section>

    <!-- Calculator Preview Section -->
    <section id="calculator" class="py-20 px-4 bg-slate-900/50">
        <div class="max-w-7xl mx-auto">
            <div class="text-center mb-12">
                <h2 class="text-4xl md:text-5xl font-bold mb-4">2-in-1 Calculator</h2>
                <p class="text-xl text-gray-400">Laadsnelheid én kosten in één tool</p>
            </div>

            <div class="grid md:grid-cols-2 gap-8 mb-12">
                <!-- Speed Calculator Preview -->
                <div class="glass rounded-2xl p-8">
                    <div class="flex items-center mb-6">
                        <i class="fas fa-tachometer-alt text-3xl gradient-text mr-4"></i>
                        <h3 class="text-2xl font-bold">Laadsnelheid Calculator</h3>
                    </div>
                    <div class="space-y-4 text-gray-300">
                        <div class="flex items-center">
                            <i class="fas fa-check text-green-400 mr-3"></i>
                            <span>Bereken km/uur laadsnelheid</span>
                        </div>
                        <div class="flex items-center">
                            <i class="fas fa-check text-green-400 mr-3"></i>
                            <span>Laadtijd 20% → 80%</span>
                        </div>
                        <div class="flex items-center">
                            <i class="fas fa-check text-green-400 mr-3"></i>
                            <span>Range per hour of charging</span>
                        </div>
                        <div class="flex items-center">
                            <i class="fas fa-check text-green-400 mr-3"></i>
                            <span>SOC-based charging curves</span>
                        </div>
                    </div>
                    <a href="/app" class="mt-6 block w-full py-3 gradient-bg text-white rounded-xl text-center font-semibold hover:opacity-90 transition-opacity">
                        Probeer Nu →
                    </a>
                </div>

                <!-- Cost Calculator Preview -->
                <div class="glass rounded-2xl p-8">
                    <div class="flex items-center mb-6">
                        <i class="fas fa-calculator text-3xl gradient-text mr-4"></i>
                        <h3 class="text-2xl font-bold">Kosten Calculator</h3>
                    </div>
                    <div class="space-y-4 text-gray-300">
                        <div class="flex items-center">
                            <i class="fas fa-check text-green-400 mr-3"></i>
                            <span>Exacte laadkosten per sessie</span>
                        </div>
                        <div class="flex items-center">
                            <i class="fas fa-check text-green-400 mr-3"></i>
                            <span>Compare home charging vs fast chargers</span>
                        </div>
                        <div class="flex items-center">
                            <i class="fas fa-check text-green-400 mr-3"></i>
                            <span>Energie efficiëntie berekening</span>
                        </div>
                        <div class="flex items-center">
                            <i class="fas fa-check text-green-400 mr-3"></i>
                            <span>Kosten per 100 km</span>
                        </div>
                    </div>
                    <a href="/app/cost-calculator" class="mt-6 block w-full py-3 gradient-bg text-white rounded-xl text-center font-semibold hover:opacity-90 transition-opacity">
                        Bereken Kosten →
                    </a>
                </div>
            </div>
        </div>
    </section>

    <!-- Pricing Section -->
    <section id="pricing" class="py-20 px-4">
        <div class="max-w-7xl mx-auto">
            <div class="text-center mb-16">
                <h2 class="text-4xl md:text-5xl font-bold mb-4">Simpele, Eerlijke Prijzen</h2>
                <p class="text-xl text-gray-400">Start free. Upgrade when you need more.</p>
            </div>

            <div class="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                <!-- Free Tier -->
                <div class="glass rounded-2xl p-8 hover:scale-105 transition-transform">
                    <h3 class="text-2xl font-bold mb-4">Free</h3>
                    <div class="text-4xl font-bold mb-6">€0<span class="text-lg text-gray-400">/maand</span></div>
                    <ul class="space-y-3 mb-8">
                        <li class="flex items-start">
                            <i class="fas fa-check text-green-400 mt-1 mr-3"></i>
                            <span>73+ populaire EV modellen</span>
                        </li>
                        <li class="flex items-start">
                            <i class="fas fa-check text-green-400 mt-1 mr-3"></i>
                            <span>Laadsnelheid calculator</span>
                        </li>
                        <li class="flex items-start">
                            <i class="fas fa-check text-green-400 mt-1 mr-3"></i>
                            <span>Kosten calculator</span>
                        </li>
                        <li class="flex items-start">
                            <i class="fas fa-check text-green-400 mt-1 mr-3"></i>
                            <span>Real-world data</span>
                        </li>
                    </ul>
                    <a href="/app" class="block w-full py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-center font-semibold transition-colors">
                        Start Free
                    </a>
                </div>

                <!-- Premium Tier -->
                <div class="glass rounded-2xl p-8 ring-2 ring-purple-500 transform scale-105 relative">
                    <div class="absolute -top-4 left-1/2 transform -translate-x-1/2">
                        <span class="px-4 py-1 premium-badge rounded-full text-sm font-bold">POPULAIR</span>
                    </div>
                    <h3 class="text-2xl font-bold mb-4">Premium</h3>
                    <div class="text-4xl font-bold mb-6">€4.99<span class="text-lg text-gray-400">/maand</span></div>
                    <ul class="space-y-3 mb-8">
                        <li class="flex items-start">
                            <i class="fas fa-check text-green-400 mt-1 mr-3"></i>
                            <span>Alles van Free +</span>
                        </li>
                        <li class="flex items-start">
                            <i class="fas fa-check text-green-400 mt-1 mr-3"></i>
                            <span><strong>284+ EV modellen</strong></span>
                        </li>
                        <li class="flex items-start">
                            <i class="fas fa-check text-green-400 mt-1 mr-3"></i>
                            <span>Charging curve analyse</span>
                        </li>
                        <li class="flex items-start">
                            <i class="fas fa-check text-green-400 mt-1 mr-3"></i>
                            <span>Vehicle comparison</span>
                        </li>
                        <li class="flex items-start">
                            <i class="fas fa-check text-green-400 mt-1 mr-3"></i>
                            <span>SOC-based calculaties</span>
                        </li>
                        <li class="flex items-start">
                            <i class="fas fa-check text-green-400 mt-1 mr-3"></i>
                            <span>Berekeningsgeschiedenis</span>
                        </li>
                        <li class="flex items-start">
                            <i class="fas fa-check text-green-400 mt-1 mr-3"></i>
                            <span>PDF export</span>
                        </li>
                    </ul>
                    <a href="/app" class="block w-full py-3 premium-badge text-white rounded-xl text-center font-semibold hover:opacity-90 transition-opacity">
                        Upgrade Naar Premium
                    </a>
                </div>

                <!-- Pro Tier -->
                <div class="glass rounded-2xl p-8 hover:scale-105 transition-transform">
                    <h3 class="text-2xl font-bold mb-4">Pro</h3>
                    <div class="text-4xl font-bold mb-6">€49.99<span class="text-lg text-gray-400">/jaar</span></div>
                    <ul class="space-y-3 mb-8">
                        <li class="flex items-start">
                            <i class="fas fa-check text-green-400 mt-1 mr-3"></i>
                            <span>Alles van Premium +</span>
                        </li>
                        <li class="flex items-start">
                            <i class="fas fa-check text-green-400 mt-1 mr-3"></i>
                            <span>Priority support</span>
                        </li>
                        <li class="flex items-start">
                            <i class="fas fa-check text-green-400 mt-1 mr-3"></i>
                            <span>Vehicle requests</span>
                        </li>
                        <li class="flex items-start">
                            <i class="fas fa-check text-green-400 mt-1 mr-3"></i>
                            <span>Advanced analytics</span>
                        </li>
                        <li class="flex items-start">
                            <i class="fas fa-check text-green-400 mt-1 mr-3"></i>
                            <span>API access</span>
                        </li>
                        <li class="flex items-start">
                            <i class="fas fa-check text-green-400 mt-1 mr-3"></i>
                            <span>White-label optie</span>
                        </li>
                    </ul>
                    <a href="/app" class="block w-full py-3 gradient-bg text-white rounded-xl text-center font-semibold hover:opacity-90 transition-opacity">
                        Kies Pro
                    </a>
                </div>
            </div>
        </div>
    </section>

    <!-- Brands Showcase -->
    <section class="py-20 px-4 bg-slate-900/50">
        <div class="max-w-7xl mx-auto">
            <div class="text-center mb-12">
                <h2 class="text-4xl font-bold mb-4">39 Merken. 284 Modellen.</h2>
                <p class="text-xl text-gray-400">Van budget tot premium - we hebben ze allemaal</p>
            </div>
            <div class="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-8 gap-4">
                ${['Tesla', 'BMW', 'Audi', 'Mercedes', 'Volkswagen', 'Porsche', 'Hyundai', 'Kia', 
                   'Nissan', 'Renault', 'Peugeot', 'Volvo', 'Lucid', 'Rivian', 'Ford', 'Dacia']
                  .map(brand => `
                    <div class="glass rounded-xl p-4 text-center hover:bg-white/10 transition-colors">
                        <span class="font-semibold">${brand}</span>
                    </div>
                  `).join('')}
            </div>
            <div class="text-center mt-8">
                <a href="/app" class="text-blue-400 hover:text-blue-300 font-semibold">
                    Bekijk alle 39 merken →
                </a>
            </div>
        </div>
    </section>

    <!-- CTA Section -->
    <section class="py-20 px-4">
        <div class="max-w-4xl mx-auto text-center">
            <div class="glass rounded-3xl p-12">
                <h2 class="text-4xl md:text-5xl font-bold mb-6">Klaar om te Starten?</h2>
                <p class="text-xl text-gray-300 mb-8">
                    Join thousands of EV drivers who already charge smarter with EV Charge Pro
                </p>
                <a href="/app" class="inline-block px-10 py-4 gradient-bg text-white rounded-xl text-xl font-bold hover:opacity-90 transition-all transform hover:scale-105 shadow-2xl">
                    <i class="fas fa-rocket mr-2"></i>Start Now Free
                </a>
                <p class="text-sm text-gray-400 mt-4">No credit card required • 73+ vehicleen free • Upgrade later</p>
            </div>
        </div>
    </section>

    <!-- Footer -->
    <footer class="py-12 border-t border-slate-800">
        <div class="max-w-7xl mx-auto px-4">
            <div class="grid md:grid-cols-4 gap-8 mb-8">
                <div>
                    <a href="/" class="flex items-center space-x-2 mb-4 cursor-pointer hover:opacity-80 transition-opacity">
                        <i class="fas fa-bolt text-2xl gradient-text"></i>
                        <span class="text-lg font-bold">EV Charge Pro</span>
                    </a>
                    <p class="text-gray-400 text-sm">
                        The most advanced EV charging calculator for electric driving.
                    </p>
                </div>
                <div>
                    <h4 class="font-semibold mb-4">Product</h4>
                    <ul class="space-y-2 text-gray-400 text-sm">
                        <li><a href="/app" class="hover:text-white transition-colors">Calculator</a></li>
                        <li><a href="/app/cost-calculator" class="hover:text-white transition-colors">Cost Calculator</a></li>
                        <li><a href="#pricing" class="hover:text-white transition-colors">Pricing</a></li>
                        <li><a href="#features" class="hover:text-white transition-colors">Features</a></li>
                    </ul>
                </div>
                <div>
                    <h4 class="font-semibold mb-4">Support</h4>
                    <ul class="space-y-2 text-gray-400 text-sm">
                        <li><a href="#" class="hover:text-white transition-colors">Help Center</a></li>
                        <li><a href="#" class="hover:text-white transition-colors">API Docs</a></li>
                        <li><a href="#" class="hover:text-white transition-colors">Contact</a></li>
                        <li><a href="#" class="hover:text-white transition-colors">Status</a></li>
                    </ul>
                </div>
                <div>
                    <h4 class="font-semibold mb-4">Legal</h4>
                    <ul class="space-y-2 text-gray-400 text-sm">
                        <li><a href="#" class="hover:text-white transition-colors">Privacy</a></li>
                        <li><a href="#" class="hover:text-white transition-colors">Terms</a></li>
                        <li><a href="#" class="hover:text-white transition-colors">Cookies</a></li>
                        <li><a href="#" class="hover:text-white transition-colors">GDPR</a></li>
                    </ul>
                </div>
            </div>
            <div class="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
                <p>© 2024 EV Charge Pro. Built with ⚡ for EV enthusiasts.</p>
                <div class="flex space-x-6 mt-4 md:mt-0">
                    <a href="#" class="hover:text-white transition-colors"><i class="fab fa-twitter"></i></a>
                    <a href="#" class="hover:text-white transition-colors"><i class="fab fa-github"></i></a>
                    <a href="#" class="hover:text-white transition-colors"><i class="fab fa-linkedin"></i></a>
                </div>
            </div>
        </div>
    </footer>
</body>
</html>
  `)
})

export { routes }

import { useState, useEffect } from 'react';
import { Github, Twitter, Linkedin, Code, Book, Users, Rocket, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Alert } from '@/components/ui/alert';
import Nav from './Nav';

const calculateTimeLeft = () => {
    const launchDate = new Date('2026-03-20').getTime();
    const now = new Date().getTime();
    const difference = launchDate - now;

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((difference % (1000 * 60)) / 1000)
    };
  };

const ComingSoon = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [email, setEmail] = useState('');
  const [showNotification, setShowNotification] = useState(false);
  const [countdown, setCountdown] = useState(calculateTimeLeft());

  
    useEffect(() => {
        const timer = setInterval(() => {
        setCountdown(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth),
        y: (e.clientY / window.innerHeight)
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) {
      setShowNotification(true);
      setEmail('');
      setTimeout(() => setShowNotification(false), 3000);
    }
  };

  const features = [
    {
      icon: Code,
      title: "Interactive Coding",
      description: "Real-time collaborative coding environment with instant feedback"
    },
    {
      icon: Book,
      title: "Structured Learning",
      description: "Curriculum designed by industry experts and academia"
    },
    {
      icon: Users,
      title: "Peer Learning",
      description: "Connect with fellow students and mentors worldwide"
    },
    {
      icon: Rocket,
      title: "Project-Based",
      description: "Learn by building real-world applications"
    }
  ];

  // Enhanced background pattern component
  const BackgroundPattern = () => (
    <div className="absolute inset-0 overflow-hidden">
      {/* Gradient Overlay */}
      <div 
        className="absolute inset-0 opacity-50 transition-opacity duration-1000"
        style={{
          background: `
            radial-gradient(circle at ${mousePosition.x * 100}% ${mousePosition.y * 100}%, 
            rgba(22, 163, 74, 0.4) 0%,
            rgba(22, 163, 74, 0.1) 20%,
            rgba(0, 0, 0, 0.2) 50%,
            rgba(0, 0, 0, 0.8) 100%)
          `
        }}
      />
      
      {/* Animated Grid */}
      <div className="absolute inset-0" 
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(22, 163, 74, 0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(22, 163, 74, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
          transform: `translate(
            ${mousePosition.x * 10}px,
            ${mousePosition.y * 10}px
          )`,
          transition: 'transform 0.2s ease-out'
        }}
      />

      {/* Glowing Orbs */}
      <div className="absolute inset-0">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full mix-blend-screen animate-pulse-glow"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 400 + 200}px`,
              height: `${Math.random() * 400 + 200}px`,
              background: `radial-gradient(circle, 
                rgba(34, 197, 94, ${0.2 + Math.random() * 0.3}) 0%, 
                rgba(16, 185, 129, ${0.1 + Math.random() * 0.2}) 30%, 
                rgba(0, 0, 0, 0) 70%)
              `,
              filter: 'blur(60px)',
              transform: `translate(
                ${mousePosition.x * 20 * (i % 2 ? 1 : -1)}px,
                ${mousePosition.y * 20 * (i % 2 ? -1 : 1)}px
              )`,
              transition: 'transform 0.3s ease-out'
            }}
          />
        ))}
      </div>

      {/* Noise Texture */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"%3E%3Cfilter id="noiseFilter"%3E%3CfeTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch"/%3E%3C/filter%3E%3Crect width="100%" height="100%" filter="url(%23noiseFilter)"/%3E%3C/svg%3E")',
          backgroundSize: '150px 150px'
        }}
      />
    </div>
  );

  const FloatingCard = ({ children }) => {
    return (
      <div>
        {children}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <BackgroundPattern />
      
      {/* Navigation - Fixed at top */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-sm border-b border-green-900">
        <Nav />
      </div>

      {/* Main Content - Added pt-24 to account for fixed nav height */}
      <main className="flex-1 relative z-10 pt-24">
        <div className="container mx-auto px-6 py-20">
          <div className="max-w-6xl mx-auto text-center space-y-8">
            <Badge className="bg-green-500/10 text-green-500 animate-pulse text-lg px-4 py-2">
              Launch Countdown Started
            </Badge>
            
            <h1 className="text-7xl md:text-9xl font-bold mb-8 tracking-tight">
              <span className="bg-gradient-to-r from-green-400 via-green-500 to-green-600 bg-clip-text text-transparent animate-gradient">
                ByteRunners
              </span>
            </h1>
            
            <p className="text-2xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Transform your coding journey with our revolutionary platform. 
              Built for ambitious students, powered by cutting-edge technology.
            </p>

            {/* Countdown Timer */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 my-16">
                {Object.entries(countdown).map(([unit, value], index) => (
                <FloatingCard key={unit} delay={`${index * 0.2}s`}>
                    <Card className="p-6 bg-black/40 backdrop-blur-xl border border-green-900/50 hover:border-green-500 transition-all duration-300">
                    <div className="text-5xl font-bold text-green-500 countdown">
                        {String(value).padStart(2, '0')}
                    </div>
                    <div className="text-gray-400 capitalize text-lg mt-2">{unit}</div>
                    </Card>
                </FloatingCard>
                ))}
            </div>
            {/* Features Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 my-16">
              {features.map(({ icon: Icon, title, description }, index) => (
                <Card key={index} className="p-6 bg-black/40 backdrop-blur-xl border border-green-900/50 hover:border-green-500 transition-all duration-300 group">
                  <Icon className="w-12 h-12 text-green-500 mb-4 group-hover:scale-110 transition-transform duration-300" />
                  <h3 className="text-xl text-green-500 font-bold mb-2 group-hover:scale-110 transition-transform duration-300">{title}</h3>
                  <p className="text-gray-400 group-hover:scale-110 transition-transform duration-300">{description}</p>
                </Card>
              ))}
            </div>

            {/* Email Signup */}
            <div className="max-w-xl mx-auto">
              <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                  type="email"
                  placeholder="Enter your email for early access"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 px-6 py-3 rounded-lg bg-black/40 backdrop-blur-xl border border-green-900/50 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition-all duration-300 text-lg"
                />
                <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-8 text-lg h-12">
                  Join Waitlist <ChevronRight className="ml-2" />
                </Button>
              </form>
            </div>

            {showNotification && (
              <Alert className="bg-green-500/10 border-green-500 text-green-500 max-w-md mx-auto mt-4">
                Thank you for joining our waitlist!
              </Alert>
            )}

            {/* Social Links */}
            <div className="flex justify-center space-x-8 mt-16">
              {[
                { Icon: Github, href: "#" },
                { Icon: Twitter, href: "#" },
                { Icon: Linkedin, href: "#" }
              ].map(({ Icon, href }, index) => (
                <a
                  key={index}
                  href={href}
                  className="transform hover:scale-110 transition-transform duration-200"
                >
                  <Icon className="w-8 h-8 text-gray-400 hover:text-green-500" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-green-900/30">
        <div className="container mx-auto px-6 py-8">
          <p className="text-center text-gray-400">
            © {new Date().getFullYear()} ByteRunners. All rights reserved.
          </p>
        </div>
      </footer>      <style>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
          100% { transform: translateY(0px); }
        }
        
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        @keyframes pulse-glow {
          0% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.05); }
          100% { opacity: 0.3; transform: scale(1); }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 15s ease infinite;
        }

        .animate-pulse-glow {
          animation: pulse-glow 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default ComingSoon;
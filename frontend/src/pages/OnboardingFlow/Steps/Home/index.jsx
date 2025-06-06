import paths from "@/utils/paths";
import LGroupImg from "./l_group.png";
import RGroupImg from "./r_group.png";
import LGroupImgLight from "./l_group-light.png";
import RGroupImgLight from "./r_group-light.png";
import AnythingLLMLogo from "@/media/logo/anything-llm.png";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/hooks/useTheme";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";

// Import ALL integration SVGs
import SlackIcon from "@/media/svg/slack-svgrepo-com.svg";
import GmailIcon from "@/media/svg/gmail-svgrepo-com.svg";
import GoogleDriveIcon from "@/media/svg/google-drive-svgrepo-com.svg";
import GoogleCalendarIcon from "@/media/svg/google-calendar-svgrepo-com.svg";
import GoogleMeetIcon from "@/media/svg/google-meet-svgrepo-com.svg";
import GithubIcon from "@/media/svg/github-svgrepo-com.svg";
import GitlabIcon from "@/media/svg/gitlab-svgrepo-com.svg";
import WhatsappIcon from "@/media/svg/whatsapp-svgrepo-com.svg";
import AirbnbIcon from "@/media/svg/airbnb-svgrepo-com.svg";
import AlexaIcon from "@/media/svg/amazon-alexa-svgrepo-com.svg";
import TaigaIcon from "@/media/svg/taiga-svgrepo-com.svg";
import SpotifyIcon from "@/media/svg/spotify-svgrepo-com.svg";
import UbuntuIcon from "@/media/svg/ubuntu-svgrepo-com.svg";
import PayPalIcon from "@/media/svg/paypal-svgrepo-com.svg";
import InstagramIcon from "@/media/svg/instagram-svgrepo-com.svg";
import DockerIcon from "@/media/svg/docker-svgrepo-com.svg";

// Integration data for background floating - ALL INTEGRATIONS!
const integrations = [
  { name: "Slack", icon: SlackIcon, color: "from-purple-500 to-blue-500" },
  { name: "Gmail", icon: GmailIcon, color: "from-red-500 to-orange-500" },
  { name: "Google Drive", icon: GoogleDriveIcon, color: "from-blue-500 to-green-500" },
  { name: "Calendar", icon: GoogleCalendarIcon, color: "from-blue-600 to-purple-600" },
  { name: "Google Meet", icon: GoogleMeetIcon, color: "from-green-500 to-blue-500" },
  { name: "GitHub", icon: GithubIcon, color: "from-gray-700 to-gray-900" },
  { name: "GitLab", icon: GitlabIcon, color: "from-orange-600 to-red-600" },
  { name: "WhatsApp", icon: WhatsappIcon, color: "from-green-500 to-green-600" },
  { name: "Airbnb", icon: AirbnbIcon, color: "from-pink-500 to-red-500" },
  { name: "Alexa", icon: AlexaIcon, color: "from-cyan-500 to-blue-500" },
  { name: "Taiga", icon: TaigaIcon, color: "from-green-600 to-teal-600" },
  { name: "Spotify", icon: SpotifyIcon, color: "from-green-400 to-green-600" },
  { name: "Ubuntu", icon: UbuntuIcon, color: "from-orange-500 to-red-600" },
  { name: "PayPal", icon: PayPalIcon, color: "from-blue-600 to-blue-800" },
  { name: "Instagram", icon: InstagramIcon, color: "from-pink-500 to-purple-600" },
  { name: "Docker", icon: DockerIcon, color: "from-blue-400 to-cyan-500" },
];

const IMG_SRCSET = {
  light: {
    l: LGroupImgLight,
    r: RGroupImgLight,
  },
  default: {
    l: LGroupImg,
    r: RGroupImg,
  },
};

// Enhanced Floating Integration Background - More Apparent & Responsive
const FloatingIntegrations = () => {
  const [integrationPositions, setIntegrationPositions] = useState([]);
  const [hoveredIntegration, setHoveredIntegration] = useState(null);

  useEffect(() => {
    // Generate random positions for each integration with better visibility
    const positions = integrations.map((integration, index) => ({
      ...integration,
      id: index,
      x: Math.random() * 70 + 15, // 15-85% to avoid edges
      y: Math.random() * 70 + 15,
      size: Math.random() * 40 + 50, // 50-90px (larger!)
      opacity: Math.random() * 0.4 + 0.3, // 0.3-0.7 opacity (more visible!)
      delay: Math.random() * 10,
      duration: Math.random() * 15 + 10, // 10-25s duration (a bit faster)
      rotationSpeed: Math.random() * 360 + 120, // 120-480 degrees
      hoverScale: Math.random() * 0.3 + 1.2, // 1.2-1.5x scale on hover
    }));
    setIntegrationPositions(positions);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-70">
      {integrationPositions.map((integration) => (
        <div
          key={integration.id}
          className="absolute transition-all duration-1000 pointer-events-auto cursor-pointer"
          style={{
            left: `${integration.x}%`,
            top: `${integration.y}%`,
            transform: 'translate(-50%, -50%)',
            animationDelay: `${integration.delay}s`,
          }}
          onMouseEnter={() => setHoveredIntegration(integration.id)}
          onMouseLeave={() => setHoveredIntegration(null)}
        >
          {/* Enhanced Integration Icon */}
          <div 
            className="relative animate-float-integration group"
            style={{
              width: `${integration.size}px`,
              height: `${integration.size}px`,
              opacity: hoveredIntegration === integration.id ? 0.9 : integration.opacity,
              filter: hoveredIntegration === integration.id ? 'blur(0px)' : 'blur(0.5px)',
              animationDuration: `${integration.duration}s`,
              transform: hoveredIntegration === integration.id ? `scale(${integration.hoverScale})` : 'scale(1)',
            }}
          >
            {/* Enhanced Glow Background */}
            <div 
              className={`absolute inset-0 rounded-xl bg-gradient-to-br ${integration.color} opacity-30 blur-lg animate-pulse-integration group-hover:opacity-60 transition-all duration-500`}
              style={{ animationDuration: `${integration.duration * 0.7}s` }}
            />
            
            {/* Secondary Glow Layer */}
            <div 
              className={`absolute inset-2 rounded-lg bg-gradient-to-br ${integration.color} opacity-20 blur-md animate-pulse-integration-offset group-hover:opacity-40 transition-all duration-500`}
              style={{ animationDuration: `${integration.duration * 0.5}s` }}
            />
            
            {/* Icon Container with better visibility */}
            <div className="relative w-full h-full flex items-center justify-center p-3 bg-white/20 rounded-xl backdrop-blur-sm border border-white/10 group-hover:bg-white/30 group-hover:border-white/20 transition-all duration-500">
              <img 
                src={integration.icon} 
                alt={integration.name}
                className="w-full h-full object-contain opacity-80 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  filter: hoveredIntegration === integration.id 
                    ? 'brightness(1.1) saturate(1.1)' 
                    : 'brightness(0.9) saturate(0.8)',
                }}
              />
            </div>

            {/* Enhanced Connection Lines */}
            <div 
              className="absolute inset-0 border border-white/10 rounded-xl animate-rotate-integration group-hover:border-white/30 transition-all duration-500"
              style={{ 
                animationDuration: `${integration.rotationSpeed}s`,
                animationDirection: integration.id % 2 === 0 ? 'normal' : 'reverse'
              }}
            />

            {/* Hover Label */}
            {hoveredIntegration === integration.id && (
              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap pointer-events-none">
                <span className="text-theme-text-primary text-xs font-medium bg-theme-bg-primary/90 px-3 py-1 rounded-full border border-theme-text-primary/30 animate-fade-in backdrop-blur-sm">
                  {integration.name}
                </span>
              </div>
            )}

            {/* Floating Particles on Hover */}
            {hoveredIntegration === integration.id && (
              <div className="absolute inset-0 pointer-events-none">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-1 h-1 bg-blue-400 rounded-full animate-float-particle opacity-70"
                    style={{
                      left: `${20 + i * 15}%`,
                      top: `${15 + (i % 2) * 50}%`,
                      animationDelay: `${i * 0.3}s`,
                      animationDuration: `${2 + i * 0.3}s`,
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

// Enhanced floating particles with constellation connections
const FloatingParticles = () => {
  const [particles, setParticles] = useState([]);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const particleArray = [];
    for (let i = 0; i < 60; i++) {
      particleArray.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 4 + 1,
        delay: Math.random() * 10,
        duration: Math.random() * 20 + 10,
        type: Math.random() > 0.7 ? 'star' : 'dot', // 30% chance of star particles
        opacity: Math.random() * 0.6 + 0.2,
      });
    }
    setParticles(particleArray);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Calculate connections between nearby particles
  const getConnections = () => {
    const connections = [];
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const distance = Math.sqrt(
          Math.pow(particles[i].x - particles[j].x, 2) + 
          Math.pow(particles[i].y - particles[j].y, 2)
        );
        if (distance < 20) { // Connect particles within 20% of screen
          connections.push({
            x1: particles[i].x,
            y1: particles[i].y,
            x2: particles[j].x,
            y2: particles[j].y,
            opacity: Math.max(0, 0.3 - distance / 60),
          });
        }
      }
    }
    return connections;
  };

  const connections = getConnections();

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {/* Mouse spotlight effect */}
      <div 
        className="absolute w-96 h-96 rounded-full pointer-events-none transition-all duration-1000 ease-out"
        style={{
          left: `${mousePos.x}%`,
          top: `${mousePos.y}%`,
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, rgba(59, 130, 246, 0.05) 30%, transparent 70%)',
          transform: 'translate(-50%, -50%)',
        }}
      />

      {/* Constellation connections */}
      <svg className="absolute inset-0 w-full h-full">
        {connections.map((connection, index) => (
          <line
            key={index}
            x1={`${connection.x1}%`}
            y1={`${connection.y1}%`}
            x2={`${connection.x2}%`}
            y2={`${connection.y2}%`}
            stroke="rgba(59, 130, 246, 0.3)"
            strokeWidth="1"
            opacity={connection.opacity}
            className="animate-pulse-line"
          />
        ))}
      </svg>

      {/* Enhanced particles */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className={`absolute transition-all duration-1000 ${
            particle.type === 'star' 
              ? 'animate-twinkle' 
              : 'animate-float'
          }`}
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            animationDelay: `${particle.delay}s`,
            animationDuration: `${particle.duration}s`,
            opacity: particle.opacity,
          }}
        >
          {particle.type === 'star' ? (
            <div className="w-full h-full bg-yellow-300 rounded-full relative">
              <div className="absolute inset-0 bg-yellow-300 rounded-full animate-ping" />
            </div>
          ) : (
            <div className="w-full h-full bg-blue-400 rounded-full opacity-60" />
          )}
        </div>
      ))}
    </div>
  );
};

// Aurora wave effect
const AuroraWaves = () => (
  <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-20">
    <div className="absolute inset-0 animate-aurora-wave-1">
      <div className="h-full w-full bg-gradient-to-r from-transparent via-green-400 to-transparent transform rotate-12 scale-150 opacity-30" />
    </div>
    <div className="absolute inset-0 animate-aurora-wave-2">
      <div className="h-full w-full bg-gradient-to-r from-transparent via-purple-400 to-transparent transform -rotate-12 scale-150 opacity-20" />
    </div>
    <div className="absolute inset-0 animate-aurora-wave-3">
      <div className="h-full w-full bg-gradient-to-r from-transparent via-blue-400 to-transparent transform rotate-6 scale-150 opacity-25" />
    </div>
  </div>
);

// Glowing orb component with enhanced effects
const GlowingOrb = ({ className = "", size = "w-32 h-32", color = "bg-blue-500" }) => (
  <div className={`absolute ${size} ${color} rounded-full opacity-30 blur-xl animate-glow-pulse ${className} hover:scale-110 transition-transform duration-1000`}>
    <div className={`absolute inset-2 ${color} rounded-full opacity-50 blur-md animate-glow-pulse-offset`} />
    <div className={`absolute inset-4 ${color} rounded-full opacity-70 blur-sm animate-glow-pulse-double`} />
  </div>
);

// Geometric patterns
const GeometricPatterns = () => (
  <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-10">
    <div className="absolute top-1/4 left-1/4 w-32 h-32 border border-blue-400 rotate-45 animate-rotate-slow" />
    <div className="absolute bottom-1/3 right-1/4 w-24 h-24 border border-purple-400 animate-rotate-reverse" />
    <div className="absolute top-1/2 right-1/3 w-16 h-16 border border-teal-400 rotate-12 animate-float-geometric" />
  </div>
);

export default function OnboardingHome() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { t } = useTranslation();
  const srcSet = IMG_SRCSET?.[theme] || IMG_SRCSET.default;

  return (
    <>
      <div className="relative w-screen h-screen flex overflow-hidden bg-theme-bg-primary">
        {/* Enhanced Floating Particles Background */}
        <FloatingParticles />
        
        {/* Enhanced Floating Integrations */}
        <FloatingIntegrations />
        
        {/* Aurora Waves */}
        <AuroraWaves />
        
        {/* Geometric Patterns */}
        <GeometricPatterns />
        
        {/* Animated Gradient Background with breathing effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 via-purple-900/5 to-teal-900/10 animate-gradient-shift" />
        <div className="absolute inset-0 bg-gradient-to-tr from-purple-900/5 via-blue-900/10 to-green-900/5 animate-gradient-shift-reverse" />
        
        {/* Enhanced Glowing Orbs */}
        <GlowingOrb className="top-1/4 left-1/4" size="w-48 h-48" color="bg-blue-500" />
        <GlowingOrb className="bottom-1/4 right-1/4" size="w-64 h-64" color="bg-purple-500" />
        <GlowingOrb className="top-1/2 right-1/3" size="w-32 h-32" color="bg-teal-500" />
        <GlowingOrb className="bottom-1/2 left-1/2" size="w-40 h-40" color="bg-green-500" />

        {/* Enhanced Left Group Image with more effects */}
        <div
          className="hidden md:block fixed bottom-10 left-10 w-[320px] h-[320px] bg-no-repeat bg-contain transform transition-all duration-1000 hover:scale-125 hover:rotate-2 animate-float-slow group cursor-pointer"
          style={{ 
            backgroundImage: `url(${srcSet.l})`,
            filter: 'drop-shadow(0 0 20px rgba(59, 130, 246, 0.3))',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-transparent rounded-lg animate-pulse-glow" />
          <div className="absolute inset-0 border-2 border-blue-400/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-border-glow" />
        </div>

        {/* Enhanced Right Group Image with more effects */}
        <div
          className="hidden md:block fixed top-10 right-10 w-[320px] h-[320px] bg-no-repeat bg-contain transform transition-all duration-1000 hover:scale-125 hover:-rotate-2 animate-float-slow-reverse group cursor-pointer"
          style={{ 
            backgroundImage: `url(${srcSet.r})`,
            filter: 'drop-shadow(0 0 20px rgba(168, 85, 247, 0.3))',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-l from-purple-500/20 to-transparent rounded-lg animate-pulse-glow" />
          <div className="absolute inset-0 border-2 border-purple-400/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-border-glow" />
        </div>

        {/* Main Content with enhanced breathing and glow effects */}
        <div className="relative flex justify-center items-center m-auto z-10">
          <div className="flex flex-col justify-center items-center animate-breathe">
            {/* Enhanced Title with more sophisticated glow */}
            <p className="text-theme-text-primary font-thin text-[24px] animate-text-glow mb-2 text-center tracking-wide hover:scale-105 transition-transform duration-500">
              {t("onboarding.home.title")}
              <span className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 blur-xl opacity-20 animate-pulse-soft" />
            </p>
            
            {/* Logo with enhanced effects and hover interactions */}
            <div className="relative mb-8 group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-xl opacity-30 animate-pulse group-hover:opacity-60 transition-opacity duration-500" />
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-teal-500 rounded-full blur-2xl opacity-20 animate-pulse-offset group-hover:opacity-40 transition-opacity duration-500" />
              <img
                src={AnythingLLMLogo}
                alt="Axon"
                className="relative md:h-[50px] flex-shrink-0 max-w-[300px] light:invert transform transition-all duration-700 hover:scale-125 hover:rotate-3 animate-logo-pulse cursor-pointer"
                style={{ filter: 'drop-shadow(0 0 15px rgba(59, 130, 246, 0.5))' }}
              />
              <div className="absolute inset-0 rounded-full border border-blue-400/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-spin-slow" />
            </div>

            {/* Tagline */}
            <p className="text-theme-text-secondary font-medium text-lg mb-6 animate-text-glow opacity-80 text-center">
              Own your AI
            </p>
            
            {/* Enhanced Button with sophisticated multi-layer effects */}
            <div className="relative group">
              {/* Outer glow layers */}
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-500 via-purple-500 to-teal-500 rounded-lg blur-lg opacity-20 group-hover:opacity-40 transition-all duration-700 animate-pulse-border" />
              <div className="absolute -inset-2 bg-gradient-to-r from-teal-500 via-blue-500 to-purple-500 rounded-lg blur-md opacity-30 group-hover:opacity-60 transition-all duration-700 animate-pulse-border-offset" />
              
              {/* Main Button */}
              <button
                onClick={() => navigate(paths.onboarding.llmPreference())}
                className="relative border-[2px] border-theme-text-primary w-full md:max-w-[350px] md:min-w-[300px] text-center py-3 bg-theme-button-primary hover:bg-theme-bg-secondary text-theme-text-primary font-semibold text-sm rounded-md transition-all duration-700 transform hover:scale-110 hover:shadow-2xl hover:shadow-blue-500/30 animate-button-glow group overflow-hidden"
              >
                <span className="relative z-10 transition-all duration-500 group-hover:text-blue-200">{t("onboarding.home.getStarted")}</span>
                
                {/* Button Inner Effects */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-teal-500/10 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 skew-x-12" />
                
                {/* Button Border Glow */}
                <div className="absolute inset-0 rounded-md border border-blue-400/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-border-glow-intense" />
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Grid Pattern Overlay with movement */}
        <div className="absolute inset-0 opacity-5 animate-grid-drift" 
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)`,
            backgroundSize: '50px 50px'
          }}
        />

        {/* Ambient light spots */}
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl animate-ambient-pulse" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl animate-ambient-pulse-offset" />
      </div>
    </>
  );
}

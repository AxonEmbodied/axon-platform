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

// Floating particles component
const FloatingParticles = () => {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    const particleArray = [];
    for (let i = 0; i < 50; i++) {
      particleArray.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 4 + 1,
        delay: Math.random() * 10,
        duration: Math.random() * 20 + 10,
      });
    }
    setParticles(particleArray);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute rounded-full bg-blue-400 opacity-20 animate-float"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            animationDelay: `${particle.delay}s`,
            animationDuration: `${particle.duration}s`,
          }}
        />
      ))}
    </div>
  );
};

// Glowing orb component
const GlowingOrb = ({ className = "", size = "w-32 h-32", color = "bg-blue-500" }) => (
  <div className={`absolute ${size} ${color} rounded-full opacity-30 blur-xl animate-glow-pulse ${className}`} />
);

export default function OnboardingHome() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { t } = useTranslation();
  const srcSet = IMG_SRCSET?.[theme] || IMG_SRCSET.default;

  return (
    <>
      <div className="relative w-screen h-screen flex overflow-hidden bg-theme-bg-primary">
        {/* Floating Particles Background */}
        <FloatingParticles />
        
        {/* Animated Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 via-purple-900/5 to-teal-900/10 animate-gradient-shift" />
        
        {/* Glowing Orbs */}
        <GlowingOrb className="top-1/4 left-1/4" size="w-48 h-48" color="bg-blue-500" />
        <GlowingOrb className="bottom-1/4 right-1/4" size="w-64 h-64" color="bg-purple-500" />
        <GlowingOrb className="top-1/2 right-1/3" size="w-32 h-32" color="bg-teal-500" />

        {/* Enhanced Left Group Image with Glow */}
        <div
          className="hidden md:block fixed bottom-10 left-10 w-[320px] h-[320px] bg-no-repeat bg-contain transform transition-all duration-1000 hover:scale-110 animate-float-slow"
          style={{ 
            backgroundImage: `url(${srcSet.l})`,
            filter: 'drop-shadow(0 0 20px rgba(59, 130, 246, 0.3))',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-transparent rounded-lg animate-pulse-glow" />
        </div>

        {/* Enhanced Right Group Image with Glow */}
        <div
          className="hidden md:block fixed top-10 right-10 w-[320px] h-[320px] bg-no-repeat bg-contain transform transition-all duration-1000 hover:scale-110 animate-float-slow-reverse"
          style={{ 
            backgroundImage: `url(${srcSet.r})`,
            filter: 'drop-shadow(0 0 20px rgba(168, 85, 247, 0.3))',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-l from-purple-500/20 to-transparent rounded-lg animate-pulse-glow" />
        </div>

        {/* Main Content with Enhanced Effects */}
        <div className="relative flex justify-center items-center m-auto z-10">
          <div className="flex flex-col justify-center items-center">
            {/* Enhanced Title with Glow */}
            <p className="text-theme-text-primary font-thin text-[24px] animate-text-glow mb-2 text-center tracking-wide">
              {t("onboarding.home.title")}
            </p>
            
            {/* Logo with Enhanced Effects */}
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-xl opacity-30 animate-pulse" />
              <img
                src={AnythingLLMLogo}
                alt="Axon"
                className="relative md:h-[50px] flex-shrink-0 max-w-[300px] light:invert transform transition-all duration-500 hover:scale-110 animate-logo-pulse"
                style={{ filter: 'drop-shadow(0 0 15px rgba(59, 130, 246, 0.5))' }}
              />
            </div>
            
            {/* Enhanced Button with Multiple Effects */}
            <div className="relative group">
              {/* Button Glow Background */}
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-purple-500 to-teal-500 rounded-lg blur opacity-30 group-hover:opacity-60 transition-all duration-500 animate-pulse-border" />
              
              {/* Main Button */}
              <button
                onClick={() => navigate(paths.onboarding.llmPreference())}
                className="relative border-[2px] border-theme-text-primary w-full md:max-w-[350px] md:min-w-[300px] text-center py-3 bg-theme-button-primary hover:bg-theme-bg-secondary text-theme-text-primary font-semibold text-sm rounded-md transition-all duration-500 transform hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25 animate-button-glow group"
              >
                <span className="relative z-10">{t("onboarding.home.getStarted")}</span>
                
                {/* Button Inner Glow */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-teal-500/10 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </button>
            </div>
          </div>
        </div>

        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 opacity-5" 
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)`,
            backgroundSize: '50px 50px'
          }}
        />
      </div>
    </>
  );
}

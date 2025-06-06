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
import TpLinkIcon from "@/media/svg/tp-link-logo.svg";

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
  { name: "TP-Link", icon: TpLinkIcon, color: "from-yellow-400 to-green-500", target: "/test" },
];

// Logical connection groups for network sparks
const connectionGroups = [
  {
    name: "Google Ecosystem",
    members: ["Gmail", "Google Drive", "Calendar", "Google Meet"],
    sparkColor: "rgba(66, 133, 244, 0.8)", // Google blue
    sparkType: "data-sync"
  },
  {
    name: "Communication",
    members: ["Slack", "WhatsApp"],
    sparkColor: "rgba(124, 58, 237, 0.8)", // Purple
    sparkType: "message-flow"
  },
  {
    name: "Code Repositories",
    members: ["GitHub", "GitLab"],
    sparkColor: "rgba(34, 197, 94, 0.8)", // Green
    sparkType: "code-sync"
  },
  {
    name: "Development Stack",
    members: ["Docker", "Ubuntu", "GitHub", "TP-Link"],
    sparkColor: "rgba(59, 130, 246, 0.8)", // Blue
    sparkType: "dev-workflow"
  },
  {
    name: "Social & Media",
    members: ["Instagram", "Spotify"],
    sparkColor: "rgba(236, 72, 153, 0.8)", // Pink
    sparkType: "content-sync"
  },
  {
    name: "Commerce",
    members: ["PayPal", "Airbnb"],
    sparkColor: "rgba(245, 158, 11, 0.8)", // Amber
    sparkType: "transaction-flow"
  },
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

// Epic Circle Coalescing Integration Background
const FloatingIntegrations = ({
  onCircleFormationComplete,
  isAccelerating,
  isFlashing,
  isButtonHovered,
  integrationPositions,
  setIntegrationPositions,
  visibleIntegrations,
  setVisibleIntegrations,
}) => {
  const [hoveredIntegration, setHoveredIntegration] = useState(null);
  const [circleProgress, setCircleProgress] = useState(0);
  const navigate = useNavigate();

  const handleIconClick = (target) => {
    if (target) {
      navigate(target);
    }
  };

  // Recalculate circle positions whenever visible integrations change
  const recalculateCirclePositions = (visibleSet) => {
    const centerX = 50;
    const centerY = 50;
    const radius = 25;
    
    const visibleArray = Array.from(visibleSet).sort((a, b) => a - b); // Keep consistent ordering
    
    return integrations.map((integration, originalIndex) => {
      if (!visibleSet.has(originalIndex)) {
        // For invisible integrations, return off-screen position
        return {
          targetX: Math.random() > 0.5 ? -20 : 120, // Off-screen left or right
          targetY: Math.random() * 100,
        };
      }
      
      // For visible integrations, calculate their position in the circle
      const visibleIndex = visibleArray.indexOf(originalIndex);
      const angle = (visibleIndex / visibleArray.length) * 2 * Math.PI;
      const circleX = centerX + Math.cos(angle) * radius;
      const circleY = centerY + Math.sin(angle) * radius;
      
      return {
        targetX: circleX,
        targetY: circleY,
      };
    });
  };

  useEffect(() => {
    // Initialize integration positions
    const positions = integrations.map((integration, index) => ({
      ...integration,
      id: index,
      // Random starting positions
      startX: Math.random() * 70 + 15,
      startY: Math.random() * 70 + 15,
      // Will be calculated dynamically
      targetX: Math.random() * 70 + 15,
      targetY: Math.random() * 70 + 15,
      // Current positions (will interpolate)
      currentX: Math.random() * 70 + 15,
      currentY: Math.random() * 70 + 15,
      size: Math.random() * 40 + 50,
      opacity: Math.random() * 0.4 + 0.3,
      delay: Math.random() * 10,
      duration: Math.random() * 15 + 10,
      rotationSpeed: Math.random() * 360 + 120,
      hoverScale: Math.random() * 0.3 + 1.2,
      angle: (index / integrations.length) * 2 * Math.PI, // Store original angle for spinning
      isNewlyVisible: false, // Track if this just became visible
    }));
    setIntegrationPositions(positions);

    // Start with about half the integrations visible
    const initialCount = Math.floor(integrations.length / 2);
    const shuffledIndices = [...Array(integrations.length).keys()].sort(() => Math.random() - 0.5);
    const initialVisible = new Set(shuffledIndices.slice(0, initialCount));
    setVisibleIntegrations(initialVisible);

    // Gradually introduce the remaining integrations
    const remainingIndices = shuffledIndices.slice(initialCount);
    remainingIndices.forEach((index, i) => {
      setTimeout(() => {
        setVisibleIntegrations((prev) => new Set([...prev, index]));
      }, (i + 1) * (Math.random() * 3000 + 1500)); // Random intervals between 1.5-4.5 seconds
    });
  }, []);

  // Recalculate positions whenever visible integrations change
  useEffect(() => {
    if (integrationPositions.length === 0) return;

    const newTargets = recalculateCirclePositions(visibleIntegrations);
    
    setIntegrationPositions((prev) =>
      prev.map((integration, index) => {
        const newTarget = newTargets[index];
        const wasVisible =
          prev[index].targetX >= 0 && prev[index].targetX <= 100;
        const isNowVisible = visibleIntegrations.has(index);
        
        return {
          ...integration,
          targetX: newTarget.targetX,
          targetY: newTarget.targetY,
          // If just became visible, start from off-screen
          startX:
            !wasVisible && isNowVisible
              ? Math.random() > 0.5
                ? -30
                : 130 // Start off-screen
              : integration.currentX, // Keep current position as new start
          startY:
            !wasVisible && isNowVisible
              ? Math.random() * 100
              : integration.currentY,
          currentX:
            !wasVisible && isNowVisible
              ? Math.random() > 0.5
                ? -30
                : 130
              : integration.currentX,
          currentY:
            !wasVisible && isNowVisible
              ? Math.random() * 100
              : integration.currentY,
          isNewlyVisible: !wasVisible && isNowVisible,
        };
      })
    );
  }, [visibleIntegrations]);

  // Animate circle formation - starts immediately with visible integrations
  useEffect(() => {
    if (integrationPositions.length === 0) return;

    const interval = setInterval(() => {
      setCircleProgress((prev) => {
        const speed = isAccelerating ? 0.025 : 0.008;
        const newProgress = Math.min(prev + speed, 1);
        
        if (newProgress >= 1 && !isAccelerating) {
          onCircleFormationComplete?.();
        }
        
        return newProgress;
      });

      setIntegrationPositions((prev) => {
        return prev.map((integration) => {
          const progress = circleProgress;
          const easeProgress = 1 - Math.pow(1 - progress, 2); // Gentler ease
          
          return {
            ...integration,
            currentX:
              integration.startX +
              (integration.targetX - integration.startX) * easeProgress,
            currentY:
              integration.startY +
              (integration.targetY - integration.startY) * easeProgress,
            isNewlyVisible: false, // Reset after first animation frame
          };
        });
      });
    }, 32); // 30fps for smoother organic movement

    return () => clearInterval(interval);
  }, [
    integrationPositions.length,
    circleProgress,
    isAccelerating,
    onCircleFormationComplete,
    setIntegrationPositions,
  ]);

  return (
    <div className={`fixed inset-0 pointer-events-none overflow-hidden opacity-70 transition-transform duration-2000`} style={{ zIndex: 10 }}>
      {integrationPositions.map((integration) => (
        visibleIntegrations.has(integration.id) && (
          <div
            key={integration.id}
            className={`absolute transition-all duration-2000 pointer-events-auto cursor-pointer ease-out ${integration.isNewlyVisible ? 'animate-fade-in' : ''}`}
            style={{
              left: `${integration.currentX}%`,
              top: `${integration.currentY}%`,
              transform: `translate(-50%, -50%)`,
              transitionDuration: isAccelerating ? '1.5s' : '2s',
              animationDelay: `${integration.delay}s`,
            }}
            onMouseEnter={() => setHoveredIntegration(integration.id)}
            onMouseLeave={() => setHoveredIntegration(null)}
            onClick={() => handleIconClick(integration.target)}
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
                transition: 'all 0.8s ease-out',
              }}
            >
              {/* Enhanced Glow Background */}
              <div 
                className={`absolute inset-0 rounded-xl bg-gradient-to-br ${integration.color} opacity-30 blur-lg animate-pulse-integration group-hover:opacity-60 transition-all duration-1000 ${circleProgress > 0.7 ? 'animate-circle-glow' : ''} ${isButtonHovered ? 'animate-bounce opacity-50' : ''} ${isFlashing ? 'animate-ping opacity-80' : ''}`}
                style={{ animationDuration: `${integration.duration * 0.7}s` }}
              />
              
              {/* Secondary Glow Layer */}
              <div 
                className={`absolute inset-2 rounded-lg bg-gradient-to-br ${integration.color} opacity-20 blur-md animate-pulse-integration-offset group-hover:opacity-40 transition-all duration-1000 ${isButtonHovered ? 'opacity-35' : ''} ${isFlashing ? 'animate-pulse opacity-60' : ''}`}
                style={{ animationDuration: `${integration.duration * 0.5}s` }}
              />
              
              {/* Icon Container with better visibility */}
              <div className={`relative w-full h-full flex items-center justify-center p-3 bg-theme-bg-primary rounded-xl backdrop-blur-sm border border-white/10 group-hover:border-white/20 transition-all duration-800 ${isButtonHovered ? 'border-white/25 shadow-lg' : ''} ${isFlashing ? 'border-white/40 animate-pulse shadow-2xl' : ''}`} 
                style={{ 
                  backgroundColor: 'var(--theme-bg-primary)',
                  position: 'relative',
                  zIndex: 5
                }}>
                {/* Solid background blocker */}
                <div className="absolute inset-0 rounded-xl" style={{ backgroundColor: 'var(--theme-bg-primary)', opacity: 1, zIndex: 1 }} />
                
                {/* Content layer */}
                <div className="relative z-10 w-full h-full flex items-center justify-center">
                  <img 
                    src={integration.icon} 
                    alt={integration.name}
                    className={`w-full h-full object-contain opacity-80 group-hover:opacity-100 transition-opacity duration-800 ${isButtonHovered ? 'opacity-90 brightness-110' : ''} ${isFlashing ? 'opacity-100 brightness-125 animate-pulse' : ''}`}
                    style={{
                      filter: hoveredIntegration === integration.id 
                        ? 'brightness(1.1) saturate(1.1)' 
                        : 'brightness(0.9) saturate(0.8)',
                    }}
                  />
                </div>
              </div>

              {/* Enhanced Connection Lines */}
              <div 
                className={`absolute inset-0 border border-white/10 rounded-xl animate-rotate-integration group-hover:border-white/30 transition-all duration-800 ${isButtonHovered ? 'border-blue-400/40' : ''} ${isFlashing ? 'border-white/60' : ''}`}
                style={{ 
                  animationDuration: `${integration.rotationSpeed}s`,
                  animationDirection: integration.id % 2 === 0 ? 'normal' : 'reverse'
                }}
              />

              {/* Circle Formation Progress Ring - appears earlier and smoother */}
              {circleProgress > 0.3 && (
                <div 
                  className={`absolute inset-0 border-2 border-blue-400/30 rounded-xl animate-pulse-border transition-all duration-1000 ${isButtonHovered ? 'border-blue-400/50' : ''} ${isFlashing ? 'border-white/80 animate-ping' : ''}`}
                  style={{
                    opacity: Math.min((circleProgress - 0.3) * 1.5, 0.6),
                    borderColor: `rgba(59, 130, 246, ${Math.min((circleProgress - 0.3) * 0.8, 0.5)})`,
                  }}
                />
              )}

              {/* Hover Label */}
              {hoveredIntegration === integration.id && !isFlashing && (
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap pointer-events-none">
                  <span className="text-theme-text-primary text-xs font-medium bg-theme-bg-primary/90 px-3 py-1 rounded-full border border-theme-text-primary/30 animate-fade-in backdrop-blur-sm">
                    {integration.name}
                  </span>
                </div>
              )}

              {/* Floating Particles on Hover */}
              {hoveredIntegration === integration.id && !isFlashing && (
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
        )
      ))}

      {/* Circle Formation Progress Indicator - more subtle and professional */}
      {circleProgress > 0.15 && circleProgress < 0.95 && !isFlashing && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 pointer-events-none">
          <div className="text-theme-text-secondary text-sm opacity-60 animate-pulse-soft tracking-wide">
            {circleProgress < 0.4 ? 'Connecting' : circleProgress < 0.7 ? 'Integrating' : 'Aligning systems'}...
          </div>
        </div>
      )}

      {/* Integration Complete - subtle and professional */}
      {circleProgress >= 0.95 && !isFlashing && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 pointer-events-none">
          <div className="text-blue-400 text-sm font-medium animate-text-glow tracking-wide opacity-80">
            Systems aligned
          </div>
        </div>
      )}
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

// Network Connection Lines Component - Elegant and Visible
const NetworkConnections = ({ integrationPositions, visibleIntegrations, isFlashing }) => {
  const [connections, setConnections] = useState([]);
  const [connectionOpacities, setConnectionOpacities] = useState({});

  // Update connections continuously to track exact MCP positions
  useEffect(() => {
    if (isFlashing) return;

    const updateConnections = () => {
      const newConnections = [];
      const newOpacities = { ...connectionOpacities };

      // Create connections only for related integrations
      connectionGroups.forEach(group => {
        const groupMembers = group.members
          .map(memberName => {
            const index = integrations.findIndex(i => i.name === memberName);
            return { index, name: memberName };
          })
          .filter(member => {
            const pos = integrationPositions[member.index];
            return visibleIntegrations.has(member.index) && pos && 
                   pos.currentX >= 0 && pos.currentX <= 100 &&
                   pos.currentY >= 0 && pos.currentY <= 100;
          });

        // Only connect if we have at least 2 members in this group
        if (groupMembers.length >= 2) {
          // Connect each member to the next one
          for (let i = 0; i < groupMembers.length - 1; i++) {
            const fromPos = integrationPositions[groupMembers[i].index];
            const toPos = integrationPositions[groupMembers[i + 1].index];

            if (fromPos && toPos) {
              const connectionId = `${groupMembers[i].index}-${groupMembers[i + 1].index}`;
              
              // Initialize opacity for new connections
              if (!(connectionId in newOpacities)) {
                newOpacities[connectionId] = 0;
                // Fade in new connections
                setTimeout(() => {
                  setConnectionOpacities(prev => ({
                    ...prev,
                    [connectionId]: 1
                  }));
                }, 100);
              }

              newConnections.push({
                id: connectionId,
                // Use exact current positions of the MCP icons
                fromX: fromPos.currentX,
                fromY: fromPos.currentY,
                toX: toPos.currentX,
                toY: toPos.currentY,
                color: group.sparkColor,
                groupName: group.name,
                opacity: newOpacities[connectionId] || 0,
              });
            }
          }
        }
      });

      // Remove opacity entries for connections that no longer exist
      const currentConnectionIds = new Set(newConnections.map(c => c.id));
      Object.keys(newOpacities).forEach(id => {
        if (!currentConnectionIds.has(id)) {
          delete newOpacities[id];
        }
      });

      setConnections(newConnections);
      setConnectionOpacities(newOpacities);
    };

    // Update connections at 60fps for smooth tracking
    const interval = setInterval(updateConnections, 16); // ~60fps

    return () => clearInterval(interval);
  }, [integrationPositions, visibleIntegrations, isFlashing, connectionOpacities]);

  // Calculate curved path between two points with proper viewport coordinates
  const createCurvedPath = (fromX, fromY, toX, toY) => {
    // Convert percentages to viewport coordinates
    const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1920;
    const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 1080;
    
    const x1 = (fromX / 100) * viewportWidth;
    const y1 = (fromY / 100) * viewportHeight;
    const x2 = (toX / 100) * viewportWidth;
    const y2 = (toY / 100) * viewportHeight;
    
    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;
    const distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    const curveOffset = Math.min(distance * 0.3, 100); // Gentle curve in pixels
    
    // Calculate center of viewport
    const centerX = viewportWidth / 2;
    const centerY = viewportHeight / 2;
    
    // Calculate vector from line midpoint to center
    const toCenterX = centerX - midX;
    const toCenterY = centerY - midY;
    const toCenterLength = Math.sqrt(toCenterX * toCenterX + toCenterY * toCenterY);
    
    // Normalize the vector and apply curve offset toward center
    const normalizedX = toCenterLength > 0 ? toCenterX / toCenterLength : 0;
    const normalizedY = toCenterLength > 0 ? toCenterY / toCenterLength : 0;
    
    const controlX = midX + normalizedX * curveOffset;
    const controlY = midY + normalizedY * curveOffset;
    
    return `M ${x1} ${y1} Q ${controlX} ${controlY} ${x2} ${y2}`;
  };

  return (
    <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
      <svg className="absolute inset-0 w-full h-full" viewBox={`0 0 ${typeof window !== 'undefined' ? window.innerWidth : 1920} ${typeof window !== 'undefined' ? window.innerHeight : 1080}`}>
        <defs>
          {/* Gradient definitions for each connection type */}
          <linearGradient id="google-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(66, 133, 244, 0.6)" />
            <stop offset="50%" stopColor="rgba(66, 133, 244, 0.8)" />
            <stop offset="100%" stopColor="rgba(66, 133, 244, 0.6)" />
          </linearGradient>
          <linearGradient id="communication-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(124, 58, 237, 0.6)" />
            <stop offset="50%" stopColor="rgba(124, 58, 237, 0.8)" />
            <stop offset="100%" stopColor="rgba(124, 58, 237, 0.6)" />
          </linearGradient>
          <linearGradient id="code-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(34, 197, 94, 0.6)" />
            <stop offset="50%" stopColor="rgba(34, 197, 94, 0.8)" />
            <stop offset="100%" stopColor="rgba(34, 197, 94, 0.6)" />
          </linearGradient>
          <linearGradient id="dev-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(59, 130, 246, 0.6)" />
            <stop offset="50%" stopColor="rgba(59, 130, 246, 0.8)" />
            <stop offset="100%" stopColor="rgba(59, 130, 246, 0.6)" />
          </linearGradient>
          <linearGradient id="social-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(236, 72, 153, 0.6)" />
            <stop offset="50%" stopColor="rgba(236, 72, 153, 0.8)" />
            <stop offset="100%" stopColor="rgba(236, 72, 153, 0.6)" />
          </linearGradient>
          <linearGradient id="commerce-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(245, 158, 11, 0.6)" />
            <stop offset="50%" stopColor="rgba(245, 158, 11, 0.8)" />
            <stop offset="100%" stopColor="rgba(245, 158, 11, 0.6)" />
          </linearGradient>
          
          {/* Glow filter */}
          <filter id="connection-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {connections.map(connection => {
          const path = createCurvedPath(connection.fromX, connection.fromY, connection.toX, connection.toY);
          const gradientId = connection.groupName.toLowerCase().replace(/ /g, '-') + '-gradient';
          const connectionOpacity = connectionOpacities[connection.id] || 0;
          
          // Convert percentages to viewport coordinates for circles too
          const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1920;
          const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 1080;
          const fromPxX = (connection.fromX / 100) * viewportWidth;
          const fromPxY = (connection.fromY / 100) * viewportHeight;
          const toPxX = (connection.toX / 100) * viewportWidth;
          const toPxY = (connection.toY / 100) * viewportHeight;
          
          return (
            <g key={connection.id} style={{ transition: 'opacity 0.8s ease-in-out' }}>
              {/* Outer glow layer */}
              <path
                d={path}
                fill="none"
                stroke={connection.color}
                strokeWidth="3"
                opacity={connectionOpacity * 0.4}
                filter="url(#connection-glow)"
                className="animate-pulse-line"
              />
              
              {/* Main connection line */}
              <path
                d={path}
                fill="none"
                stroke={`url(#${gradientId})`}
                strokeWidth="2"
                opacity={connectionOpacity * 0.7}
                strokeLinecap="round"
                className="animate-pulse-line"
              />
              
              {/* Highlight line */}
              <path
                d={path}
                fill="none"
                stroke="rgba(255, 255, 255, 0.8)"
                strokeWidth="1"
                opacity={connectionOpacity * 0.3}
                strokeLinecap="round"
                strokeDasharray="4 8"
                className="animate-pulse-line"
                style={{ 
                  animationDelay: '1s',
                  animationDuration: '6s' 
                }}
              />
              
              {/* Connection nodes at endpoints */}
              <circle
                cx={fromPxX}
                cy={fromPxY}
                r="3"
                fill={connection.color}
                opacity={connectionOpacity * 0.6}
                className="animate-pulse-soft"
              />
              <circle
                cx={toPxX}
                cy={toPxY}
                r="3"
                fill={connection.color}
                opacity={connectionOpacity * 0.6}
                className="animate-pulse-soft"
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default function OnboardingHome() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { t } = useTranslation();
  const srcSet = IMG_SRCSET?.[theme] || IMG_SRCSET.default;

  // Circle formation states
  const [isCircleComplete, setIsCircleComplete] = useState(false);
  const [isAccelerating, setIsAccelerating] = useState(false);
  const [isFlashing, setIsFlashing] = useState(false);
  const [isButtonHovered, setIsButtonHovered] = useState(false);
  
  // Shared state for network sparks
  const [integrationPositions, setIntegrationPositions] = useState([]);
  const [visibleIntegrations, setVisibleIntegrations] = useState(new Set());

  const handleGetStarted = () => {
    if (!isCircleComplete) {
      // Speed up circle formation
      setIsAccelerating(true);
      
      // Wait for circle to complete, then flash
      setTimeout(() => {
        setIsFlashing(true);
        setTimeout(() => {
          navigate(paths.onboarding.llmPreference());
        }, 1500); // Flash for 1.5 seconds then navigate
      }, 4000);
    } else {
      // Circle is already complete, flash immediately
      setIsFlashing(true);
      setTimeout(() => {
        navigate(paths.onboarding.llmPreference());
      }, 1500); // Flash for 1.5 seconds
    }
  };

  const onCircleFormationComplete = () => {
    setIsCircleComplete(true);
  };

  return (
    <>
      <div className="relative w-screen h-screen flex overflow-hidden bg-theme-bg-primary">
        {/* Enhanced Floating Particles Background */}
        <FloatingParticles />
        
        {/* Network Connection Lines - Behind everything */}
        <NetworkConnections 
          integrationPositions={integrationPositions}
          visibleIntegrations={visibleIntegrations}
          isFlashing={isFlashing}
        />
        
        {/* Epic Circle Coalescing Integrations */}
        <FloatingIntegrations 
          onCircleFormationComplete={onCircleFormationComplete}
          isAccelerating={isAccelerating}
          isFlashing={isFlashing}
          isButtonHovered={isButtonHovered}
          integrationPositions={integrationPositions}
          setIntegrationPositions={setIntegrationPositions}
          visibleIntegrations={visibleIntegrations}
          setVisibleIntegrations={setVisibleIntegrations}
        />
        
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
            
            {/* Enhanced Button with epic transition logic */}
            <div className="relative group">
              {/* Outer glow layers */}
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-500 via-purple-500 to-teal-500 rounded-lg blur-lg opacity-20 group-hover:opacity-40 transition-all duration-700 animate-pulse-border" />
              <div className="absolute -inset-2 bg-gradient-to-r from-teal-500 via-blue-500 to-purple-500 rounded-lg blur-md opacity-30 group-hover:opacity-60 transition-all duration-700 animate-pulse-border-offset" />
              
              {/* Main Button */}
              <button
                onClick={handleGetStarted}
                onMouseEnter={() => setIsButtonHovered(true)}
                onMouseLeave={() => setIsButtonHovered(false)}
                disabled={isFlashing}
                className="relative border-[2px] border-theme-text-primary w-full md:max-w-[350px] md:min-w-[300px] text-center py-3 bg-theme-button-primary hover:bg-theme-bg-secondary text-theme-text-primary font-semibold text-sm rounded-md transition-all duration-700 transform hover:scale-110 hover:shadow-2xl hover:shadow-blue-500/30 animate-button-glow group overflow-hidden disabled:opacity-75"
              >
                <span className="relative z-10 transition-all duration-500 group-hover:text-blue-200">
                  {isFlashing ? 'Activating...' : isAccelerating ? 'Connecting...' : t("onboarding.home.getStarted")}
                </span>
                
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

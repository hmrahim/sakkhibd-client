import React from 'react';


const CorruptionBribeAnimation = () => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
      <style>{`
        /* Natural wind flutter & wave animation anchored to pole on the left */
        @keyframes clothWaveAnchored {
          0% {
            transform: skewY(0deg) scaleY(1);
          }
          25% {
            transform: skewY(1.8deg) scaleY(1.02);
          }
          50% {
            transform: skewY(-1.4deg) scaleY(0.98);
          }
          75% {
            transform: skewY(2.2deg) scaleY(1.03);
          }
          100% {
            transform: skewY(0deg) scaleY(1);
          }
        }

        /* Subtle pole flex in strong gusts */
        @keyframes poleFlex {
          0%, 100% {
            transform: rotate(0deg);
          }
          50% {
            transform: rotate(0.4deg);
          }
        }

        /* Moving shadow creases simulating realistic fabric folds */
        @keyframes windCylinderFolds {
          0% {
            background-position: -300px 0;
          }
          100% {
            background-position: 500px 0;
          }
        }

        /* Red circle ripple sync */
        @keyframes redCircleRipple {
          0%, 100% {
            transform: translate(0px, 0px) scale(1);
          }
          25% {
            transform: translate(4px, -6px) scale(1.02);
          }
          50% {
            transform: translate(-3px, 5px) scale(0.98);
          }
          75% {
            transform: translate(5px, -3px) scale(1.01);
          }
        }

        /* Ambient floating pollen/wind particles */
        @keyframes windBreezeStreak {
          0% {
            transform: translate3d(-10vw, 20px, 0) scale(0.8);
            opacity: 0;
          }
          20% {
            opacity: 0.7;
          }
          80% {
            opacity: 0.5;
          }
          100% {
            transform: translate3d(110vw, -40px, 0) scale(1.1);
            opacity: 0;
          }
        }

        .anim-pole-stand {
          animation: poleFlex 4.5s ease-in-out infinite;
          transform-origin: bottom center;
        }

        .anim-cloth-wave {
          animation: clothWaveAnchored 3.8s ease-in-out infinite;
          transform-origin: left center;
          will-change: transform;
        }

        .anim-sun-ripple {
          animation: redCircleRipple 3.8s ease-in-out infinite;
          transform-origin: 270px 180px;
        }

        .cloth-shade-moving {
          background: linear-gradient(
            90deg,
            rgba(0, 0, 0, 0.4) 0%,
            rgba(255, 255, 255, 0.18) 15%,
            rgba(0, 0, 0, 0.35) 30%,
            rgba(255, 255, 255, 0.22) 50%,
            rgba(0, 0, 0, 0.38) 70%,
            rgba(255, 255, 255, 0.15) 85%,
            rgba(0, 0, 0, 0.3) 100%
          );
          background-size: 350px 100%;
          animation: windCylinderFolds 3.2s linear infinite;
        }

        .anim-breeze-1 { animation: windBreezeStreak 9s linear infinite; }
        .anim-breeze-2 { animation: windBreezeStreak 12s linear infinite 2.5s; }
        .anim-breeze-3 { animation: windBreezeStreak 10s linear infinite 5s; }
      `}</style>

      {/* Atmospheric lighting */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#003828]/55 via-transparent to-[#002419]/85 pointer-events-none" />
      <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[360px] bg-red-600/15 rounded-full blur-[110px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[450px] bg-emerald-600/15 rounded-full blur-[130px] pointer-events-none" />

      {/* Wind Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[30%] left-0 w-2 h-2 rounded-full bg-red-400/40 blur-[1px] anim-breeze-1" />
        <div className="absolute top-[55%] left-0 w-3 h-3 rounded-full bg-emerald-300/40 blur-[1px] anim-breeze-2" />
        <div className="absolute top-[40%] left-0 w-2.5 h-2.5 rounded-full bg-yellow-300/35 blur-[1px] anim-breeze-3" />
      </div>

      {/* ======================================================== */}
      {/* FLAGPOST & WAVING BANGLADESH FLAG STRUCTURE */}
      {/* ======================================================== */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-45 hover:opacity-75 transition-opacity duration-700">
        <div className="relative w-full max-w-5xl h-[380px] sm:h-[450px] md:h-[500px] flex items-center justify-center">
          
          <svg
            viewBox="0 0 1000 550"
            className="w-full h-full object-contain"
            preserveAspectRatio="xMidYMid meet"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              {/* Metallic Pole Shading */}
              <linearGradient id="metallicPole" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#475569" />
                <stop offset="35%" stopColor="#f8fafc" />
                <stop offset="65%" stopColor="#94a3b8" />
                <stop offset="100%" stopColor="#334155" />
              </linearGradient>

              {/* Gold Finial Sphere (মাথার সোনালী গোলক) */}
              <radialGradient id="goldFinial" cx="35%" cy="35%" r="65%">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="50%" stopColor="#eab308" />
                <stop offset="85%" stopColor="#ca8a04" />
                <stop offset="100%" stopColor="#713f12" />
              </radialGradient>

              {/* Metallic Stand Base Gradient */}
              <linearGradient id="basePlateGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#1e293b" />
                <stop offset="30%" stopColor="#94a3b8" />
                <stop offset="70%" stopColor="#cbd5e1" />
                <stop offset="100%" stopColor="#1e293b" />
              </linearGradient>

              {/* Bangladesh Flag Green Fabric with depth */}
              <linearGradient id="flagGreenField" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#007a59" />
                <stop offset="40%" stopColor="#006A4E" />
                <stop offset="80%" stopColor="#004d38" />
                <stop offset="100%" stopColor="#003325" />
              </linearGradient>

              {/* Crimson Red Sun Radial Gradient */}
              <radialGradient id="flagRedSun" cx="45%" cy="45%" r="55%">
                <stop offset="0%" stopColor="#ff4d63" />
                <stop offset="70%" stopColor="#F42A41" />
                <stop offset="100%" stopColor="#c0172c" />
              </radialGradient>

              {/* Realistic 3D Wave Filter Distortion */}
              <filter id="waveClothFilter" x="-10%" y="-10%" width="120%" height="120%">
                <feTurbulence type="fractalNoise" baseFrequency="0.015 0.04" numOctaves="3" result="noise" />
                <feDisplacementMap in="SourceGraphic" in2="noise" scale="14" xChannelSelector="R" yChannelSelector="G" />
              </filter>

              <filter id="sunBloom" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="15" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* ================================================== */}
            {/* 1. STAND BASE & GROUND SHADOW */}
            {/* ================================================== */}
            <g id="flag-stand-base">
              {/* Floor Shadow of Base */}
              <ellipse cx="230" cy="535" rx="90" ry="14" fill="#000000" opacity="0.4" filter="blur(4px)" />
              {/* Tier 1 Bottom Base */}
              <ellipse cx="230" cy="530" rx="80" ry="12" fill="url(#basePlateGrad)" stroke="#475569" strokeWidth="1.5" />
              {/* Tier 2 Middle Base */}
              <ellipse cx="230" cy="522" rx="55" ry="9" fill="url(#basePlateGrad)" stroke="#64748b" strokeWidth="1" />
              {/* Tier 3 Ring Collar */}
              <ellipse cx="230" cy="516" rx="30" ry="5" fill="#eab308" stroke="#ca8a04" strokeWidth="1" />
            </g>

            {/* ================================================== */}
            {/* 2. FLAGPOLE (মজবুত স্টেনলেস স্টিল স্ট্যান্ড/খুঁটি) */}
            {/* ================================================== */}
            <g id="flag-pole" className="anim-pole-stand">
              {/* Main Pole Rod */}
              <rect x="224" y="25" width="12" height="492" rx="4" fill="url(#metallicPole)" stroke="#334155" strokeWidth="0.8" />

              {/* Golden Spherical Finial on Top of Mast */}
              <circle cx="230" cy="22" r="14" fill="url(#goldFinial)" stroke="#ca8a04" strokeWidth="1" />
              <ellipse cx="226" cy="18" rx="4" ry="2.5" fill="#ffffff" opacity="0.6" />

              {/* Top & Bottom Mounting Rings / Halter Clasps */}
              {/* Top Clasp */}
              <rect x="220" y="52" width="20" height="7" rx="2" fill="#ca8a04" stroke="#854d0e" strokeWidth="1" />
              <line x1="236" y1="55" x2="248" y2="55" stroke="#e2e8f0" strokeWidth="2.5" />

              {/* Bottom Clasp */}
              <rect x="220" y="388" width="20" height="7" rx="2" fill="#ca8a04" stroke="#854d0e" strokeWidth="1" />
              <line x1="236" y1="391" x2="248" y2="391" stroke="#e2e8f0" strokeWidth="2.5" />

              {/* Hoisting Cord / Rope running alongside pole */}
              <line x1="223" y1="28" x2="223" y2="515" stroke="#f1f5f9" strokeWidth="1.5" strokeDasharray="6 4" opacity="0.75" />
            </g>

            {/* ================================================== */}
            {/* 3. WAVING BANGLADESH NATIONAL FLAG (পতাকা) */}
            {/* ================================================== */}
            <g id="waving-flag" transform="translate(242, 54)">
              {/* Cloth Wave Group (Anchored to left pole clasps) */}
              <g className="anim-cloth-wave">
                
                {/* White hoist header reinforcement tape on the left edge */}
                <rect x="0" y="0" width="8" height="338" fill="#f8fafc" opacity="0.8" rx="1" />
                <circle cx="4" cy="4" r="2.5" fill="#64748b" />
                <circle cx="4" cy="334" r="2.5" fill="#64748b" />

                {/* THE WAVING FLAG FABRIC (10:6 official ratio, 560 x 336) */}
                <g transform="translate(8, 0)" filter="url(#waveClothFilter)">
                  {/* Green Field */}
                  <rect
                    x="0"
                    y="0"
                    width="560"
                    height="336"
                    rx="3"
                    fill="url(#flagGreenField)"
                  />

                  {/* Red Circle (Official proportion: centered 9/20th from left, r = 1/5th length) */}
                  <g className="anim-sun-ripple">
                    {/* Glowing Aura around Sun */}
                    <circle cx="245" cy="168" r="120" fill="#F42A41" opacity="0.25" filter="url(#sunBloom)" />
                    {/* Red Sun Circle */}
                    <circle cx="245" cy="168" r="112" fill="url(#flagRedSun)" />
                  </g>

                  {/* Wind Fold Wave Shadows layered directly in SVG */}
                  <path
                    d="M 0,0 C 140,25 280,-20 420,15 L 560,0 L 560,336 C 420,355 280,315 140,350 L 0,336 Z"
                    fill="url(#metallicPole)"
                    opacity="0.12"
                    mixBlendMode="overlay"
                  />
                  <path
                    d="M 0,0 C 180,-25 360,30 560,0 L 560,336 C 360,365 180,310 0,336 Z"
                    fill="#000000"
                    opacity="0.15"
                  />
                </g>

                {/* Foreign object overlay for continuous flowing 3D wind shimmer */}
                <foreignObject x="8" y="0" width="560" height="336" className="pointer-events-none">
                  <div className="w-full h-full cloth-shade-moving mix-blend-overlay opacity-60 rounded-r-md" />
                </foreignObject>

                {/* End Edge Tassel/Fringes flutter on the right */}
                <line x1="568" y1="0" x2="568" y2="336" stroke="#ffffff" strokeWidth="1" opacity="0.3" strokeDasharray="3 3" />
              </g>
            </g>
          </svg>
        </div>
      </div>
    </div>
  );
};

export default CorruptionBribeAnimation;


import React, { useEffect, useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';

const CHANNEL_URL = 'https://t.me/FXALKILANY';

export default function Landing() {
  const containerRef = useRef(null);
  const buttonRef = useRef(null);
  const [booted, setBooted] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [cursor, setCursor] = useState({ x: -100, y: -100, visible: false });
  const reduceMotion =
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const visitIdRef = useRef(null);
  const startRef = useRef(Date.now());
  const clickedRef = useRef(false);

  useEffect(() => {
    const t = setTimeout(() => setBooted(true), 80);
    return () => clearTimeout(t);
  }, []);

  // Track visit on mount, update duration periodically
  useEffect(() => {
    const sessionId =
      Math.random().toString(36).slice(2) + Date.now().toString(36);
    startRef.current = Date.now();
    base44.entities.PageVisit.create({
      session_id: sessionId,
      duration_seconds: 0,
      clicked: false,
    })
      .then((rec) => {
        visitIdRef.current = rec.id;
      })
      .catch(() => {});

    const interval = setInterval(() => {
      if (visitIdRef.current) {
        const elapsed = Math.floor((Date.now() - startRef.current) / 1000);
        base44.entities.PageVisit.update(visitIdRef.current, {
          duration_seconds: elapsed,
        }).catch(() => {});
      }
    }, 10000);

    const onUnload = () => {
      if (visitIdRef.current) {
        const elapsed = Math.floor((Date.now() - startRef.current) / 1000);
        base44.entities.PageVisit.update(visitIdRef.current, {
          duration_seconds: elapsed,
        }).catch(() => {});
      }
    };
    window.addEventListener('beforeunload', onUnload);

    return () => {
      clearInterval(interval);
      window.removeEventListener('beforeunload', onUnload);
      onUnload();
    };
  }, []);

  const handleAnyClick = () => {
    if (clickedRef.current) return;
    clickedRef.current = true;
    if (visitIdRef.current) {
      base44.entities.PageVisit.update(visitIdRef.current, {
        clicked: true,
        duration_seconds: Math.floor((Date.now() - startRef.current) / 1000),
      }).catch(() => {});
    }
    window.open(CHANNEL_URL, '_blank', 'noopener,noreferrer');
  };

  // Crosshair cursor
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const move = (e) => {
      const rect = el.getBoundingClientRect();
      setCursor({ x: e.clientX - rect.left, y: e.clientY - rect.top, visible: true });
    };
    const leave = () => setCursor((c) => ({ ...c, visible: false }));
    el.addEventListener('mousemove', move);
    el.addEventListener('mouseleave', leave);
    return () => {
      el.removeEventListener('mousemove', move);
      el.removeEventListener('mouseleave', leave);
    };
  }, []);

  // Light packets along streamers
  const streamers = [
    { from: { x: '0%', y: '0%' } },
    { from: { x: '100%', y: '0%' } },
    { from: { x: '0%', y: '100%' } },
    { from: { x: '100%', y: '100%' } },
    { from: { x: '50%', y: '0%' } },
    { from: { x: '50%', y: '100%' } },
    { from: { x: '0%', y: '50%' } },
    { from: { x: '100%', y: '50%' } },
  ];

  return (
    <div
      ref={containerRef}
      dir="rtl"
      onClick={handleAnyClick}
      className="relative h-screen w-screen overflow-hidden"
      style={{
        background:
          'radial-gradient(circle at 50% 50%, #0a1018 0%, #05070A 60%, #020306 100%)',
        cursor: 'none',
      }}
    >
      {/* Animated trading signals background */}
      {!reduceMotion && (
        <>
          {/* Candlestick stream */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-[0.10]">
            <div className="absolute left-0 right-0 top-[18%] flex items-end gap-3 alk-ticker-x">
              {[12,28,18,40,22,34,16,30,24,46,20,38,14,32,26,42,18,30,22,36].map((h, i) => (
                <div key={i} className="flex flex-col items-center">
                  <div style={{ width: 6, height: h * 2, background: i % 2 ? '#FF3B5C' : '#00F3FF' }} />
                  <div style={{ width: 1.5, height: 80, background: i % 2 ? '#FF3B5C' : '#00F3FF', marginTop: 2 }} />
                </div>
              ))}
            </div>
            <div className="absolute left-0 right-0 bottom-[22%] flex items-end gap-3 alk-ticker-x-rev">
              {[20,34,16,28,44,18,30,24,40,14,36,22,32,26,38,12,30,24,46,20].map((h, i) => (
                <div key={i} className="flex flex-col items-center">
                  <div style={{ width: 6, height: h * 2, background: i % 2 ? '#00F3FF' : '#FFD700' }} />
                  <div style={{ width: 1.5, height: 70, background: i % 2 ? '#00F3FF' : '#FFD700', marginTop: 2 }} />
                </div>
              ))}
            </div>
          </div>
          {/* Scrolling ticker text */}
          <div className="pointer-events-none absolute top-[8%] left-0 right-0 overflow-hidden opacity-30">
            <div className="alk-ticker-x whitespace-nowrap font-mono text-[11px] tracking-widest text-[#00F3FF]">
              {'EUR/USD 1.0876 ▲   GBP/USD 1.2742 ▼   XAU/USD 2438.5 ▲   BTC 67,420 ▲   USD/JPY 151.32 ▼   ETH 3,510 ▲   OIL 78.4 ▼   '.repeat(4)}
            </div>
          </div>
        </>
      )}

      {/* Grain overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      {/* Grid */}
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-1000"
        style={{
          opacity: booted ? 1 : 0,
          backgroundImage:
            'linear-gradient(rgba(26,30,35,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(26,30,35,0.5) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
          maskImage: 'radial-gradient(circle at 50% 50%, black 0%, transparent 70%)',
          WebkitMaskImage: 'radial-gradient(circle at 50% 50%, black 0%, transparent 70%)',
        }}
      />

      {/* Convergence streamers */}
      {!reduceMotion && (
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full"
          preserveAspectRatio="none"
          style={{ opacity: booted ? 1 : 0, transition: 'opacity 1.4s ease' }}
        >
          {streamers.map((s, i) => (
            <line
              key={i}
              x1={s.from.x}
              y1={s.from.y}
              x2="50%"
              y2="50%"
              stroke="#1A1E23"
              strokeWidth="1"
              strokeDasharray="4 8"
            >
              <animate
                attributeName="stroke-dashoffset"
                from="0"
                to={hovering ? '-48' : '-12'}
                dur={hovering ? '0.6s' : '3s'}
                repeatCount="indefinite"
              />
            </line>
          ))}
          {/* light packets */}
          {streamers.map((s, i) => (
            <circle key={`p${i}`} r="2.5" fill="#00F3FF">
              <animateMotion
                dur={`${hovering ? 0.8 : 2.4}s`}
                repeatCount="indefinite"
                begin={`${i * 0.3}s`}
                path={`M ${s.from.x} ${s.from.y} L 50% 50%`}
              />
              <animate
                attributeName="opacity"
                values="0;1;1;0"
                dur={`${hovering ? 0.8 : 2.4}s`}
                begin={`${i * 0.3}s`}
                repeatCount="indefinite"
              />
            </circle>
          ))}
        </svg>
      )}

      {/* Central glow floor */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          width: 600,
          height: 600,
          background:
            'radial-gradient(circle, rgba(0,243,255,0.18) 0%, rgba(0,243,255,0.04) 40%, transparent 70%)',
          filter: 'blur(20px)',
          opacity: booted ? 1 : 0,
          transition: 'opacity 1.6s ease',
          transform: hovering
            ? 'translate(-50%,-50%) scale(1.15)'
            : 'translate(-50%,-50%) scale(1)',
          animation: reduceMotion
            ? 'none'
            : 'alk-pulse 3.2s ease-in-out infinite',
        }}
      />

      {/* Dimmed background headline */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-[150%] md:-translate-y-[180%] text-center"
        style={{ opacity: booted ? 0.05 : 0, transition: 'opacity 2s ease 0.4s' }}
      >
        <span
          className="font-heading font-bold tracking-tight text-white"
          style={{ fontSize: 'clamp(48px, 12vw, 120px)', letterSpacing: '-0.05em' }}
        >
          الإشارة
        </span>
      </div>

      {/* Core button */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
        {/* Animated headline above button */}
        <div
          className="pointer-events-none mb-7 text-center px-4"
          style={{ opacity: booted ? 1 : 0, transition: 'opacity 1.6s ease 0.5s' }}
        >
          <p
            className="font-heading font-bold text-white alk-glow-text"
            style={{ fontSize: 'clamp(18px, 3.6vw, 28px)', lineHeight: 1.4 }}
          >
            <span className="alk-gradient-flow">اضغط على الزر للانضمام إلى أفضل قناة تداول في العالم</span>
          </p>
        </div>

        <div className="relative">
          {/* Multiple bouncing arrows above the button */}
          {!reduceMotion && (
            <>
              <div className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 alk-bounce-down">
                <svg width="38" height="38" viewBox="0 0 24 24" fill="none">
                  <path d="M12 5v14M12 19l6-6M12 19l-6-6" stroke="#00F3FF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="pointer-events-none absolute -top-8 left-[18%] alk-bounce-down" style={{ animationDelay: '0.3s' }}>
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
                  <path d="M12 5v14M12 19l6-6M12 19l-6-6" stroke="#FFD700" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="pointer-events-none absolute -top-8 right-[18%] alk-bounce-down" style={{ animationDelay: '0.6s' }}>
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
                  <path d="M12 5v14M12 19l6-6M12 19l-6-6" stroke="#FFD700" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="pointer-events-none absolute -right-8 top-1/2 -translate-y-1/2 alk-bounce-left hidden sm:block">
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
                  <path d="M19 12H5M5 12l6-6M5 12l6 6" stroke="#00F3FF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="pointer-events-none absolute -left-8 top-1/2 -translate-y-1/2 alk-bounce-right hidden sm:block">
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12h14M19 12l-6-6M19 12l-6 6" stroke="#FFD700" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              {/* Arrows below the button pointing up */}
              <div className="pointer-events-none absolute -bottom-8 left-1/2 -translate-x-1/2 alk-bounce-up">
                <svg width="38" height="38" viewBox="0 0 24 24" fill="none">
                  <path d="M12 19V5M12 5l-6 6M12 5l6 6" stroke="#00F3FF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="pointer-events-none absolute -bottom-8 left-[18%] alk-bounce-up" style={{ animationDelay: '0.4s' }}>
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
                  <path d="M12 19V5M12 5l-6 6M12 5l6 6" stroke="#FFD700" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="pointer-events-none absolute -bottom-8 right-[18%] alk-bounce-up" style={{ animationDelay: '0.7s' }}>
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
                  <path d="M12 19V5M12 5l-6 6M12 5l6 6" stroke="#FFD700" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </>
          )}

          {/* Flowing multi-color border along the button edges */}
          <div
            className="pointer-events-none absolute -inset-[3px] rounded-full alk-flow-border"
            style={{
              background:
                'repeating-linear-gradient(90deg, #00F3FF 0px, #FFD700 40px, #FF00E5 80px, #FFFFFF 120px, #00F3FF 160px)',
              backgroundSize: '320px 100%',
            }}
          >
            <div
              className="absolute inset-[3px] rounded-full"
              style={{ background: '#05070A' }}
            />
          </div>

          <div
            ref={buttonRef}
            role="button"
            tabIndex={0}
            onMouseEnter={() => setHovering(true)}
            onMouseLeave={() => setHovering(false)}
            onFocus={() => setHovering(true)}
            onBlur={() => setHovering(false)}
            className="group relative inline-flex items-center justify-center rounded-full outline-none transition-transform duration-300"
            style={{
              whiteSpace: 'nowrap',
              minWidth: 360,
              minHeight: 72,
              padding: '0 56px',
              background: hovering
                ? 'linear-gradient(90deg, rgba(0,243,255,0.25), rgba(255,215,0,0.25), rgba(255,0,229,0.25))'
                : 'linear-gradient(90deg, rgba(0,243,255,0.14), rgba(255,215,0,0.12), rgba(255,0,229,0.10))',
              border: '2px solid #00F3FF',
              boxShadow: hovering
                ? '0 0 50px 8px rgba(0,243,255,0.65), 0 0 120px 24px rgba(255,215,0,0.3), inset 0 0 36px rgba(0,243,255,0.25)'
                : '0 0 30px 3px rgba(0,243,255,0.45), 0 0 90px 14px rgba(255,215,0,0.18), inset 0 0 24px rgba(0,243,255,0.12)',
              transform: hovering ? 'scale(1.05)' : 'scale(1)',
              backdropFilter: 'blur(6px)',
            }}
          >
            <span
              className="font-heading font-extrabold text-white"
              style={{ fontSize: 22, letterSpacing: '0.04em', whiteSpace: 'nowrap' }}
            >
              انضم إلى FX ALKILANY
            </span>
            {/* inner pulse ring */}
            {!reduceMotion && (
              <span
                className="pointer-events-none absolute inset-0 rounded-full"
                style={{
                  border: '1px solid rgba(0,243,255,0.4)',
                  animation: 'alk-ring 2.4s ease-out infinite',
                }}
              />
            )}
          </div>
        </div>

        {/* tagline */}
        <div
          className="mt-6 text-center font-mono text-[12px] tracking-[0.3em]"
          style={{ color: 'rgba(255,255,255,0.4)', opacity: booted ? 1 : 0, transition: 'opacity 1.6s ease 0.6s' }}
        >
          إشارات تداول النخبة
        </div>
      </div>

      {/* Bottom flickering link */}
      <div
        className="absolute bottom-6 left-1/2 -translate-x-1/2 font-mono text-[11px] tracking-[0.25em] text-[#00F3FF]/70 transition-colors hover:text-[#00F3FF]"
        style={{ opacity: booted ? 1 : 0, transition: 'opacity 1.6s ease 0.8s' }}
      >
        <span className="alk-flicker">{CHANNEL_URL.replace('https://', '')}</span>
      </div>

      {/* Custom crosshair cursor */}
      {!reduceMotion && cursor.visible && (
        <div
          className="pointer-events-none absolute z-50"
          style={{ left: cursor.x, top: cursor.y, transform: 'translate(-50%,-50%)' }}
        >
          <div className="absolute h-[2px] w-5 -translate-x-1/2 -translate-y-1/2 bg-[#00F3FF]" />
          <div className="absolute h-5 w-[2px] -translate-x-1/2 -translate-y-1/2 bg-[#00F3FF]" />
          <div className="absolute h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#00F3FF]" />
        </div>
      )}

      {/* Focus ring for keyboard */}
      <style>{`
        @keyframes alk-pulse {
          0%,100% { opacity: 0.7; }
          50% { opacity: 1; }
        }
        @keyframes alk-ring {
          0% { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(1.35); opacity: 0; }
        }
        @keyframes alk-flicker {
          0%,100% { opacity: 1; }
          92% { opacity: 1; }
          94% { opacity: 0.3; }
          95% { opacity: 1; }
          96% { opacity: 0.4; }
          97% { opacity: 1; }
        }
        .alk-flicker { animation: alk-flicker 5s linear infinite; }
        @keyframes alk-bounce-down {
          0%,100% { transform: translate(-50%, 0); opacity: 0.5; }
          50% { transform: translate(-50%, 8px); opacity: 1; }
        }
        @keyframes alk-bounce-left {
          0%,100% { transform: translate(0, -50%); opacity: 0.5; }
          50% { transform: translate(-8px, -50%); opacity: 1; }
        }
        @keyframes alk-bounce-right {
          0%,100% { transform: translate(0, -50%); opacity: 0.5; }
          50% { transform: translate(8px, -50%); opacity: 1; }
        }
        .alk-bounce-down { animation: alk-bounce-down 1.4s ease-in-out infinite; }
        .alk-bounce-left { animation: alk-bounce-left 1.4s ease-in-out infinite; }
        .alk-bounce-right { animation: alk-bounce-right 1.4s ease-in-out infinite; }
        @keyframes alk-bounce-up {
          0%,100% { transform: translate(-50%, 0); opacity: 0.5; }
          50% { transform: translate(-50%, -8px); opacity: 1; }
        }
        .alk-bounce-up { animation: alk-bounce-up 1.4s ease-in-out infinite; }
        @keyframes alk-rotate { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        .alk-rotate { animation: alk-rotate 4s linear infinite; }
        @keyframes alk-flow-border {
          0% { background-position: 0 0; }
          100% { background-position: 320px 0; }
        }
        .alk-flow-border { animation: alk-flow-border 2.4s linear infinite; filter: drop-shadow(0 0 6px rgba(0,243,255,0.45)); }
        @keyframes alk-ticker-x {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes alk-ticker-x-rev {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
        .alk-ticker-x { animation: alk-ticker-x 18s linear infinite; }
        .alk-ticker-x-rev { animation: alk-ticker-x-rev 22s linear infinite; }
        .alk-glow-text { text-shadow: 0 0 18px rgba(0,243,255,0.5), 0 0 40px rgba(0,243,255,0.25); }
        .alk-gradient-flow {
          background: linear-gradient(90deg, #00F3FF 0%, #FFFFFF 50%, #00F3FF 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: alk-flow 3s linear infinite;
        }
        @keyframes alk-flow {
          0% { background-position: 0% center; }
          100% { background-position: 200% center; }
        }
        a:focus-visible { outline: 2px solid #FFFFFF; outline-offset: 4px; }
      `}</style>
    </div>
  );
}
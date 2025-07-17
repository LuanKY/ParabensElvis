import { Calendar, Coffee, Crown, Flame, Rocket, ShieldCheck, Sparkles, Trophy, Wrench } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

type Particle = { id: number, x: number, y: number, vx: number, vy: number, life: number, color: string, size: number };
type Firework = { id: number, x: number, y: number, particles: Array<{ x: number, y: number, vx: number, vy: number, life: number, color: string }> };
type Shockwave = { id: number, x: number, y: number, radius: number, maxRadius: number };
type Note = { note: number, duration: number, type: OscillatorType };

const happyBirthdayMelody: Note[] = [
  { note: 261.63, duration: 200, type: 'square' }, { note: 261.63, duration: 100, type: 'square' },
  { note: 293.66, duration: 300, type: 'square' }, { note: 261.63, duration: 300, type: 'square' },
  { note: 349.23, duration: 300, type: 'square' }, { note: 329.63, duration: 600, type: 'square' },
  { note: 261.63, duration: 200, type: 'square' }, { note: 261.63, duration: 100, type: 'square' },
  { note: 293.66, duration: 300, type: 'square' }, { note: 261.63, duration: 300, type: 'square' },
  { note: 392.00, duration: 300, type: 'square' }, { note: 349.23, duration: 600, type: 'square' },
  { note: 261.63, duration: 200, type: 'square' }, { note: 261.63, duration: 100, type: 'square' },
  { note: 523.25, duration: 300, type: 'sawtooth' }, { note: 440.00, duration: 300, type: 'sawtooth' },
  { note: 349.23, duration: 300, type: 'sawtooth' }, { note: 329.63, duration: 300, type: 'sawtooth' },
  { note: 293.66, duration: 600, type: 'sawtooth' }, { note: 466.16, duration: 200, type: 'square' },
  { note: 466.16, duration: 100, type: 'square' }, { note: 440.00, duration: 300, type: 'square' },
  { note: 349.23, duration: 300, type: 'square' }, { note: 392.00, duration: 300, type: 'square' },
  { note: 349.23, duration: 600, type: 'square' },
];

function App() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [celebrationActive, setCelebrationActive] = useState(false);
  const [celebrationText, setCelebrationText] = useState('');
  const [screenShake, setScreenShake] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameId = useRef<number>();
  const celebrationOverlayRef = useRef<HTMLDivElement>(null);

  const particlesRef = useRef<Particle[]>([]);
  const fireworksRef = useRef<Firework[]>([]);
  const shockwavesRef = useRef<Shockwave[]>([]);
  const isCelebratingRef = useRef(false);

  const playMelody = useCallback((melody: Note[]) => {
    if (!audioContextRef.current) {
      try {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      } catch (e) {
        console.error("Web Audio API is not supported in this browser.");
        return;
      }
    }
    const audioCtx = audioContextRef.current;
    let currentTime = audioCtx.currentTime;

    melody.forEach(noteInfo => {
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.type = noteInfo.type;
      oscillator.frequency.setValueAtTime(noteInfo.note, currentTime);
      gainNode.gain.setValueAtTime(0.07, currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + noteInfo.duration / 1000);

      oscillator.start(currentTime);
      oscillator.stop(currentTime + noteInfo.duration / 1000);

      currentTime += noteInfo.duration / 1000 + 0.05;
    });
  }, []);

  const triggerCelebration = useCallback(() => {
    if (isCelebratingRef.current) return;

    isCelebratingRef.current = true;
    setCelebrationActive(true);
    setScreenShake(true);
    setTimeout(() => setScreenShake(false), 800);

    setTimeout(() => {
      celebrationOverlayRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 500);

    playMelody(happyBirthdayMelody);

    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    [0, 300, 600].forEach((delay, index) => {
      setTimeout(() => {
        shockwavesRef.current.push({ id: Date.now() + index, x: centerX, y: centerY, radius: 0, maxRadius: Math.max(window.innerWidth, window.innerHeight) * 0.6 });
      }, delay);
    });

    const messages = [
      'SISTEMA INICIADO...',
      'OTIMIZANDO TABELAS DE PARABÉNS...',
      'FELIZ ANIVERSÁRIO ELVIS!',
      'BACKUP DE MAIS UM ANO COMPLETO!',
      'CONSISTÊNCIA: 100%, LATÊNCIA: 0%',
      'PARABÉNS!'
    ];
    messages.forEach((message, index) => {
      setTimeout(() => setCelebrationText(message), 1000 + index * 1500);
    });

    setTimeout(() => {
      isCelebratingRef.current = false;
      setCelebrationActive(false);
      setCelebrationText('');
    }, 10000);
  }, [playMelody]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    for (let i = 0; i < 25; i++) {
      particlesRef.current.push({
        id: i, x: Math.random() * canvas.width, y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 1, vy: (Math.random() - 0.5) * 1,
        life: 1, color: Math.random() > 0.3 ? 'gold' : 'white', size: Math.random() * 2 + 1
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particlesRef.current = particlesRef.current.map(p => {
        const newP = { ...p, x: p.x + p.vx, y: p.y + p.vy, life: Math.max(0, p.life - 0.003) };
        if (newP.x < 0 || newP.x > canvas.width) newP.vx *= -1;
        if (newP.y < 0 || newP.y > canvas.height) newP.vy *= -1;
        return newP;
      }).filter(p => p.life > 0);

      particlesRef.current.forEach(p => {
        ctx.shadowBlur = 8;
        ctx.shadowColor = p.color === 'gold' ? '#FFD700' : '#FFFFFF';
        ctx.fillStyle = p.color === 'gold' ? `rgba(255, 215, 0, ${p.life * 0.8})` : `rgba(255, 255, 255, ${p.life * 0.6})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.shadowBlur = 0;

      for (let i = 0; i < particlesRef.current.length; i++) {
        for (let j = i + 1; j < particlesRef.current.length; j++) {
          const p1 = particlesRef.current[i];
          const p2 = particlesRef.current[j];
          const distance = Math.hypot(p1.x - p2.x, p1.y - p2.y);
          if (distance < 120) {
            const alpha = (120 - distance) / 120;
            ctx.strokeStyle = `rgba(255, 215, 0, ${alpha * 0.2})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

      shockwavesRef.current = shockwavesRef.current.map(w => ({ ...w, radius: w.radius + 8 })).filter(w => w.radius < w.maxRadius);
      shockwavesRef.current.forEach(w => {
        const alpha = 1 - (w.radius / w.maxRadius);
        ctx.strokeStyle = `rgba(255, 215, 0, ${alpha * 0.6})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(w.x, w.y, w.radius, 0, Math.PI * 2);
        ctx.stroke();
      });

      animationFrameId.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  useEffect(() => {
    setTimeout(() => setIsLoaded(true), 100);

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const appClasses = ['app-container', screenShake ? 'animate-shake' : '', celebrationActive ? 'animate-wave' : ''].join(' ').trim();

  return (
    <div className={appClasses}>
      <div
        className={`custom-cursor ${celebrationActive ? 'celebrating' : ''}`}
        style={{
          transform: `translate(${mousePosition.x}px, ${mousePosition.y}px) scale(${celebrationActive ? 2 : 1.2}) rotate(${celebrationActive ? '360deg' : '0deg'})`,
          left: -16, top: -16,
        }}
      >
        <Crown className="icon" />
      </div>

      <canvas ref={canvasRef} className="effects-canvas" />

      {celebrationActive && (
        <div className="hologram-effect">
          <div className="hologram-scanline"></div>
        </div>
      )}

      <div className={`gold-rain-container ${celebrationActive ? 'active' : ''}`}>
        {[...Array(celebrationActive ? 40 : 20)].map((_, i) => (
          <div
            key={i} className="gold-rain-particle"
            style={{
              left: `${Math.random() * 100}%`, top: `-10%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${celebrationActive ? 2 + Math.random() * 2 : 4 + Math.random() * 3}s`,
            }}
          >
            {['⭐', '✨', '🎉', '👑', '🏆'][Math.floor(Math.random() * 5)]}
          </div>
        ))}
      </div>

      <div ref={celebrationOverlayRef} className="celebration-overlay">
        {celebrationActive && (
          <div className={`celebration-text font-orbitron ${celebrationActive ? 'animate-glitch' : ''}`}>
            {celebrationText}
          </div>
        )}
      </div>

      <div className="main-content">
        <header className={`header ${isLoaded ? 'loaded' : ''}`}>
          <div className="header-inner">
            <div className="header-icons">
              <Calendar className="icon" />
              <h1 className="main-title font-orbitron animate-glow">Feliz Aniversário</h1>
              <Coffee className="icon" />
            </div>
            <div className="subtitle font-orbitron animate-glow">Elvis Martins</div>
            <div className="tagline animate-fade-in-up">Celebrando mais um ano de vida</div>
          </div>
        </header>

        <section className="qualities-section">
          <div className="qualities-grid">
            {[
              { icon: ShieldCheck, title: "LIDERANÇA", desc: "Lidera igual editor de código bom: sugere, corrige e ainda completa o que falta", delay: 0 },
              { icon: Rocket, title: "VISÃO", desc: "Enxerga o futuro do projeto antes mesmo do deploy", delay: 200 },
              { icon: Wrench, title: "RESOLUTIVIDADE", desc: "Seja bug, reunião ou burocracia, resolve com um script ou um e-mail", delay: 400 },
              { icon: Flame, title: "REFERÊNCIA", desc: "Código limpo, ideias afiadas e sempre 10 passos à frente", delay: 600 }
            ].map((card, index) => (
              <div key={index} className={`quality-card ${isLoaded ? 'loaded' : ''}`} style={{ transitionDelay: `${card.delay}ms` }}>
                <div className="card-content">
                  <card.icon className="card-icon" />
                  <h3 className="card-title font-orbitron">{card.title}</h3>
                  <p className="card-desc">{card.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className={`terminal-container ${isLoaded ? 'loaded' : ''}`}>
            <div className="terminal-window">
              <div className="terminal-header">
                <div className="terminal-button red"></div><div className="terminal-button yellow"></div><div className="terminal-button green"></div>
                <span className="terminal-title">terminal.exe</span>
              </div>
              <div className="terminal-body">
                <div className="terminal-line large-margin"><span>Sistema:</span> <span className="animate-typing">Feliz aniversário, Elvis!</span></div>
                <div className="terminal-line blue animate-fade-in-up" style={{ animationDelay: '1s' }}><span>Carregando desejos especiais...</span></div>
                <div className="terminal-line green animate-fade-in-up" style={{ animationDelay: '2s' }}><span>✓ Processo concluído com sucesso!</span></div>
                <div className="terminal-list-container animate-fade-in-up" style={{ animationDelay: '3s' }}>
                  <p>Elvis Martins, que este novo ano seja repleto de:</p>
                  <ul>
                    <li>• Deploys tranquilos (até na sexta)</li>
                    <li>• Reuniões mais leves que uma query com índice</li>
                    <li>• Time que entrega e ainda manda meme no Slack</li>
                    <li>• Query sem timeout, projeto sem débito e conta sem susto 💸</li>
                  </ul>
                </div>
                <div className="prompt-cursor-line animate-fade-in-up" style={{ animationDelay: '4s' }}><span>$</span> <span className="animate-blink">_</span></div>
              </div>
            </div>
          </div>

          <div className="celebration-button-container">
            <button onClick={triggerCelebration} disabled={celebrationActive} className="celebration-button font-orbitron">
              <span className="button-content">
                <Trophy className="icon" />
                {celebrationActive ? 'CELEBRAÇÃO ATIVA...' : 'INICIAR CELEBRAÇÃO'}
                <Sparkles className="icon" />
              </span>
              <div className="button-shimmer" />
            </button>
          </div>
        </section>
      </div>

      <div className="floating-elements-container">
        {[...Array(celebrationActive ? 30 : 15)].map((_, i) => (
          <div
            key={i} className={`floating-element animate-float ${celebrationActive ? 'celebrating' : ''}`}
            style={{
              left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 4}s`,
              animationDuration: `${4 + Math.random() * 4}s`
            }}
          >
            {['🎈', '🎁', '🎊', '🌟', '✨', '🎉', '👑', '🏆'][Math.floor(Math.random() * 8)]}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;

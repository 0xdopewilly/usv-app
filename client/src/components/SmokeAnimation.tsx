import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface SmokeParticle {
  id: number;
  left: number;
  size: number;
  delay: number;
}

export default function SmokeAnimation() {
  const [particles, setParticles] = useState<SmokeParticle[]>([]);

  useEffect(() => {
    const generateParticles = () => {
      const newParticles: SmokeParticle[] = [];
      for (let i = 0; i < 5; i++) {
        newParticles.push({
          id: i,
          left: Math.random() * 100,
          size: 15 + Math.random() * 10,
          delay: i * 1.5,
        });
      }
      setParticles(newParticles);
    };

    generateParticles();
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            left: `${particle.left}%`,
            width: particle.size,
            height: particle.size,
            background: 'linear-gradient(45deg, rgba(59, 130, 246, 0.1), rgba(245, 158, 11, 0.1))',
          }}
          initial={{ y: '100vh', scale: 1, opacity: 0 }}
          animate={{
            y: '-20vh',
            scale: 1.5,
            opacity: [0, 0.4, 0.8, 0.3, 0],
          }}
          transition={{
            duration: 8,
            delay: particle.delay,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      ))}
    </div>
  );
}

import confetti from 'canvas-confetti';

const colors = ['#8b5cf6', '#3b82f6', '#f5c76b', '#ffffff'];

export function celebrate() {
  confetti({ particleCount: 110, spread: 80, startVelocity: 42, origin: { y: 0.6 }, colors, zIndex: 90 });
  setTimeout(() => confetti({ particleCount: 60, spread: 120, origin: { y: 0.5 }, colors, zIndex: 90 }), 180);
}

export function bigCelebration() {
  const end = Date.now() + 1600;
  (function frame() {
    confetti({ particleCount: 5, angle: 60, spread: 70, origin: { x: 0, y: 0.7 }, colors, zIndex: 90 });
    confetti({ particleCount: 5, angle: 120, spread: 70, origin: { x: 1, y: 0.7 }, colors, zIndex: 90 });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
  confetti({ particleCount: 160, spread: 100, startVelocity: 45, origin: { y: 0.55 }, colors, zIndex: 90 });
}

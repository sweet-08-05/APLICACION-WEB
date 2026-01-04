import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import LegoBackground from "@/components/LegoBackground";
import "@/styles/Results.css";

export default function Results({ user }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { score, stars, total, completed } = location.state || { score: 0, stars: 0, total: 0, completed: 0 };

  useEffect(() => {
    playSound('finish');
    createConfetti();
  }, []);

  const playSound = (type) => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    if (type === 'finish') {
      oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.2);
      oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.4);
      oscillator.frequency.setValueAtTime(1046.50, audioContext.currentTime + 0.6);
    }

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 1);
  };

  const createConfetti = () => {
    const colors = ['#FF6B6B', '#FFD93D', '#6BCB77', '#4ECDC4', '#FF6B9D', '#C69FFF'];
    
    for (let i = 0; i < 50; i++) {
      setTimeout(() => {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.setProperty('--confetti-color', colors[Math.floor(Math.random() * colors.length)]);
        document.body.appendChild(confetti);

        setTimeout(() => {
          confetti.remove();
        }, 3000);
      }, i * 50);
    }
  };

  const getPerformanceMessage = () => {
    const percentage = (completed / total) * 100;
    if (percentage === 100) return "¡PERFECTO! 🎉";
    if (percentage >= 80) return "¡Excelente trabajo! 🌟";
    if (percentage >= 60) return "¡Muy bien! 👏";
    if (percentage >= 40) return "¡Buen intento! 💪";
    return "¡Sigue practicando! 📚";
  };

  return (
    <div className="results-container">
      <LegoBackground />
      <div className="results-content">
        <div className="results-card" data-testid="results-card">
          <h1 className="results-title animate-bounce" data-testid="results-title">
            {getPerformanceMessage()}
          </h1>

          <div className="stars-display-large" data-testid="stars-display-large">
            {[...Array(3)].map((_, i) => (
              <span key={i} className={i < stars ? "star filled animate-sparkle" : "star"} style={{ animationDelay: `${i * 0.2}s` }}>
                ⭐
              </span>
            ))}
          </div>

          <div className="results-stats" data-testid="results-stats">
            <div className="stat-item" data-testid="score-stat">
              <div className="stat-label">Puntuación</div>
              <div className="stat-value score-display">{score}</div>
            </div>

            <div className="stat-item" data-testid="completed-stat">
              <div className="stat-label">Ejercicios completados</div>
              <div className="stat-value">{completed} / {total}</div>
            </div>

            <div className="stat-item" data-testid="accuracy-stat">
              <div className="stat-label">Precisión</div>
              <div className="stat-value">{Math.round((score / (completed * 10)) * 100)}%</div>
            </div>
          </div>

          <div className="results-actions">
            <button
              className="lego-button"
              style={{
                '--btn-color': '#4CAF50',
                '--btn-dark': '#45A049',
                '--btn-shadow': '#3D8B40'
              }}
              onClick={() => navigate("/dashboard")}
              data-testid="play-again-button"
            >
              Jugar de nuevo
            </button>

            <button
              className="lego-button"
              style={{
                '--btn-color': '#FF6B6B',
                '--btn-dark': '#E84A4A',
                '--btn-shadow': '#C53030'
              }}
              onClick={() => {
                navigate("/");
                window.location.reload();
              }}
              data-testid="logout-button"
            >
              Salir
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import LegoBackground from "@/components/LegoBackground";
import "@/styles/Dashboard.css";

export default function Dashboard({ user }) {
  const navigate = useNavigate();
  const [selectedAgeGroup, setSelectedAgeGroup] = useState(null);
  const [selectedOperation, setSelectedOperation] = useState(null);

  const ageGroups = [
    { id: "3-5", name: "3-5 años", color: "#FF6B6B", icon: "🧸" },
    { id: "7-9", name: "7-9 años", color: "#4ECDC4", icon: "🎮" },
    { id: "10-12", name: "10-12 años", color: "#95E1D3", icon: "🚀" }
  ];

  const operations = [
    { id: "suma", name: "Suma", color: "#FFD93D", icon: "+" },
    { id: "resta", name: "Resta", color: "#6BCB77", icon: "-" },
    { id: "multiplicacion", name: "Multiplicación", color: "#FF6B9D", icon: "×" },
    { id: "division", name: "División", color: "#C69FFF", icon: "÷" }
  ];

  const levels = [
    { id: "facil", name: "Fácil", color: "#4CAF50" },
    { id: "intermedio", name: "Intermedio", color: "#FF9800" },
    { id: "dificil", name: "Difícil", color: "#F44336" }
  ];

  const handleStartGame = (level) => {
    playSound('start');
    navigate(`/game/${selectedAgeGroup}/${selectedOperation}/${level}`);
  };

  const playSound = (type) => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    if (type === 'select') {
      oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
    } else if (type === 'start') {
      oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1);
    }

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  };

  return (
    <div className="dashboard-container">
      <LegoBackground />
      <div className="dashboard-content">
        <div className="dashboard-header" data-testid="dashboard-header">
          <h1 className="welcome-text" data-testid="welcome-text">¡Hola, {user.name}! 👋</h1>
          <p className="age-badge" data-testid="age-badge">{user.age} años</p>
        </div>

        {!selectedAgeGroup && (
          <div className="selection-section" data-testid="age-group-selection">
            <h2 className="section-title" data-testid="age-group-title">Elige tu grupo de edad</h2>
            <div className="cards-grid">
              {ageGroups.map((group) => (
                <div
                  key={group.id}
                  className="card lego-block animate-float"
                  style={{ backgroundColor: group.color }}
                  onClick={() => {
                    setSelectedAgeGroup(group.id);
                    playSound('select');
                  }}
                  data-testid={`age-group-${group.id}`}
                >
                  <div className="card-icon">{group.icon}</div>
                  <div className="card-name">{group.name}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedAgeGroup && !selectedOperation && (
          <div className="selection-section" data-testid="operation-selection">
            <button
              className="back-button"
              onClick={() => setSelectedAgeGroup(null)}
              data-testid="back-to-age-button"
            >
              ← Volver
            </button>
            <h2 className="section-title" data-testid="operation-title">¿Qué quieres practicar?</h2>
            <div className="cards-grid">
              {operations.map((op) => (
                <div
                  key={op.id}
                  className="card lego-block animate-bounce"
                  style={{ backgroundColor: op.color }}
                  onClick={() => {
                    setSelectedOperation(op.id);
                    playSound('select');
                  }}
                  data-testid={`operation-${op.id}`}
                >
                  <div className="card-icon operation-icon">{op.icon}</div>
                  <div className="card-name">{op.name}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedAgeGroup && selectedOperation && (
          <div className="selection-section" data-testid="level-selection">
            <button
              className="back-button"
              onClick={() => setSelectedOperation(null)}
              data-testid="back-to-operation-button"
            >
              ← Volver
            </button>
            <h2 className="section-title" data-testid="level-title">Elige el nivel de dificultad</h2>
            <div className="cards-grid">
              {levels.map((level) => (
                <div
                  key={level.id}
                  className="card lego-block animate-pulse"
                  style={{ backgroundColor: level.color }}
                  onClick={() => handleStartGame(level.id)}
                  data-testid={`level-${level.id}`}
                >
                  <div className="card-name">{level.name}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
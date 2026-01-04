import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import LegoBackground from "@/components/LegoBackground";
import DraggableGame from "@/components/DraggableGame";
import MultipleChoiceGame from "@/components/MultipleChoiceGame";
import "@/styles/Game.css";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function Game({ user }) {
  const { ageGroup, operation, level } = useParams();
  const navigate = useNavigate();
  const [exercises, setExercises] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [stars, setStars] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameMode, setGameMode] = useState("multiple"); // "multiple" or "draggable"
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadExercises();
  }, []);

  useEffect(() => {
    // Only start timer logic after exercises are loaded
    if (exercises.length === 0) return;
    
    if (timeLeft > 0 && currentIndex < exercises.length) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 || currentIndex >= exercises.length) {
      endGame();
    }
  }, [timeLeft, currentIndex, exercises.length]);

  const loadExercises = async () => {
    try {
      const response = await axios.get(`${API}/exercises`, {
        params: {
          age_group: ageGroup,
          operation: operation,
          level: level,
          count: 10
        }
      });

      setExercises(response.data.exercises);
      setLoading(false);
    } catch (error) {
      console.error("Error al cargar ejercicios:", error);
      alert("Hubo un error al cargar los ejercicios");
      navigate("/dashboard");
    }
  };

  const handleAnswer = (isCorrect) => {
    if (isCorrect) {
      setScore(score + 10);
      const newStars = Math.floor((currentIndex + 1) / 3);
      setStars(newStars);
      playSound('correct');
      createConfetti();
    } else {
      playSound('incorrect');
    }

    setTimeout(() => {
      setCurrentIndex(currentIndex + 1);
    }, 1000);
  };

  const endGame = async () => {
    try {
      await axios.post(`${API}/progress`, {
        user_id: user.id,
        age_group: ageGroup,
        operation: operation,
        level: level,
        score: score,
        stars: stars,
        completed_exercises: currentIndex
      });

      navigate("/results", {
        state: {
          score: score,
          stars: stars,
          total: exercises.length,
          completed: currentIndex
        }
      });
    } catch (error) {
      console.error("Error al guardar progreso:", error);
      navigate("/results", {
        state: {
          score: score,
          stars: stars,
          total: exercises.length,
          completed: currentIndex
        }
      });
    }
  };

  const playSound = (type) => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    if (type === 'correct') {
      oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1);
      oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2);
    } else if (type === 'incorrect') {
      oscillator.frequency.setValueAtTime(300, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(250, audioContext.currentTime + 0.1);
    }

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  };

  const createConfetti = () => {
    const colors = ['#FF6B6B', '#FFD93D', '#6BCB77', '#4ECDC4', '#FF6B9D', '#C69FFF'];
    
    for (let i = 0; i < 20; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'confetti';
      confetti.style.left = Math.random() * 100 + '%';
      confetti.style.setProperty('--confetti-color', colors[Math.floor(Math.random() * colors.length)]);
      confetti.style.animationDelay = Math.random() * 0.5 + 's';
      document.body.appendChild(confetti);

      setTimeout(() => {
        confetti.remove();
      }, 3000);
    }
  };

  if (loading) {
    return (
      <div className="game-container">
        <LegoBackground />
        <div className="loading" data-testid="loading">Cargando ejercicios...</div>
      </div>
    );
  }

  if (currentIndex >= exercises.length || timeLeft === 0) {
    return null;
  }

  const currentExercise = exercises[currentIndex];
  const operationSymbol = {
    "suma": "+",
    "resta": "-",
    "multiplicacion": "×",
    "division": "÷"
  };

  return (
    <div className="game-container">
      <LegoBackground />
      <div className="game-content">
        <div className="game-header" data-testid="game-header">
          <div className="score-display" data-testid="score-display">
            🏆 {score}
          </div>
          <div className="timer" data-testid="timer">
            ⏱️ {timeLeft}s
          </div>
          <div className="stars-display" data-testid="stars-display">
            {[...Array(3)].map((_, i) => (
              <span key={i} className={i < stars ? "star filled" : "star"}>
                ⭐
              </span>
            ))}
          </div>
        </div>

        <div className="progress-container" data-testid="progress-container">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${(currentIndex / exercises.length) * 100}%` }}
            ></div>
          </div>
          <p className="progress-text" data-testid="progress-text">
            Ejercicio {currentIndex + 1} de {exercises.length}
          </p>
        </div>

        <div className="exercise-card" data-testid="exercise-card">
          <h2 className="exercise-question" data-testid="exercise-question">
            {currentExercise.number1} {operationSymbol[operation]} {currentExercise.number2} = ?
          </h2>

          {gameMode === "multiple" ? (
            <MultipleChoiceGame
              exercise={currentExercise}
              onAnswer={handleAnswer}
            />
          ) : (
            <DraggableGame
              exercise={currentExercise}
              onAnswer={handleAnswer}
            />
          )}
        </div>
      </div>
    </div>
  );
}
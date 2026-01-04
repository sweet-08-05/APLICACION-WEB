import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import LegoBackground from "@/components/LegoBackground";
import "@/styles/Login.css";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function Login({ setUser }) {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!name || !age) {
      alert("Por favor, ingresa tu nombre y edad");
      return;
    }

    const ageNum = parseInt(age);
    if (ageNum < 3 || ageNum > 12) {
      alert("Esta aplicación es para niños de 3 a 12 años");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${API}/users`, {
        name: name,
        age: ageNum
      });

      setUser(response.data);
      playSound('welcome');
      navigate("/dashboard");
    } catch (error) {
      console.error("Error al crear usuario:", error);
      alert("Hubo un error. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const playSound = (type) => {
    // Crear sonido LEGO
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    if (type === 'welcome') {
      oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1);
      oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2);
    }

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  };

  return (
    <div className="login-container">
      <LegoBackground />
      <div className="login-content">
        <div className="login-card" data-testid="login-card">
          <div className="lego-logo" data-testid="lego-logo">
            <div className="lego-brick red"></div>
            <div className="lego-brick yellow"></div>
            <div className="lego-brick blue"></div>
            <div className="lego-brick green"></div>
          </div>
          
          <h1 className="login-title" data-testid="login-title">¡Matemáticas LEGO!</h1>
          <p className="login-subtitle" data-testid="login-subtitle">¡Aprende matemáticas mientras te diviertes!</p>

          <form onSubmit={handleSubmit} className="login-form" data-testid="login-form">
            <div className="form-group">
              <label htmlFor="name" data-testid="name-label">¿Cómo te llamas?</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Tu nombre"
                className="login-input"
                data-testid="name-input"
                maxLength={30}
              />
            </div>

            <div className="form-group">
              <label htmlFor="age" data-testid="age-label">¿Cuántos años tienes?</label>
              <input
                id="age"
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="Tu edad (3-12)"
                min="3"
                max="12"
                className="login-input"
                data-testid="age-input"
              />
            </div>

            <button
              type="submit"
              className="lego-button"
              style={{
                '--btn-color': '#FF6B6B',
                '--btn-dark': '#E84A4A',
                '--btn-shadow': '#C53030'
              }}
              disabled={loading}
              data-testid="login-submit-button"
            >
              {loading ? "Cargando..." : "¡JUGAR!"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
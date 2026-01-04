import { useState } from "react";
import "@/styles/DraggableGame.css";

export default function DraggableGame({ exercise, onAnswer }) {
  const [dragging, setDragging] = useState(null);
  const [dropped, setDropped] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const handleDragStart = (e, value) => {
    setDragging(value);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (dragging !== null) {
      setDropped(dragging);
      checkAnswer(dragging);
    }
  };

  const handleClick = (value) => {
    setDropped(value);
    checkAnswer(value);
  };

  const checkAnswer = (value) => {
    const isCorrect = value === exercise.correct_answer;
    setFeedback(isCorrect ? "correct" : "incorrect");
    
    setTimeout(() => {
      onAnswer(isCorrect);
      setDropped(null);
      setFeedback(null);
      setDragging(null);
    }, 800);
  };

  return (
    <div className="draggable-game" data-testid="draggable-game">
      <div 
        className={`drop-zone ${dragging !== null ? 'active' : ''} ${feedback ? `feedback-${feedback}` : ''}`}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        data-testid="drop-zone"
      >
        {dropped !== null ? (
          <div className="dropped-value" data-testid="dropped-value">{dropped}</div>
        ) : (
          <div className="drop-placeholder" data-testid="drop-placeholder">Arrastra aquí</div>
        )}
      </div>

      {feedback && (
        <div className={`feedback-message ${feedback === 'correct' ? 'feedback-correct' : 'feedback-incorrect'}`} data-testid="feedback-message">
          {feedback === 'correct' ? '¡Correcto! 🎉' : '¡Inténtalo de nuevo! 💪'}
        </div>
      )}

      <div className="draggable-options" data-testid="draggable-options">
        {exercise.options.map((option, index) => (
          <div
            key={index}
            className="draggable-item lego-block"
            draggable
            onDragStart={(e) => handleDragStart(e, option)}
            onClick={() => handleClick(option)}
            style={{
              backgroundColor: ['#FF6B6B', '#FFD93D', '#6BCB77', '#4ECDC4'][index % 4],
              opacity: dropped === option ? 0.5 : 1
            }}
            data-testid={`option-${index}`}
          >
            <div className="brick-studs">
              <div className="stud"></div>
              <div className="stud"></div>
            </div>
            <span className="option-value">{option}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
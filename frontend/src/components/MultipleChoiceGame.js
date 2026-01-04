import { useState } from "react";
import "@/styles/MultipleChoiceGame.css";

export default function MultipleChoiceGame({ exercise, onAnswer }) {
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const handleSelect = (option) => {
    if (selected !== null) return;

    setSelected(option);
    const isCorrect = option === exercise.correct_answer;
    setFeedback(isCorrect ? "correct" : "incorrect");

    setTimeout(() => {
      onAnswer(isCorrect);
      setSelected(null);
      setFeedback(null);
    }, 800);
  };

  return (
    <div className="multiple-choice-game" data-testid="multiple-choice-game">
      {feedback && (
        <div className={`feedback-message ${feedback === 'correct' ? 'feedback-correct' : 'feedback-incorrect'}`} data-testid="feedback-message">
          {feedback === 'correct' ? '¡Correcto! 🎉' : '¡Inténtalo de nuevo! 💪'}
        </div>
      )}

      <div className="options-grid" data-testid="options-grid">
        {exercise.options.map((option, index) => (
          <button
            key={index}
            className={`option-button lego-block ${
              selected === option
                ? feedback === 'correct'
                  ? 'correct'
                  : 'incorrect'
                : ''
            }`}
            onClick={() => handleSelect(option)}
            disabled={selected !== null}
            style={{
              backgroundColor: ['#FF6B6B', '#FFD93D', '#6BCB77', '#4ECDC4'][index % 4]
            }}
            data-testid={`option-button-${index}`}
          >
            <div className="brick-studs">
              <div className="stud"></div>
              <div className="stud"></div>
              <div className="stud"></div>
            </div>
            <span className="option-text">{option}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
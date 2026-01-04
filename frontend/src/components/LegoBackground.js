import "@/styles/LegoBackground.css";

export default function LegoBackground() {
  const colors = ['#FF6B6B', '#FFD93D', '#6BCB77', '#4ECDC4', '#FF6B9D', '#C69FFF'];
  const bricks = [];

  for (let i = 0; i < 15; i++) {
    bricks.push({
      id: i,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 60 + 40,
      left: Math.random() * 100,
      top: Math.random() * 100,
      delay: Math.random() * 5,
      duration: Math.random() * 10 + 10
    });
  }

  return (
    <div className="lego-background" data-testid="lego-background">
      {bricks.map((brick) => (
        <div
          key={brick.id}
          className="floating-brick"
          style={{
            backgroundColor: brick.color,
            width: `${brick.size}px`,
            height: `${brick.size}px`,
            left: `${brick.left}%`,
            top: `${brick.top}%`,
            animationDelay: `${brick.delay}s`,
            animationDuration: `${brick.duration}s`
          }}
        >
          <div className="brick-studs">
            <div className="stud"></div>
            <div className="stud"></div>
          </div>
        </div>
      ))}
    </div>
  );
}
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import "./SnakeGame.css";

const GRID_SIZE = 20;
const INITIAL_SNAKE = [
  { x: 8, y: 10 },
  { x: 7, y: 10 },
  { x: 6, y: 10 },
];

const DIRECTIONS = {
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
  w: { x: 0, y: -1 },
  s: { x: 0, y: 1 },
  a: { x: -1, y: 0 },
  d: { x: 1, y: 0 },
};

function createFood(snake) {
  let food;

  do {
    food = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
  } while (snake.some((part) => part.x === food.x && part.y === food.y));

  return food;
}

export default function SnakeGame() {
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [food, setFood] = useState({ x: 14, y: 10 });
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [status, setStatus] = useState("ready");

  const directionRef = useRef({ x: 1, y: 0 });
  const nextDirectionRef = useRef({ x: 1, y: 0 });
  const touchStartRef = useRef(null);

  const resetGame = useCallback(() => {
    setSnake(INITIAL_SNAKE);
    setFood(createFood(INITIAL_SNAKE));
    setScore(0);
    directionRef.current = { x: 1, y: 0 };
    nextDirectionRef.current = { x: 1, y: 0 };
    setStatus("playing");
  }, []);

  const changeDirection = useCallback((direction) => {
    const current = directionRef.current;

    // Prevent the snake from reversing into itself.
    if (
      current.x + direction.x === 0 &&
      current.y + direction.y === 0
    ) {
      return;
    }

    nextDirectionRef.current = direction;
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      const direction = DIRECTIONS[event.key] || DIRECTIONS[event.key.toLowerCase()];

      if (!direction) return;

      event.preventDefault();
      changeDirection(direction);

      if (status === "ready") {
        setStatus("playing");
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [changeDirection, status]);

  useEffect(() => {
    if (status !== "playing") return;

    const speed = Math.max(75, 150 - score * 3);

    const interval = setInterval(() => {
      directionRef.current = nextDirectionRef.current;

      setSnake((currentSnake) => {
        const direction = directionRef.current;
        const head = currentSnake[0];

        const newHead = {
          x: head.x + direction.x,
          y: head.y + direction.y,
        };

        const ateFood =
          newHead.x === food.x && newHead.y === food.y;

        const bodyToCheck = ateFood
          ? currentSnake
          : currentSnake.slice(0, -1);

        const hitWall =
          newHead.x < 0 ||
          newHead.x >= GRID_SIZE ||
          newHead.y < 0 ||
          newHead.y >= GRID_SIZE;

        const hitBody = bodyToCheck.some(
          (part) => part.x === newHead.x && part.y === newHead.y
        );

        if (hitWall || hitBody) {
          setStatus("over");
          return currentSnake;
        }

        const newSnake = [newHead, ...currentSnake];

        if (!ateFood) {
          newSnake.pop();
        } else {
          setScore((previous) => {
            const updated = previous + 10;
            setHighScore((best) => Math.max(best, updated));
            return updated;
          });

          setFood(createFood(newSnake));
        }

        return newSnake;
      });
    }, speed);

    return () => clearInterval(interval);
  }, [status, score, food]);

  const handleTouchStart = (event) => {
    const touch = event.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (event) => {
    if (!touchStartRef.current) return;

    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;

    if (Math.max(Math.abs(deltaX), Math.abs(deltaY)) < 20) return;

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      changeDirection({
        x: deltaX > 0 ? 1 : -1,
        y: 0,
      });
    } else {
      changeDirection({
        x: 0,
        y: deltaY > 0 ? 1 : -1,
      });
    }

    if (status === "ready") setStatus("playing");
    touchStartRef.current = null;
  };

  return (
    <section className="snake-section" id="snake-game">
      <div className="snake-heading">
        <span className="snake-eyebrow">A LITTLE BREAK</span>
        <h2>
          Ready to <span>play?</span>
        </h2>
        <p>
          Take a break and test your reflexes. How long can you survive?
        </p>
      </div>

      <div className="snake-game-card">
        <div className="snake-game-top">
          <div>
            <span className="snake-label">SCORE</span>
            <strong>{score.toString().padStart(3, "0")}</strong>
          </div>

          <div>
            <span className="snake-label">BEST</span>
            <strong>{highScore.toString().padStart(3, "0")}</strong>
          </div>

          <div className="snake-live-status">
            <span className={status === "playing" ? "live-dot" : ""} />
            {status === "playing"
              ? "LIVE"
              : status === "over"
                ? "GAME OVER"
                : status === "paused"
                  ? "PAUSED"
                  : "READY"}
          </div>
        </div>

        <div
          className="snake-board"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          role="application"
          aria-label="Snake game. Use arrow keys, WASD, or swipe to move."
        >
          {Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, index) => {
            const x = index % GRID_SIZE;
            const y = Math.floor(index / GRID_SIZE);

            const snakeIndex = snake.findIndex(
              (part) => part.x === x && part.y === y
            );

            const isFood = food.x === x && food.y === y;

            return (
              <div
                key={index}
                className={[
                  "snake-cell",
                  snakeIndex === 0 ? "snake-head" : "",
                  snakeIndex > 0 ? "snake-body" : "",
                  isFood ? "snake-food" : "",
                ].join(" ")}
              />
            );
          })}

          {status !== "playing" && (
            <div className="snake-overlay">
              <div className="snake-overlay-content">
                <span className="snake-overlay-icon">
                  {status === "over" ? "💀" : "🐍"}
                </span>

                <h3>
                  {status === "over"
                    ? "Game Over"
                    : status === "paused"
                      ? "Paused"
                      : "Let's Play"}
                </h3>

                <p>
                  {status === "over"
                    ? `You scored ${score} points. Try again!`
                    : status === "paused"
                      ? "Take your time."
                      : "Eat the glowing food. Avoid the walls and yourself."}
                </p>

                <button onClick={resetGame}>
                  {status === "over" ? "Play Again" : "Start Game"}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="snake-game-bottom">
          <span>USE ARROW KEYS / WASD</span>

          <div className="snake-actions">
            {status === "playing" && (
              <button
                onClick={() => setStatus("paused")}
                className="snake-secondary-btn"
              >
                Pause
              </button>
            )}

            {status === "paused" && (
              <button
                onClick={() => setStatus("playing")}
                className="snake-secondary-btn"
              >
                Resume
              </button>
            )}

            <button onClick={resetGame} className="snake-restart-btn">
              Restart ↻
            </button>
          </div>
        </div>
      </div>

      <div className="snake-mobile-controls">
        <button onClick={() => changeDirection({ x: 0, y: -1 })}>↑</button>
        <div>
          <button onClick={() => changeDirection({ x: -1, y: 0 })}>←</button>
          <button onClick={() => changeDirection({ x: 0, y: 1 })}>↓</button>
          <button onClick={() => changeDirection({ x: 1, y: 0 })}>→</button>
        </div>
      </div>
    </section>
  );
}
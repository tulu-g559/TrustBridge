import { useEffect, useState } from "react";

export const Spotlight = ({
  className = "",
  spotlightColor = "rgba(168, 85, 247, 0.25)",
}) => {
  const [position, setPosition] = useState({ x: -200, y: -200 });

  useEffect(() => {
    const move = (e) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("pointermove", move);
    return () => window.removeEventListener("pointermove", move);
  }, []);

  return (
    <div
      className={`pointer-events-none fixed inset-0 z-10 transition duration-300 ${className}`}
    >
      <div
        className="absolute w-[500px] h-[500px] rounded-full blur-[150px] opacity-60"
        style={{
          background: spotlightColor,
          transform: `translate(${position.x - 250}px, ${position.y - 250}px)`,
        }}
      />
    </div>
  );
};

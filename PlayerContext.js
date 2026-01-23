import React, { createContext, useState, useEffect, useContext } from "react";

const PlayerContext = createContext();

export const usePlayer = () => useContext(PlayerContext);

export const PlayerProvider = ({ children }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0); // 0.0 to 1.0
  const [elapsedTime, setElapsedTime] = useState(0); // in seconds
  const [totalTime, setTotalTime] = useState(60 * 60); // Default 1 hour (3600s)

  // Timer Logic
  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        setElapsedTime((prev) => {
          // Create a loop or stop at max? Let's stop at max or loop based on logic.
          // For now, let's just increment.
          // If we want progress to match, we need totalTime.
          const newTime = prev + 1;
          if (totalTime > 0) {
            setProgress(Math.min(newTime / totalTime, 1));
          }
          return newTime;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, totalTime]);

  const play = () => setIsPlaying(true);
  const pause = () => setIsPlaying(false);
  const reset = () => {
    setIsPlaying(false);
    setElapsedTime(0);
    setProgress(0);
  };

  const setTraining = (durationInSeconds) => {
    setTotalTime(durationInSeconds);
    // Optional: reset if new training?
    // reset();
  };

  return (
    <PlayerContext.Provider
      value={{
        isPlaying,
        progress,
        elapsedTime,
        totalTime,
        play,
        pause,
        reset,
        setTraining,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};

export default PlayerContext;

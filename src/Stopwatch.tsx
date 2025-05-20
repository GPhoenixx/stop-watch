import React, { useEffect, useRef, useState } from "react";

const formatTime = (time: number) => {
  const minute = Math.floor(time / 60000);
  const second = Math.floor((time % 60000) / 1000);
  const centisecond = Math.floor((time % 1000) / 10);
  return `${minute.toString().padStart(2, "0")}:${second
    .toString()
    .padStart(2, "0")},${centisecond.toString().padStart(2, "0")}`;
};

export const Stopwatch = () => {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  const [timeLatest, setTimeLatest] = useState(0);
  const [isRunningTimeLatest, setIsRunningTimeLatest] = useState(false);
  const [laps, setLaps] = useState<number[]>([]);

  const startRef = useRef<number | null>(null); 
  const elapsedRef = useRef<number>(0);
  const rafRef = useRef<number | null>(null);

  const startTimeLatestRef = useRef<number | null>(null);
  const elapsedTimeLatestRef = useRef<number>(0);
  const rafTimeLatestRef = useRef<number | null>(null);

  const animate = (now: number) => {
    if (startRef.current !== null) {
      setTime(elapsedRef.current + (now - startRef.current));
      rafRef.current = requestAnimationFrame(animate);
    }
  };

  const animateTimeLatest = (now: number) => {
    if (startTimeLatestRef.current !== null) {
      setTimeLatest(
        elapsedTimeLatestRef.current + (now - startTimeLatestRef.current)
      );
      rafTimeLatestRef.current = requestAnimationFrame(animateTimeLatest);
    }
  };

  useEffect(() => {
    if (isRunning) {
      startRef.current = performance.now();
      rafRef.current = requestAnimationFrame(animate);
    } else {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      elapsedRef.current = time;
      startRef.current = null;
    }
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning]);

  useEffect(() => {
    if (isRunningTimeLatest) {
      startTimeLatestRef.current = performance.now();
      rafTimeLatestRef.current = requestAnimationFrame(animateTimeLatest);
    } else {
      if (rafTimeLatestRef.current)
        cancelAnimationFrame(rafTimeLatestRef.current);
      elapsedTimeLatestRef.current = timeLatest;
      startTimeLatestRef.current = null;
    }
    return () => {
      if (rafTimeLatestRef.current)
        cancelAnimationFrame(rafTimeLatestRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunningTimeLatest]);

  const handleLap = () => {
    setLaps([...laps, timeLatest]);
    setTimeLatest(0);

    setIsRunningTimeLatest(false);

    setTimeout(() => {
      elapsedTimeLatestRef.current = 0;
      startTimeLatestRef.current = null;
      setIsRunningTimeLatest(true);
    }, 0);
  };

  const handleReset = () => {
    setTime(0);
    setTimeLatest(0);
    setLaps([]);
    elapsedRef.current = 0;
    startRef.current = null;

    elapsedTimeLatestRef.current = 0;
    startTimeLatestRef.current = null;
  };

  const handleStop = () => {
    setIsRunning(false);
    setIsRunningTimeLatest(false);
  };

  const handleStart = () => {
    setIsRunning(true);
    setIsRunningTimeLatest(true);
    if (laps.length === 0) {
      setLaps([timeLatest]);
    }
  };

  const fastestLap = laps.length > 1 ? Math.min(...laps.slice(1)) : null;
  const slowestLap = laps.length > 1 ? Math.max(...laps.slice(1)) : null;

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center">
      <div className="w-full max-w-md p-6 rounded flex flex-col items-center">
        <div className="text-white text-6xl font-mono tracking-widest mb-8">
          {formatTime(time)}
        </div>
        <div className="flex w-full justify-between mb-8">
          <button
            className="w-24 aspect-square p-0 rounded-full flex items-center justify-center bg-gray-700 text-white text-xl font-semibold focus:outline-none"
            onClick={isRunning ? handleLap : handleReset}
          >
            {isRunning ? "Lap" : "Reset"}
          </button>
          <button
            className={`w-24 aspect-square p-0 rounded-full flex items-center justify-center text-xl font-semibold focus:outline-none ${
              isRunning ? "bg-red-700 text-white" : "bg-green-700 text-white"
            }`}
            onClick={isRunning ? handleStop : handleStart}
          >
            {isRunning ? "Stop" : "Start"}
          </button>
        </div>
        <div className="w-full mt-4 border-t border-gray-800">
          {laps.map((lap, idx) => {
            const lapNumber = laps.length - idx;
            let color = "text-white";
            if (idx > 0 && laps[laps.length - idx] === fastestLap)
              color = "text-green-400";
            if (idx > 0 && laps[laps.length - idx] === slowestLap)
              color = "text-red-400";
           
            return (
              <div
                key={idx}
                className="flex justify-between text-lg font-mono border-b border-gray-800 py-1"
              >
                <span className={color}>{`Lap ${lapNumber}`}</span>
                <span className={color}>
                  {idx === 0
                    ? formatTime(timeLatest)
                    : formatTime(laps[laps.length - idx])}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

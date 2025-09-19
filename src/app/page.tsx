"use client";
import { useState, useEffect } from "react";

// --- Version & Copyright ---
const version = "1.0.1";
const year = new Date().getFullYear();

type State = {
  capacity: number;
  population: number;
};

export default function Home() {
  const [state, setState] = useState<State>({ capacity: 0, population: 0 });
  const [history, setHistory] = useState<State[]>([]);
  const [flash, setFlash] = useState<{ capacity: boolean; population: boolean }>({
    capacity: false,
    population: false,
  });
  const [debugMode, setDebugMode] = useState(false);

  // Load state + debug flag on mount
  useEffect(() => {
    const saved = localStorage.getItem("city-limits-state");
    if (saved) {
      setState(JSON.parse(saved));
    }
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      setDebugMode(params.get("debug") === "1");
    }
  }, []);

  // Save state to localStorage
  useEffect(() => {
    localStorage.setItem("city-limits-state", JSON.stringify(state));
  }, [state]);

  const triggerFlash = (targets: { capacity?: boolean; population?: boolean }) => {
    setFlash({
      capacity: !!targets.capacity,
      population: !!targets.population,
    });
    setTimeout(() => setFlash({ capacity: false, population: false }), 500);
  };

  const updateState = (newState: State) => {
    setHistory((prev) => [...prev.slice(-9), state]);
    setState(newState);
  };

  const adjust = (field: keyof State, amount: number) => {
    const oldCapacity = state.capacity;
    const oldPopulation = state.population;

    let newCapacity = oldCapacity;
    let newPopulation = oldPopulation;
    const flashes: { capacity?: boolean; population?: boolean } = {};

    if (field === "capacity") newCapacity += amount;
    if (field === "population") newPopulation += amount;

    // Prevent negatives
    if (newCapacity < 0) {
      newCapacity = 0;
      flashes.capacity = true;
    }
    if (newPopulation < 0) {
      newPopulation = 0;
      flashes.population = true;
    }

    // Cap population if it exceeds capacity
    if (newPopulation > newCapacity) {
      newPopulation = newCapacity;
      flashes.capacity = true;
    }

    // Key case: capacity shrank AND forced population down
    if (newCapacity < oldCapacity && newPopulation < oldPopulation) {
      flashes.capacity = true;
      flashes.population = true;
    }

    if (flashes.capacity || flashes.population) {
      triggerFlash(flashes);
    }

    updateState({ capacity: newCapacity, population: newPopulation });
  };

  const reset = () => {
    if (window.confirm("Are you sure you want to reset both values to zero?")) {
      updateState({ capacity: 0, population: 0 });
    }
  };

  const undo = () => {
    if (history.length > 0) {
      const last = history[history.length - 1];
      setHistory((prev) => prev.slice(0, -1));
      setState(last);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white p-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-wide">
          🏙️ CITY LIMITS
        </h1>
        <p className="text-lg sm:text-xl text-gray-300 mt-2">
          Population and Capacity Tracker
        </p>
        <div className="mx-auto mt-3 h-1 w-24 bg-gray-600 rounded"></div>
      </div>

      {/* Current values */}
      <div className="text-center space-y-2">
        <p
          className={`text-2xl font-semibold transition-colors duration-300 ${
            flash.capacity ? "text-red-500" : "text-green-400"
          }`}
        >
          Capacity: {state.capacity.toLocaleString()}
        </p>
        <p
          className={`text-2xl font-semibold transition-colors duration-300 ${
            flash.population ? "text-red-500" : "text-blue-400"
          }`}
        >
          Population: {state.population.toLocaleString()}
        </p>
      </div>

      {/* Controls wrapper */}
      <div className="w-full max-w-md space-y-8 mt-8">
        {/* Capacity controls */}
        <div className="space-y-3">
          <h2 className="text-center text-gray-300 font-medium">Capacity Controls</h2>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => adjust("capacity", -1000000)}
              className="px-4 py-3 rounded-lg font-semibold shadow-md bg-blue-500 hover:bg-blue-600 transition"
            >
              <span className="text-white font-bold text-2xl mr-1">-</span> 1M Capacity
            </button>
            <button
              onClick={() => adjust("capacity", 1000000)}
              className="px-4 py-3 rounded-lg font-semibold shadow-md bg-blue-500 hover:bg-blue-600 transition"
            >
              <span className="text-white font-bold text-2xl mr-1">+</span> 1M Capacity
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => adjust("capacity", -100000)}
              className="px-4 py-3 rounded-lg font-semibold shadow-md bg-blue-300 hover:bg-blue-400 transition"
            >
              <span className="text-white font-bold text-2xl mr-1">-</span> 100k Capacity
            </button>
            <button
              onClick={() => adjust("capacity", 100000)}
              className="px-4 py-3 rounded-lg font-semibold shadow-md bg-blue-300 hover:bg-blue-400 transition"
            >
              <span className="text-white font-bold text-2xl mr-1">+</span> 100k Capacity
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className="mx-auto h-px w-full bg-gray-600"></div>

        {/* Population controls */}
        <div className="space-y-3">
          <h2 className="text-center text-gray-300 font-medium">Population Controls</h2>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => adjust("population", -1000000)}
              className="px-4 py-3 rounded-lg font-semibold shadow-md bg-lime-500 hover:bg-lime-600 transition text-black"
            >
              <span className="text-black font-bold text-2xl mr-1">-</span> 1M Population
            </button>
            <button
              onClick={() => adjust("population", 1000000)}
              className="px-4 py-3 rounded-lg font-semibold shadow-md bg-lime-500 hover:bg-lime-600 transition text-black"
            >
              <span className="text-black font-bold text-2xl mr-1">+</span> 1M Population
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => adjust("population", -100000)}
              className="px-4 py-3 rounded-lg font-semibold shadow-md bg-lime-200 hover:bg-lime-300 transition text-black"
            >
              <span className="text-black font-bold text-2xl mr-1">-</span> 100k Population
            </button>
            <button
              onClick={() => adjust("population", 100000)}
              className="px-4 py-3 rounded-lg font-semibold shadow-md bg-lime-200 hover:bg-lime-300 transition text-black"
            >
              <span className="text-black font-bold text-2xl mr-1">+</span> 100k Population
            </button>
          </div>
        </div>
      </div>

      {/* Undo & Reset */}
      <div className="flex gap-4 mt-8">
        <button
          onClick={undo}
          disabled={history.length === 0}
          className="px-4 py-2 rounded-lg font-semibold shadow-md transition bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-600"
        >
          Undo
        </button>
        <button
          onClick={reset}
          className="px-4 py-2 rounded-lg font-semibold shadow-md transition bg-red-500 hover:bg-red-600"
        >
          Reset
        </button>
      </div>

      {/* Debug info */}
      {debugMode && (
        <p className="mt-6 text-sm text-gray-400">
          Undo steps left: {history.length}
        </p>
      )}

      {/* Footer */}
      <footer className="mt-12 text-center text-gray-500 text-sm">
        © {year} James Hunt — Version {version}
      </footer>
    </main>
  );
}

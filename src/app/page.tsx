"use client";
import { useState } from "react";

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

    // Enforce rules
    if (newPopulation > newCapacity) {
      newPopulation = newCapacity;
      flashes.capacity = true; // show capacity limited it
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

  const reset = () => updateState({ capacity: 0, population: 0 });
  const undo = () => {
    if (history.length > 0) {
      const last = history[history.length - 1];
      setHistory((prev) => prev.slice(0, -1));
      setState(last);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white p-8">
      <h1 className="text-4xl font-extrabold mb-8 tracking-wide">🏙️ City Tracker</h1>

      <div className="mb-8 text-center space-y-2">
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

      {/* Capacity controls */}
      <div className="w-full max-w-md mb-8 space-y-3">
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => adjust("capacity", -100000)}
            className="px-4 py-2 rounded-lg font-semibold shadow-md bg-blue-300 hover:bg-blue-400 transition"
          >
            -100k Capacity
          </button>
          <button
            onClick={() => adjust("capacity", 100000)}
            className="px-4 py-2 rounded-lg font-semibold shadow-md bg-blue-300 hover:bg-blue-400 transition"
          >
            +100k Capacity
          </button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => adjust("capacity", -1000000)}
            className="px-4 py-2 rounded-lg font-semibold shadow-md bg-blue-500 hover:bg-blue-600 transition"
          >
            -1M Capacity
          </button>
          <button
            onClick={() => adjust("capacity", 1000000)}
            className="px-4 py-2 rounded-lg font-semibold shadow-md bg-blue-500 hover:bg-blue-600 transition"
          >
            +1M Capacity
          </button>
        </div>
      </div>

      {/* Divider */}
      <div className="w-full max-w-md border-t border-gray-600 my-6"></div>

      {/* Population controls */}
      <div className="w-full max-w-md mb-8 space-y-3">
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => adjust("population", -100000)}
            className="px-4 py-2 rounded-lg font-semibold shadow-md bg-lime-200 hover:bg-lime-300 transition text-black"
          >
            -100k Population
          </button>
          <button
            onClick={() => adjust("population", 100000)}
            className="px-4 py-2 rounded-lg font-semibold shadow-md bg-lime-200 hover:bg-lime-300 transition text-black"
          >
            +100k Population
          </button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => adjust("population", -1000000)}
            className="px-4 py-2 rounded-lg font-semibold shadow-md bg-lime-500 hover:bg-lime-600 transition text-black"
          >
            -1M Population
          </button>
          <button
            onClick={() => adjust("population", 1000000)}
            className="px-4 py-2 rounded-lg font-semibold shadow-md bg-lime-500 hover:bg-lime-600 transition text-black"
          >
            +1M Population
          </button>
        </div>
      </div>

      {/* Undo & Reset */}
      <div className="flex gap-4">
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

      <p className="mt-6 text-sm text-gray-400">Undo steps left: {history.length}</p>
    </main>
  );
}
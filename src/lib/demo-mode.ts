import { useEffect, useState } from "react";

/** The demo is a separate, clearly marked mode: fictional data for a fictional hire. */
const KEY = "io-demo-entered";
const EVENT = "io-demo-change";

function read() {
  try {
    return localStorage.getItem(KEY) === "yes";
  } catch {
    return false;
  }
}

export function enterDemo() {
  try {
    localStorage.setItem(KEY, "yes");
  } catch {
    /* storage unavailable */
  }
  window.dispatchEvent(new Event(EVENT));
}

export function exitDemo() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* storage unavailable */
  }
  window.dispatchEvent(new Event(EVENT));
}

export function useDemoMode() {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const sync = () => setOn(read());
    sync();
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  return on;
}

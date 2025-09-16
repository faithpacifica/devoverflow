"use client"; // Mark as a client component for App Router
import { useTheme } from "next-themes";

export default function Home() {
  const { theme, setTheme } = useTheme();
  return (
    <div className="text-purple-600">
      <p>The current theme is: {theme}</p>
      <button onClick={() => setTheme("light")}>Light Mode</button>
      <br />
      <button onClick={() => setTheme("dark")}>Dark Mode</button>
    </div>
  );
}

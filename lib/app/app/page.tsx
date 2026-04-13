'use client';

import { useState, useEffect } from "react";
import { validateAccessCode, analyzeLease } from "./actions";

export default function Home() {
  const [unlocked, setUnlocked] = useState(false);
  const [code, setCode] = useState("");
  const [validating, setValidating] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (localStorage.getItem("access_granted") === "true") {
      setUnlocked(true);
    }
  }, []);

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidating(true);
    setError("");
    const res = await validateAccessCode(code);
    if (res.success) {
      localStorage.setItem("access_granted", "true");
      setUnlocked(true);
    } else {
      setError(res.message);
    }
    setValidating(false);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const data = await analyzeLease(formData);
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  };

  if (!unlocked) {
    return (
      <main className="min-h-screen bg-zinc-950 flex items-center justify-center p-8">
        <div className="max-w-md w-full text-center">
          <h1 className="text-5xl font-bold mb-4">LeaseAbstract AI</h1>
          <p className="text-xl text-zinc-400 mb-12">Enter your Gumroad access code</p>
          <form onSubmit={handleCodeSubmit} className="space-y-6">
            <input
              type="text"
              placeholder="XXXX-YYYY-ZZZZ"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-3xl px-8 py-6 text-2xl text-center"
            />
            <button
              type="submit"
              disabled={validating}
              className="w-full py-7 bg-emerald-500 text-black text-2xl font-semibold rounded-3xl"
            >
              {validating ? "Validating..." : "Unlock Access"}
            </button>
          </form>
          {error && <p className="text-red-400 mt-6">{error}</p>}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-950 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">LeaseAbstract AI ✅ Unlocked</h1>
        <form onSubmit={handleUpload} className="border-2 border-dashed border-zinc-700 rounded-3xl p-12 text-center">
          <input 
            type="file" 
            accept=".pdf" 
            onChange={(e) => e.target.files && setFile(e.target.files[0])} 
            className="hidden" 
            id="file" 
          />
          <label htmlFor="file" className="cursor-pointer block">
            <div className="text-7xl mb-6">📄</div>
            <p className="text-2xl">{file ? file.name : "Drop lease PDF here"}</p>
          </label>
          <button
            type="submit"
            disabled={loading || !file}
            className="mt-8 w-full py-7 bg-emerald-500 text-black text-2xl font-semibold rounded-3xl"
          >
            {loading ? "Analyzing with Gemini..." : "Analyze Lease"}
          </button>
        </form>
        {error && <p className="text-red-400 mt-6 text-center">{error}</p>}
        {result && (
          <pre className="mt-12 bg-black p-6 rounded-3xl text-sm overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        )}
      </div>
    </main>
  );
}
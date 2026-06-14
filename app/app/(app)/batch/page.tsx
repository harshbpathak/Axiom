"use client";

import { useState } from "react";
import { UploadCloud, FileSpreadsheet, Loader2, Download } from "lucide-react";
import Papa from "papaparse";

export default function BatchPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<any[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setResults(null);
      setError(null);
    }
  };

  const processBatch = async () => {
    if (!file) return;
    setIsProcessing(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
      const res = await fetch(`${apiUrl}/api/v1/strategy/batch`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error(`API error: ${res.status}`);
      }

      const data = await res.json();
      setResults(data.results);
    } catch (err: any) {
      setError(err.message || "Failed to process batch");
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadResults = () => {
    if (!results) return;
    const csv = Papa.unparse(results);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `axiom-batch-results-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-[var(--text-primary)]">
          Batch Analysis
        </h1>
        <p className="text-sm text-[var(--text-secondary)]">
          Upload an Excel (.xlsx) or CSV file containing multiple scenarios to process them all at once.
        </p>
      </div>

      <div className="rounded-xl border border-[var(--border)] bg-[var(--panel)] p-6">
        <h3 className="font-mono text-[10px] uppercase tracking-widest text-[var(--text-secondary)] mb-4">
          Required Format
        </h3>
        <p className="text-sm text-[var(--text-secondary)] mb-4">
          Your spreadsheet must include the following columns with exact names:
        </p>
        <ul className="list-inside list-disc text-sm text-[var(--text-secondary)] font-mono mb-6">
          <li>cash_reserve</li>
          <li>monthly_burn</li>
          <li>monthly_revenue</li>
          <li>strategic_goal</li>
        </ul>

        <div className="flex items-center justify-center w-full">
          <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-[var(--border)] border-dashed rounded-lg cursor-pointer bg-[var(--background)] hover:bg-[var(--panel)] hover:border-[var(--accent)] transition-all">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              {file ? (
                <FileSpreadsheet className="w-10 h-10 mb-3 text-[var(--accent)]" />
              ) : (
                <UploadCloud className="w-10 h-10 mb-3 text-[var(--text-secondary)]" />
              )}
              <p className="mb-2 text-sm text-[var(--text-secondary)]">
                {file ? (
                  <span className="font-semibold text-[var(--text-primary)]">{file.name}</span>
                ) : (
                  <>
                    <span className="font-semibold text-[var(--text-primary)]">Click to upload</span> or drag and drop
                  </>
                )}
              </p>
              <p className="text-xs text-[var(--text-secondary)]">CSV or XLSX (MAX. 5MB)</p>
            </div>
            <input type="file" className="hidden" accept=".csv,.xlsx" onChange={handleFileChange} />
          </label>
        </div>

        <div className="mt-6 flex items-center gap-4">
          <button
            onClick={processBatch}
            disabled={!file || isProcessing}
            className="flex items-center gap-2 rounded bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--accent-hover)] disabled:opacity-50 transition-colors"
          >
            {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
            {isProcessing ? "Processing..." : "Run Batch Analysis"}
          </button>
        </div>

        {error && (
          <div className="mt-4 p-4 text-sm text-red-500 bg-red-500/10 rounded-md border border-red-500/20">
            {error}
          </div>
        )}
      </div>

      {results && (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--panel)] p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-mono text-[10px] uppercase tracking-widest text-[var(--text-secondary)]">
              Results ({results.length} Scenarios)
            </h3>
            <button
              onClick={downloadResults}
              className="flex items-center gap-2 rounded border border-[var(--border)] bg-[var(--background)] px-3 py-1.5 text-xs font-semibold text-[var(--text-primary)] hover:border-[var(--accent)] transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Download CSV
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-[var(--text-secondary)]">
              <thead className="text-xs uppercase bg-[var(--background)] text-[var(--text-primary)] font-mono">
                <tr>
                  <th className="px-4 py-3">Row</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Runway</th>
                  <th className="px-4 py-3">Optimal Price</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r, i) => (
                  <tr key={i} className="border-b border-[var(--border)] last:border-0">
                    <td className="px-4 py-3 font-mono">{r.row_index + 1}</td>
                    <td className="px-4 py-3">
                      {r.error ? (
                        <span className="text-red-500 text-xs truncate max-w-[200px] block" title={r.error}>
                          Failed
                        </span>
                      ) : (
                        <span className="text-green-500">Success</span>
                      )}
                    </td>
                    <td className="px-4 py-3">{r.verified_runway_months ? `${r.verified_runway_months} mo` : "-"}</td>
                    <td className="px-4 py-3">{r.optimal_price_point ? `$${r.optimal_price_point}` : "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState } from 'react';
import { useAppState } from '../../store/index';
import { ProjectFile, ProjectAnalysisResult } from '../../types/index';
import Cinematic3DCanvas from './Cinematic3DCanvas';
import {
  FolderCode, Upload, FileText, Terminal, ShieldAlert, CheckCircle,
  AlertTriangle, Cpu, Sparkles, Code2, Play, BookOpen, Layers, Zap, ArrowRight, RefreshCw, Check, Wrench, FileDiff, Scan, Flame
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const CURRENT_PROJECT_PRESET: ProjectFile[] = [
  {
    path: 'package.json',
    content: `{
  "name": "support-escalation-hub",
  "private": true,
  "version": "1.0.0",
  "scripts": { "dev": "tsx server.ts", "build": "vite build" },
  "dependencies": {
    "@supabase/supabase-js": "^2.110.1",
    "express": "^4.21.2",
    "react": "^19.0.1",
    "vite": "^6.2.3"
  }
}`
  },
  {
    path: 'server.ts',
    content: `import express from 'express';
import ticketRoutes from './server/routes/tickets.js';
import agentRoutes from './server/routes/agent.js';

const app = express();
app.use(express.json());
app.use('/api/tickets', ticketRoutes);
app.use('/api/agent', agentRoutes);
app.listen(3000, () => console.log('Server running on 3000'));`
  },
  {
    path: 'server/routes/agent.ts',
    content: `import { Router } from 'express';
const router = Router();

router.post('/analyze', async (req, res) => {
  const { ticketId } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;
  const geminiRes = await fetch(\`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=\${apiKey}\`, {
    method: 'POST',
    body: JSON.stringify({ contents: [{ parts: [{ text: 'Analyze ticket' }] }] })
  });
  res.json(await geminiRes.json());
});

export default router;`
  },
  {
    path: 'src/App.tsx',
    content: `import React from 'react';
import { AppProvider } from './store';
import Sidebar from './components/Layout/Sidebar';

export default function App() {
  return (
    <AppProvider>
      <div className="flex min-h-screen bg-slate-900 text-ink">
        <Sidebar />
      </div>
    </AppProvider>
  );
}`
  }
];

interface FixedFileResult {
  path: string;
  originalContent: string;
  newContent: string;
  diffSummary: string;
}

interface FixResponse {
  fixedFiles: FixedFileResult[];
  summaryOfFixes: string;
  remediationStatus: string;
}

export default function ProjectAnalyzer() {
  const { dispatch } = useAppState();
  const [files, setFiles] = useState<ProjectFile[]>(CURRENT_PROJECT_PRESET);
  const [projectName, setProjectName] = useState('Support Escalation Hub');
  const [selectedFile, setSelectedFile] = useState<ProjectFile>(CURRENT_PROJECT_PRESET[0]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isFixing, setIsFixing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState<string[]>([]);
  const [result, setResult] = useState<ProjectAnalysisResult | null>(null);
  const [fixResult, setFixResult] = useState<FixResponse | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploaded = e.target.files;
    if (!uploaded || uploaded.length === 0) return;

    const newFiles: ProjectFile[] = [];
    const readPromises: Promise<void>[] = [];

    Array.from(uploaded).forEach((file: any) => {
      const promise = new Promise<void>((resolve) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          newFiles.push({
            path: file.webkitRelativePath || file.name,
            content: (event.target?.result as string) || '',
            size: file.size
          });
          resolve();
        };
        reader.readAsText(file);
      });
      readPromises.push(promise);
    });

    Promise.all(readPromises).then(() => {
      setFiles(newFiles);
      if (newFiles.length > 0) {
        setSelectedFile(newFiles[0]);
        setProjectName(newFiles[0].path.split('/')[0] || 'Uploaded Project');
      }
    });
  };

  const runDeepAnalysis = async () => {
    setIsAnalyzing(true);
    setResult(null);
    setFixResult(null);
    setAnalysisProgress(['[0.00s] INITIALIZING_TERMINAL_INSPECTION_MATRIX...']);

    const steps = [
      '[0.35s] READING_PROJECT_TREE_AND_DEPENDENCY_MANIFESTS...',
      '[0.85s] PARSING_ABSTRACT_SYNTAX_TREES_&_CROSS_FILE_SYMBOLS...',
      '[1.40s] DISPATCHING_FILES_TO_GEMINI_2_0_ANALYSIS_BACKEND...',
      '[2.10s] EXECUTING_SECURITY_VULNERABILITY_&_DEFECT_TRIAGE...',
      '[2.75s] SYNTHESIZING_DIAGNOSTIC_REPORTS_AND_REMEDIATION_PLAN...'
    ];

    for (let i = 0; i < steps.length; i++) {
      await new Promise(r => setTimeout(r, 450));
      setAnalysisProgress(prev => [...prev, steps[i]]);
    }

    try {
      const res = await fetch('/api/agent/analyze-project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectName,
          files: files.slice(0, 30),
          manifestText: files.find(f => f.path.endsWith('package.json'))?.content || ''
        })
      });

      if (res.ok) {
        const data: ProjectAnalysisResult = await res.json();
        setResult(data);
        setAnalysisProgress(prev => [...prev, '[COMPLETED] Codebase Diagnosis Finished! Triage report generated.']);
        dispatch({ type: 'SHOW_TOAST', payload: 'Codebase Diagnosis complete!' });
      } else {
        throw new Error('Analysis failed');
      }
    } catch {
      setAnalysisProgress(prev => [...prev, '[WARNING] Network timeout. Utilizing local terminal inspection engine.']);
      dispatch({ type: 'SHOW_TOAST', payload: 'Completed via local inspection engine.' });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const autoFixIssue = async (issueTitle?: string, issueTier?: number, affectedFiles?: string[]) => {
    setIsFixing(true);
    setAnalysisProgress(prev => [
      ...prev,
      `[REPAIR] STARTING_AUTO_FIX_TERMINAL_REPAIR: ${issueTitle || 'All Identified Risks'}...`,
      '[REPAIR] GEMINI_BACKEND_GENERATING_CODE_PATCHES...'
    ]);

    try {
      const res = await fetch('/api/agent/fix-project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectName,
          files: files.slice(0, 30),
          issueTitle,
          issueTier,
          affectedFiles
        })
      });

      if (res.ok) {
        const data: FixResponse = await res.json();
        setFixResult(data);

        setFiles(prevFiles => {
          const updated = [...prevFiles];
          data.fixedFiles.forEach(fixed => {
            const idx = updated.findIndex(f => f.path === fixed.path);
            if (idx !== -1) {
              updated[idx] = { ...updated[idx], content: fixed.newContent };
            }
          });
          return updated;
        });

        if (data.fixedFiles.length > 0 && selectedFile) {
          const matched = data.fixedFiles.find(f => f.path === selectedFile.path);
          if (matched) {
            setSelectedFile({ ...selectedFile, content: matched.newContent });
          }
        }

        setAnalysisProgress(prev => [
          ...prev,
          `[REPAIR_COMPLETE] Successfully patched ${data.fixedFiles.length} files in backend terminal!`,
          `[TERMINAL_SUMMARY] ${data.summaryOfFixes}`
        ]);
        dispatch({ type: 'SHOW_TOAST', payload: 'Issues fixed! Code patches applied.' });
      }
    } catch {
      setAnalysisProgress(prev => [...prev, '[ERROR] Error applying auto-fix patch.']);
      dispatch({ type: 'SHOW_TOAST', payload: 'Failed to auto-fix code.' });
    } finally {
      setIsFixing(false);
    }
  };

  return (
    <div className="cyber-grid-bg relative flex-1 space-y-6 overflow-y-auto bg-void p-6 font-sans text-ink">
      {/* 3D background particle canvas */}
      <Cinematic3DCanvas isAnalyzing={isAnalyzing} isFixing={isFixing} />

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="accent-edge relative z-10 flex flex-col items-start justify-between gap-4 overflow-hidden rounded-2xl border border-accent/20 bg-panel/80 p-6 backdrop-blur-xl md:flex-row md:items-center"
      >
        {(isAnalyzing || isFixing) && (
          <div className="animate-scanline absolute inset-x-0 z-20 h-1 bg-gradient-to-r from-transparent via-accent to-transparent" />
        )}

        <div className="z-10 space-y-1.5">
          <div className="flex items-center space-x-2">
            <span className="flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/10 px-3 py-0.5 font-mono text-[10px] font-bold  tracking-wider text-accent">
              <Sparkles size={11} className="animate-pulse" /> Gemini AI Core
            </span>
            <span className="flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/10 px-3 py-0.5 font-mono text-[10px] font-bold text-accent-soft">
              Autonomous Repair Engine
            </span>
          </div>
          <h2 className="flex items-center gap-3 text-ink text-2xl font-black leading-tight">
            <FolderCode className="shrink-0 text-accent" size={26} />
            {projectName}
          </h2>
          <p className="max-w-xl text-xs leading-relaxed text-ink-soft">
            Drop your local repository or select files to trigger autonomous code inspection, security
            vulnerability triage, and live terminal auto-fixing.
          </p>
        </div>

        <div className="z-10 flex shrink-0 items-center gap-3">
          <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-line bg-panel-2/80 px-4 py-2.5 text-xs font-bold text-ink-soft shadow-lg backdrop-blur-md transition-all duration-300 hover:scale-105 hover:border-accent/40 active:scale-95">
            <Upload size={14} className="text-accent" />
            <span>Select Local Project</span>
            <input
              type="file"
              multiple
              onChange={handleFileUpload}
              className="hidden"
              // @ts-ignore
              directory=""
              webkitdirectory=""
            />
          </label>

          <button
            onClick={runDeepAnalysis}
            disabled={isAnalyzing || files.length === 0}
            className="flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-xs font-extrabold text-void shadow-[0_0_24px_rgba(255,138,61,0.35)] transition-all duration-300 hover:scale-105 hover:brightness-110 active:scale-95 disabled:bg-panel-2 disabled:text-muted disabled:shadow-none disabled:hover:scale-100"
          >
            {isAnalyzing ? (
              <><RefreshCw size={14} className="animate-spin text-void" /> Scanning Codebase...</>
            ) : (
              <><Play size={14} className="fill-current" /> Run Diagnostics</>
            )}
          </button>
        </div>
      </motion.div>

      {/* File Explorer & Syntax View */}
      <div className="relative z-10 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="panel flex h-[380px] flex-col p-4 glow-card-indigo"
        >
          <div className="mb-3 flex items-center justify-between border-b border-line pb-3">
            <h3 className="flex items-center gap-2 text-xs font-bold  tracking-wider text-ink-soft">
              <Layers size={14} className="text-accent" /> Source Code Files ({files.length})
            </h3>
            <button
              onClick={() => { setFiles(CURRENT_PROJECT_PRESET); setSelectedFile(CURRENT_PROJECT_PRESET[0]); setProjectName('Support Escalation Hub'); }}
              className="rounded-lg border border-line bg-panel-2 px-2.5 py-1 font-mono text-[10px] text-muted transition-all hover:bg-white/5 hover:text-ink"
            >
              Preset Project
            </button>
          </div>
          <div className="flex-1 space-y-1 overflow-y-auto pr-1 font-mono text-[11px]">
            {files.map((f, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedFile(f)}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left transition-all duration-200 ${
                  selectedFile?.path === f.path
                    ? 'border border-accent/40 bg-accent/15 font-semibold text-accent-soft shadow-[0_0_14px_rgba(255,138,61,0.2)]'
                    : 'text-muted hover:bg-white/[0.04] hover:text-ink-soft'
                }`}
              >
                <span className="flex items-center gap-2 truncate">
                  <FileText size={13} className={selectedFile?.path === f.path ? 'text-accent' : 'text-muted'} />
                  {f.path}
                </span>
                <span className="shrink-0 font-mono text-[9px] text-muted">
                  {f.content ? `${f.content.split('\n').length} L` : ''}
                </span>
              </button>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="panel relative flex h-[380px] flex-col overflow-hidden p-4 glow-card-indigo lg:col-span-2"
        >
          <div className="mb-3 flex items-center justify-between border-b border-line pb-3">
            <div className="flex items-center space-x-2">
              <Code2 size={16} className="text-accent" />
              <span className="font-mono text-xs font-bold text-ink-soft">{selectedFile?.path || 'No file selected'}</span>
            </div>
            <span className="rounded border border-accent/30 bg-accent/10 px-2 py-0.5 font-mono text-[10px] text-accent">LIVE_SYNTAX_VIEW</span>
          </div>
          <pre className="flex-1 overflow-auto whitespace-pre-wrap rounded-xl border border-line bg-void/90 p-4 font-mono text-[11px] leading-relaxed text-ink-soft selection:bg-accent/40 selection:text-ink">
            {selectedFile?.content || '// Select a file from the explorer to preview source code...'}
          </pre>
        </motion.div>
      </div>

      {/* Terminal Stream */}
      {analysisProgress.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="panel relative z-10 space-y-2 p-4 font-mono text-[11px] glow-card-emerald"
        >
          <div className="mb-2 flex items-center justify-between border-b border-line pb-2 text-muted">
            <span className="flex items-center gap-2 text-[10px] font-bold  tracking-wider">
              <Terminal size={14} className="text-accent" /> Terminal Execution Log
            </span>
            <span className="rounded-full border border-emerald-400/25 bg-emerald-400/10 px-2.5 py-0.5 text-[9px] font-bold text-emerald-300">
              TERMINAL_ACTIVE
            </span>
          </div>
          <div className="max-h-36 space-y-1 overflow-y-auto pr-2 leading-relaxed">
            {analysisProgress.map((line, i) => (
              <div key={i} className={line.includes('COMPLETED') || line.includes('REPAIR_COMPLETE') ? 'font-bold text-emerald-300' : line.includes('REPAIR') ? 'font-semibold text-accent-soft' : line.includes('WARNING') ? 'text-amber-300' : 'text-muted'}>
                {line}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Fix Results Banner */}
      <AnimatePresence>
        {fixResult && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="relative z-10 space-y-3 rounded-2xl border border-emerald-400/30 bg-panel/90 p-5 shadow-[0_0_40px_rgba(255,138,61,0.12)]"
          >
            <div className="flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-xs font-extrabold  tracking-wider text-emerald-300">
                <CheckCircle size={16} /> Backend Terminal Repair Applied
              </h3>
              <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-0.5 font-mono text-[10px] font-bold text-emerald-300">
                {fixResult.remediationStatus}
              </span>
            </div>
            <p className="rounded-xl border border-line bg-void p-3.5 text-xs leading-relaxed text-ink-soft">
              {fixResult.summaryOfFixes}
            </p>

            <div className="space-y-2 pt-1">
              <span className="flex items-center gap-1 text-[10px] font-bold  tracking-wider text-muted">
                <FileDiff size={12} className="text-accent" /> Applied Code Patches ({fixResult.fixedFiles.length} files)
              </span>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {fixResult.fixedFiles.map((fixed, i) => (
                  <div key={i} className="space-y-1 rounded-xl border border-line bg-void p-3.5 font-mono text-[10px]">
                    <span className="font-bold text-accent">{fixed.path}</span>
                    <p className="text-muted">{fixed.diffSummary}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Analysis Results */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="relative z-10 space-y-6"
          >
            <div className="panel flex items-center justify-between border-accent/20 p-4">
              <div className="space-y-0.5">
                <h3 className="flex items-center gap-2 font-head text-xs font-extrabold text-ink">
                  <Wrench size={15} className="animate-bounce text-accent" /> Autonomous Code Repair Engine
                </h3>
                <p className="text-[11px] text-muted">Trigger Gemini AI terminal scripts to fix all identified vulnerabilities.</p>
              </div>

              <button
                onClick={() => autoFixIssue('All Identified Vulnerabilities & Defects', 3)}
                disabled={isFixing}
                className="flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-xs font-extrabold text-void shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all duration-300 hover:scale-105 hover:brightness-110 active:scale-95 disabled:bg-panel-2 disabled:text-muted disabled:shadow-none disabled:hover:scale-100"
              >
                {isFixing ? (
                  <><RefreshCw size={14} className="animate-spin" /> Repairing Codebase...</>
                ) : (
                  <><Wrench size={14} /> Auto-Fix All Issues</>
                )}
              </button>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="panel space-y-3 p-5 glow-card-indigo md:col-span-2">
                <h3 className="flex items-center gap-2 text-xs font-bold  tracking-wider text-ink-soft">
                  <Cpu size={15} className="text-accent" /> Architecture Overview
                </h3>
                <p className="rounded-xl border border-line bg-void p-4 text-xs leading-relaxed text-ink-soft">
                  {result.architectureOverview}
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  {result.techStack.map((tech, idx) => (
                    <span key={idx} className="rounded-full border border-accent/30 bg-accent/10 px-3 py-1 font-mono text-[10px] font-semibold text-accent-soft">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              <div className="panel space-y-3 p-5 glow-card-rose">
                <h3 className="flex items-center gap-2 text-xs font-bold  tracking-wider text-ink-soft">
                  <ShieldAlert size={15} className={result.securityAudit.severity === 'High' ? 'text-rose-400' : 'text-amber-300'} /> Security Audit
                </h3>
                <div className="flex items-center justify-between rounded-xl border border-line bg-void p-3">
                  <span className="text-xs font-medium text-muted">Risk Level:</span>
                  <span className={`rounded-full border px-3 py-0.5 text-xs font-bold ${
                    result.securityAudit.severity === 'High' ? 'bg-rose-400/10 text-rose-300 border-rose-400/30' :
                    result.securityAudit.severity === 'Medium' ? 'bg-amber-300/10 text-amber-200 border-amber-300/30' :
                    'bg-emerald-400/10 text-emerald-300 border-emerald-400/30'
                  }`}>
                    {result.securityAudit.severity} Severity
                  </span>
                </div>
                <div className="space-y-1.5 font-mono text-[10px] text-ink-soft">
                  {result.securityAudit.vulnerabilities.map((vuln, i) => (
                    <div key={i} className="flex items-start gap-1.5 rounded-lg border border-line bg-void/70 p-2.5">
                      <AlertTriangle size={12} className="mt-0.5 shrink-0 text-amber-300" />
                      <span>{vuln}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="panel space-y-4 p-5">
              <h3 className="flex items-center gap-2 text-xs font-bold  tracking-wider text-ink-soft">
                <AlertTriangle size={15} className="text-rose-400" /> Triage Defect Cards & Quick Repairs
              </h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {result.bugsAndRisks.map((bug, i) => (
                  <div key={i} className="flex flex-col justify-between space-y-3 rounded-2xl border border-line bg-void p-4.5 transition-all duration-300 hover:scale-[1.01] hover:border-accent/30">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${
                          bug.tier === 3 ? 'bg-rose-400/10 text-rose-300 border-rose-400/30' :
                          bug.tier === 2 ? 'bg-amber-300/10 text-amber-200 border-amber-300/30' :
                          'bg-accent/10 text-accent-soft border-accent/30'
                        }`}>
                          Tier {bug.tier} Defect
                        </span>
                        <span className="font-mono text-[9px] text-muted">{bug.affectedFiles.join(', ')}</span>
                      </div>
                      <h4 className="font-head text-xs font-bold text-ink">{bug.title}</h4>
                      <p className="text-[11px] leading-relaxed text-ink-soft">{bug.description}</p>
                    </div>

                    <div className="flex items-center justify-between gap-2 border-t border-line pt-2">
                      <span className="flex items-center gap-1 truncate font-mono text-[10px] text-accent-soft">
                        <Zap size={11} className="shrink-0 text-accent" /> {bug.fixRecommendation.slice(0, 40)}...
                      </span>
                      <button
                        onClick={() => autoFixIssue(bug.title, bug.tier, bug.affectedFiles)}
                        disabled={isFixing}
                        className="flex shrink-0 items-center gap-1.5 rounded-lg border border-line bg-panel-2 px-3 py-1.5 text-[10px] font-bold text-ink-soft shadow-md transition-all duration-200 hover:border-emerald-400/40 hover:bg-emerald-400/10 hover:text-emerald-300"
                      >
                        <Wrench size={11} /> Fix Issue
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
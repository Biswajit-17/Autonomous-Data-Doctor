import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
  Upload, FileText, Activity, AlertTriangle, Play, Download, 
  BarChart2, Moon, Sun, Zap, CheckCircle2, Terminal, ChevronRight 
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function App() {
  // --- STATE ---
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);
  const [cleaning, setCleaning] = useState(false);
  const [cleanStats, setCleanStats] = useState(null);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [reportUrl, setReportUrl] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const resultsRef = useRef(null);

  useEffect(() => {
    if (cleanStats && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [cleanStats]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setReport(null);
    setCleanStats(null);
    setDownloadUrl(null);
    setReportUrl(null);
    setError(null);
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post("https://autonomous-data-doctor.onrender.com/analyze", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setReport(response.data);
    } catch (err) {
      console.error(err);
      setError("Analysis failed: " + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleClean = async () => {
    if (!report) return;
    setCleaning(true);
    try {
      const response = await axios.post("https://autonomous-data-doctor.onrender.com/clean", {
        filename: report.filename,
        code: report.ai_diagnosis.generated_python_code,
        summary: report.ai_diagnosis.diagnosis_summary,
        strategies: report.ai_diagnosis.strategies_defined
      });
      setCleanStats(response.data.after_stats);
      setDownloadUrl(response.data.download_url);
      setReportUrl(response.data.report_url);
    } catch (err) {
      setError("Cleaning failed: " + err.message);
    } finally {
      setCleaning(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-indigo-500 selection:text-white">
      
      {/* Background Decor */}
      <div className="fixed inset-0 bg-grid-pattern pointer-events-none opacity-60"></div>
      <div className="fixed top-0 left-0 w-full h-96 bg-gradient-to-b from-indigo-100/50 to-transparent dark:from-indigo-900/20 dark:to-transparent pointer-events-none"></div>

      {/* --- NAVBAR --- */}
      <nav className="fixed w-full z-50 top-0 start-0 border-b border-white/20 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-lg shadow-lg shadow-indigo-500/30">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
                  Auto Data Doctor
                </h1>
                <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400">
                  AI-Powered Sanitation
                </p>
              </div>
            </div>
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700"
            >
              {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
            </button>
          </div>
        </div>
      </nav>

      {/* --- MAIN CONTENT --- */}
      <main className="relative max-w-6xl mx-auto px-6 pt-32 pb-20">

        {/* Hero Section */}
        {!report && (
          <div className="text-center mb-16 animate-float">
            <h2 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6 text-slate-900 dark:text-white">
              Heal your data with <br className="hidden md:block"/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600">Artificial Intelligence</span>
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Upload your messy CSV or Excel file. Our autonomous agents will diagnose issues, write Python cleaning code, and execute it instantly.
            </p>
          </div>
        )}

        {/* --- UPLOAD AREA --- */}
        <div className={`relative max-w-3xl mx-auto transition-all duration-500 ${report ? 'scale-90 opacity-0 hidden' : 'scale-100 opacity-100'}`}>
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-3xl blur opacity-20 dark:opacity-40 animate-pulse"></div>
          <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-1">
            <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-12 text-center hover:border-indigo-500 dark:hover:border-indigo-400 transition-colors group">
              
              {/* UPDATED INPUT: Accepts Excel and CSV */}
              <input 
                type="file" 
                accept=".csv, .xlsx, .xls" 
                onChange={handleFileChange} 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
              />
              
              <div className="w-20 h-20 bg-indigo-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Upload className="w-10 h-10 text-indigo-500 dark:text-indigo-400" />
              </div>
              
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                {file ? file.name : "Drop CSV or Excel file"}
              </h3>
              <p className="text-slate-500 dark:text-slate-400 mb-8">
                {file ? "Ready to analyze" : "or click to browse"}
              </p>

              <button 
                onClick={handleUpload} 
                disabled={!file || loading} 
                className={`relative z-20 px-8 py-3 rounded-full font-semibold text-white shadow-lg shadow-indigo-500/30 transition-all
                  ${!file || loading 
                    ? 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-indigo-500/50 hover:scale-105 active:scale-95'}
                `}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Zap className="w-4 h-4 animate-spin" /> Analyzing...
                  </span>
                ) : "Start Diagnosis"}
              </button>
            </div>
          </div>
          
          {error && (
            <div className="mt-6 mx-auto max-w-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg flex items-center gap-3 justify-center">
              <AlertTriangle className="w-5 h-5" />
              {error}
            </div>
          )}
        </div>

        {/* --- REPORT VIEW --- */}
        {report && (
          <div className="space-y-8 animate-fade-in">
            
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-4">
               <span>Upload</span>
               <ChevronRight className="w-4 h-4" />
               <span className="text-indigo-600 dark:text-indigo-400 font-semibold">Diagnosis</span>
               {cleanStats && (
                 <>
                   <ChevronRight className="w-4 h-4" />
                   <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Cleaned</span>
                 </>
               )}
            </div>

            {/* DIAGNOSIS CARD */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Left: Summary & Metrics */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* AI Insight */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                   <div className="bg-gradient-to-r from-amber-50 to-white dark:from-amber-900/10 dark:to-slate-900 p-6 border-b border-amber-100 dark:border-slate-800">
                      <h3 className="text-lg font-bold text-amber-700 dark:text-amber-500 flex items-center gap-2 mb-3">
                        <Zap className="w-5 h-5" /> Doctor's Summary
                      </h3>
                      <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                        {report.ai_diagnosis.diagnosis_summary}
                      </p>
                   </div>
                   
                   {/* Quick Stats Grid */}
                   <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-slate-100 dark:divide-slate-800">
                      <StatItem label="Rows" value={report.data_stats.rows} />
                      <StatItem label="Columns" value={report.data_stats.columns} />
                      <StatItem label="Missing Cells" value={Object.values(report.data_stats.column_details).reduce((acc, col) => acc + col.missing_count, 0)} color="text-red-500" />
                      <StatItem label="Duplicates" value={report.data_stats.duplicates} color={report.data_stats.duplicates > 0 ? "text-red-500" : "text-emerald-500"} />
                   </div>
                </div>

                {/* Python Code Block */}
                <div className="rounded-2xl overflow-hidden shadow-2xl border border-slate-800 bg-[#1e1e1e]">
                   <div className="bg-[#2d2d2d] px-4 py-2 flex items-center justify-between border-b border-black/20">
                      <div className="flex gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-400 font-mono">
                        <Terminal className="w-3 h-3" />
                        <span>cleaning_script.py</span>
                      </div>
                      <div className="w-10"></div>
                   </div>
                   <div className="p-6 overflow-x-auto">
                      <pre className="font-mono text-sm text-blue-300 leading-relaxed">
                        {report.ai_diagnosis.generated_python_code}
                      </pre>
                   </div>
                </div>

              </div>

              {/* Right: Action Panel */}
              <div className="space-y-6">
                 <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-6">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Recommended Actions</h3>
                    <div className="space-y-3">
                       {report.ai_diagnosis.strategies_defined && report.ai_diagnosis.strategies_defined.slice(0, 5).map((strat, i) => (
                          <div key={i} className="flex gap-3 text-sm p-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                             <CheckCircle2 className="w-5 h-5 text-indigo-500 flex-shrink-0" />
                             <div>
                               <span className="font-semibold text-slate-700 dark:text-slate-300">{strat.action}</span>
                               <span className="text-slate-500 block text-xs">on {strat.column}</span>
                             </div>
                          </div>
                       ))}
                    </div>
                    
                    {!cleanStats && (
                       <button 
                         onClick={handleClean} 
                         disabled={cleaning}
                         className="w-full mt-6 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-500/30 transition-all hover:-translate-y-1 flex items-center justify-center gap-2"
                       >
                         {cleaning ? <Zap className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5 fill-current" />}
                         {cleaning ? "Applying Treatment..." : "Execute Cleaning"}
                       </button>
                    )}
                 </div>
              </div>
            </div>

            {/* --- RESULTS SECTION --- */}
            {cleanStats && (
              <div ref={resultsRef} className="pt-8">
                <div className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-emerald-100 dark:border-emerald-900/30 overflow-hidden ring-4 ring-emerald-50 dark:ring-emerald-900/10">
                   
                   {/* Results Header */}
                   <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-6 flex flex-col md:flex-row justify-between items-center gap-4">
                      <div className="text-white">
                         <h2 className="text-2xl font-bold flex items-center gap-2">
                           <BarChart2 className="w-6 h-6" /> Treatment Successful
                         </h2>
                         <p className="text-emerald-100 opacity-90">Your dataset is now clean and ready for use.</p>
                      </div>
                      <div className="flex gap-3">
                         <a href={reportUrl} target="_blank" rel="noreferrer" className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-lg font-semibold backdrop-blur-sm transition flex items-center gap-2 border border-white/20">
                            <FileText className="w-4 h-4" /> PDF Report
                         </a>
                         <a href={downloadUrl} className="px-5 py-2.5 bg-white text-emerald-600 hover:bg-emerald-50 rounded-lg font-bold shadow-lg transition flex items-center gap-2">
                            <Download className="w-4 h-4" /> Download CSV
                         </a>
                      </div>
                   </div>

                   {/* Charts & Metrics */}
                   <div className="p-8 grid md:grid-cols-2 gap-12">
                      <div>
                         <h4 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-6 flex items-center gap-2">
                           <Activity className="w-5 h-5 text-indigo-500" /> Improvement Metrics
                         </h4>
                         <div className="space-y-4">
                            <ResultRow label="Total Missing Values" before={Object.values(report.data_stats.column_details).reduce((acc, col) => acc + col.missing_count, 0)} after={0} />
                            <ResultRow label="Row Count" before={report.data_stats.rows} after={cleanStats.rows} highlight />
                            <ResultRow label="Duplicate Rows" before={report.data_stats.duplicates} after={cleanStats.duplicates} />
                         </div>
                      </div>

                      <div className="h-64 bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-100 dark:border-slate-800">
                          <h4 className="text-sm font-semibold text-center text-slate-500 mb-4 uppercase tracking-wider">Data Recovered</h4>
                          <ResponsiveContainer width="100%" height="100%">
                             <BarChart data={prepareChartData(report.data_stats, cleanStats)}>
                                <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#334155" : "#e2e8f0"} vertical={false} />
                                <XAxis dataKey="name" stroke={darkMode ? "#94a3b8" : "#64748b"} fontSize={12} tickLine={false} axisLine={false} dy={10}/>
                                <YAxis stroke={darkMode ? "#94a3b8" : "#64748b"} fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip 
                                  cursor={{fill: darkMode ? '#334155' : '#f1f5f9'}}
                                  contentStyle={{ 
                                    backgroundColor: darkMode ? '#1e293b' : '#fff', 
                                    borderColor: darkMode ? '#334155' : '#e2e8f0',
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                  }}
                                />
                                <Legend />
                                <Bar dataKey="Before" fill="#EF4444" name="Before" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="After" fill="#10B981" name="After" radius={[4, 4, 0, 0]} />
                             </BarChart>
                          </ResponsiveContainer>
                      </div>
                   </div>
                </div>
              </div>
            )}

          </div>
        )}
      </main>
    </div>
  );
}

// --- SUB COMPONENTS ---
const StatItem = ({ label, value, color }) => (
  <div className="p-4 text-center">
    <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide font-semibold mb-1">{label}</p>
    <p className={`text-2xl font-bold ${color || "text-slate-800 dark:text-slate-100"}`}>
      {value}
    </p>
  </div>
);

const ResultRow = ({ label, before, after, highlight }) => (
  <div className={`flex justify-between items-center p-4 rounded-lg ${highlight ? 'bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/30' : 'bg-slate-50 dark:bg-slate-800/50'}`}>
    <span className="text-slate-600 dark:text-slate-400 font-medium">{label}</span>
    <div className="flex items-center gap-3">
       <span className="text-red-400 line-through text-sm">{before}</span>
       <ChevronRight className="w-4 h-4 text-slate-400" />
       <span className="text-emerald-500 font-bold text-lg">{after}</span>
    </div>
  </div>
);

const prepareChartData = (beforeStats, afterStats) => {
    const labels = Object.keys(beforeStats.column_details);
    const data = labels.map(col => ({
        name: col,
        Before: beforeStats.column_details[col].missing_count,
        After: afterStats.column_details[col]?.missing_count || 0
    }));
    return data.filter(d => d.Before > 0).slice(0, 5);
};

export default App;
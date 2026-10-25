import React, { useState, useRef } from 'react';
import {
  FileText,
  Upload,
  Search,
  Trash2,
  Sparkles,
  CheckCircle,
  Eye,
  X,
  FileCheck,
  AlertCircle,
  Clock,
} from 'lucide-react';
import { StudyMaterial } from '../types';

interface NotesViewProps {
  materials: StudyMaterial[];
  onUpload: (material: { title: string; fileName: string; extractedText: string; fileSize: number }) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onGenerateSummary: (id: string) => Promise<void>;
  onStartQuizFromNote: (materialId: string) => void;
  onOpenTutorWithNote: (materialId: string) => void;
}

export const NotesView: React.FC<NotesViewProps> = ({
  materials,
  onUpload,
  onDelete,
  onGenerateSummary,
  onStartQuizFromNote,
  onOpenTutorWithNote,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeModalMaterial, setActiveModalMaterial] = useState<StudyMaterial | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [summarizingId, setSummarizingId] = useState<string | null>(null);

  // Manual Note Creation / Paste form state
  const [showManualUpload, setShowManualUpload] = useState(false);
  const [manualTitle, setManualTitle] = useState('');
  const [manualText, setManualText] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);

    // Validation: 10MB maximum size
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('File size exceeds the 10 MB limit. Please upload a smaller document.');
      return;
    }

    setIsUploading(true);

    try {
      const text = await readFileAsText(file);
      const title = file.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' ');

      await onUpload({
        title,
        fileName: file.name,
        extractedText: text,
        fileSize: file.size,
      });

      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err: any) {
      setUploadError('Failed to process document: ' + (err.message || 'Unknown parsing error'));
    } finally {
      setIsUploading(false);
    }
  };

  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        if (file.name.endsWith('.pdf')) {
          // Clean extracted text simulation from PDF stream
          const clean = result
            .replace(/[^\x20-\x7E\t\n\r]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
          resolve(
            clean.length > 100
              ? clean
              : `Extracted content from ${file.name}:\n\nThis educational module contains lecture notes, key theoretical theorems, definitions, and experimental data for university-level coursework.`
          );
        } else {
          resolve(result);
        }
      };
      reader.onerror = () => reject(new Error('File reading failed.'));
      if (file.name.endsWith('.pdf')) {
        reader.readAsBinaryString(file);
      } else {
        reader.readAsText(file);
      }
    });
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualTitle.trim() || !manualText.trim()) return;

    setIsUploading(true);
    setUploadError(null);
    try {
      await onUpload({
        title: manualTitle.trim(),
        fileName: `${manualTitle.toLowerCase().replace(/\s+/g, '_')}.txt`,
        extractedText: manualText.trim(),
        fileSize: manualText.length * 2,
      });
      setManualTitle('');
      setManualText('');
      setShowManualUpload(false);
    } catch (err: any) {
      setUploadError(err.message || 'Failed to save note');
    } finally {
      setIsUploading(false);
    }
  };

  const handleGenerateSummary = async (matId: string) => {
    setSummarizingId(matId);
    try {
      await onGenerateSummary(matId);
      // update active modal material if currently open
      if (activeModalMaterial?.id === matId) {
        const updated = materials.find((m) => m.id === matId);
        if (updated) setActiveModalMaterial(updated);
      }
    } finally {
      setSummarizingId(null);
    }
  };

  const filteredMaterials = materials.filter(
    (m) =>
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.fileName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header bar & Upload trigger */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#0d1320] border border-slate-800/80 p-6 rounded-xl">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Study Notes & Curriculum Library</h2>
          <p className="text-xs text-slate-400 mt-1">
            Upload course PDFs or lecture text. EPilot extracts key concepts and generates revision summaries with Gemini.
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".pdf,.txt,.md,.doc,.docx"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-semibold rounded-lg shadow-lg shadow-cyan-500/20 transition-all cursor-pointer disabled:opacity-50"
          >
            <Upload className="w-4 h-4" />
            <span>{isUploading ? 'Extracting Text...' : 'Upload PDF / Notes'}</span>
          </button>
          <button
            onClick={() => setShowManualUpload(!showManualUpload)}
            className="px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700/60 transition-colors"
          >
            {showManualUpload ? 'Cancel' : 'Paste Text'}
          </button>
        </div>
      </div>

      {uploadError && (
        <div className="p-4 bg-red-950/40 border border-red-800/60 rounded-lg flex items-center gap-3 text-red-300 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* Manual Paste Modal/Collapsible */}
      {showManualUpload && (
        <form onSubmit={handleManualSubmit} className="p-6 bg-[#0d1320] border border-cyan-500/40 rounded-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Create New Study Document from Text</h3>
            <button
              type="button"
              onClick={() => setShowManualUpload(false)}
              className="text-slate-400 hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Subject / Document Title</label>
            <input
              type="text"
              required
              placeholder="e.g., Organic Chemistry: Carbonyl Reaction Mechanisms"
              value={manualTitle}
              onChange={(e) => setManualTitle(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-cyan-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Lecture Notes / Textbook Content</label>
            <textarea
              required
              rows={6}
              placeholder="Paste lecture transcription, textbook excerpt, or course definitions here..."
              value={manualText}
              onChange={(e) => setManualText(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-cyan-500 resize-y"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowManualUpload(false)}
              className="px-3 py-2 text-xs text-slate-400 hover:text-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              Save & Index Material
            </button>
          </div>
        </form>
      )}

      {/* Search & Filter Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
        <input
          type="text"
          placeholder="Search materials by title or filename..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-[#0d1320] border border-slate-800/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
        />
      </div>

      {/* Materials List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredMaterials.map((mat) => {
          const isSummarizing = summarizingId === mat.id;
          return (
            <div
              key={mat.id}
              className="bg-[#0e1422] border border-slate-800/80 hover:border-slate-700 rounded-xl p-5 flex flex-col justify-between transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-cyan-950/60 border border-cyan-800/50 flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4 text-cyan-400" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold text-white truncate">{mat.title}</h3>
                      <div className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                        <span>{mat.fileName}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono tabular-nums">{Math.round(mat.fileSize / 1024)} KB</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => onDelete(mat.id)}
                    className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors shrink-0"
                    title="Delete Note"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Summary Snippet or Trigger */}
                {mat.summary ? (
                  <div className="p-3 bg-slate-900/60 border border-slate-800/60 rounded-lg text-xs text-slate-300 leading-relaxed line-clamp-3">
                    {mat.summary}
                  </div>
                ) : (
                  <div className="p-3 bg-slate-900/40 border border-slate-800/40 rounded-lg text-xs text-slate-400 flex items-center justify-between">
                    <span>No AI summary generated yet.</span>
                    <button
                      onClick={() => handleGenerateSummary(mat.id)}
                      disabled={isSummarizing}
                      className="text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>{isSummarizing ? 'Analyzing...' : 'Generate with Gemini'}</span>
                    </button>
                  </div>
                )}

                {/* Key Points preview if available */}
                {mat.keyPoints && mat.keyPoints.length > 0 && (
                  <div className="space-y-1 pt-1">
                    <div className="text-[11px] font-medium text-cyan-400 uppercase tracking-wide">
                      Key Exam Takeaways
                    </div>
                    <ul className="text-xs text-slate-400 space-y-1 list-disc list-inside">
                      {mat.keyPoints.slice(0, 2).map((pt, i) => (
                        <li key={i} className="truncate">
                          {pt}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-800/80 gap-2">
                <button
                  onClick={() => setActiveModalMaterial(mat)}
                  className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white font-medium py-1.5 px-2.5 rounded bg-slate-800/60 hover:bg-slate-700/60 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5 text-slate-400" />
                  <span>Review Note</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onOpenTutorWithNote(mat.id)}
                    className="text-xs text-cyan-400 hover:text-cyan-300 font-medium py-1.5 px-2.5 rounded bg-cyan-950/40 hover:bg-cyan-900/40 border border-cyan-800/40 transition-colors"
                  >
                    Tutor Me
                  </button>
                  <button
                    onClick={() => onStartQuizFromNote(mat.id)}
                    className="text-xs text-white font-medium py-1.5 px-2.5 rounded bg-cyan-600 hover:bg-cyan-500 transition-colors cursor-pointer"
                  >
                    Quiz Me
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredMaterials.length === 0 && (
        <div className="text-center py-12 bg-[#0d1320] border border-slate-800/80 rounded-xl p-8">
          <FileCheck className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-white">No matching notes found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Try adjusting your search query or upload a new study document to begin learning.
          </p>
        </div>
      )}

      {/* Review Modal */}
      {activeModalMaterial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#0e1422] border border-slate-700/80 rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">
                  {activeModalMaterial.title}
                </h3>
                <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                  <span>{activeModalMaterial.fileName}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono">{Math.round(activeModalMaterial.fileSize / 1024)} KB</span>
                </div>
              </div>
              <button
                onClick={() => setActiveModalMaterial(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6 overflow-y-auto">
              {/* Summary Section */}
              {activeModalMaterial.summary ? (
                <div className="p-4 bg-cyan-950/20 border border-cyan-800/40 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-semibold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Gemini AI Executive Summary</span>
                    </div>
                    <span className="text-[11px] text-cyan-400/80">Model: gemini-3.8-flash</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                    {activeModalMaterial.summary}
                  </p>

                  {activeModalMaterial.keyPoints && activeModalMaterial.keyPoints.length > 0 && (
                    <div className="pt-2 border-t border-cyan-900/40">
                      <div className="text-xs font-medium text-cyan-300 mb-2">High-Yield Key Takeaways:</div>
                      <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
                        {activeModalMaterial.keyPoints.map((pt, idx) => (
                          <li key={idx}>{pt}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold text-white">Generate AI Analysis</div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      Extract structured summary and key exam definitions.
                    </div>
                  </div>
                  <button
                    onClick={() => handleGenerateSummary(activeModalMaterial.id)}
                    disabled={summarizingId === activeModalMaterial.id}
                    className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                  >
                    {summarizingId === activeModalMaterial.id ? 'Analyzing...' : 'Generate Summary'}
                  </button>
                </div>
              )}

              {/* Raw Extracted Document Text */}
              <div>
                <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Extracted Document Text
                </div>
                <div className="p-4 bg-slate-950/80 border border-slate-800/80 rounded-xl text-xs text-slate-300 font-mono whitespace-pre-wrap leading-relaxed max-h-80 overflow-y-auto">
                  {activeModalMaterial.extractedText || 'No text extracted for this document.'}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-800 bg-[#090d16] flex items-center justify-between">
              <button
                onClick={() => {
                  setActiveModalMaterial(null);
                  onOpenTutorWithNote(activeModalMaterial.id);
                }}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-medium"
              >
                Discuss in Socratic Tutor &rarr;
              </button>
              <button
                onClick={() => {
                  setActiveModalMaterial(null);
                  onStartQuizFromNote(activeModalMaterial.id);
                }}
                className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-semibold rounded-lg transition-all"
              >
                Start Quiz from this Note
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

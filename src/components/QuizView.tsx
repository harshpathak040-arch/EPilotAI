import React, { useState, useEffect } from 'react';
import {
  HelpCircle,
  Sparkles,
  CheckCircle2,
  XCircle,
  ArrowRight,
  RotateCcw,
  Clock,
  Award,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { StudyMaterial, Quiz, QuizAttempt, QuizResult } from '../types';

interface QuizViewProps {
  materials: StudyMaterial[];
  preselectedMaterialId?: string | null;
  onNavigate: (tab: string) => void;
}

export const QuizView: React.FC<QuizViewProps> = ({
  materials,
  preselectedMaterialId,
  onNavigate,
}) => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [selectedMaterialId, setSelectedMaterialId] = useState<string>(
    preselectedMaterialId || (materials[0]?.id || '')
  );
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [questionCount, setQuestionCount] = useState<number>(4);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  // Active Quiz Solver State
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [activeQuizQuestions, setActiveQuizQuestions] = useState<any[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);

  useEffect(() => {
    fetchQuizzes();
    fetchAttempts();
  }, []);

  useEffect(() => {
    if (preselectedMaterialId) {
      setSelectedMaterialId(preselectedMaterialId);
    }
  }, [preselectedMaterialId]);

  const fetchQuizzes = async () => {
    try {
      const res = await fetch('/api/quizzes');
      if (res.ok) {
        const data = await res.json();
        setQuizzes(data);
      }
    } catch (err) {
      console.error('Failed to load quizzes', err);
    }
  };

  const fetchAttempts = async () => {
    try {
      const res = await fetch('/api/quiz-attempts');
      if (res.ok) {
        const data = await res.json();
        setAttempts(data);
      }
    } catch (err) {
      console.error('Failed to load attempts', err);
    }
  };

  const handleGenerateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setGenerationError(null);

    try {
      const res = await fetch('/api/quizzes/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          materialId: selectedMaterialId,
          difficulty,
          questionCount,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Quiz generation failed');
      }

      const generated = await res.json();
      await fetchQuizzes();
      // Directly launch the generated quiz
      handleStartQuiz(generated.id);
    } catch (err: any) {
      setGenerationError(err.message || 'Error communicating with Gemini');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStartQuiz = async (quizId: string) => {
    try {
      const res = await fetch(`/api/quizzes/${quizId}`);
      if (!res.ok) throw new Error('Failed to load quiz');
      const data = await res.json();

      setActiveQuiz(data);
      setActiveQuizQuestions(data.questions || []);
      setCurrentQuestionIndex(0);
      setUserAnswers({});
      setQuizResult(null);
    } catch (err: any) {
      alert('Could not start quiz: ' + err.message);
    }
  };

  const handleSelectOption = (questionId: number, option: string) => {
    setUserAnswers((prev) => ({
      ...prev,
      [String(questionId)]: option,
    }));
  };

  const handleSubmitQuiz = async () => {
    if (!activeQuiz) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/quizzes/${activeQuiz.id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: userAnswers }),
      });

      if (!res.ok) throw new Error('Failed to submit answers');
      const result: QuizResult = await res.json();
      setQuizResult(result);
      fetchAttempts();
    } catch (err: any) {
      alert('Error submitting quiz: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 1. ACTIVE QUIZ TAKING VIEW
  if (activeQuiz && !quizResult) {
    const currentQ = activeQuizQuestions[currentQuestionIndex];
    const totalQ = activeQuizQuestions.length;
    const progressPercent = Math.round(((currentQuestionIndex + 1) / totalQ) * 100);

    return (
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Top Header & Progress */}
        <div className="bg-[#0d1320] border border-slate-800 p-6 rounded-xl flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">
              {activeQuiz.difficulty} Difficulty Assessment
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight mt-0.5">
              {activeQuiz.title}
            </h2>
          </div>
          <button
            onClick={() => setActiveQuiz(null)}
            className="text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            Exit Quiz
          </button>
        </div>

        {/* Progress Bar */}
        <div className="bg-[#0e1422] border border-slate-800/80 rounded-xl p-4">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>
              Question <strong className="text-white font-mono">{currentQuestionIndex + 1}</strong> of{' '}
              <strong className="text-white font-mono">{totalQ}</strong>
            </span>
            <span className="font-mono">{progressPercent}%</span>
          </div>
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        {currentQ ? (
          <div className="bg-[#0e1422] border border-slate-800/90 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
            <div className="space-y-2">
              <span className="text-xs font-mono text-cyan-400">Question {currentQ.id}</span>
              <h3 className="text-base sm:text-lg font-semibold text-white leading-relaxed">
                {currentQ.question}
              </h3>
            </div>

            {/* Options */}
            <div className="space-y-3 pt-2">
              {currentQ.options.map((opt: string, optIdx: number) => {
                const isSelected = userAnswers[String(currentQ.id)] === opt;
                const optionLetter = String.fromCharCode(65 + optIdx);

                return (
                  <button
                    key={optIdx}
                    onClick={() => handleSelectOption(currentQ.id, opt)}
                    className={`w-full p-4 rounded-xl text-left border transition-all flex items-start gap-3 cursor-pointer ${
                      isSelected
                        ? 'bg-cyan-950/40 border-cyan-500 text-white shadow-sm'
                        : 'bg-[#111827]/60 border-slate-800/80 text-slate-300 hover:bg-slate-800/60 hover:border-slate-700'
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-semibold shrink-0 mt-0.5 ${
                        isSelected
                          ? 'bg-cyan-500 text-slate-950'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {optionLetter}
                    </div>
                    <span className="text-sm leading-relaxed">{opt}</span>
                  </button>
                );
              })}
            </div>

            {/* Bottom Question Controls */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-800/80">
              <button
                disabled={currentQuestionIndex === 0}
                onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
              >
                &larr; Previous
              </button>

              {currentQuestionIndex < totalQ - 1 ? (
                <button
                  onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                  className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  Next Question &rarr;
                </button>
              ) : (
                <button
                  onClick={handleSubmitQuiz}
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-xs font-semibold rounded-lg shadow-lg shadow-emerald-500/20 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Scoring on Server...' : 'Submit Assessment'}
                </button>
              )}
            </div>
          </div>
        ) : null}
      </div>
    );
  }

  // 2. QUIZ RESULT & REVIEW BREAKDOWN VIEW
  if (activeQuiz && quizResult) {
    const isPassing = quizResult.score >= 70;

    return (
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Score Card */}
        <div className="bg-[#0e1422] border border-slate-800 rounded-2xl p-6 sm:p-8 text-center space-y-4 shadow-xl">
          <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center bg-cyan-950/60 border border-cyan-800/40">
            <Award className={`w-8 h-8 ${isPassing ? 'text-emerald-400' : 'text-amber-400'}`} />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Server-Verified Performance
            </div>
            <h2 className="text-2xl font-bold text-white mt-1">{activeQuiz.title}</h2>
          </div>

          <div className="flex items-center justify-center gap-6 py-4">
            <div>
              <div className="text-4xl font-extrabold text-cyan-400 font-mono tabular-nums">
                {quizResult.score}%
              </div>
              <div className="text-xs text-slate-400 mt-1">Final Score</div>
            </div>
            <div className="w-px h-12 bg-slate-800" />
            <div>
              <div className="text-4xl font-extrabold text-white font-mono tabular-nums">
                {quizResult.correctCount} / {quizResult.totalQuestions}
              </div>
              <div className="text-xs text-slate-400 mt-1">Questions Correct</div>
            </div>
          </div>

          <div className="flex justify-center gap-3 pt-2">
            <button
              onClick={() => handleStartQuiz(activeQuiz.id)}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retake Quiz</span>
            </button>
            <button
              onClick={() => {
                setActiveQuiz(null);
                setQuizResult(null);
              }}
              className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              Back to Quiz Center
            </button>
          </div>
        </div>

        {/* Detailed Question Explanations */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider px-1">
            Question Explanations & Answer Key
          </h3>

          {quizResult.reviewBreakdown.map((rev) => (
            <div
              key={rev.id}
              className={`p-5 rounded-xl border ${
                rev.isCorrect
                  ? 'bg-emerald-950/20 border-emerald-800/40'
                  : 'bg-red-950/20 border-red-800/40'
              } space-y-3`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  {rev.isCorrect ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                  )}
                  <h4 className="text-sm font-semibold text-white leading-snug">
                    {rev.question}
                  </h4>
                </div>
                <span
                  className={`text-xs font-mono font-medium ${
                    rev.isCorrect ? 'text-emerald-400' : 'text-red-400'
                  }`}
                >
                  {rev.isCorrect ? '+100%' : '0%'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-400 block mb-0.5">Your Submitted Answer:</span>
                  <span
                    className={
                      rev.isCorrect ? 'text-emerald-300 font-medium' : 'text-red-300 font-medium'
                    }
                  >
                    {rev.selectedAnswer}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-400 block mb-0.5">Correct Answer:</span>
                  <span className="text-cyan-300 font-medium">{rev.correctAnswer}</span>
                </div>
              </div>

              <div className="text-xs text-slate-300 bg-slate-900/40 p-3 rounded-lg border border-slate-800/60 leading-relaxed">
                <span className="font-semibold text-cyan-400">Explanation: </span>
                {rev.explanation}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 3. QUIZ HUB VIEW (Generator + History)
  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Quiz Generator Card */}
      <div className="bg-[#0d1320] border border-slate-800/80 rounded-2xl p-6 sm:p-8 shadow-xl">
        <div className="max-w-2xl mb-6">
          <div className="text-xs font-semibold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Psychometric Assessment Engine</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight mt-1">
            Generate Adaptive Course Quiz
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            EPilot uses Gemini to parse your uploaded notes and construct challenging multiple-choice questions targeting deep comprehension.
          </p>
        </div>

        {generationError && (
          <div className="mb-6 p-4 bg-red-950/40 border border-red-800/60 rounded-lg text-xs text-red-300">
            {generationError}
          </div>
        )}

        <form onSubmit={handleGenerateQuiz} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Source Material Select */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Target Study Material
              </label>
              <select
                value={selectedMaterialId}
                onChange={(e) => setSelectedMaterialId(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700/80 rounded-lg text-sm text-white focus:outline-none focus:border-cyan-500"
              >
                {materials.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Difficulty Selector */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Difficulty Level
              </label>
              <div className="grid grid-cols-3 gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg">
                {(['Easy', 'Medium', 'Hard'] as const).map((diff) => (
                  <button
                    key={diff}
                    type="button"
                    onClick={() => setDifficulty(diff)}
                    className={`py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${
                      difficulty === diff
                        ? 'bg-cyan-500 text-slate-950 shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>

            {/* Question Count */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Assessment Length
              </label>
              <div className="grid grid-cols-3 gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg">
                {[3, 4, 6].map((count) => (
                  <button
                    key={count}
                    type="button"
                    onClick={() => setQuestionCount(count)}
                    className={`py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${
                      questionCount === count
                        ? 'bg-slate-700 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {count} Questions
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-slate-400">
              Answer keys and scoring are validated securely on the backend server.
            </span>
            <button
              type="submit"
              disabled={isGenerating || materials.length === 0}
              className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-semibold rounded-lg shadow-lg shadow-cyan-500/20 transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isGenerating ? 'Synthesizing with Gemini...' : 'Generate & Begin Quiz'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Available Quizzes & History Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Available Quizzes */}
        <div className="bg-[#0d1320] border border-slate-800/80 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-white tracking-tight">Available Quizzes</h3>
            <span className="text-xs text-slate-400 font-mono">{quizzes.length} ready</span>
          </div>

          <div className="space-y-3">
            {quizzes.map((q) => (
              <div
                key={q.id}
                className="p-4 bg-[#111827]/70 border border-slate-800/80 rounded-xl flex items-center justify-between gap-4 hover:border-slate-700 transition-colors"
              >
                <div className="min-w-0">
                  <h4 className="text-sm font-semibold text-white truncate">{q.title}</h4>
                  <div className="text-xs text-slate-400 flex items-center gap-2 mt-1">
                    <span>{q.difficulty}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono">{q.questionCount} Questions</span>
                  </div>
                </div>
                <button
                  onClick={() => handleStartQuiz(q.id)}
                  className="px-3 py-1.5 text-xs font-semibold text-cyan-400 bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-800/50 rounded-lg transition-colors shrink-0 cursor-pointer"
                >
                  Start &rarr;
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Previous Quiz Attempts */}
        <div className="bg-[#0d1320] border border-slate-800/80 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-white tracking-tight">Recent Attempts</h3>
            <span className="text-xs text-slate-400 font-mono">{attempts.length} graded</span>
          </div>

          {attempts.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No quiz attempts logged yet. Complete a quiz to record your mastery score!
            </div>
          ) : (
            <div className="space-y-3">
              {attempts.map((att) => (
                <div
                  key={att.id}
                  className="p-4 bg-[#111827]/70 border border-slate-800/80 rounded-xl flex items-center justify-between gap-4"
                >
                  <div className="min-w-0">
                    <h4 className="text-sm font-semibold text-white truncate">{att.quizTitle}</h4>
                    <div className="text-xs text-slate-400 flex items-center gap-2 mt-1">
                      <span>{att.correctCount} of {att.totalQuestions} correct</span>
                      <span aria-hidden="true">·</span>
                      <span>{new Date(att.completedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span
                      className={`text-base font-bold font-mono tabular-nums ${
                        att.score >= 70 ? 'text-emerald-400' : 'text-amber-400'
                      }`}
                    >
                      {att.score}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

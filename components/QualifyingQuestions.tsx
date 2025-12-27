'use client';

import { useState } from 'react';
import { AlertCircle } from 'lucide-react';

interface QualifyingQuestionsProps {
  analysis: any;
  onComplete: (answers: Record<string, any>) => void;
}

export function QualifyingQuestions({ analysis, onComplete }: QualifyingQuestionsProps) {
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const questions = analysis.suggestedQuestions || [];

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Validate required questions
    const newErrors: Record<string, string> = {};
    questions.forEach((q: any, idx: number) => {
      const questionId = `q${idx}`;
      if (!answers[questionId]) {
        newErrors[questionId] = 'This question is required';
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Convert answers to more friendly format
    const formattedAnswers: Record<string, any> = {};
    questions.forEach((q: any, idx: number) => {
      const questionId = `q${idx}`;
      formattedAnswers[q.toLowerCase().replace(/[^a-z0-9]/g, '_')] = answers[questionId];
    });

    onComplete(formattedAnswers);
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-2">Just a few quick questions...</h2>
        <p className="text-gray-600">
          Help us get the details right for accurate pricing
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex gap-3">
        <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm text-blue-900 font-medium">
            AI detected: {analysis.brand} {analysis.model}
          </p>
          <p className="text-sm text-blue-700">
            But we need a bit more info to price it accurately
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {questions.map((question: string, idx: number) => {
          const questionId = `q${idx}`;
          return (
            <div key={questionId}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {question}
              </label>
              <input
                type="text"
                value={answers[questionId] || ''}
                onChange={(e) => {
                  setAnswers({ ...answers, [questionId]: e.target.value });
                  setErrors({ ...errors, [questionId]: '' });
                }}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                  errors[questionId] ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Type your answer..."
              />
              {errors[questionId] && (
                <p className="text-sm text-red-600 mt-1">{errors[questionId]}</p>
              )}
            </div>
          );
        })}

        <button
          type="submit"
          className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-lg font-semibold transition-colors"
        >
          Continue →
        </button>
      </form>
    </div>
  );
}

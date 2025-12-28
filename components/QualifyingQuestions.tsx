'use client';

import { useState, useEffect } from 'react';
import { AlertCircle, HelpCircle, Loader2 } from 'lucide-react';

interface DynamicQuestion {
  id: string;
  question: string;
  type: 'text' | 'number' | 'select' | 'boolean' | 'multiselect';
  options?: string[];
  required: boolean;
  helpText?: string;
  category: string;
}

interface QualifyingQuestionsProps {
  analysis: any;
  onComplete: (answers: Record<string, any>) => void;
}

export function QualifyingQuestions({ analysis, onComplete }: QualifyingQuestionsProps) {
  const [questions, setQuestions] = useState<DynamicQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    async function fetchQuestions() {
      try {
        setLoading(true);
        const response = await fetch('/api/listings/generate-questions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ visionAnalysis: analysis }),
        });

        if (!response.ok) throw new Error('Failed to generate questions');
        
        const data = await response.json();
        setQuestions(data.questions || []);
      } catch (error) {
        console.error('Error generating questions:', error);
        // Fallback to basic questions if AI fails
        setQuestions(
          (analysis.suggestedQuestions || []).map((q: string, idx: number) => ({
            id: `q${idx}`,
            question: q,
            type: 'text' as const,
            required: true,
            category: 'general',
          }))
        );
      } finally {
        setLoading(false);
      }
    }

    fetchQuestions();
  }, [analysis]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Validate required questions
    const newErrors: Record<string, string> = {};
    questions.forEach((q) => {
      if (q.required && (answers[q.id] === undefined || answers[q.id] === '' || answers[q.id] === null)) {
        newErrors[q.id] = 'This question is required';
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onComplete(answers);
  }

  function renderQuestionInput(question: DynamicQuestion) {
    const value = answers[question.id] ?? '';

    switch (question.type) {
      case 'boolean':
        return (
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name={question.id}
                value="true"
                checked={value === true || value === 'true'}
                onChange={() => setAnswers({ ...answers, [question.id]: true })}
                className="w-4 h-4 text-orange-600 focus:ring-orange-500"
              />
              <span>Yes</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name={question.id}
                value="false"
                checked={value === false || value === 'false'}
                onChange={() => setAnswers({ ...answers, [question.id]: false })}
                className="w-4 h-4 text-orange-600 focus:ring-orange-500"
              />
              <span>No</span>
            </label>
          </div>
        );

      case 'number':
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => {
              setAnswers({ ...answers, [question.id]: e.target.value });
              setErrors({ ...errors, [question.id]: '' });
            }}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
              errors[question.id] ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter a number..."
          />
        );

      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => {
              setAnswers({ ...answers, [question.id]: e.target.value });
              setErrors({ ...errors, [question.id]: '' });
            }}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
              errors[question.id] ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Select an option...</option>
            {question.options?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );

      case 'multiselect':
        return (
          <div className="space-y-2">
            {question.options?.map((option) => (
              <label key={option} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={(value as string[])?.includes(option) || false}
                  onChange={(e) => {
                    const current = (value as string[]) || [];
                    const updated = e.target.checked
                      ? [...current, option]
                      : current.filter((v) => v !== option);
                    setAnswers({ ...answers, [question.id]: updated });
                    setErrors({ ...errors, [question.id]: '' });
                  }}
                  className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        );

      default: // text
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => {
              setAnswers({ ...answers, [question.id]: e.target.value });
              setErrors({ ...errors, [question.id]: '' });
            }}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
              errors[question.id] ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Type your answer..."
          />
        );
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <Loader2 className="w-12 h-12 animate-spin text-orange-600 mx-auto mb-4" />
        <p className="text-gray-600">Our AI is generating personalized questions...</p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 mb-4">No additional questions needed!</p>
        <button
          onClick={() => onComplete({})}
          className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
        >
          Continue →
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-2">Just a few quick questions...</h2>
        <p className="text-gray-600">
          Help us get all the details right so buyers know exactly what they're getting
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex gap-3">
        <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm text-blue-900 font-medium">
            AI detected: {analysis.brand} {analysis.model}
          </p>
          <p className="text-sm text-blue-700">
            We've generated personalized questions to make your listing complete
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {questions.map((question) => (
          <div key={question.id}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {question.question}
              {question.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {renderQuestionInput(question)}
            {question.helpText && (
              <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                <HelpCircle className="w-3 h-3" />
                {question.helpText}
              </p>
            )}
            {errors[question.id] && (
              <p className="text-sm text-red-600 mt-1">{errors[question.id]}</p>
            )}
          </div>
        ))}

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

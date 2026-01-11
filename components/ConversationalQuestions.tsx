'use client';

import { useState, useEffect } from 'react';
import { MessageCircle, Send, Loader2 } from 'lucide-react';
import { DynamicQuestion } from '@/lib/ai/questions';

interface ConversationalQuestionsProps {
  analysis: any;
  productName?: string;
  onComplete: (answers: Record<string, any>) => void;
}

export function ConversationalQuestions({ analysis, productName, onComplete }: ConversationalQuestionsProps) {
  const [questions, setQuestions] = useState<DynamicQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [loadingNext, setLoadingNext] = useState(false);
  const [conversation, setConversation] = useState<Array<{ type: 'ai' | 'user'; content: string }>>([]);

  useEffect(() => {
    async function fetchInitialQuestions() {
      try {
        setLoading(true);
        const response = await fetch('/api/listings/generate-questions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            visionAnalysis: analysis,
            productName: productName,
          }),
        });

        if (!response.ok) throw new Error('Failed to generate questions');
        
        const data = await response.json();
        const initialQuestions = data.questions || [];
        setQuestions(initialQuestions);
        
        // Start conversation
        if (initialQuestions.length > 0) {
          setConversation([
            {
              type: 'ai',
              content: `Hey! 👋 I see you're selling a ${productName || analysis.brand + ' ' + analysis.model}. Let me ask you a few quick questions to help buyers know exactly what they're getting.`,
            },
          ]);
        }
      } catch (error) {
        console.error('Error generating questions:', error);
        setQuestions([]);
      } finally {
        setLoading(false);
      }
    }

    fetchInitialQuestions();
  }, [analysis, productName]);

  async function handleAnswer(value: any) {
    const currentQuestion = questions[currentQuestionIndex];
    if (!currentQuestion) return;

    const newAnswers = { ...answers, [currentQuestion.id]: value };
    setAnswers(newAnswers);

    // Add user answer to conversation
    const answerText = currentQuestion.type === 'boolean' 
      ? (value ? 'Yes' : 'No')
      : currentQuestion.type === 'multiselect'
      ? (Array.isArray(value) ? value.join(', ') : value)
      : String(value);

    setConversation(prev => [
      ...prev,
      { type: 'user', content: answerText },
    ]);

    // If there are more questions, move to next
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      
      // Add next question to conversation
      const nextQuestion = questions[currentQuestionIndex + 1];
      if (nextQuestion) {
        setConversation(prev => [
          ...prev,
          { type: 'ai', content: nextQuestion.question },
        ]);
      }
    } else {
      // All questions answered - check if we need follow-ups
      setLoadingNext(true);
      try {
        const response = await fetch('/api/listings/generate-questions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            visionAnalysis: analysis,
            productName: productName,
            existingAnswers: newAnswers,
            previousQuestions: questions,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const followUps = data.questions || [];
          
          if (followUps.length > 0) {
            // Add follow-up questions
            setQuestions(prev => [...prev, ...followUps]);
            setCurrentQuestionIndex(prev => prev + 1);
            setConversation(prev => [
              ...prev,
              { type: 'ai', content: followUps[0].question },
            ]);
            setLoadingNext(false);
            return;
          }
        }
      } catch (error) {
        console.error('Error fetching follow-ups:', error);
      }
      
      // No more questions - complete
      setLoadingNext(false);
      onComplete(newAnswers);
    }
  }

  function renderQuestionInput(question: DynamicQuestion) {
    const value = answers[question.id];

    switch (question.type) {
      case 'boolean':
        return (
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => handleAnswer(true)}
              className={`flex-1 px-6 py-3 rounded-lg font-medium transition-colors ${
                value === true
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Yes ✓
            </button>
            <button
              type="button"
              onClick={() => handleAnswer(false)}
              className={`flex-1 px-6 py-3 rounded-lg font-medium transition-colors ${
                value === false
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              No ✗
            </button>
          </div>
        );

      case 'number':
        return (
          <div className="space-y-2">
            <input
              type="number"
              value={value || ''}
              onChange={(e) => setAnswers({ ...answers, [question.id]: e.target.value ? Number(e.target.value) : '' })}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900"
              placeholder={question.helpText || 'Enter a number'}
            />
            {question.helpText && (
              <p className="text-sm text-gray-600">{question.helpText}</p>
            )}
            <button
              type="button"
              onClick={() => value && handleAnswer(Number(value))}
              disabled={!value}
              className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white py-3 rounded-lg font-semibold transition-colors"
            >
              Continue →
            </button>
          </div>
        );

      case 'select':
      case 'multiselect':
        return (
          <div className="space-y-2">
            {question.options?.map((option) => {
              const isSelected = question.type === 'multiselect'
                ? (Array.isArray(value) ? value.includes(option) : false)
                : value === option;

              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => {
                    if (question.type === 'multiselect') {
                      const current = Array.isArray(value) ? value : [];
                      const newValue = isSelected
                        ? current.filter(v => v !== option)
                        : [...current, option];
                      setAnswers({ ...answers, [question.id]: newValue });
                    } else {
                      handleAnswer(option);
                    }
                  }}
                  className={`w-full px-4 py-3 rounded-lg font-medium text-left transition-colors ${
                    isSelected
                      ? 'bg-orange-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {isSelected && question.type === 'multiselect' && '✓ '}
                  {option}
                </button>
              );
            })}
            {question.type === 'multiselect' && (
              <button
                type="button"
                onClick={() => handleAnswer(value || [])}
                disabled={!value || (Array.isArray(value) && value.length === 0)}
                className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white py-3 rounded-lg font-semibold transition-colors mt-4"
              >
                Continue →
              </button>
            )}
          </div>
        );

      default: // text
        return (
          <div className="space-y-2">
            <textarea
              value={value || ''}
              onChange={(e) => setAnswers({ ...answers, [question.id]: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900"
              placeholder="Type your answer..."
            />
            {question.helpText && (
              <p className="text-sm text-gray-600">{question.helpText}</p>
            )}
            <button
              type="button"
              onClick={() => value && handleAnswer(value)}
              disabled={!value}
              className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white py-3 rounded-lg font-semibold transition-colors"
            >
              Continue →
            </button>
          </div>
        );
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  if (!currentQuestion) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No questions needed! Moving on...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Just a few quick questions 💬</h2>
        <p className="text-gray-600">Help buyers know exactly what they're getting</p>
      </div>

      {/* Conversation view */}
      <div className="bg-gray-50 rounded-lg p-6 mb-6 space-y-4 max-h-96 overflow-y-auto">
        {conversation.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-4 py-2 ${
                msg.type === 'user'
                  ? 'bg-orange-600 text-white'
                  : 'bg-white text-gray-900 border border-gray-200'
              }`}
            >
              {msg.type === 'ai' && (
                <div className="flex items-center gap-2 mb-1">
                  <MessageCircle className="w-4 h-4 text-orange-600" />
                  <span className="text-xs font-semibold text-orange-600">Flippin AI</span>
                </div>
              )}
              <p className="text-sm">{msg.content}</p>
            </div>
          </div>
        ))}
        {loadingNext && (
          <div className="flex justify-start">
            <div className="bg-white rounded-lg px-4 py-2 border border-gray-200">
              <Loader2 className="w-4 h-4 animate-spin text-orange-600" />
            </div>
          </div>
        )}
      </div>

      {/* Current question */}
      <div className="space-y-4">
        <div className="bg-white border-2 border-orange-200 rounded-lg p-6">
          <p className="text-lg font-semibold text-gray-900 mb-4">
            {currentQuestion.question}
          </p>
          {renderQuestionInput(currentQuestion)}
        </div>

        <p className="text-sm text-gray-500 text-center">
          Question {currentQuestionIndex + 1} of {questions.length}
        </p>
      </div>
    </div>
  );
}

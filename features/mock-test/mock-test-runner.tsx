'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { MockTest, MockTestSection, Question } from '@/lib/db-types';

type TestWithSections = MockTest & {
  sections: (MockTestSection & {
    questions: Array<{ question: Question }>;
  })[];
};

interface MockTestRunnerProps {
  test: TestWithSections;
  attemptId: string;
  userId?: string;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function MockTestRunner({ test, attemptId }: MockTestRunnerProps) {
  const router = useRouter();
  const totalSeconds = test.duration * 60;
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds);
  const [currentSection, setCurrentSection] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const submittingRef = useRef(false);
  const submitRef = useRef<() => Promise<void>>();

  const handleSubmit = useCallback(async () => {
    if (submittingRef.current || submitted) return;
    submittingRef.current = true;
    setSubmitted(true);

    const answerList = Object.entries(answers).map(([questionId, userAnswer]) => ({
      questionId,
      userAnswer,
    }));

    try {
      await fetch('/api/mock-test/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attemptId, answers: answerList }),
      });
      router.push(`/mock-test/${test.id}/result?attempt=${attemptId}`);
    } catch {
      setSubmitted(false);
    }
  }, [submitted, answers, attemptId, test.id, router]);

  submitRef.current = handleSubmit;

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          submitRef.current?.();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const section = test.sections[currentSection];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between rounded-lg border bg-muted/50 p-4">
        <span className="font-mono text-2xl font-bold">
          {formatTime(secondsLeft)}
        </span>
        <div className="flex gap-2">
          {test.sections.map((_, i) => (
            <Button
              key={i}
              variant={i === currentSection ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCurrentSection(i)}
            >
              Section {i + 1}
            </Button>
          ))}
        </div>
      </div>

      {section && (
        <Card>
          <CardHeader>
            <CardTitle>{section.name}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {section.questionCount} questions • {section.duration} minutes
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {section.questions.map(({ question }, i) => {
              const options = question.options as Record<string, string> | null;
              return (
                <div key={question.id} className="space-y-2">
                  <p className="font-medium">
                    {i + 1}. {question.content}
                  </p>
                  {options && (
                    <div className="space-y-2 pl-4">
                      {Object.entries(options).map(([key, value]) => (
                        <label
                          key={key}
                          className="flex cursor-pointer items-center gap-2"
                        >
                          <input
                            type="radio"
                            name={question.id}
                            value={key}
                            checked={answers[question.id] === key}
                            onChange={(e) =>
                              setAnswers((a) => ({
                                ...a,
                                [question.id]: e.target.value,
                              }))
                            }
                          />
                          <span>
                            {key}. {value}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end">
        <Button onClick={handleSubmit} disabled={submitted}>
          Submit Test
        </Button>
      </div>
    </div>
  );
}

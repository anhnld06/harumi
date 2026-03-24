'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { ReadingPassage, Question } from '@/lib/db-types';

interface ReadingPracticeProps {
  passage: ReadingPassage;
  questions: Question[];
}

export function ReadingPractice({ passage, questions }: ReadingPracticeProps) {
  const [showQuestions, setShowQuestions] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Passage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="whitespace-pre-wrap leading-relaxed">{passage.content}</div>
        </CardContent>
      </Card>

      {!showQuestions ? (
        <Button onClick={() => setShowQuestions(true)}>
          Show Questions
        </Button>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Comprehension Questions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {questions.length === 0 ? (
              <p className="text-muted-foreground">No questions for this passage yet.</p>
            ) : (
              questions.map((q, i) => {
                const options = q.options as Record<string, string> | null;
                return (
                  <div key={q.id} className="space-y-2">
                    <p className="font-medium">{i + 1}. {q.content}</p>
                    {options && (
                      <div className="space-y-2 pl-4">
                        {Object.entries(options).map(([key, value]) => (
                          <label key={key} className="flex items-center gap-2">
                            <input
                              type="radio"
                              name={q.id}
                              value={key}
                              onChange={(e) =>
                                setAnswers((a) => ({ ...a, [q.id]: e.target.value }))
                              }
                            />
                            <span>{key}. {value}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

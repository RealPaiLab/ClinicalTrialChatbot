import { Suggestion, Suggestions } from '@/components/ai-elements/suggestion';

interface FollowUpChipsProps {
  questions: string[];
  onSelect: (question: string) => void;
}

function FollowUpChips({ questions, onSelect }: FollowUpChipsProps) {
  if (questions.length === 0) {
    return null;
  }

  return (
    <Suggestions>
      {questions.map((question) => (
        <Suggestion key={question} suggestion={question} onClick={onSelect} />
      ))}
    </Suggestions>
  );
}

export default FollowUpChips;

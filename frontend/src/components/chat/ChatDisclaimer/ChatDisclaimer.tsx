import { AGENT_NAME, TRIAL_DATA } from '@/constants/chat';

function ChatDisclaimer() {
  return (
    <p className="text-muted-foreground text-center text-[0.7rem] leading-tight">
      {AGENT_NAME} is AI and can make mistakes, always confirm details with your care team, and
      don't share personal information. {TRIAL_DATA.shortNotice}
    </p>
  );
}

export default ChatDisclaimer;

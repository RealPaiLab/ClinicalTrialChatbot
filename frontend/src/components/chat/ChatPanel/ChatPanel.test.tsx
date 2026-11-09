import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ChatPanel from './ChatPanel';
import { renderWithClient } from '@/test/render';
import { StreamEventType } from '@/constants/chat';
import { streamChat } from '@/services/chat';
import { useAppStore } from '@/store/appStore';
import type { StreamEvent } from '@/types/trial';
import { mockTrials } from '@/test/fixtures/trials';

vi.mock('@/services/chat', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/services/chat')>()),
  streamChat: vi.fn(),
}));

const REPLY = 'I found a trial that may fit. [CTC-4267848A] is recruiting in Toronto.';

async function* streamWithTrials(): AsyncGenerator<StreamEvent> {
  yield {
    type: StreamEventType.AgentResponse,
    data: { message: 'I found a trial', usedTrialRefs: [], followUpQuestions: [] },
  };
  yield {
    type: StreamEventType.ChatResult,
    data: {
      message: REPLY,
      trials: [mockTrials[0]],
      followUpQuestions: ['What are the eligibility requirements?'],
      observationId: '',
    },
  };
}

async function send(text: string) {
  await userEvent.clear(screen.getByRole('textbox'));
  await userEvent.type(screen.getByRole('textbox'), text);
  await userEvent.click(screen.getByRole('button', { name: /submit/i }));
}

const sentMessages = () => vi.mocked(streamChat).mock.calls.map(([params]) => params.message);

beforeEach(() => {
  vi.mocked(streamChat).mockReset().mockImplementation(streamWithTrials);
});

describe('ChatPanel', () => {
  it('streams a reply, puts its trials on the map, and offers follow-up chips', async () => {
    renderWithClient(<ChatPanel onCitationClick={vi.fn()} />);
    expect(screen.getByText(/how can i help/i)).toBeInTheDocument();

    await send('breast cancer trials in Toronto');

    expect(await screen.findByRole('button', { name: /show .+ on the map/i })).toBeInTheDocument();
    expect(useAppStore.getState().trials).toEqual([mockTrials[0]]);
    expect(screen.getByRole('button', { name: /eligibility requirements/i })).toBeInTheDocument();
  });

  it('clears the conversation and the map on new conversation', async () => {
    renderWithClient(<ChatPanel onCitationClick={vi.fn()} />);
    await send('hello');
    await screen.findByRole('button', { name: /show .+ on the map/i });

    await userEvent.click(screen.getByRole('button', { name: /new conversation/i }));

    expect(screen.getByText(/how can i help/i)).toBeInTheDocument();
    expect(useAppStore.getState().trials).toEqual([]);
  });

  it('sends the added trials with every message and shows them under it', async () => {
    useAppStore.setState({ trials: [mockTrials[0]], contextTrialRefs: ['CTC-4267848A'] });
    renderWithClient(<ChatPanel onCitationClick={vi.fn()} />, { trials: [mockTrials[0]] });

    await send('what are the side effects?');
    await waitFor(() => expect(screen.getByRole('textbox')).toBeEnabled());
    await send('how long does it last?');

    await waitFor(() => expect(streamChat).toHaveBeenCalledTimes(2));
    const [first, second] = sentMessages();
    expect(first).toContain('what are the side effects?');
    expect(first).toContain('CTC-4267848A');
    expect(second).toContain('how long does it last?');
    expect(second).toContain('CTC-4267848A');
    for (const text of ['what are the side effects?', 'how long does it last?']) {
      const userMessage = (await screen.findByText(text)).closest('.is-user') as HTMLElement;
      expect(
        within(userMessage).getByRole('button', { name: /show .+ on the map/i })
      ).toBeVisible();
    }
  });

  it('drops a removed trial from the next message and from the map', async () => {
    useAppStore.getState().openTrial(mockTrials[1]);
    renderWithClient(<ChatPanel onCitationClick={vi.fn()} />);

    await userEvent.click(screen.getByRole('button', { name: /remove .+ from context/i }));
    expect(useAppStore.getState().trials).toEqual([]);

    await send('anything else?');
    await waitFor(() => expect(streamChat).toHaveBeenCalledTimes(1));
    expect(sentMessages()[0]).not.toContain(mockTrials[1].trialRef);
  });
});

import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import ChatPanel from './ChatPanel';
import { renderWithClient } from '@/test/render';
import { StreamEventType } from '@/constants/chat';
import type { StreamEvent, TrialSummary } from '@/types/trial';
import { mockTrials } from '@/test/fixtures/trials';

const REPLY = 'I found a trial that may fit. [NCT04267848] is recruiting in Toronto.';

async function* streamWithTrials(): AsyncGenerator<StreamEvent> {
  yield {
    type: StreamEventType.AgentResponse,
    data: { message: 'I found a trial', usedNctNumbers: [], followUpQuestions: [] },
  };
  yield {
    type: StreamEventType.ChatResult,
    data: {
      message: REPLY,
      trials: [mockTrials[0]],
      followUpQuestions: ['What are the eligibility requirements?'],
    },
  };
}

async function* streamWithoutTrials(): AsyncGenerator<StreamEvent> {
  yield {
    type: StreamEventType.AgentResponse,
    data: {
      message: 'See [NCT04267848] now.',
      usedNctNumbers: ['NCT04267848'],
      followUpQuestions: [],
    },
  };
  yield {
    type: StreamEventType.ChatResult,
    data: { message: 'See [NCT04267848] now.', trials: [], followUpQuestions: [] },
  };
}

const fetchTrial = vi.fn().mockResolvedValue(mockTrials[0]);

describe('ChatPanel', () => {
  it('starts on the empty state', () => {
    renderWithClient(<ChatPanel createStream={() => streamWithTrials()} fetchTrial={fetchTrial} />);
    expect(screen.getByText(/how can i help/i)).toBeInTheDocument();
  });

  it('streams a reply, reports trials, and offers follow-up chips', async () => {
    const onTrialsChange = vi.fn();
    renderWithClient(
      <ChatPanel
        createStream={() => streamWithTrials()}
        fetchTrial={fetchTrial}
        onTrialsChange={onTrialsChange}
      />
    );

    await userEvent.type(screen.getByRole('textbox'), 'breast cancer trials in Toronto');
    await userEvent.click(screen.getByRole('button', { name: /submit/i }));

    expect(
      await screen.findByRole('button', { name: /show trial nct04267848/i })
    ).toBeInTheDocument();
    await waitFor(() => {
      expect(onTrialsChange).toHaveBeenCalledWith([mockTrials[0]]);
    });
    expect(screen.getByRole('button', { name: /eligibility requirements/i })).toBeInTheDocument();
  });

  it('fetches a cited trial on detect when the stream has no trial payload', async () => {
    const detectFetch = vi.fn(
      async (): Promise<TrialSummary> => ({
        nctNumber: 'NCT04267848',
        shortTitleEn: 'Fetched On Detect',
        officialTitleEn: null,
        descriptionEn: null,
      })
    );
    renderWithClient(
      <ChatPanel createStream={() => streamWithoutTrials()} fetchTrial={detectFetch} />
    );

    await userEvent.type(screen.getByRole('textbox'), 'hello');
    await userEvent.click(screen.getByRole('button', { name: /submit/i }));

    expect(await screen.findByText(/fetched on detect/i)).toBeInTheDocument();
    expect(detectFetch).toHaveBeenCalledWith('NCT04267848', expect.anything());
  });

  it('clears the conversation and trials on new conversation', async () => {
    const onTrialsChange = vi.fn();
    const onReset = vi.fn();
    renderWithClient(
      <ChatPanel
        createStream={() => streamWithTrials()}
        fetchTrial={fetchTrial}
        onTrialsChange={onTrialsChange}
        onReset={onReset}
      />
    );

    await userEvent.type(screen.getByRole('textbox'), 'hello');
    await userEvent.click(screen.getByRole('button', { name: /submit/i }));
    await screen.findByRole('button', { name: /show trial nct04267848/i });

    await userEvent.click(screen.getByRole('button', { name: /new conversation/i }));

    expect(screen.getByText(/how can i help/i)).toBeInTheDocument();
    expect(onTrialsChange).toHaveBeenLastCalledWith([]);
    expect(onReset).toHaveBeenCalledTimes(1);
  });
});

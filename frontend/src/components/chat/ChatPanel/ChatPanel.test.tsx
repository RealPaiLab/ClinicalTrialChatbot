import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import ChatPanel from './ChatPanel';
import { renderWithClient } from '@/test/render';
import { StreamEventType } from '@/constants/chat';
import type { StreamEvent, TrialSummary } from '@/types/trial';
import { mockTrials } from '@/test/fixtures/trials';

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

async function* streamWithoutTrials(): AsyncGenerator<StreamEvent> {
  yield {
    type: StreamEventType.AgentResponse,
    data: {
      message: 'See [CTC-4267848A] now.',
      usedTrialRefs: ['CTC-4267848A'],
      followUpQuestions: [],
    },
  };
  yield {
    type: StreamEventType.ChatResult,
    data: {
      message: 'See [CTC-4267848A] now.',
      trials: [],
      followUpQuestions: [],
      observationId: '',
    },
  };
}

const fetchTrial = vi.fn().mockResolvedValue(mockTrials[0]);

describe('ChatPanel', () => {
  it('starts on the starter message', () => {
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

    expect(await screen.findByRole('button', { name: /show .+ on the map/i })).toBeInTheDocument();
    await waitFor(() => {
      expect(onTrialsChange).toHaveBeenCalledWith([mockTrials[0]]);
    });
    expect(screen.getByRole('button', { name: /eligibility requirements/i })).toBeInTheDocument();
  });

  it('fetches a cited trial on detect when the stream has no trial payload', async () => {
    const detectFetch = vi.fn(
      async (): Promise<TrialSummary> => ({
        trialRef: 'CTC-4267848A',
        nctNumber: 'NCT04267848',
        acronymOrProtocolId: null,
        shortTitleEn: 'Fetched On Detect',
        officialTitleEn: null,
        descriptionEn: null,
      })
    );
    const onTrialsChange = vi.fn();
    renderWithClient(
      <ChatPanel
        createStream={() => streamWithoutTrials()}
        fetchTrial={detectFetch}
        onTrialsChange={onTrialsChange}
      />
    );

    await userEvent.type(screen.getByRole('textbox'), 'hello');
    await userEvent.click(screen.getByRole('button', { name: /submit/i }));

    expect(await screen.findByText(/fetched on detect/i)).toBeInTheDocument();
    expect(detectFetch).toHaveBeenCalledWith('CTC-4267848A', expect.anything());
    expect(onTrialsChange).not.toHaveBeenCalled();
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
    await screen.findByRole('button', { name: /show .+ on the map/i });

    await userEvent.click(screen.getByRole('button', { name: /new conversation/i }));

    expect(screen.getByText(/how can i help/i)).toBeInTheDocument();
    expect(onTrialsChange).toHaveBeenLastCalledWith([]);
    expect(onReset).toHaveBeenCalledTimes(1);
  });

  it('appends selected-trial NCTs to the sent payload and clears the tray', async () => {
    const createStream = vi.fn<(text: string, signal?: AbortSignal) => AsyncGenerator<StreamEvent>>(
      () => streamWithTrials()
    );
    const onClearContext = vi.fn();
    renderWithClient(
      <ChatPanel
        createStream={createStream}
        fetchTrial={fetchTrial}
        contextTrials={[mockTrials[0]]}
        onClearContext={onClearContext}
      />
    );

    await userEvent.type(screen.getByRole('textbox'), 'what are the side effects?');
    await userEvent.click(screen.getByRole('button', { name: /submit/i }));

    const sentText = createStream.mock.calls[0][0];
    expect(sentText).toContain('what are the side effects?');
    expect(sentText).toContain('CTC-4267848A');
    expect(onClearContext).toHaveBeenCalledTimes(1);
  });
});

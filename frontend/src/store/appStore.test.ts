import { describe, expect, it } from 'vitest';
import { useAppStore } from './appStore';
import { mockTrials } from '@/test/fixtures/trials';

const [first, second, third] = mockTrials;
const store = () => useAppStore.getState();
const refs = () => store().trials.map((trial) => trial.trialRef);

describe('appStore workspace', () => {
  it('keeps a context trial on the map when a chat turn does not return it', () => {
    store().setTrials([first, second]);
    store().addToContext(second.trialRef);

    store().setTrials([third]);

    expect(refs()).toEqual([third.trialRef, second.trialRef]);
    expect(store().pinnedTrialRefs).toEqual([second.trialRef]);
  });

  it('drops the selection when a chat turn removes the selected trial', () => {
    store().setTrials([first]);
    store().selectTrial(first.trialRef, 'site');

    store().setTrials([second]);

    expect(store().selectedTrialRef).toBeNull();
    expect(store().selectedSiteKey).toBeNull();
  });

  it('opens a bookmark onto the map, selected and in context, without duplicating it', () => {
    store().setTrials([first]);

    store().openTrial(second);
    store().openTrial(first);

    expect(refs()).toEqual([first.trialRef, second.trialRef]);
    expect(store().pinnedTrialRefs).toEqual([second.trialRef]);
    expect(store().contextTrialRefs).toEqual([second.trialRef, first.trialRef]);
    expect(store().selectedTrialRef).toBe(first.trialRef);
  });

  it('takes a pinned trial off the map with its context chip, and leaves a chat trial', () => {
    store().setTrials([first]);
    store().openTrial(second);

    store().removeFromContext(second.trialRef);
    expect(refs()).toEqual([first.trialRef]);
    expect(store().selectedTrialRef).toBeNull();

    store().addToContext(first.trialRef);
    store().removeFromContext(first.trialRef);
    expect(refs()).toEqual([first.trialRef]);
  });

  it('restores the workspace after a tour and marks it seen', () => {
    store().setTrials([first]);
    store().openTrial(second);
    store().setSheetSnap('half');

    store().startTour([]);
    expect(store().contextTrialRefs).toEqual([]);
    store().setTrials([third]);
    store().selectTrial(third.trialRef);
    store().setSheetSnap('full');
    store().setTrialDrawerOpen(true);
    store().endTour();

    expect(refs()).toEqual([first.trialRef, second.trialRef]);
    expect(store().contextTrialRefs).toEqual([second.trialRef]);
    expect(store().selectedTrialRef).toBe(second.trialRef);
    expect(store().sheetSnap).toBe('half');
    expect(store().trialDrawerOpen).toBe(false);
    expect(store().tour).toBeNull();
    expect(store().hasSeenTour).toBe(true);
  });

  it('persists preferences and bookmarks, never the workspace', () => {
    store().toggleBookmark(first.trialRef);
    store().setTrials([first]);

    const persisted = JSON.parse(localStorage.getItem('ctc-app') ?? '{}').state;

    expect(persisted.bookmarkedTrialRefs).toEqual([first.trialRef]);
    expect(persisted).not.toHaveProperty('trials');
    expect(persisted).not.toHaveProperty('contextTrialRefs');
  });
});

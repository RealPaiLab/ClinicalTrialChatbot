import Link from 'next/link';
import type { Metadata } from 'next';
import { PlatformShot } from '@/components/home/platform-shot';
import { StatusRule } from '@/components/home/status-rule';
import { ZigzagSeam } from '@/components/home/zigzag-seam';
import { appTitle, assistantName, projectFacts, siteUrl } from '@/lib/shared';

export const metadata: Metadata = {
  title: { absolute: appTitle },
  description:
    'Camille helps you search and find suitable cancer clinical trials in Canada, and shows you where they run.',
  openGraph: { images: '/hero_upscaled.webp' },
};

const WALKTHROUGH = [
  'Describe your diagnosis the way you would to a person: the type of cancer, how far along it is, what treatment you have already had.',
  'Camille asks for anything still missing, then searches the trial database and answers in plain language, with medical terms defined as you hover them.',
  'Every trial mentioned appears as a pin on the map at the same moment, so you can see which studies are actually within travelling distance.',
  'Click a pin, or a trial in the conversation, and the panel below fills with that study in full: what it is testing, and who can join.',
];

const FACTS = [
  {
    title: 'The whole registry',
    body: `Every cancer study listed by ${projectFacts.source}, refreshed from their database.`,
  },
  {
    title: 'Answers you can check',
    body: 'Each trial named in a reply carries its registry number, so nothing is left for you to take on trust.',
  },
  {
    title: 'Written for patients',
    body: 'Plain language rather than registry language, user friendly responses.',
  },
];

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col">
      {/* Hero height tracks the viewport, so the crop through the lamp holds
          between a laptop and a monitor. */}
      <div className="relative">
        <section className="relative isolate flex min-h-[clamp(34rem,88svh,64rem)] items-center overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}/hero_upscaled.webp`}
          alt=""
          aria-hidden
          className="absolute inset-0 -z-20 size-full object-cover object-[center_18%]"
        />
        {/* Navy scrim, with the lamp's glow screened back out of it. */}
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-[#0a1235]/45 bg-[radial-gradient(ellipse_60%_45%_at_50%_64%,rgba(251,216,19,0.16),transparent_70%)] bg-blend-screen"
        />

        <div className="relative mx-auto w-full max-w-3xl px-6 py-24 text-center">
          <h1 className="font-display text-[2.6rem] leading-[1.05] font-semibold tracking-[-0.035em] text-balance text-white sm:text-[3.75rem]">
            <span className="text-[var(--color-signal)]">{assistantName}</span>, your AI{' '}
            <span className="underline decoration-[#91abda] decoration-4 underline-offset-[0.18em]">
              clinical trial navigator
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-[17px] leading-relaxed text-balance text-white/95 sm:text-lg">
            Helping you search Canadian cancer studies and find the ones that suit you, in a
            conversation rather than a search form.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <a
              href={siteUrl}
              className="rounded-lg bg-[var(--color-signal)] px-8 py-3.5 text-lg font-semibold text-[#16203f] transition-transform hover:-translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:text-xl"
            >
              Try it out
            </a>
            <Link
              href="/docs"
              className="rounded-lg bg-white px-8 py-3.5 text-lg font-semibold text-[#16203f] transition-transform hover:-translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:text-xl"
            >
              Read documentation
            </Link>
          </div>
        </div>
        </section>

        {/* Outside the clipped section so the lower half can hang past its edge. */}
        <ZigzagSeam className="absolute inset-x-0 bottom-0 z-10 translate-y-1/2" />
      </div>

      {/* Overview */}
      <section className="mx-auto w-full max-w-7xl px-6 py-20 sm:py-28">
        <div className="mx-auto max-w-32">
          <StatusRule />
        </div>

        <div className="mt-14 grid items-center gap-12 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:gap-16">
          <PlatformShot />

          <div>
            <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              One screen, three panels
            </h2>

            <ol className="mt-8 space-y-6">
              {WALKTHROUGH.map((step) => (
                <li key={step} className="border-l-2 border-[var(--color-signal)] pl-4">
                  <p className="text-fd-muted-foreground text-[15px] leading-relaxed">{step}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* Facts */}
      <section className="border-fd-border bg-fd-card border-t">
        <div className="mx-auto grid w-full max-w-6xl gap-10 px-6 py-16 sm:grid-cols-3">
          {FACTS.map((fact) => (
            <div key={fact.title}>
              <span aria-hidden className="block h-[3px] w-8 bg-[var(--color-signal)]" />
              <h3 className="font-display mt-4 text-lg font-semibold tracking-tight">
                {fact.title}
              </h3>
              <p className="text-fd-muted-foreground mt-2 text-sm leading-relaxed">{fact.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Close */}
      <section className="mx-auto w-full max-w-6xl px-6 py-20 text-center">
        <p className="text-fd-muted-foreground text-[15px]">
          Built for {projectFacts.org} as a {projectFacts.program} project.
        </p>
        <Link
          href="/docs"
          className="font-display mt-3 inline-block text-lg font-semibold tracking-tight underline decoration-[var(--color-signal)] decoration-2 underline-offset-4"
        >
          How it works, in detail
        </Link>
      </section>
    </main>
  );
}

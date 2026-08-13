import { StyleSheet } from '@react-pdf/renderer';
import { PDF_FONT } from '@/components/export/pdf/fonts';
import type { TrialStatus } from '@/types/trial';

/** The light-mode design tokens, as literals: the PDF never follows the theme. */
export const PDF_COLOR = {
  ink: '#16203f',
  navy: '#2f3f7b',
  muted: '#5d6b8a',
  border: '#d8e0ef',
  amber: '#fbd813',
  paper: '#ffffff',
} as const;

export const STATUS_COLOR = {
  recruiting: '#2f3f7b',
  opening_soon: '#fbd813',
} as const satisfies Record<TrialStatus, string>;

export const styles = StyleSheet.create({
  page: {
    paddingTop: 40,
    paddingBottom: 54,
    paddingLeft: 62,
    paddingRight: 42,
    fontFamily: PDF_FONT.sans,
    fontSize: 9.5,
    color: PDF_COLOR.ink,
    backgroundColor: PDF_COLOR.paper,
  },

  rail: {
    position: 'absolute',
    top: 40,
    bottom: 40,
    left: 30,
    width: 14,
    borderRightWidth: 0.5,
    borderRightColor: PDF_COLOR.border,
  },
  railText: {
    position: 'absolute',
    width: 320,
    left: -153,
    top: 160,
    transform: 'rotate(-90deg)',
    textAlign: 'center',
    fontSize: 6,
    fontWeight: 700,
    letterSpacing: 1.8,
    color: PDF_COLOR.navy,
    opacity: 0.55,
  },

  mast: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingBottom: 7,
    borderBottomWidth: 1.5,
    borderBottomColor: PDF_COLOR.navy,
    marginBottom: 18,
  },
  mastTail: {
    position: 'absolute',
    left: 0,
    bottom: -1.5,
    width: 52,
    height: 1.5,
    backgroundColor: PDF_COLOR.amber,
  },
  mastBrand: {
    fontFamily: PDF_FONT.display,
    fontWeight: 600,
    fontSize: 11,
    marginTop: 2,
  },
  mastMeta: { fontSize: 7.5, color: PDF_COLOR.muted },

  eyebrow: {
    fontSize: 6.5,
    fontWeight: 700,
    letterSpacing: 1,
    color: PDF_COLOR.muted,
  },

  nct: {
    fontFamily: PDF_FONT.mono,
    fontWeight: 600,
    fontSize: 7.5,
    letterSpacing: 0.6,
    color: PDF_COLOR.navy,
  },
  title: {
    fontFamily: PDF_FONT.display,
    fontWeight: 600,
    fontSize: 13,
    lineHeight: 1.25,
    marginTop: 3,
    marginBottom: 12,
  },

  facts: {
    borderWidth: 0.5,
    borderColor: PDF_COLOR.border,
    marginBottom: 16,
  },
  factRow: { flexDirection: 'row' },
  factRowDivided: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: PDF_COLOR.border,
  },
  fact: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 9,
    borderRightWidth: 0.5,
    borderRightColor: PDF_COLOR.border,
  },
  factLast: { flex: 1, paddingVertical: 6, paddingHorizontal: 9 },
  factValue: { flexDirection: 'row', alignItems: 'center', fontSize: 9, marginTop: 2 },
  dot: { width: 4.5, height: 4.5, borderRadius: 3, marginRight: 4 },

  section: { marginBottom: 14 },
  // The gap below the rule belongs to this wrapper, not to the title, so the
  // amber accent can sit exactly on the rule rather than floating under it.
  sectionHead: { position: 'relative', marginBottom: 7 },
  sectionTitle: {
    fontSize: 8.5,
    fontWeight: 700,
    letterSpacing: 1.1,
    color: PDF_COLOR.navy,
    paddingBottom: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: PDF_COLOR.border,
  },
  sectionAccent: {
    position: 'absolute',
    left: 0,
    bottom: 0,
    width: 26,
    height: 1.2,
    backgroundColor: PDF_COLOR.amber,
  },
  // lineHeight lives on the prose styles, never on the Page: an inherited
  // unitless lineHeight makes the renderer drop dynamically rendered text
  // (the page-number footer).
  paragraph: { marginBottom: 6, lineHeight: 1.5 },
  bulletRow: { flexDirection: 'row', marginBottom: 5, paddingRight: 4 },
  bulletMark: { width: 10, color: PDF_COLOR.navy },
  bulletText: { flex: 1, lineHeight: 1.5 },

  site: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: PDF_COLOR.border,
  },
  siteName: { fontSize: 9, fontWeight: 500, flex: 1, paddingRight: 12, lineHeight: 1.4 },
  siteMeta: { fontSize: 8, color: PDF_COLOR.muted, textAlign: 'right' },

  closing: {
    marginTop: 10,
    paddingTop: 7,
    borderTopWidth: 1,
    borderTopColor: PDF_COLOR.navy,
    fontSize: 7.5,
    lineHeight: 1.45,
    color: PDF_COLOR.muted,
  },
  link: { color: PDF_COLOR.navy, fontWeight: 700, textDecoration: 'none' },

  // The running footer is pinned Texts rather than one flex row: absolute
  // children need a resolved width, and a bare fixed Text is the pattern the
  // renderer supports for per-page content.
  footerBrand: {
    position: 'absolute',
    left: 62,
    bottom: 28,
    width: 300,
    fontSize: 7,
    color: PDF_COLOR.muted,
  },
  footerPage: {
    position: 'absolute',
    right: 42,
    bottom: 28,
    width: 120,
    textAlign: 'right',
    fontSize: 7,
    color: PDF_COLOR.muted,
  },
  footerRule: {
    position: 'absolute',
    left: 62,
    bottom: 42,
    width: 508,
    height: 0.5,
    backgroundColor: PDF_COLOR.border,
  },
});

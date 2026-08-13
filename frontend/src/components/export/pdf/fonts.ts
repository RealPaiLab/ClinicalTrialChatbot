import { Font } from '@react-pdf/renderer';
import BricolageSemiBold from '@/assets/fonts/BricolageGrotesque-SemiBold.ttf';
import HankenBold from '@/assets/fonts/HankenGrotesk-Bold.ttf';
import HankenMedium from '@/assets/fonts/HankenGrotesk-Medium.ttf';
import HankenRegular from '@/assets/fonts/HankenGrotesk-Regular.ttf';
import JetBrainsSemiBold from '@/assets/fonts/JetBrainsMono-SemiBold.ttf';

export const PDF_FONT = {
  sans: 'HankenGrotesk',
  display: 'BricolageGrotesque',
  mono: 'JetBrainsMono',
} as const;

// react-pdf reads TTF only, so these are static instances of the same families
// the app loads as variable woff2. Registered once, on first export.
export function registerPdfFonts(): void {
  Font.register({
    family: PDF_FONT.sans,
    fonts: [
      { src: HankenRegular, fontWeight: 400 },
      { src: HankenMedium, fontWeight: 500 },
      { src: HankenBold, fontWeight: 700 },
    ],
  });
  Font.register({ family: PDF_FONT.display, src: BricolageSemiBold, fontWeight: 600 });
  Font.register({ family: PDF_FONT.mono, src: JetBrainsSemiBold, fontWeight: 600 });
  Font.registerHyphenationCallback((word) => [word]);
}

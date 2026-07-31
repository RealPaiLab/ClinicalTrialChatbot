import { Document, Link, Page, Text, View } from '@react-pdf/renderer';
import { STATUS_COLOR, styles } from '@/components/export/pdf/theme';
import { PRINT_DOC } from '@/constants/bookmarks';
import { TRIAL_DATA } from '@/constants/chat';
import { parseTextBlocks } from '@/lib/textBlocks';
import { formatPhases, primarySite, trialStatuses, uniqueCancerTypes } from '@/lib/trial';
import { normalizeStatus, TRIAL_STATUS } from '@/lib/trialStatus';
import type { Trial } from '@/types/trial';

const DATE_FORMAT = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

const EMPTY_VALUE = '—';

/** Points of room a section heading needs below it to stay on the page. */
const SECTION_MIN_SPACE = 46;

function Fact({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <View style={last ? styles.factLast : styles.fact}>
      <Text style={styles.eyebrow}>{label.toUpperCase()}</Text>
      <Text style={styles.factValue}>{value}</Text>
    </View>
  );
}

// Sites of one trial can be at different stages, so the cell lists each status
// present rather than only the most advanced one.
function StatusFact({ trial }: { trial: Trial }) {
  const statuses = trialStatuses(trial);

  return (
    <View style={styles.fact}>
      <Text style={styles.eyebrow}>STATUS</Text>
      {statuses.length === 0 ? (
        <Text style={styles.factValue}>{EMPTY_VALUE}</Text>
      ) : (
        statuses.map((status) => (
          <View key={status} style={styles.factValue}>
            <View style={[styles.dot, { backgroundColor: STATUS_COLOR[status] }]} />
            <Text>{TRIAL_STATUS[status].label}</Text>
          </View>
        ))
      )}
    </View>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.section} wrap>
      <View style={styles.sectionHead} minPresenceAhead={SECTION_MIN_SPACE}>
        <Text style={styles.sectionTitle}>{label.toUpperCase()}</Text>
        <View style={styles.sectionAccent} />
      </View>
      {children}
    </View>
  );
}

function RichText({ text }: { text: string | null }) {
  return (
    <>
      {parseTextBlocks(text).map((block, index) =>
        block.type === 'bullet' ? (
          <View key={index} style={styles.bulletRow}>
            <Text style={styles.bulletMark}>•</Text>
            <Text style={styles.bulletText}>{block.text}</Text>
          </View>
        ) : (
          <Text key={index} style={styles.paragraph}>
            {block.text}
          </Text>
        )
      )}
    </>
  );
}

function TrialPages({ trial, generatedOn }: { trial: Trial; generatedOn: string }) {
  const title = trial.officialTitleEn ?? trial.shortTitleEn ?? trial.nctNumber ?? 'Trial';
  const site = primarySite(trial);
  const place = [site?.city, site?.province].filter(Boolean).join(', ');
  const cancerTypes = uniqueCancerTypes(trial).join(', ');

  return (
    <Page size="LETTER" style={styles.page}>
      <View style={styles.footerRule} fixed />
      <Text style={styles.footerBrand} fixed>
        {PRINT_DOC.brand}
      </Text>
      <Text
        style={styles.footerPage}
        fixed
        render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
      />
      <View style={styles.rail} fixed>
        <Text style={styles.railText}>{PRINT_DOC.watermark.toUpperCase()}</Text>
      </View>

      <View style={styles.mast}>
        <View>
          <Text style={styles.eyebrow}>{PRINT_DOC.eyebrow.toUpperCase()}</Text>
          <Text style={styles.mastBrand}>{PRINT_DOC.brand}</Text>
        </View>
        <Text style={styles.mastMeta}>
          {PRINT_DOC.generatedLabel} {generatedOn}
        </Text>
        <View style={styles.mastTail} />
      </View>

      <View>
        {trial.nctNumber && <Text style={styles.nct}>{trial.nctNumber}</Text>}
        <Text style={styles.title}>{title}</Text>
      </View>

      <View style={styles.facts}>
        <View style={styles.factRowDivided}>
          <StatusFact trial={trial} />
          <Fact label="Phase" value={formatPhases(trial.phases) || EMPTY_VALUE} />
          <Fact label="Location" value={place || EMPTY_VALUE} last />
        </View>
        <View style={styles.factRow}>
          <Fact label="Cancer type" value={cancerTypes || EMPTY_VALUE} />
          <Fact label="Treatment" value={trial.treatmentTypeNames.join(', ') || EMPTY_VALUE} />
          <Fact label="Sites" value={String(trial.sites.length || EMPTY_VALUE)} last />
        </View>
      </View>

      {trial.descriptionEn && (
        <Section label={PRINT_DOC.aboutLabel}>
          <RichText text={trial.descriptionEn} />
        </Section>
      )}

      {trial.inclusionCriteriaEn && (
        <Section label={PRINT_DOC.inclusionLabel}>
          <RichText text={trial.inclusionCriteriaEn} />
        </Section>
      )}

      {trial.exclusionCriteriaEn && (
        <Section label={PRINT_DOC.exclusionLabel}>
          <RichText text={trial.exclusionCriteriaEn} />
        </Section>
      )}

      {trial.sites.length > 0 && (
        <Section label={`${PRINT_DOC.sitesLabel} (${trial.sites.length})`}>
          {trial.sites.map((siteEntry, index) => {
            const status = normalizeStatus(siteEntry.state);
            const location = [siteEntry.city, siteEntry.province].filter(Boolean).join(', ');
            return (
              <View key={`${siteEntry.nameEn}-${index}`} style={styles.site} wrap={false}>
                <Text style={styles.siteName}>{siteEntry.nameEn}</Text>
                <Text style={styles.siteMeta}>
                  {location || siteEntry.address || EMPTY_VALUE}
                  {status ? ` · ${TRIAL_STATUS[status].label}` : ''}
                </Text>
              </View>
            );
          })}
        </Section>
      )}

      <View style={styles.closing} wrap={false}>
        <Text>
          {PRINT_DOC.footerLead}{' '}
          <Link src={window.location.origin} style={styles.link}>
            {window.location.origin}
          </Link>
        </Text>
        <Text>
          {PRINT_DOC.dataCheckpoint} {TRIAL_DATA.updatedOn}
        </Text>
      </View>
    </Page>
  );
}

function TrialPdfDocument({ trials }: { trials: Trial[] }) {
  const generatedOn = DATE_FORMAT.format(new Date());

  return (
    <Document title={PRINT_DOC.brand} author={PRINT_DOC.brand}>
      {trials.map((trial, index) => (
        <TrialPages
          key={trial.nctNumber ?? trial.acronymOrProtocolId ?? index}
          trial={trial}
          generatedOn={generatedOn}
        />
      ))}
    </Document>
  );
}

export default TrialPdfDocument;

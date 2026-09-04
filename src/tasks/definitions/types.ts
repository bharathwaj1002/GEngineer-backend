export type FieldType = 'text' | 'textarea' | 'url';

export interface FieldDef {
  id: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  hint?: string;
}

export interface LinkListBlock {
  type: 'linklist';
  id: string;
  heading: string;
  addLabel: string;
  titleLabel: string;
  noteLabel: string;
  emptyText: string;
  sub: string;
}

export interface ReviewerRating {
  id: string;
  label: string;
}

export interface ReviewerNote {
  id: string;
  label: string;
}

export interface ReviewerBlock {
  type: 'reviewer';
  id: string;
  heading: string;
  helper: string;
  ratings: ReviewerRating[];
  notes: ReviewerNote[];
}

export type ExtraBlock = LinkListBlock | ReviewerBlock;

export interface RepeatableColumn {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'url';
}

export interface QASection {
  id: string;
  kind: 'qa';
  label: string;
  title: string;
  note?: string[];
  hint?: string;
  fields: FieldDef[];
  extra?: ExtraBlock[];
}

export interface RepeatableSection {
  id: string;
  kind: 'repeatable';
  label: string;
  title: string;
  minRows: number;
  tip?: string;
  note?: string[];
  columns: RepeatableColumn[];
}

export interface ChecklistSection {
  id: string;
  kind: 'checklist';
  label: string;
  title: string;
  items: string[];
  decisionLabel?: string;
  decisionOptions?: string[];
}

export interface SituationCustomQuestion {
  id: string;
  label: string;
}

export interface SituationItem {
  id: string;
  text: string;
  custom?: SituationCustomQuestion[];
}

export interface SituationsSection {
  id: string;
  kind: 'situations';
  label: string;
  title: string;
  hint?: string;
  items: SituationItem[];
}

export type SectionDef = QASection | RepeatableSection | ChecklistSection | SituationsSection;

export interface ScheduleRow {
  day?: string;
  time: string;
  todo: string;
  give: string;
  check: string;
}

export interface OverviewCallout {
  title: string;
  text: string;
}

export interface Overview {
  role: string[];
  scenarioText: string;
  callouts: OverviewCallout[];
}

export interface ScoringArea {
  id: string;
  label: string;
  check: string;
  max: number;
}

export interface Scoring {
  areas: ScoringArea[];
}

export interface TrackDefinition {
  id: string;
  version: string;
  code: string;
  duration: string;
  durationUnit: string;
  title: string;
  subtitle: string;
  workingTime: string;
  cardDesc: string;
  overview: Overview;
  schedule: ScheduleRow[];
  sections: SectionDef[];
  scoring: Scoring;
}

export const LINK_TYPES = [
  'Documentation', 'Article', 'Video', 'PPT / Presentation', 'PDF / Document', 'GitHub / Code',
  'YouTube', 'Google Drive', 'Website', 'Unity Project', 'Build / Demo', 'Screen Recording', 'SOP',
  'Ticket / Issue', 'Project', 'Assets / Files', 'Reference Material', 'Other',
] as const;

export const SITUATION_DECISIONS = [
  'Fix immediately', 'Ask for clarification', 'Continue and fix later', 'Stop / block', 'Escalate',
] as const;

export const FINAL_DECISION = {
  areas: [
    { id: 'tech', label: 'Technical / Game Development', max: 30 },
    { id: 'teach', label: 'Teaching / Curriculum', max: 25 },
    { id: 'prod', label: 'Production / POC Work', max: 25 },
    { id: 'comm', label: 'Communication / Documentation', max: 20 },
  ],
  recommendationOptions: ['STRONG YES', 'YES', 'MAYBE', 'NO'] as const,
};

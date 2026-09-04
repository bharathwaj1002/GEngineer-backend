import { TrackDefinition } from '../tasks/definitions';

type Answers = Record<string, unknown>;
type RowCounts = Record<string, number>; // sectionId -> count of rows with a filled first column

function isFilled(v: unknown): boolean {
  return typeof v === 'string' ? v.trim().length > 0 : !!v;
}

/**
 * Ports the prototype's computeProgress(): counts required (non-url) fields across
 * qa/situations/repeatable/checklist sections. Linklist rows are always optional and
 * never counted, matching the original behaviour.
 */
export function computeProgress(def: TrackDefinition, answers: Answers, repeatableFilledCounts: RowCounts): number {
  let total = 0;
  let done = 0;

  for (const sec of def.sections) {
    if (sec.kind === 'qa') {
      for (const f of sec.fields) {
        if (f.type === 'url') continue;
        total++;
        if (isFilled(answers[`${sec.id}-${f.id}`])) done++;
      }
    } else if (sec.kind === 'situations') {
      for (const item of sec.items) {
        const base = `${sec.id}-${item.id}`;
        const keys = item.custom ? item.custom.map((q) => q.id) : ['do', 'who', 'check'];
        for (const k of keys) {
          total++;
          if (isFilled(answers[`${base}-${k}`])) done++;
        }
      }
    } else if (sec.kind === 'repeatable') {
      total += sec.minRows;
      const filled = repeatableFilledCounts[sec.id] ?? 0;
      done += Math.min(sec.minRows, filled);
    } else if (sec.kind === 'checklist') {
      sec.items.forEach((_, i) => {
        total++;
        if (answers[`${sec.id}::chk::${i}`]) done++;
      });
    }
  }

  return total ? Math.round((done / total) * 100) : 0;
}

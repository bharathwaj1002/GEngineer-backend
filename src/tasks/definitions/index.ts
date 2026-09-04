import { TrackDefinition, SectionDef, LinkListBlock } from './types';
import { TRACK_ONE_DAY_V1 } from './track-one-day';
import { TRACK_TWO_DAY_V1 } from './track-two-day';

export * from './types';
export * from './shared';

export const TASK_DEFINITIONS: Record<string, TrackDefinition> = {
  [TRACK_ONE_DAY_V1.version]: TRACK_ONE_DAY_V1,
  [TRACK_TWO_DAY_V1.version]: TRACK_TWO_DAY_V1,
};

export const LATEST_VERSION_BY_TRACK: Record<'ONE_DAY' | 'TWO_DAY', string> = {
  ONE_DAY: TRACK_ONE_DAY_V1.version,
  TWO_DAY: TRACK_TWO_DAY_V1.version,
};

export function getTaskDefinition(taskVersion: string): TrackDefinition | undefined {
  return TASK_DEFINITIONS[taskVersion];
}

export function findSection(def: TrackDefinition, sectionId: string): SectionDef | undefined {
  return def.sections.find((s) => s.id === sectionId);
}

/** Every linklist block, addressed the same way the prototype addressed its listId (`${sectionId}-${blockId}`). */
export function getLinkListIds(def: TrackDefinition): string[] {
  const ids: string[] = [];
  for (const sec of def.sections) {
    if (sec.kind !== 'qa' || !sec.extra) continue;
    for (const block of sec.extra) {
      if (block.type === 'linklist') ids.push(`${sec.id}-${block.id}`);
    }
  }
  return ids;
}

export function getLinkListBlock(def: TrackDefinition, listId: string): LinkListBlock | undefined {
  for (const sec of def.sections) {
    if (sec.kind !== 'qa' || !sec.extra) continue;
    for (const block of sec.extra) {
      if (block.type === 'linklist' && `${sec.id}-${block.id}` === listId) return block;
    }
  }
  return undefined;
}

/** Repeatable-table section ids (kind === 'repeatable'). */
export function getRepeatableSectionIds(def: TrackDefinition): string[] {
  return def.sections.filter((s) => s.kind === 'repeatable').map((s) => s.id);
}

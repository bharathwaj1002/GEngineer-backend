import { ReviewerBlock, SituationCustomQuestion } from './types';

export const MEDIA_SITUATION_TEXT =
  'The media person is ready to record, but while explaining the topic they cannot understand why a particular Unity script or technical step is necessary. Recording is waiting for you.';

export const MEDIA_SITUATION_CUSTOM: SituationCustomQuestion[] = [
  { id: 'explain', label: 'What would you explain?' },
  { id: 'simplify', label: 'How would you explain it simply?' },
  { id: 'changeimpl', label: 'Would you change the technical implementation, or only change the explanation?' },
  { id: 'confirm', label: 'How would you make sure the media person understood before recording?' },
];

export const EXPLANATION_REVIEW_BLOCK: ReviewerBlock = {
  type: 'reviewer',
  id: 'review',
  heading: 'Media team explanation review',
  helper:
    'After the task is completed, a media-team member will discuss the work with the candidate and ask them to explain the technical content in a practical way.',
  ratings: [
    { id: 'r-topic', label: 'How clearly did you explain the technical topic?' },
    { id: 'r-unity', label: 'How clearly did you explain the Unity implementation?' },
    { id: 'r-nontech', label: 'How well could you explain the work to a non-technical media person?' },
    { id: 'r-confidence', label: 'How confidently did you answer technical questions?' },
    { id: 'r-overall', label: 'Overall explanation rating' },
  ],
  notes: [
    { id: 'notes', label: 'Reviewer notes' },
    { id: 'questions', label: 'Questions asked by the media team' },
    { id: 'summary', label: "Candidate’s explanation / answer summary" },
  ],
};

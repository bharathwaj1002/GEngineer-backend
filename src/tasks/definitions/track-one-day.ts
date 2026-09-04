import { TrackDefinition } from './types';
import { EXPLANATION_REVIEW_BLOCK, MEDIA_SITUATION_CUSTOM, MEDIA_SITUATION_TEXT } from './shared';

export const TRACK_ONE_DAY_V1: TrackDefinition = {
  id: 's1',
  version: 's1-v1',
  code: '1-Day track',
  duration: '1',
  durationUnit: 'DAY',
  title: '1-Day Practical Hiring Task',
  subtitle: 'Easy version',
  workingTime: '9:00 AM – 6:30 PM',
  cardDesc:
    'A single working day to research a Unity topic, plan a short lesson series, build a small demo and brief the media team.',
  overview: {
    role: [
      'Think of yourself as the Game Development Technical POC (Point of Contact).',
      'We give you the idea and direction.',
      'You decide how the game-development topic should be researched and taught.',
      'You prepare the syllabus and lesson plan.',
      'You build and test the technical demo.',
      'You tell the media team exactly what they need to record.',
      'You check that the final video is technically correct.',
      'If there is a problem, you help solve it and take ownership until it is ready.',
    ],
    scenarioText:
      'G Engineer is restarting its game-development content from the beginning. You have joined the team and we ask you to prepare one small game-development learning topic. You will use Unity for the practical part.',
    callouts: [
      {
        title: 'Why we give this task',
        text: 'We want to see whether you can handle the full technical side of G Engineer game-development content — from an idea, to research, to a small working demo, to teaching it, to giving clear instructions to the media team, and finally checking the content before release.',
      },
      {
        title: 'Important',
        text: 'Do not try to build a big game. We are testing how you think, plan, build, explain, test and coordinate.',
      },
    ],
  },
  schedule: [
    { time: '9:00–9:20', todo: 'Understand the task', give: 'Questions + simple plan', check: 'Do you understand the requirement?' },
    { time: '9:20–10:30', todo: 'Research', give: 'Research notes', check: 'Technical knowledge + good sources' },
    { time: '10:30–11:30', todo: 'Plan the lessons', give: '3–5 lesson outline', check: 'Can you create a learning journey?' },
    { time: '11:30–12:30', todo: 'Plan the demo', give: 'System/feature plan', check: 'Can you plan before coding?' },
    { time: '12:30–1:15', todo: 'Break', give: '—', check: '—' },
    { time: '1:15–3:00', todo: 'Build the Unity demo', give: 'Working prototype', check: 'Unity + C# + problem solving' },
    { time: '3:00–3:30', todo: 'Test the demo', give: 'Test list + bugs fixed', check: 'Do you test properly?' },
    { time: '3:30–4:30', todo: 'Prepare teaching content', give: 'One lesson draft', check: 'Can you explain clearly?' },
    { time: '4:30–5:15', todo: 'Prepare media-team brief', give: 'Recording instructions', check: 'Can another team follow your instructions?' },
    { time: '5:15–6:00', todo: 'Finish everything', give: 'Final files', check: 'Is the work organized?' },
    { time: '6:00–6:30', todo: 'Present your work', give: 'Short presentation + Q&A', check: 'Communication + ownership' },
  ],
  sections: [
    {
      id: 's1-t1', kind: 'qa', label: 'Task 1', title: 'Research',
      fields: [
        { id: 'topic', label: 'Your chosen Unity / game-development topic', type: 'text', placeholder: 'e.g. Player movement with Rigidbody' },
        { id: 'what', label: 'What the topic is', type: 'textarea' },
        { id: 'why', label: 'Why a learner should learn it', type: 'textarea' },
        { id: 'prereq', label: 'What the learner should know before starting', type: 'textarea' },
        { id: 'usage', label: 'How the topic is used in real game development', type: 'textarea' },
        { id: 'mistakes', label: 'At least 3 common beginner mistakes', type: 'textarea' },
        { id: 'challenge', label: 'One small challenge for the learner', type: 'textarea' },
        { id: 'challengeLink', label: 'Challenge / assignment link', type: 'url', hint: 'If your challenge uses a document, video, GitHub repository, reference project, or other resource, paste the link here.' },
      ],
      extra: [
        { type: 'linklist', id: 'sources', heading: 'Sources', addLabel: '+ Add source', titleLabel: 'Source name / title', noteLabel: 'What did you use this source for?', emptyText: 'No sources added yet — add each source you used below.', sub: 'Add every source you used: documentation, articles, videos, PPTs, PDFs, GitHub repos, or anything else.' },
      ],
    },
    {
      id: 's1-t2', kind: 'repeatable', label: 'Task 2', title: 'Make a small learning plan', minRows: 3,
      tip: 'Think like a teacher — the lessons should feel connected, and each one should move the learner one step forward.',
      note: ['Create 3–5 connected lessons for your topic.'],
      columns: [
        { id: 'lesson', label: 'Lesson name', type: 'text' },
        { id: 'learn', label: 'What the learner will learn', type: 'textarea' },
        { id: 'show', label: 'What you will show', type: 'textarea' },
        { id: 'challenge', label: 'Small challenge', type: 'textarea' },
        { id: 'assignment', label: 'Assignment', type: 'textarea' },
        { id: 'assignmentLink', label: 'Assignment / reference link', type: 'url' },
        { id: 'resources', label: 'Resources', type: 'textarea' },
        { id: 'resourcesLink', label: 'Resource link', type: 'url' },
        { id: 'mistake', label: 'Common mistake', type: 'textarea' },
        { id: 'next', label: 'What comes next', type: 'text' },
      ],
    },
    {
      id: 's1-t3', kind: 'qa', label: 'Task 3', title: 'Build a small Unity demo',
      note: ['Use C# where appropriate.', 'Keep the code and project organized.', 'Test it yourself.', 'The game does not need beautiful graphics.'],
      fields: [
        { id: 'desc', label: 'Describe your prototype — what it does, structure, key scripts', type: 'textarea' },
        { id: 'bug', label: 'One possible bug/failure you found, and how you would debug it', type: 'textarea' },
        { id: 'filesLink', label: 'Prototype files / additional resources', type: 'url' },
      ],
      extra: [
        { type: 'linklist', id: 'links', heading: 'Prototype / project links', addLabel: '+ Add link', titleLabel: 'Link title', noteLabel: 'Short description', emptyText: 'No links added yet — this is how the evaluator opens your work.', sub: 'Unity project/repository, GitHub, a playable build, a screen recording, or another reference.' },
      ],
    },
    {
      id: 's1-t4', kind: 'qa', label: 'Task 4', title: 'Prepare one lesson',
      fields: [
        { id: 'hook', label: 'What the learner will build (open with this)', type: 'textarea' },
        { id: 'why', label: 'Why the topic matters', type: 'textarea' },
        { id: 'concept', label: 'Explain the concept', type: 'textarea' },
        { id: 'demo', label: 'Show the demo — what you will demonstrate', type: 'textarea' },
        { id: 'demoLink', label: 'Demo / reference link', type: 'url' },
        { id: 'challenge', label: 'Give a small challenge', type: 'textarea' },
        { id: 'challengeLink', label: 'Challenge link', type: 'url' },
        { id: 'solution', label: 'Show / explain the solution', type: 'textarea' },
        { id: 'solutionLink', label: 'Solution / reference link', type: 'url' },
        { id: 'assignment', label: 'Give an assignment', type: 'textarea' },
        { id: 'assignmentLink', label: 'Assignment link', type: 'url' },
        { id: 'recap', label: 'Recap and next lesson', type: 'textarea' },
      ],
      extra: [
        { type: 'linklist', id: 'resources', heading: 'Lesson resources', addLabel: '+ Add resource', titleLabel: 'Resource name', noteLabel: 'Optional note', emptyText: 'No resources added yet.', sub: 'Documentation, videos, PDFs, PPTs, GitHub repositories — anything that supports this lesson.' },
      ],
    },
    {
      id: 's1-t5', kind: 'qa', label: 'Task 5', title: 'Media team brief',
      note: ['Pretend you are sending the work to the A2D Media Group. Write simple instructions for them.'],
      fields: [
        { id: 'explain', label: 'What should the presenter explain?', type: 'textarea' },
        { id: 'camera', label: 'What should be recorded on camera?', type: 'textarea' },
        { id: 'screen', label: 'What should be screen-recorded?', type: 'textarea' },
        { id: 'scene', label: 'Which Unity scene/project state must be ready?', type: 'textarea' },
        { id: 'code', label: 'Which code/demo parts must be shown?', type: 'textarea' },
        { id: 'careful', label: 'What should the editor be careful not to change?', type: 'textarea' },
        { id: 'callouts', label: 'What labels/zoom/callouts would help?', type: 'textarea' },
        { id: 'checkbefore', label: 'What should be checked before the video is approved?', type: 'textarea' },
      ],
      extra: [
        { type: 'linklist', id: 'mediarefs', heading: 'Media / reference materials', addLabel: '+ Add reference', titleLabel: 'Name', noteLabel: 'What should the media person use this for?', emptyText: 'No reference materials added yet.', sub: 'Reference document/PPT, script or lesson document, Unity project, demo link, screen-recording reference, assets/files, or other material.' },
        EXPLANATION_REVIEW_BLOCK,
      ],
    },
    {
      id: 's1-t6', kind: 'situations', label: 'Task 6', title: 'Small POC situations',
      items: [
        { id: 'sit0', text: 'The editor misunderstood a technical point.' },
        { id: 'sit1', text: 'A bug is found just before the recording deadline.' },
        { id: 'sit2', text: 'Two videos need your technical review at the same time.' },
        { id: 'sit3', text: 'The media team asks for information that was not in your brief.' },
        { id: 'sit4', text: 'A team member disagrees with your technical correction.' },
        { id: 'sitmedia', text: MEDIA_SITUATION_TEXT, custom: MEDIA_SITUATION_CUSTOM },
      ],
    },
    {
      id: 's1-sub', kind: 'checklist', label: 'Submit', title: 'What you must submit by 6:30 PM',
      items: [
        'Research notes', '3–5 lesson plan', 'Working Unity demo', 'Testing/bug notes',
        'One complete lesson draft', 'Media-team recording brief', 'Simple issue/production plan', 'Short final presentation',
      ],
    },
  ],
  scoring: {
    areas: [
      { id: 'game', label: 'Game Development', check: 'Unity, C#, technical thinking, debugging', max: 30 },
      { id: 'curriculum', label: 'Curriculum & Teaching', check: 'Lesson order, clarity, learner-focused thinking', max: 25 },
      { id: 'production', label: 'Production / POC', check: 'Media brief, coordination, problem solving', max: 25 },
      { id: 'documentation', label: 'Documentation', check: 'Organized, clear and complete work', max: 10 },
      { id: 'presentation', label: 'Final Presentation', check: 'Communication and confidence', max: 10 },
    ],
  },
};

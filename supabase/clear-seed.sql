-- ISOL CODING LAB
-- 제작 과정에서 넣은 모의 프로그램·제작자·아이디어만 지웁니다.
-- 선생님이 직접 등록한 항목(prog-..., idea-..., maker- 난수 ID)은 그대로 둡니다.
-- SQL Editor에서 한 번 실행하세요.

delete from public.idea_developers
where idea_id in ('idea-001', 'idea-002', 'idea-003', 'idea-004', 'idea-005')
   or maker_id in ('maker-001', 'maker-002', 'maker-003', 'maker-004');

delete from public.ideas
where id in ('idea-001', 'idea-002', 'idea-003', 'idea-004', 'idea-005');

delete from public.program_makers
where program_id in (
    'exam-flow', 'sign-on', 'event-desk', 'timetable-lab', 'teachertalk',
    'class-tools', 'class-manager', 'curriculum-guide', 'another-geox',
    'urban-trail', 'geo-tools', 'class-mate'
  )
   or maker_id in ('maker-001', 'maker-002', 'maker-003', 'maker-004');

delete from public.programs
where id in (
  'exam-flow', 'sign-on', 'event-desk', 'timetable-lab', 'teachertalk',
  'class-tools', 'class-manager', 'curriculum-guide', 'another-geox',
  'urban-trail', 'geo-tools', 'class-mate'
);

delete from public.makers
where id in ('maker-001', 'maker-002', 'maker-003', 'maker-004');

DELETE FROM "StudyRoadmap"
WHERE "isOfficial" = true
  AND "slug" IN (
    'frontend-developer',
    'backend-developer',
    'react',
    'nodejs',
    'banco-de-dados',
    'sql',
    'git-github'
  );

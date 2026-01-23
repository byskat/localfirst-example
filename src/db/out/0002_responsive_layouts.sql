-- Migration: Update widget layouts to support responsive breakpoints (mobile, tablet, desktop)
-- Convert existing single layout to multi-breakpoint structure

UPDATE dashboard_widgets
SET layout = jsonb_build_object(
  'mobile', jsonb_build_object(
    'x', 0,
    'y', COALESCE((layout->>'y')::int, 0),
    'w', 12,
    'h', COALESCE((layout->>'h')::int, 4),
    'minW', 6,
    'minH', 2
  ),
  'tablet', jsonb_build_object(
    'x', COALESCE((layout->>'x')::int, 0),
    'y', COALESCE((layout->>'y')::int, 0),
    'w', LEAST(COALESCE((layout->>'w')::int, 6), 8),
    'h', COALESCE((layout->>'h')::int, 4),
    'minW', 4,
    'minH', 2
  ),
  'desktop', layout
)
WHERE NOT (layout ? 'mobile' AND layout ? 'tablet' AND layout ? 'desktop');

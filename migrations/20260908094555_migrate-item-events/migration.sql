WITH legacy_events AS (
  SELECT
    r.id AS source_id,
    r.item_id,
    'reassignment'::"itemEventType" AS type,
    NULL::integer AS from_owner_user_id,
    NULL::integer AS to_owner_user_id,
    r.from_assigned_id,
    r.to_assigned_id,
    NULL::integer AS from_holder_id,
    NULL::integer AS to_holder_id,
    r.changed_by_user_id,
    r.reassigned_at AS created_at,
    1 AS event_priority
  FROM reassignments r

  UNION ALL

  SELECT
    t.id AS source_id,
    t.item_id,
    'transfer'::"itemEventType" AS type,
    NULL::integer AS from_owner_user_id,
    NULL::integer AS to_owner_user_id,
    NULL::integer AS from_assigned_id,
    NULL::integer AS to_assigned_id,
    t.from_holder_id,
    t.to_holder_id,
    t.changed_by_user_id,
    t.transferred_at AS created_at,
    2 AS event_priority
  FROM transfers t
),

ordered_events AS (
  SELECT
    *,
    ROW_NUMBER() OVER (
      PARTITION BY item_id
      ORDER BY created_at, event_priority, source_id
    ) AS event_order
  FROM legacy_events
),

resolved_events AS (
  SELECT
    e.*,

    (
      SELECT r.to_assigned_id
      FROM ordered_events r
      WHERE r.item_id = e.item_id
        AND r.type = 'reassignment'
        AND r.event_order <= e.event_order
      ORDER BY r.event_order DESC
      LIMIT 1
    ) AS snapshot_assigned_id,

    (
      SELECT t.to_holder_id
      FROM ordered_events t
      WHERE t.item_id = e.item_id
        AND t.type = 'transfer'
        AND t.event_order <= e.event_order
      ORDER BY t.event_order DESC
      LIMIT 1
    ) AS snapshot_holder_id

  FROM ordered_events e
)

INSERT INTO item_events (
  item_id,
  type,
  from_owner_user_id,
  to_owner_user_id,
  from_assigned_id,
  to_assigned_id,
  from_holder_id,
  to_holder_id,
  changed_by_user_id,
  snapshot,
  created_at
)
SELECT
  e.item_id,
  e.type,
  e.from_owner_user_id,
  e.to_owner_user_id,
  e.from_assigned_id,
  e.to_assigned_id,
  e.from_holder_id,
  e.to_holder_id,
  e.changed_by_user_id,

  jsonb_build_object(
    'name', i.name,
    'type', i.type,
    'grade', i.grade,
    'enchantLevel', i.enchant_level,
    'imageUrl', i.image_url,
    'status',
      CASE
        WHEN e.snapshot_holder_id IS NOT NULL THEN 'held'
        WHEN e.snapshot_assigned_id IS NOT NULL THEN 'assigned'
        ELSE 'in_bank'
      END,
    'ownerUserId', i.owner_user_id,
    'ownerClanId', i.owner_clan_id,
    'assignedId', e.snapshot_assigned_id,
    'holderId', e.snapshot_holder_id
  ),

  e.created_at

FROM resolved_events e
JOIN items i ON i.id = e.item_id;
import { createServerAdminSupabaseClient } from './supabase-admin';

type AdminAuditPayload = {
  actorUserId?: string | null;
  targetUserId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  metadata?: Record<string, unknown>;
};

export async function recordAdminActivity(payload: AdminAuditPayload) {
  const adminClient = createServerAdminSupabaseClient();

  const { error } = await adminClient.from('activity_logs').insert({
    actor_user_id: payload.actorUserId ?? null,
    target_user_id: payload.targetUserId ?? null,
    action: payload.action,
    entity_type: payload.entityType,
    entity_id: payload.entityId ?? null,
    metadata: payload.metadata ?? {}
  });

  if (error) {
    throw new Error(`Failed to record admin activity: ${error.message}`);
  }
}
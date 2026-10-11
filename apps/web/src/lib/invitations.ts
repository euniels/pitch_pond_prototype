export type InvitationRecord = {
  accepted_at: string | null;
  expires_at: string;
};

export function invitationState(
  invitation: InvitationRecord,
  now = new Date(),
) {
  if (invitation.accepted_at) return "accepted" as const;
  if (new Date(invitation.expires_at).getTime() <= now.getTime())
    return "expired" as const;
  return "available" as const;
}

import { Resend } from "resend";

export async function sendInvitationEmail(input: {
  email: string;
  inviter: string;
  role: string;
  inviteUrl: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!apiKey || !from)
    return { delivered: false, reason: "Email is not configured." };
  try {
    const resend = new Resend(apiKey);
    const result = await resend.emails.send({
      from,
      to: input.email,
      subject: "Your PitchPond pilot invitation",
      text: `${input.inviter} invited you to PitchPond as ${input.role.replaceAll("_", " ")}. Accept the invitation: ${input.inviteUrl}\n\nPitchPond helps ventures become evidence-ready before fundraising. It does not execute investments or hold funds.`,
    });
    return { delivered: !result.error, reason: result.error?.message };
  } catch {
    return { delivered: false, reason: "Email provider unavailable." };
  }
}

export async function sendOperationalEmail(subject: string, text: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  const to = process.env.OPERATIONAL_EMAIL;
  if (!apiKey || !from || !to) return;
  try {
    await new Resend(apiKey).emails.send({ from, to, subject, text });
  } catch {
    // Operational email failure must not undo the already-recorded event.
  }
}

export async function sendProductEmail(input: {
  email: string;
  subject: string;
  text: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!apiKey || !from) return { delivered: false };
  try {
    const result = await new Resend(apiKey).emails.send({
      from,
      to: input.email,
      subject: input.subject,
      text: `${input.text}\n\nOpen your private workspace: ${publicSiteUrl()}/workspace`,
    });
    return { delivered: !result.error };
  } catch {
    return { delivered: false };
  }
}

function publicSiteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

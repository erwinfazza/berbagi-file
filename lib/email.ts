import { Resend } from "resend";

type UploadNotification = {
  title: string;
  fileName: string;
  uploaderName: string | null;
  appUrl: string;
};

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export async function sendUploadNotification(input: UploadNotification) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.RESEND_TO;
  if (!apiKey || !to) return;

  const from =
    process.env.RESEND_FROM ?? "berbagi-file <onboarding@resend.dev>";
  const resend = new Resend(apiKey);

  try {
    await resend.emails.send({
      from,
      to,
      subject: `File baru: ${input.title}`,
      html: [
        `<h2>${escapeHtml(input.title)}</h2>`,
        `<p>${escapeHtml(input.fileName)} diunggah oleh ${escapeHtml(
          input.uploaderName ?? "pengguna",
        )}.</p>`,
        `<p><a href="${escapeHtml(input.appUrl)}">Buka berbagi-file</a></p>`,
      ].join(""),
    });
  } catch (error) {
    console.error("Gagal mengirim notifikasi email", error);
  }
}

/**
 * Mailer의 Resend 구현 (https://resend.com). API 키는 서버 함수 비밀값으로만 보관한다.
 */
import type { Mailer, MailMessage } from "./run.ts";

/**
 * Resend 메일 발송기를 만든다.
 * @param {object} settings
 * @param {string} settings.apiKey - Resend API 키 (RESEND_API_KEY)
 * @param {string} settings.from - 보내는 주소 (REPORT_FROM_EMAIL, 예: "쪽지시험 <report@example.com>")
 * @returns {Mailer}
 */
export function createResendMailer({
  apiKey,
  from,
}: {
  apiKey: string;
  from: string;
}): Mailer {
  return {
    async send(message: MailMessage) {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from,
          to: message.to,
          subject: message.subject,
          text: message.text,
          html: message.html,
          attachments: message.attachments,
        }),
      });
      if (!response.ok) {
        throw new Error(
          `메일 발송 실패 (HTTP ${response.status}): ${await response.text()}`,
        );
      }
    },
  };
}

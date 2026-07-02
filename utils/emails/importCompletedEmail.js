import { emailLayout } from "./emailLayout.js";

export const importCompletedEmail = (eventName, eventCode) =>
  emailLayout(
    "Your Event is Ready",
    `
      <h2 style="margin-top:0;">🎉 Your event photos are ready!</h2>

      <p>
        Great news! Your event photos have been successfully processed and are now ready.
      </p>

      <p><strong>Event Name:</strong> ${eventName}</p>

      <p><strong>Event Code:</strong> ${eventCode}</p>

      <p>Your guests can now:</p>

      <ul>
        <li>Upload a selfie</li>
        <li>Instantly find every photo they're in</li>
        <li>Download their photos in high quality</li>
      </ul>

      <div style="text-align:center;margin:40px 0;">
        <a
          href="https://pichive.in/${eventCode}"
          style="
            display:inline-block;
            background:#2563eb;
            color:white;
            text-decoration:none;
            padding:14px 30px;
            border-radius:8px;
            font-weight:bold;
          "
        >
          Open Event
        </a>
      </div>

      <p>
        Thank you for choosing <strong>PICHIVE</strong>. We hope you enjoy reliving your memories.
      </p>
    `
  );
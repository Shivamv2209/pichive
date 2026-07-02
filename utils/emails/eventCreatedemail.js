import {emailLayout} from "./emailLayout.js"

export const eventCreatedEmail = (eventName, eventCode , upload_key) =>
  emailLayout(
    "Your Event Has Been Created",
    `
      <h2 style="margin-top:0;">🎉 Your event has been created!</h2>

      <p>
        Congratulations! Your event has been created successfully and is now ready to receive photos.
      </p>

      <p><strong>Event Name:</strong> ${eventName}</p>

      <p><strong>Event Code:</strong> ${eventCode}</p>

      <p><strong>Upload Key:</strong> ${upload_key}</p>

      <p>Here's what you can do next:</p>

      <ul>
        <li>📸 Share the event code with your guests.</li>
        <li>☁️ Upload photos manually or import them from Google Drive.</li>
        <li>🤳 Once processing is complete, guests can upload a selfie to instantly find every photo they're in.</li>
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
        Thank you for choosing <strong>PICHIVE</strong>. We're excited to help you preserve and share your event memories effortlessly.
      </p>
    `
  );
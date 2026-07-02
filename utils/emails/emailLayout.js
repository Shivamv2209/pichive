export const emailLayout = (title, body) => {
  return `
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
</head>

<body style="
    margin:0;
    padding:0;
    background:#f4f7fb;
    font-family:Arial, Helvetica, sans-serif;
">

  <table
    width="100%"
    cellpadding="0"
    cellspacing="0"
    style="padding:40px 20px;"
  >
    <tr>
      <td align="center">

        <table
          width="600"
          cellpadding="0"
          cellspacing="0"
          style="
            background:#ffffff;
            border-radius:12px;
            overflow:hidden;
            box-shadow:0 4px 18px rgba(0,0,0,.08);
          "
        >

          <!-- Header -->
          <tr>
            <td
              align="center"
              style="
                background:#2563eb;
                padding:30px;
              "
            >
              <h1
                style="
                  color:white;
                  margin:0;
                  font-size:30px;
                  letter-spacing:1px;
                "
              >
                PICHIVE
              </h1>

              <p
                style="
                  margin-top:10px;
                  color:#dbeafe;
                  font-size:15px;
                "
              >
                AI-powered event photo discovery
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td
              style="
                padding:40px;
                color:#333;
                font-size:16px;
                line-height:1.7;
              "
            >
              ${body}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td
              align="center"
              style="
                background:#f8fafc;
                padding:24px;
                color:#666;
                font-size:13px;
              "
            >
              <strong>PICHIVE</strong><br/>
              Preserve memories. Instantly find every photo you're in.
              <br/><br/>
              © ${new Date().getFullYear()} PICHIVE. All rights reserved.
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>
`;
};
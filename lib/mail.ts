import nodemailer from "nodemailer";

export async function sendVerificationEmail(email: string, token: string) {
  // If no env variables are set, fallback to console.log for local testing
  const verifyUrl = `${process.env.NEXTAUTH_URL}/verify?token=${token}`;
  
  if (process.env.EMAIL_SERVER_USER === "your-email@gmail.com") {
    console.log("=========================================");
    console.log("Mock Email Sender (No credentials set)");
    console.log(`To: ${email}`);
    console.log(`Subject: Verify your email address - Velora`);
    console.log(`Link: ${verifyUrl}`);
    console.log("=========================================");
    return;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_SERVER_HOST,
    port: Number(process.env.EMAIL_SERVER_PORT),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_SERVER_USER,
      pass: process.env.EMAIL_SERVER_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: "Verify your email address - Velora",
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2>Welcome to Velora!</h2>
        <p>Please click the button below to verify your email address and activate your account.</p>
        <a href="${verifyUrl}" style="display: inline-block; padding: 10px 20px; background-color: #000; color: #fff; text-decoration: none; border-radius: 5px; margin-top: 10px;">
          Verify Email
        </a>
        <p style="margin-top: 20px; font-size: 14px; color: #666;">If you didn't create this account, you can safely ignore this email.</p>
        <p style="margin-top: 20px; font-size: 12px; color: #999;">Or copy and paste this link in your browser: <br>${verifyUrl}</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Verification email sent to ${email}`);
  } catch (error) {
    console.error("Error sending email:", error);
  }
}

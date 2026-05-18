export const otpTemplate = (otp) => `
<div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e1e1e1; border-radius: 10px;">
  <div style="text-align: center; margin-bottom: 20px;">
    <h1 style="color: #7e22ce; margin: 0; font-weight: 800;">V-<span style="color: #00041a;">Learn</span></h1>
  </div>
  <h2 style="color: #00041a; text-align: center;">Verify Your Account</h2>
  <p style="font-size: 16px; color: #6a6f73; line-height: 1.6; text-align: center;">
    Welcome to V-Learn! Please use the following One-Time Password (OTP) to verify your mentor account. This code is valid for 5 minutes.
  </p>
  <div style="text-align: center; margin: 30px 0;">
    <span style="font-size: 36px; font-weight: bold; letter-spacing: 10px; color: #7e22ce; background: #f7f9fa; padding: 10px 20px; border-radius: 5px; border: 1px dashed #7e22ce;">
      ${otp}
    </span>
  </div>
  <p style="font-size: 14px; color: #6a6f73; text-align: center;">
    If you did not request this, please ignore this email.
  </p>
  <hr style="border: none; border-top: 1px solid #e1e1e1; margin: 20px 0;">
  <p style="font-size: 12px; color: #9d9fa1; text-align: center;">
    &copy; 2026 V-Learn. All rights reserved.
  </p>
</div>
`;

export const welcomeTemplate = (name) => `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e1e1e1; border-radius: 10px;">
  <div style="text-align: center;">
    <h1 style="color: #7e22ce; font-weight: 800;">Welcome to V-Learn, ${name}!</h1>
  </div>
  <p>We are thrilled to have you as a mentor. You can now start creating courses and sharing your knowledge with students worldwide.</p>
  <div style="text-align: center; margin: 30px 0;">
    <a href="${process.env.FRONTEND_URL || '#'}" style="background-color: #7e22ce; color: white; padding: 15px 25px; text-decoration: none; font-weight: bold; border-radius: 5px;">Go to Dashboard</a>
  </div>
</div>
`;

export const resetPasswordTemplate = (otp) => `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e1e1e1; border-radius: 10px;">
  <h2 style="color: #00041a; text-align: center;">Reset Your Password</h2>
  <p style="text-align: center;">Use the code below to reset your password. This code expires in 5 minutes.</p>
  <div style="text-align: center; margin: 30px 0;">
    <span style="font-size: 32px; font-weight: bold; color: #7e22ce;">${otp}</span>
  </div>
</div>
`;

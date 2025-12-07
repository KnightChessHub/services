export const getWelcomeEmailTemplate = (username: string) => ({
  subject: 'Welcome to KnightChess!',
  html: `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #2c3e50; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .button { display: inline-block; padding: 10px 20px; background: #3498db; color: white; text-decoration: none; border-radius: 5px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to KnightChess!</h1>
        </div>
        <div class="content">
          <p>Hi ${username},</p>
          <p>Welcome to KnightChess! We're excited to have you join our chess community.</p>
          <p>Start playing chess, join tournaments, and improve your skills!</p>
          <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}" class="button">Get Started</a>
        </div>
      </div>
    </body>
    </html>
  `,
  text: `Welcome to KnightChess, ${username}! Start playing chess and join our community.`,
});

export const getPasswordResetTemplate = (username: string, resetToken: string) => ({
  subject: 'Password Reset Request',
  html: `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #e74c3c; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .button { display: inline-block; padding: 10px 20px; background: #3498db; color: white; text-decoration: none; border-radius: 5px; }
        .code { background: #ecf0f1; padding: 10px; border-radius: 5px; font-family: monospace; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Password Reset</h1>
        </div>
        <div class="content">
          <p>Hi ${username},</p>
          <p>You requested to reset your password. Use the following token:</p>
          <div class="code">${resetToken}</div>
          <p>This token will expire in 1 hour.</p>
        </div>
      </div>
    </body>
    </html>
  `,
  text: `Password reset for ${username}. Token: ${resetToken}`,
});

export const getGameInviteTemplate = (username: string, opponentName: string) => ({
  subject: `Chess Game Invitation from ${opponentName}`,
  html: `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #27ae60; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .button { display: inline-block; padding: 10px 20px; background: #3498db; color: white; text-decoration: none; border-radius: 5px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Chess Game Invitation</h1>
        </div>
        <div class="content">
          <p>Hi ${username},</p>
          <p>${opponentName} has invited you to play a chess game!</p>
          <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/games" class="button">Accept Invitation</a>
        </div>
      </div>
    </body>
    </html>
  `,
  text: `${opponentName} has invited you to play a chess game!`,
});


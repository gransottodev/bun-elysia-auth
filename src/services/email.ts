import { Resend } from "resend";
import { env } from "@/env";

const resend = new Resend(env.RESEND_API_KEY);

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

export const emailService = {
  async sendEmail({ to, subject, html }: SendEmailParams) {
    try {
      const { data, error } = await resend.emails.send({
        from: env.FROM_EMAIL,
        to,
        subject,
        html,
      });

      if (error) {
        console.error("Error sending email:", error);
        throw new Error(`Failed to send email: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error("Error sending email:", error);
      throw error;
    }
  },

  async sendVerificationEmail(email: string, url: string) {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Confirme seu email</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #f4f4f4; border-radius: 10px; padding: 30px; text-align: center;">
            <h1 style="color: #4a5568; margin-bottom: 20px;">Confirme seu email</h1>
            <p style="font-size: 16px; margin-bottom: 30px;">
              Clique no botão abaixo para confirmar seu endereço de email e ativar sua conta.
            </p>
            <a href="${url}"
               style="display: inline-block; background-color: #4f46e5; color: white; padding: 14px 40px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">
              Confirmar Email
            </a>
            <p style="font-size: 14px; color: #666; margin-top: 30px;">
              Se você não criou uma conta, pode ignorar este email com segurança.
            </p>
            <p style="font-size: 12px; color: #999; margin-top: 20px;">
              Ou copie e cole este link no seu navegador:<br>
              <span style="word-break: break-all;">${url}</span>
            </p>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject: "Confirme seu email",
      html,
    });
  },

  async sendInvitationEmail(email: string, organizationName: string){
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Confirme seu email</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #f4f4f4; border-radius: 10px; padding: 30px; text-align: center;">
            <h1 style="color: #4a5568; margin-bottom: 20px;">Você recebeu um convite para se juntar a empresa ${organizationName}</h1>
          </div>
        </body>
      </html>
    `
    
    return this.sendEmail({
      to: email,
      subject: `Convite para ${organizationName}`,
      html,
    });
  },
  
  async sendPasswordResetEmail(email: string, url: string) {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Recuperação de senha</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #f4f4f4; border-radius: 10px; padding: 30px; text-align: center;">
            <h1 style="color: #4a5568; margin-bottom: 20px;">Recuperação de senha</h1>
            <p style="font-size: 16px; margin-bottom: 30px;">
              Você solicitou a recuperação de senha. Clique no botão abaixo para redefinir sua senha.
            </p>
            <a href="${url}"
               style="display: inline-block; background-color: #dc2626; color: white; padding: 14px 40px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">
              Redefinir Senha
            </a>
            <p style="font-size: 14px; color: #666; margin-top: 30px;">
              Se você não solicitou a recuperação de senha, ignore este email.
            </p>
            <p style="font-size: 12px; color: #999; margin-top: 20px;">
              Este link expira em 1 hora.<br>
              Ou copie e cole este link no seu navegador:<br>
              <span style="word-break: break-all;">${url}</span>
            </p>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject: "Recuperação de senha",
      html,
    });
  },
};

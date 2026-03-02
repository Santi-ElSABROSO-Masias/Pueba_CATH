import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: 'gmail', // Usa el proveedor incorporado de nodemailer para gmail
    auth: {
        user: process.env.GMAIL_USER,       // Ej: tu.empresa@gmail.com
        pass: process.env.GMAIL_APP_PASS    // Contraseña de 16 caracteres de Gmail App
    }
});

export const enviarCredencialesPorEmail = async (email: string, nombre: string, user: string, pass: string) => {
    // Si no están configuradas las variables, lo evitamos para no romper la app de prueba
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASS) {
        console.warn(`[MAILER] Faltan variables GMAIL_USER o GMAIL_APP_PASS en .env. No se envía el correo a ${email}`);
        return;
    }

    try {
        const mailOptions = {
            from: `"Pueba CATH" <${process.env.GMAIL_USER}>`,
            to: email,
            subject: '[Campus_CATH] Credenciales de Acceso',
            html: `
                <div style="font-family: Arial, sans-serif; p-4; color: #333; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #4F46E5;">Bienvenido a Pueba_CATH</h2>
                    <p>Hola <strong>${nombre}</strong>,</p>
                    <p>Has sido registrado en la plataforma para realizar la Inducción de Trabajos Temporales.</p>
                    <p>Para iniciar, ingresa al siguiente enlace con tus credenciales:</p>
                    <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0; margin: 20px 0;">
                        <p style="margin: 0 0 10px 0;"><strong>Enlace:</strong> <a href="http://localhost:5173">http://localhost:5173</a></p>
                        <p style="margin: 0 0 10px 0;"><strong>Usuario:</strong> ${user}</p>
                        <p style="margin: 0;"><strong>Contraseña temporal:</strong> ${pass}</p>
                    </div>
                    <p style="font-size: 12px; color: #64748b;">Este es un mensaje automático, por favor no lo respondas.</p>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`[MAILER] Correo enviado exitosamente a ${email} (MessageId: ${info.messageId})`);
    } catch (error) {
        console.error(`[MAILER] Error enviando correo a ${email}:`, error);
        // Si hay error en el correo no detenemos la petición HTTP del usuario, solo lo logeamos
    }
};

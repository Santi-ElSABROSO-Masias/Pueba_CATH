import { EventUser } from '../types';

// Placeholder functions for sending notifications
const sendEmail = async (to: string, subject: string, body: string) => {
  console.log(`Sending email to ${to} with subject "${subject}"`);
  console.log(`Body: ${body}`);
  return { success: true };
};

const sendWhatsApp = async (to: string, body: string) => {
  console.log(`Sending WhatsApp to ${to}`);
  console.log(`Body: ${body}`);
  return { success: true };
};

export async function sendTeamsLinkToUser(
  user: EventUser, 
  meetingLink: string,
  training: { start_date: string, start_time: string } // Simplified training object for now
): Promise<void> {
  
  // Enviar por EMAIL
  await sendEmail(
    user.email,
    "Link de capacitación - Microsoft Teams",
    `
      Hola ${user.name},
      
      Tu identidad fue validada correctamente.
      
      Únete a la capacitación usando este link:
      ${meetingLink}
      
      Fecha: ${training.start_date}
      Hora: ${training.start_time}
      
      ¡Te esperamos!
    `
  );
  
  // Enviar por WHATSAPP
  await sendWhatsApp(
    user.phone,
    `
      ✅ Identidad validada
      
      Link de Teams:
      ${meetingLink}
      
      📅 ${training.start_date} - ${training.start_time}
    `
  );
}

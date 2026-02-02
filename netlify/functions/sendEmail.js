import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function handler(event) {
  try {
    if (event.httpMethod !== "POST") {
      return { statusCode: 405, body: "Método no permitido" };
    }

    const { nombre, email, mensaje } = JSON.parse(event.body);

    if (!nombre || !email || !mensaje) {
      return { statusCode: 400, body: "Faltan datos requeridos" };
    }

    await resend.emails.send({
      from: "DS Steel <onboarding@resend.dev>",  // remitente válido
      to: process.env.EMAIL_EMPRESA,            // mail de la empresa
      subject: `Nuevo mensaje desde la web: ${nombre}`,
      html: `
        <h2>Nuevo mensaje de contacto</h2>
        <p><strong>Nombre:</strong> ${nombre}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Mensaje:</strong></p>
        <p>${mensaje}</p>
      `
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true })
    };

  } catch (err) {
    console.error("Error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Error enviando el email" })
    };
  }
}

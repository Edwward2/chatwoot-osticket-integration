require("dotenv").config();

const { exec } = require("child_process");

const OSTICKET_URL =
  "http://localhost:8080/api/tickets.json";

const API_KEY =
  process.env.OSTICKET_API_KEY;

/**
 * CREAR TICKET EN OSTICKET
 */

async function createTicket(data) {

  try {

    /**
     * VALIDACIONES
     */

    if (!API_KEY) {
      throw new Error(
        "OSTICKET_API_KEY no configurada"
      );
    }

    if (
      !data?.name ||
      !data?.email ||
      !data?.subject ||
      !data?.message
    ) {
      throw new Error(
        "Faltan campos obligatorios"
      );
    }

    /**
     * PAYLOAD
     */

    const payload = {

      name:
        data.name,

      email:
        data.email,

      subject:
        data.subject,

      message:
        data.message,

      topicId:
        data.topicId || 1,

      source:
        "API"
    };

    /**
     * ESCAPAR COMILLAS
     */

    const safePayload =
      JSON.stringify(payload)
        .replace(/'/g, "'\\''");

    /**
     * CURL
     */

    const cmd = `
curl -s -X POST ${OSTICKET_URL} \
-H "X-API-Key: ${API_KEY}" \
-H "Content-Type: application/json" \
-d '${safePayload}'
`.trim();

    console.log(
      "[OSTICKET] Enviando ticket"
    );

    /**
     * REQUEST
     */

    const response =
      await new Promise(
        (resolve, reject) => {

          exec(
            cmd,
            (error, stdout, stderr) => {

              if (error) {

                return reject(
                  new Error(
                    stderr || error.message
                  )
                );
              }

              resolve(
                stdout.trim()
              );
            }
          );
        }
      );

    /**
     * RESPUESTA VACÍA
     */

    if (!response) {

      throw new Error(
        "osTicket no devolvió respuesta"
      );
    }

    console.log(
      `[OSTICKET] Ticket creado: ${response}`
    );

    return {

      success: true,

      ticketId:
        response
    };

  } catch (error) {

    console.error(
      "[OSTICKET ERROR]",
      error.message
    );

    return {

      success: false,

      error:
        error.message
    };
  }
}

module.exports = {
  createTicket
};

/**
 * TEST LOCAL
 */

if (require.main === module) {

  createTicket({

    name:
      "Test User",

    email:
      "test@test.com",

    subject:
      "Prueba sender",

    message:
      "Mensaje enviado desde sender.js",

    topicId: 1
  });
}
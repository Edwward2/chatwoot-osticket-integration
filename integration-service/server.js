require("dotenv").config();

const express = require("express");
const { createTicket } = require("./sender");

const app = express();

app.use(express.json({ limit: "10mb" }));

/**
 * CONFIG
 */

const PORT = process.env.PORT || 3001;

/**
 * MEMORIA TEMPORAL
 */

const conversations = {};
const processedConversations = {};

/**
 * EVENTOS VÁLIDOS
 */

const VALID_EVENTS = [
  "conversation_updated",
  "conversation_status_changed"
];

/**
 * MENSAJES AUTOMÁTICOS A IGNORAR
 */

const IGNORED_MESSAGES = [
  "Recibir notificaciones por correo electrónico",
  "Si te gusto nuestra atención"
];

/**
 * HELPERS
 */

function sanitize(text = "") {

  return String(text)
    .replace(/<[^>]*>?/gm, "")
    .replace(/[^\x20-\x7EÀ-ÿ\n\r]/g, "")
    .trim()
    .substring(0, 10000);
}

function normalizeSender(type, sender) {

  if (type === "Contact") {
    return "Cliente";
  }

  if (type === "User") {
    return "Agente";
  }

  return sanitize(sender || "Sistema");
}

function normalizeMessage(msg = {}) {

  const content =
    sanitize(msg.content || "");

  if (!content) {
    return null;
  }

  /**
   * IGNORAR MENSAJES AUTOMÁTICOS
   */

  if (
    IGNORED_MESSAGES.some(text =>
      content.includes(text)
    )
  ) {
    return null;
  }

  const type =
    sanitize(msg.sender_type || "Sistema");

  return {

    id:
      msg.id || null,

    type,

    sender:
      normalizeSender(
        type,
        msg.sender?.name
      ),

    content,

    created_at:
      msg.created_at || null
  };
}

function buildTranscript(messages = []) {

  if (!messages.length) {
    return "Sin mensajes";
  }

  return messages
    .map((msg) => {

      return `[${msg.sender}]\n${msg.content}`;

    })
    .join("\n\n");
}

/**
 * HEALTH CHECK
 */

app.get("/", (req, res) => {

  res.status(200).json({
    success: true,
    service: "chatwoot-receiver"
  });

});

/**
 * WEBHOOK CHATWOOT
 */

app.post("/webhook", async (req, res) => {

  try {

    const data = req.body || {};

    const event =
      sanitize(data.event || "");

    /**
     * IGNORAR EVENTOS INVÁLIDOS
     */

    if (!VALID_EVENTS.includes(event)) {

      return res.status(200).json({
        ignored: true
      });
    }

    const status =
      sanitize(data.status || "unknown");

    const conversationId =
      data.id || null;

    console.log(
      `[CHATWOOT] ${event} - ${conversationId}`
    );

    /**
     * CONTACTO
     */

    const sender =
      data.meta?.sender || {};

    const contact = {

      id:
        sender.id || null,

      name:
        sanitize(sender.name) ||
        "Cliente",

      email:
        sanitize(sender.email) &&
        sanitize(sender.email) !== "null"
          ? sanitize(sender.email)
          : `usuario_${conversationId}@chatwoot.com`
    };

    /**
     * CREAR CONVERSACIÓN
     */

    if (!conversations[conversationId]) {

      conversations[conversationId] = {

        created_at:
          new Date().toISOString(),

        contact,

        messages: []
      };
    }

    /**
     * GUARDAR MENSAJES
     */

    if (Array.isArray(data.messages)) {

      data.messages.forEach((msg) => {

        const normalized =
          normalizeMessage(msg);

        if (!normalized) {
          return;
        }

        const exists =
          conversations[
            conversationId
          ].messages.find(
            (m) => m.id === normalized.id
          );

        if (!exists) {

          conversations[
            conversationId
          ].messages.push(normalized);
        }

      });
    }

    /**
     * ORDENAR MENSAJES
     */

    conversations[
      conversationId
    ].messages.sort(
      (a, b) =>
        (a.created_at || 0) -
        (b.created_at || 0)
    );

    /**
     * TRANSCRIPT
     */

    const transcript =
      buildTranscript(
        conversations[
          conversationId
        ].messages
      );

    /**
     * RESPUESTA RÁPIDA A CHATWOOT
     */

    res.status(200).json({
      success: true
    });

    /**
     * PROCESO EN SEGUNDO PLANO
     */

    setImmediate(async () => {

      try {

        /**
         * SOLO CUANDO ESTÁ RESUELTO
         */

        if (status !== "resolved") {
          return;
        }

        /**
         * EVITAR DUPLICADOS
         */

        if (
          processedConversations[
            conversationId
          ]
        ) {
          return;
        }

        processedConversations[
          conversationId
        ] = true;

        /**
         * EVITAR TICKETS VACÍOS
         */

        if (
          !conversations[
            conversationId
          ].messages.length
        ) {

          console.log(
            `[OSTICKET] Conversación ${conversationId} sin mensajes`
          );

          return;
        }

        /**
         * PAYLOAD FINAL
         */

        const ticketPayload = {

          name:
            contact.name ||
            "Cliente Chatwoot",

          email:
            contact.email ||
            `chatwoot_${conversationId}@local.test`,

          subject:
            `Chatwoot Conversación #${conversationId}`,

          message:
            transcript,

          topicId: 1
        };

        console.log(
          `[OSTICKET] Enviando conversación ${conversationId}`
        );

        /**
         * ENVIAR A OSTICKET
         */

        const result =
          await createTicket(
            ticketPayload
          );

        /**
         * RESULTADO
         */

        if (result?.success) {

          console.log(
            `[OSTICKET] Ticket creado: ${result.ticketId}`
          );

          /**
           * LIMPIAR MEMORIA
           */

          delete conversations[
            conversationId
          ];

        } else {

          console.error(
            "[OSTICKET ERROR]",
            result?.error || result
          );
        }

      } catch (error) {

        console.error(
          "[PROCESS ERROR]",
          error.message
        );
      }

    });

  } catch (error) {

    console.error(
      "[SERVER ERROR]",
      error.message
    );

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * START SERVER
 */

app.listen(PORT, "0.0.0.0", () => {

  console.log(
    `Integration Service activo en puerto ${PORT}`
  );

  console.log(
    `Webhook: http://localhost:${PORT}/webhook`
  );

});
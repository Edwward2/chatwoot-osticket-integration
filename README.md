# Chatwoot + osTicket Integration

Integración automática entre Chatwoot y osTicket utilizando Node.js.

El sistema recibe conversaciones desde Chatwoot mediante Webhooks y crea tickets automáticamente en osTicket cuando la conversación es cerrada o resuelta.

---

# Arquitectura

Chatwoot
↓
Webhook
↓
Node.js Integration Service
↓
osTicket API

---

# Componentes

## Chatwoot

Sistema principal de atención por chat.

Sitio oficial:
https://www.chatwoot.com

Nota sobre Chatwoot

La carpeta chatwoot/ no se incluye completamente en este repositorio debido a que corresponde al proyecto oficial de Chatwoot, el cual posee su propio repositorio Git, múltiples servicios Docker y dependencias de gran tamaño.

Este repositorio se enfoca específicamente en el desarrollo del Integration Service encargado de conectar Chatwoot con osTicket mediante Webhooks y API REST.

---

## osTicket

Sistema de tickets utilizado para almacenar las conversaciones cerradas.

Sitio oficial:
https://osticket.com

---

## Integration Service

Servicio Node.js encargado de:

- recibir webhooks
- limpiar mensajes
- construir transcript
- transformar payload
- enviar tickets a osTicket

Archivos principales:

- server.js
- sender.js

---

# Estructura del proyecto

```bash
proyecto_chatwoot/
│
├── chatwoot/
├── Osticket/
├── integration-service/
│   ├── server.js
│   ├── sender.js
│   ├── package.json
│   └── package-lock.json
│
├── test_chat.html
├── .gitignore
└── README.md
```

---

# Requisitos

- Node.js
- Docker
- Docker Compose
- Chatwoot
- osTicket

---

# Variables de entorno

Crear archivo `.env` dentro de:

```bash
integration-service/
```

Contenido:

```env
PORT=3001
OSTICKET_API_KEY=TU_API_KEY
```

---

# Instalación

## 1. Instalar dependencias

```bash
cd integration-service
npm install
```

---

## 2. Iniciar Integration Service

```bash
node server.js
```

---

## 3. Configurar Webhook en Chatwoot

URL:

```text
http://TU_IP:3001/webhook
```

Eventos:

- conversation_updated
- conversation_status_changed

---

# Flujo de funcionamiento

1. Cliente inicia conversación en Chatwoot
2. Chatwoot envía webhook
3. server.js procesa mensajes
4. Se construye transcript
5. Al resolver conversación:
   - sender.js envía ticket a osTicket
6. osTicket crea ticket automáticamente

---

# Ejemplo de transcript

```text
[Agente]
Hola en qué puedo ayudarle

[Cliente]
Necesito soporte

[Agente]
Claro, revisaremos su caso
```

---

# API osTicket utilizada

Endpoint:

```text
POST /api/tickets.json
```

Payload:

```json
{
  "name": "Cliente",
  "email": "cliente@test.com",
  "subject": "Chat Chatwoot #15",
  "message": "Transcript completo",
  "topicId": 1,
  "source": "API"
}
```

---

# Estado actual

## Funcional

- Recepción de webhooks
- Normalización de mensajes
- Construcción de transcript
- Envío automático a osTicket
- Creación automática de tickets

---

# Próximas mejoras

- Limpieza avanzada de mensajes
- Evitar tickets duplicados
- Persistencia en base de datos
- Dockerización del integration-service
- PM2 para producción
- Logs estructurados
- Retry automático
- Validación avanzada

---

# Desarrollo

Proyecto desarrollado para automatizar la integración entre plataformas de atención y mesa de ayuda.

---

# Licencia

Uso interno / privado.

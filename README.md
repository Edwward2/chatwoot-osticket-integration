Chatwoot + osTicket Integration

Integración automática entre Chatwoot y osTicket utilizando Node.js.

Este proyecto implementa un servicio de integración en tiempo real que recibe eventos desde Chatwoot mediante Webhooks, procesa la conversación, construye un transcript limpio y crea automáticamente tickets en osTicket cuando la conversación es cerrada o resuelta.

------------------------------------------------------------
ARQUITECTURA
------------------------------------------------------------

Chatwoot → Webhook → Node.js Integration Service → osTicket API

------------------------------------------------------------
COMPONENTES
------------------------------------------------------------

CHATWOOT

Sistema principal de atención por chat.

Sitio oficial:
https://www.chatwoot.com

NOTA IMPORTANTE:
La carpeta chatwoot/ no está incluida completamente en este repositorio.

Esto se debe a que Chatwoot es un sistema completo con múltiples servicios Docker, dependencias pesadas y su propio repositorio oficial:

https://github.com/chatwoot/chatwoot

Este proyecto se enfoca únicamente en la integración personalizada entre Chatwoot y osTicket.

------------------------------------------------------------

OSTICKET

Sistema de tickets utilizado como backend de soporte.

Sitio oficial:
https://osticket.com

------------------------------------------------------------

INTEGRATION SERVICE (NODE.JS)

Servicio principal del proyecto.

Responsable de:

- Recibir webhooks desde Chatwoot
- Normalizar y sanitizar mensajes
- Construir transcript de conversación
- Detectar cierre de conversación
- Enviar ticket a osTicket vía API REST

Archivos principales:

- server.js
- sender.js

------------------------------------------------------------
ESTRUCTURA DEL PROYECTO
------------------------------------------------------------

proyecto_chatwoot/

├── chatwoot/                  (NO incluido - proyecto externo)
├── Osticket/                  (Docker setup osTicket)

├── integration-service/
│   ├── server.js
│   ├── sender.js
│   ├── package.json
│   └── package-lock.json

├── test_chat.html
├── .gitignore
└── README.md

------------------------------------------------------------
REQUISITOS
------------------------------------------------------------

- Node.js 18+
- Docker
- Docker Compose
- Git

------------------------------------------------------------
VARIABLES DE ENTORNO
------------------------------------------------------------

Ubicación:

integration-service/.env

Contenido:

PORT=3001
OSTICKET_API_KEY=TU_API_KEY

------------------------------------------------------------
INSTALACIÓN
------------------------------------------------------------

1. CLONAR REPOSITORIO

git clone https://github.com/Edwward2/chatwoot-osticket-integration.git
cd chatwoot-osticket-integration

------------------------------------------------------------

2. INSTALAR DEPENDENCIAS

cd integration-service
npm install

------------------------------------------------------------

3. INICIAR SERVICIO

node server.js

------------------------------------------------------------

CHATWOOT (REQUERIDO PARA PRUEBAS)

git clone https://github.com/chatwoot/chatwoot.git
cd chatwoot
docker compose -f docker-compose.production.yaml up -d

Acceso:
http://localhost:3000

------------------------------------------------------------

OSTICKET (DOCKER)

cd Osticket
docker compose up -d

Acceso:
http://localhost:8080

------------------------------------------------------------
CONFIGURACIÓN WEBHOOK CHATWOOT
------------------------------------------------------------

URL:

http://TU_IP:3001/webhook

EVENTOS:

- conversation_updated
- conversation_status_changed

------------------------------------------------------------
FLUJO DEL SISTEMA
------------------------------------------------------------

1. Cliente inicia conversación en Chatwoot
2. Chatwoot envía eventos vía Webhook
3. server.js recibe y procesa la conversación
4. Se construye un transcript limpio
5. Cuando la conversación se resuelve:
6. sender.js envía datos a osTicket
7. osTicket crea el ticket automáticamente

------------------------------------------------------------
EJEMPLO DE TRANSCRIPT
------------------------------------------------------------

[Agente]
Hola, ¿en qué puedo ayudarte?

[Cliente]
Necesito soporte

[Agente]
Claro, revisaremos tu caso

------------------------------------------------------------
API OSTICKET
------------------------------------------------------------

ENDPOINT:

POST /api/tickets.json

PAYLOAD:

{
  "name": "Cliente",
  "email": "cliente@test.com",
  "subject": "Chat Chatwoot #15",
  "message": "Transcript completo",
  "topicId": 1,
  "source": "API"
}

------------------------------------------------------------
ESTADO ACTUAL
------------------------------------------------------------

FUNCIONAL:

- Webhooks desde Chatwoot
- Normalización de mensajes
- Filtrado de mensajes automáticos
- Construcción de transcript
- Envío automático a osTicket
- Creación de tickets

------------------------------------------------------------
PRÓXIMAS MEJORAS
------------------------------------------------------------

- Persistencia en base de datos
- Evitar tickets duplicados
- Retry automático
- Logs estructurados
- Dockerización del servicio
- Sistema de colas
- Deploy en producción

------------------------------------------------------------
COMPATIBILIDAD
------------------------------------------------------------

- Linux
- Windows (Docker Desktop)
- macOS
- WSL2

------------------------------------------------------------
PROPÓSITO DEL PROYECTO
------------------------------------------------------------

Este sistema fue desarrollado como integración real entre plataformas de atención al cliente y sistemas de ticketing.

Demuestra habilidades en:

- Node.js backend
- APIs REST
- Webhooks
- Arquitectura de integración
- Automatización de procesos
- Sistemas reales empresariales

------------------------------------------------------------
LICENCIA
------------------------------------------------------------

Uso personal / portafolio de demostración

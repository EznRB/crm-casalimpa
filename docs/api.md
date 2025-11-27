# API

## Autenticação
- Todas as rotas retornam `401` quando não há sessão válida.

## Clients
- `GET /api/clients` → lista clientes
- `POST /api/clients` → cria cliente
- `GET /api/clients/:id` → detalhe
- `PATCH /api/clients/:id` → atualiza
- `DELETE /api/clients/:id` → remove

Exemplo `POST /api/clients`
```
{
  "name": "Maria Silva",
  "email": "maria@email.com",
  "phone": "(11) 98765-4321",
  "address": {"street":"Rua Exemplo", "city":"São Paulo"},
  "notes": "Cliente VIP"
}
```

## Services
- `GET /api/services`
- `POST /api/services`
- `GET /api/services/:id`
- `PATCH /api/services/:id`
- `DELETE /api/services/:id`

Exemplo `POST /api/services`
```
{
  "name": "Limpeza Pós-Obra",
  "description": "Limpeza especializada",
  "base_price": 250.00,
  "duration_minutes": 180,
  "active": true
}
```

## Jobs (Appointments)
- `GET /api/jobs?from=YYYY-MM-DD&to=YYYY-MM-DD` → lista por intervalo
- `POST /api/jobs` → cria agendamento
- `PATCH /api/jobs/:id` → atualiza (inclui status)
- `DELETE /api/jobs/:id` → remove

Exemplo `POST /api/jobs`
```
{
  "customer_id": "uuid",
  "service_id": "uuid",
  "appointment_date": "2025-01-10",
  "start_time": "09:00",
  "end_time": "11:00",
  "status": "scheduled",
  "total_price": 350.00,
  "notes": "Levar produtos hipoalergênicos"
}
```

## Invoices
- `GET /api/invoices` → lista
- `POST /api/invoices` → cria a partir de um job
- `GET /api/invoices/:id` → detalhe
- `PATCH /api/invoices/:id` → atualiza status
- `GET /api/invoices/:id/pdf` → gera PDF

Exemplo `POST /api/invoices`
```
{
  "appointmentId": "uuid",
  "subtotal": 350.00,
  "tax": 0
}
```

## Reports
- `POST /api/reports/pdf` → gera PDF a partir de dados da UI
- `GET /api/reports/client/:id?month=YYYY-MM` → CSV por cliente
- `GET /api/reports/monthly?month=YYYY-MM` → resumo mensal
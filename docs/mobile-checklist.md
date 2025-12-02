# Checklist de Testes Mobile (PWA)

## Preparação
- URL em produção (Vercel) acessível via HTTPS
- Conexão estável nos dispositivos
- Limpar cache do navegador antes dos testes

## Instalação como PWA
- Android (Chrome)
  - Abrir URL
  - Menu → "Adicionar à tela inicial"
  - Abrir pelo ícone instalado (modo standalone)
  - Verificar splash, ícone e theme color
- iOS (Safari)
  - Abrir URL
  - Menu compartilhar → "Adicionar à Tela de Início"
  - Abrir pelo ícone instalado
  - Validar ícone, splash e título

## Funcionalidades Principais
- Clientes: listar, criar, excluir
- Serviços: listar, criar, editar
- Agendamentos: listar, criar, marcar como concluído
- Faturas: criar, listar, alterar status
- Funcionários: listar, criar, editar, registros de trabalho
- Fluxo de Caixa: resumo mensal, criar despesa

## Câmera/QR
- Acessar `/pwa-qa/qr`
- Permitir acesso à câmera
- Ver vídeo da câmera
- Validar leitura de QR (se disponível), ou ao menos funcionamento do `getUserMedia`

## Offline
- Abrir páginas principais uma vez (para cache)
- Ativar modo avião
- Reabrir páginas já visitadas e validar conteúdo básico renderizado

## Anotações
- Device/OS: Android/iOS, versão
- Screenshots dos passos e telas
- Problemas encontrados e passos para reproduzir

## Critérios de Aceite
- App instalável como PWA em Android e iOS (quando possível)
- Fluxos principais operando sem erros
- Câmera acessível via HTTPS
- Páginas básicas funcionam offline após cache

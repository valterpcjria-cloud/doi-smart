# Release Notes - DOI Smart v2.1.28

**Data de Lançamento:** 03 de Fevereiro de 2026  
**Tag:** `v2.1.28`  
**Repositório:** [doi-smart](https://github.com/valterpcjria-cloud/doi-smart)

---

## 🎯 Resumo

Esta versão representa o lançamento inicial do **DOI Smart** no GitHub, com a estrutura completa do projeto incluindo aplicação frontend, API backend e scripts de deploy.

---

## ✨ Novidades

### Frontend (React + TypeScript)
- **Dashboard** - Painel principal com visão geral das DOIs
- **DOIList** - Listagem e gerenciamento de Declarações de Operações Imobiliárias
- **ExtractionModal** - Modal de extração de dados com formatação de campos monetários em Real (R$)
- **CertificatesView** - Visualização e gerenciamento de certificados digitais
- **TransmissionModal** - Modal para transmissão de declarações
- **HistoryView** - Histórico de operações realizadas
- **SettingsView** - Configurações do sistema

### Backend (Node.js API)
- **api/server.js** - Servidor Express com endpoints REST
- **Integração Gemini** - Serviço de IA para extração inteligente de dados
- **Serviço de Transmissão** - Comunicação com sistemas da Receita Federal

### Gerenciamento de Estado (Zustand)
- **doiStore** - Store para gerenciamento de DOIs
- **certificateStore** - Store para certificados digitais
- **Testes unitários** incluídos para as stores

### Deploy
- **Scripts PHP** para hospedagem compartilhada
- **Migrations SQL** para configuração do banco de dados
- **Configuração .htaccess** para roteamento

---

## 🔧 Melhorias Técnicas

- Formatação de campos monetários no padrão brasileiro (R$ 1.000,00)
- Estrutura de projeto com TypeScript e Vite
- Configuração de testes com Vitest
- Arquivo `.env.example` para configuração segura
- Scripts de empacotamento de release (`package_release.ps1`)

---

## 📁 Arquivos Principais

| Componente | Arquivo | Descrição |
|------------|---------|-----------|
| App | `App.tsx` | Componente raiz da aplicação |
| Dashboard | `components/Dashboard.tsx` | Painel principal |
| DOI List | `components/DOIList.tsx` | Lista de declarações |
| Extração | `components/ExtractionModal.tsx` | Extração de dados |
| Certificados | `components/CertificatesView.tsx` | Gestão de certificados |
| API | `api/server.js` | Servidor backend |
| Deploy | `deploy/api.php` | API PHP para deploy |

---

## 🚀 Como Instalar

```bash
# Clonar repositório
git clone https://github.com/valterpcjria-cloud/doi-smart.git

# Instalar dependências
npm install

# Configurar ambiente
cp .env.local .env

# Executar em desenvolvimento
npm run dev
```

---

## 📋 Próximos Passos

- [ ] Implementar autenticação de usuários
- [ ] Adicionar dashboard analítico
- [ ] Melhorar validações de dados
- [ ] Integração com mais sistemas da Receita Federal

---

## 🔗 Links

- **Repositório:** https://github.com/valterpcjria-cloud/doi-smart
- **Tag v2.1.28:** https://github.com/valterpcjria-cloud/doi-smart/releases/tag/v2.1.28

---

*DOI Smart - Sistema inteligente para gerenciamento de Declarações de Operações Imobiliárias*

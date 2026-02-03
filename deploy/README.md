# 🚀 DOI Smart 2.0 - Guia de Deploy Hostgator

## Requisitos
- Hospedagem compartilhada Hostgator
- PHP 7.4+ com cURL e PDO MySQL
- Banco de dados MySQL
- mod_rewrite habilitado (Apache)

---

## Passo 1: Banco de Dados

### Via phpMyAdmin (cPanel)
1. Acesse **cPanel → phpMyAdmin**
2. Selecione o banco: `meusis41_doismart_db`
3. Aba **Importar** → Selecione `database/schema.sql`
4. Clique **Executar**

### Via Terminal (SSH)
```bash
mysql -u meusis41_doismart_user -p meusis41_doismart_db < database/schema.sql
```

---

## Passo 2: Configuração

1. Renomeie `config.example.php` → `config.php`
2. Edite `config.php`:

```php
// Banco de dados (já configurado)
define('DB_HOST', 'localhost');
define('DB_NAME', 'meusis41_doismart_db');
define('DB_USER', 'meusis41_doismart_user');
define('DB_PASS', '=v1lt2r._00@');

// API Gemini (OBRIGATÓRIO)
define('GEMINI_API_KEY', 'sua_chave_aqui');
```

3. Obtenha sua chave Gemini: https://aistudio.google.com/app/apikey

---

## Passo 3: Upload

1. **cPanel → Gerenciador de Arquivos**
2. Navegue até `public_html` (ou subdomínio)
3. Faça upload de TODOS os arquivos:
   - `index.html`
   - `assets/` (pasta)
   - `api.php`
   - `database.php`
   - `config.php`
   - `.htaccess`

---

## Passo 4: Permissões

```
Arquivos: 644
Pastas: 755
config.php: 600 (mais seguro)
```

---

## Passo 5: Testar

1. **Health check**: `https://seudominio.com/api/health`
   ```json
   {"status":"ok","database":"connected"}
   ```

2. **Frontend**: `https://seudominio.com`

---

## Endpoints da API

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/api/health` | GET | Status do sistema |
| `/api/dois` | GET | Listar DOIs |
| `/api/dois` | POST | Criar DOI |
| `/api/dois/{id}` | DELETE | Excluir DOI |
| `/api/dois/{id}/status` | PUT | Atualizar status |
| `/api/certificados` | GET | Listar certificados |
| `/api/certificados` | POST | Criar certificado |
| `/api/certificados/{id}/ativar` | PUT | Ativar certificado |
| `/api/extract/text` | POST | Extrair dados (texto) |
| `/api/extract/image` | POST | Extrair dados (imagem) |

---

## Troubleshooting

| Problema | Solução |
|----------|---------|
| Erro 500 | Verifique `config.php` e credenciais MySQL |
| Erro 404 | Confirme `.htaccess` e mod_rewrite |
| Database error | Execute `schema.sql` no phpMyAdmin |
| API Gemini falha | Verifique `GEMINI_API_KEY` |

---

## Suporte
- Documentação Gemini: https://ai.google.dev/docs
- Hostgator: https://suporte.hostgator.com.br

<?php
/**
 * Configuração do DOI Smart 2.0
 * 
 * INSTRUÇÕES:
 * 1. Renomeie este arquivo para config.php
 * 2. Configure as credenciais do banco de dados
 * 3. Adicione sua chave da API Gemini
 */

// ======================
// BANCO DE DADOS MYSQL
// ======================
define('DB_HOST', 'localhost');
define('DB_NAME', 'meusis41_doismart_db');
define('DB_USER', 'meusis41_doismart_user');
define('DB_PASS', '=v1lt2r._00@');
define('DB_CHARSET', 'utf8mb4');

// ======================
// API GOOGLE GEMINI
// ======================
// Obtenha sua chave em: https://aistudio.google.com/app// API Gemini (Opcional se usar OpenAI)
define('GEMINI_API_KEY', 'sua_chave_aqui');

// API OpenAI (Recomendado para extração estável)
define('OPENAI_API_KEY', 'sua_chave_openai_aqui');
define('AI_PROVIDER', 'openai'); // 'gemini' ou 'openai'

// ======================
// CONFIGURAÇÕES GERAIS
// ======================
define('DEBUG_MODE', false);
define('TIMEZONE', 'America/Sao_Paulo');

// Configurar timezone
date_default_timezone_set(TIMEZONE);

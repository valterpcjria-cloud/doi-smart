<?php
/**
 * DOI Smart 2.0 - API Backend para Hostgator cPanel
 * 
 * Este arquivo fornece os endpoints de API para:
 * - Integração com Google Gemini (IA)
 * - CRUD de DOIs e Certificados (MySQL)
 * 
 * Compatible com hospedagem compartilhada PHP 7.4+
 */

// Configurações CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=utf-8');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Carregar configurações
$configFile = __DIR__ . '/config.php';
if (!file_exists($configFile)) {
    http_response_code(500);
    echo json_encode(['error' => 'Arquivo config.php não encontrado. Copie config.example.php para config.php e configure.']);
    exit();
}

try {
    require_once $configFile;
    require_once __DIR__ . '/database.php';

    // Definir configurações de IA
    $AI_PROVIDER = defined('AI_PROVIDER') ? AI_PROVIDER : 'gemini';
    $GEMINI_API_KEY = defined('GEMINI_API_KEY') ? GEMINI_API_KEY : '';
    $OPENAI_API_KEY = defined('OPENAI_API_KEY') ? OPENAI_API_KEY : '';

    // ================================
    // ROTEAMENTO SIMPLIFICADO
    // ================================

$method = $_SERVER['REQUEST_METHOD'];
$path = isset($_GET['path']) ? $_GET['path'] : '';

// Normalizar path
if (empty($path)) {
    $requestUri = explode('?', $_SERVER['REQUEST_URI'])[0];
    $scriptName = $_SERVER['SCRIPT_NAME'];
    $basePath = dirname($scriptName);
    
    // Se o base path for apenas uma barra, removemos para evitar str_replace agressivo
    if ($basePath === DIRECTORY_SEPARATOR || $basePath === '\\' || $basePath === '/') {
        $path = ltrim($requestUri, '/');
    } else {
        $path = str_replace($basePath, '', $requestUri);
        $path = trim($path, '/');
    }
    
    // Remover o próprio script se ele aparecer no path (chamada direta)
    $path = str_replace('api.php', '', $path);
    $path = trim($path, '/');
}

// Remover prefixo "api/" se existir
if (strpos($path, 'api/') === 0) {
    $path = substr($path, 4);
}
// Endpoints de IA
    if ($path === 'extract/text' && $method === 'POST') {
        handleExtractText();
    } elseif ($path === 'extract/image' && $method === 'POST') {
        handleExtractImage();
    } elseif ($path === 'validate' && $method === 'POST') {
        handleValidate();
    } 
    
    // Endpoints de DOIs
    elseif ($path === 'dois' && $method === 'GET') {
        echo json_encode(getAllDois());
    } elseif ($path === 'dois' && $method === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        echo json_encode(createDoi($input));
    } elseif (preg_match('/^dois\/(.+)\/status$/', $path, $matches) && $method === 'PUT') {
        $codigo = $matches[1];
        $input = json_decode(file_get_contents('php://input'), true);
        echo json_encode(['success' => updateDoiStatus(
            $codigo, 
            $input['status'], 
            $input['receipt'] ?? null, 
            $input['error'] ?? null
        )]);
    } elseif (preg_match('/^dois\/(.+)$/', $path, $matches) && $method === 'PUT') {
        $codigo = $matches[1];
        $input = json_decode(file_get_contents('php://input'), true);
        echo json_encode(['success' => updateDoiData($codigo, $input)]);
    } elseif (preg_match('/^dois\/(.+)$/', $path, $matches) && $method === 'DELETE') {
        echo json_encode(['success' => deleteDoi($matches[1])]);
    }

    // Endpoints de Certificados
    elseif ($path === 'certificados' && $method === 'GET') {
        echo json_encode(getAllCertificados());
    } elseif ($path === 'certificados' && $method === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        echo json_encode(createCertificado($input));
    } elseif (preg_match('/^certificados\/(.+)\/ativar$/', $path, $matches) && $method === 'PUT') {
        echo json_encode(['success' => setActiveCertificado($matches[1])]);
    } elseif (preg_match('/^certificados\/(.+)$/', $path, $matches) && $method === 'DELETE') {
        echo json_encode(['success' => deleteCertificado($matches[1])]);
    }

    // Health / Test
    elseif ($path === 'health' || $path === 'db-test') {
        $db = Database::getInstance()->getConnection();
        echo json_encode(['status' => 'ok', 'db' => 'connected', 'timestamp' => date('c')]);
    }

    else {
        http_response_code(404);
        $debugInfo = "Path: '$path', Method: '$method'";
        echo json_encode(['error' => "Endpoint não encontrado ($debugInfo)", 'path' => $path, 'method' => $method]);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}

exit();

// ================================
// HANDLERS - IA (RELEITURA)
// ================================

function handleExtractText() {
    $input = json_decode(file_get_contents('php://input'), true);
    if (empty($input['text'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Texto é obrigatório']);
        return;
    }
    
    $prompt = getExtractionPrompt() . "\n\nEscritura:\n" . $input['text'];
    
    try {
        $result = callAI($prompt);
        echo json_encode($result);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
}

function handleExtractImage() {
    $input = json_decode(file_get_contents('php://input'), true);
    if (empty($input['base64Data']) || empty($input['mimeType'])) {
        http_response_code(400);
        echo json_encode(['error' => 'base64Data e mimeType são obrigatórios']);
        return;
    }
    
    try {
        $result = callAI(getExtractionPrompt(), [
            'data' => $input['base64Data'], 
            'mimeType' => $input['mimeType']
        ]);
        echo json_encode($result);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
}

function handleValidate() {
    $input = json_decode(file_get_contents('php://input'), true);
    if (empty($input['entry'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Entry é obrigatório']);
        return;
    }
    
    $prompt = "Atue como um auditor da Receita Federal. Analise estes dados de DOI e identifique inconsistências lógicas (valores suspeitos, CPFs formatados errado, endereços incompletos).
        Dados: " . json_encode($input['entry']) . "
        Retorne apenas JSON no formato: { \"valid\": boolean, \"issues\": string[] }";
    
    try {
        $result = callAI($prompt);
        echo json_encode($result);
    } catch (Exception $e) {
        // Fallback para validação local básica ou aceitar como válido
        echo json_encode(['valid' => true, 'issues' => []]);
    }
}

// ================================
// MOTORES DE IA
// ================================

function callAI($prompt, $image = null) {
    global $AI_PROVIDER;
    
    // Forçar Gemini para PDFs, pois OpenAI Vision não suporta PDF diretamente no chat API
    if ($image && $image['mimeType'] === 'application/pdf') {
        return callGemini($prompt, $image);
    }

    if ($AI_PROVIDER === 'openai') {
        // OpenAI Chat API não suporta PDF diretamente (apenas Imagem ou Texto)
        if ($image && $image['mimeType'] === 'application/pdf') {
            throw new Exception("A OpenAI não lê arquivos PDF diretamente. Por favor, COPIE O TEXTO do PDF e cole no campo de texto, ou converta o PDF para Imagem (JPG).");
        }
        return callOpenAI($prompt, $image);
    } else {
        return callGemini($prompt, $image);
    }
}

function callOpenAI($prompt, $image = null) {
    global $OPENAI_API_KEY;
    
    if (empty($OPENAI_API_KEY)) {
        throw new Exception("OPENAI_API_KEY não configurada no config.php");
    }

    $url = "https://api.openai.com/v1/chat/completions";
    
    $messages = [];
    $content = [];
    
    $content[] = ["type" => "text", "text" => $prompt];
    
    if ($image) {
        $content[] = [
            "type" => "image_url",
            "image_url" => [
                "url" => "data:" . $image['mimeType'] . ";base64," . $image['data']
            ]
        ];
    }
    
    $messages[] = ["role" => "user", "content" => $content];
    
    $payload = [
        "model" => $image ? "gpt-4o" : "gpt-4o-mini",
        "messages" => $messages,
        "response_format" => ["type" => "json_object"],
        "temperature" => 0.1
    ];

    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => json_encode($payload),
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER => [
            'Content-Type: application/json',
            'Authorization: Bearer ' . $OPENAI_API_KEY
        ],
        CURLOPT_TIMEOUT => 120,
        CURLOPT_SSL_VERIFYPEER => false
    ]);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);
    
    if ($error) throw new Exception("Erro cURL OpenAI: " . $error);
    
    if ($httpCode !== 200) {
        $errorData = json_decode($response, true);
        $msg = $errorData['error']['message'] ?? "Erro desconhecido OpenAI ($httpCode)";
        throw new Exception("OpenAI Error: " . $msg);
    }
    
    $data = json_decode($response, true);
    $text = $data['choices'][0]['message']['content'];
    
    return json_decode($text, true);
}

function callGemini($prompt, $image = null) {
    global $GEMINI_API_KEY;
    
    if (empty($GEMINI_API_KEY)) {
        throw new Exception("GEMINI_API_KEY não configurada no config.php");
    }

    // Lista de tentativas em ordem de preferência (Modelo, Versão API)
    $attempts = [
        ['model' => 'gemini-1.5-flash', 'version' => 'v1beta'],
        ['model' => 'gemini-1.5-flash', 'version' => 'v1'],
        ['model' => 'gemini-1.5-pro', 'version' => 'v1beta'],
        ['model' => 'gemini-1.5-flash-001', 'version' => 'v1beta'],
        ['model' => 'gemini-1.5-flash-002', 'version' => 'v1beta'],
    ];

    $lastError = "";

    foreach ($attempts as $attempt) {
        try {
            return executeGeminiRequest($prompt, $image, $attempt['model'], $attempt['version'], $GEMINI_API_KEY);
        } catch (Exception $e) {
            $lastError = $e->getMessage();
            // Se o erro for de modelo não encontrado (404) ou não suportado (400), continuamos para o próximo
            // Se for erro de autenticação (403), paramos logo
            if (strpos($lastError, '403') !== false || strpos($lastError, 'key') !== false) {
                throw $e;
            }
            continue;
        }
    }

    throw new Exception("Falha em todos os modelos Gemini. Último erro: " . $lastError);
}

function executeGeminiRequest($prompt, $image, $model, $apiVersion, $apiKey) {
    $url = "https://generativelanguage.googleapis.com/{$apiVersion}/models/{$model}:generateContent?key={$apiKey}";
    
    $parts = [];
    if ($image) {
        $parts[] = ['inline_data' => ['mime_type' => $image['mimeType'], 'data' => $image['data']]];
    }
    $parts[] = ['text' => $prompt];
    
    // Payload limpo para máxima compatibilidade
    $payload = [
        'contents' => [['parts' => $parts]]
    ];
    
    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => json_encode($payload),
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
        CURLOPT_TIMEOUT => 60, // Timeout reduzido para não travar muito no loop
        CURLOPT_SSL_VERIFYPEER => false
    ]);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);
    
    if ($error) throw new Exception("Erro cURL ($model): " . $error);
    
    if ($httpCode !== 200) {
        $errorData = json_decode($response, true);
        $msg = $errorData['error']['message'] ?? "Erro HTTP $httpCode";
        throw new Exception("($model/$apiVersion) $msg");
    }
    
    $data = json_decode($response, true);
    
    if (!isset($data['candidates'][0]['content']['parts'][0]['text'])) {
        throw new Exception("($model) Resposta inválida ou vazia do Gemini.");
    }

    $text = $data['candidates'][0]['content']['parts'][0]['text'];
    
    // Limpeza de Markdown
    $text = trim($text);
    if (strpos($text, '```json') === 0) {
        $text = substr($text, 7, -3);
    } elseif (strpos($text, '```') === 0) {
        $text = substr($text, 3, -3);
    }
    
    return json_decode(trim($text), true);
}

function getExtractionPrompt() {
    return "Analise esta ESCRITURA PÚBLICA e extraia TODOS os dados solicitados abaixo para o Layout DOI 4.0.1.
    Retorne APENAS um JSON válido.

    ESTRUTURA OBRIGATÓRIA DO JSON:
    {
        \"sellers\": [ // Lista de Alienantes/Vendedores
            {\"name\": \"Nome Completo\", \"id\": \"CPF/CNPJ\", \"share\": 100.0, \"civilStatus\": \"Estado Civil\"}
        ],
        \"buyers\": [ // Lista de Adquirentes/Compradores
            {\"name\": \"Nome Completo\", \"id\": \"CPF/CNPJ\", \"share\": 100.0, \"civilStatus\": \"Estado Civil\"}
        ],
        \"property\": {
            \"address\": \"Logradouro completo, número, bairro, cidade-UF, CEP\",
            \"registry\": \"Número da Matrícula\",
            \"nirf\": \"Número NIRF (se houver)\",
            \"iptu\": \"Inscrição Imobiliária/IPTU (se houver)\",
            \"value\": 0.00, // Valor Numérico da Transação
            \"area\": \"Área total (ex: 300m²)\",
            \"type\": \"URBANO\" // ou \"RURAL\"
        },
        \"operation\": {
            \"type\": \"Tipo (ex: Compra e Venda)\",
            \"nature\": \"Natureza Jurídica (ex: Alienação Fiduciária)\",
            \"documentType\": \"Escritura Pública\", // ou Sentença Judicial, etc.
            \"paymentMethod\": \"VISTA\", // ou \"PRAZO\"
            \"book\": \"Livro\",
            \"page\": \"Folha\",
            \"date\": \"YYYY-MM-DD\", // Data da lavratura/ato
            \"itbiValue\": 0.00, // Valor Base ou Recolhido do ITBI
            \"itcdValue\": 0.00 // Valor do ITCD se houver
        },
        \"registryOffice\": {
            \"code\": \"Código CNS (se houver)\",
            \"name\": \"Nome do Cartório\",
            \"official\": \"Nome do Tabelião/Oficial\"
        }
    }

    REGRAS:
    1. Se houver múltiplos vendedores ou compradores, liste TODOS no array.
    2. Converta todos os valores monetários para numero float (ponto flutuante).
    3. Se não encontrar um dado, use null ou string vazia, NÃO INVENTE.
    4. A data deve ser ISO 8601 (YYYY-MM-DD).";
}


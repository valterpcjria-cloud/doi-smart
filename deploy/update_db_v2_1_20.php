<?php
/**
 * Script de Atualização do Banco de Dados - v2.1.20
 * Adiciona colunas para suportar dados completos da DOI
 */

// Habilitar exibição de erros
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header('Content-Type: text/plain; charset=utf-8');

echo "Iniciando script de migração v2.1.20...\n";

// Tenta encontrar config.php no diretório atual ou acima
$configPath = __DIR__ . '/config.php';
if (!file_exists($configPath) && file_exists(__DIR__ . '/../config.php')) {
    $configPath = __DIR__ . '/../config.php';
}

if (!file_exists($configPath)) {
    die("ERRO CRÍTICO: config.php não encontrado em " . __DIR__ . " ou no diretório pai.\nVerifique onde você colocou este arquivo.");
}
require_once $configPath;

// Tenta encontrar database.php
$dbPath = __DIR__ . '/database.php';
if (!file_exists($dbPath) && file_exists(__DIR__ . '/../database.php')) {
    $dbPath = __DIR__ . '/../database.php';
}
if (!file_exists($dbPath) && file_exists(__DIR__ . '/deploy/database.php')) {
    $dbPath = __DIR__ . '/deploy/database.php';
}

if (!file_exists($dbPath)) {
    die("ERRO CRÍTICO: database.php não encontrado.\n");
}
require_once $dbPath;

echo "Arquivos carregados com sucesso. Conectando ao banco...\n";

try {
    $db = Database::getInstance()->getConnection();
    
    echo "Iniciando atualização do esquema...\n";
    
    // Lista de colunas a adicionar
    $columns = [
        "ADD COLUMN nirf VARCHAR(50) AFTER matricula",
        "ADD COLUMN iptu VARCHAR(50) AFTER nirf",
        "ADD COLUMN natureza_operacao VARCHAR(100) AFTER tipo_operacao",
        "ADD COLUMN tipo_documento VARCHAR(100) AFTER natureza_operacao",
        "ADD COLUMN itbi_valor DECIMAL(15,2) DEFAULT 0.00 AFTER valor",
        "ADD COLUMN itcd_valor DECIMAL(15,2) DEFAULT 0.00 AFTER itbi_valor",
        "ADD COLUMN cartorio_nome VARCHAR(255) AFTER folha",
        "ADD COLUMN cartorio_oficial VARCHAR(255) AFTER cartorio_nome",
        "ADD COLUMN cartorio_cns VARCHAR(50) AFTER cartorio_oficial"
    ];

    foreach ($columns as $colSql) {
        try {
            // Tenta adicionar a coluna (ignora se já existir)
            $db->exec("ALTER TABLE dois $colSql");
            echo "Sucesso: $colSql\n";
        } catch (PDOException $e) {
            if (strpos($e->getMessage(), 'Duplicate column') !== false) {
                echo "Ignorado (ja existe): $colSql\n";
            } else {
                echo "Erro: " . $e->getMessage() . "\n";
            }
        }
    }

    echo "\nAtualização concluída com sucesso!";

} catch (Exception $e) {
    echo "Erro fatal: " . $e->getMessage();
}

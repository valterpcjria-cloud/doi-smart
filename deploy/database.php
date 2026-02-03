<?php
/**
 * Classe de conexão com o banco de dados MySQL
 * DOI Smart 2.0
 */

class Database {
    private static $instance = null;
    private $pdo;
    
    private function __construct() {
        try {
            $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
            $options = [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ];
            $this->pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
        } catch (PDOException $e) {
            throw new Exception("Erro de conexão com o banco de dados: " . $e->getMessage());
        }
    }
    
    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    public function getConnection() {
        return $this->pdo;
    }
    
    // Prevenir clonagem
    private function __clone() {}
}

// ======================
// FUNÇÕES CRUD - DOIs
// ======================

function getAllDois() {
    $db = Database::getInstance()->getConnection();
    
    // Simplificando a query para evitar problemas com JSON_OBJECT em MySQL antigo
    // Buscamos as DOIs primeiro
    $stmt = $db->query("SELECT * FROM dois ORDER BY criado_em DESC");
    $dois = [];
    $doiIds = [];
    
    while ($row = $stmt->fetch()) {
        $doiId = $row['id'];
        $dois[$doiId] = [
            'id' => $row['codigo'],
            'dbId' => $row['id'],
            'date' => $row['data_operacao'],
            'competence' => $row['competencia'],
            'propertyAddress' => $row['endereco_imovel'],
            'registryNumber' => $row['matricula'],
            'nirf' => $row['nirf'] ?? '',
            'iptu' => $row['iptu'] ?? '',
            'value' => (float)$row['valor'],
            'itbiValue' => (float)($row['itbi_valor'] ?? 0),
            'itcdValue' => (float)($row['itcd_valor'] ?? 0),
            'status' => $row['status'],
            'receiptNumber' => $row['numero_recibo'],
            'errorMessage' => $row['mensagem_erro'],
            'lastUpdate' => $row['atualizado_em'],
            'operationType' => $row['tipo_operacao'],
            'operationNature' => $row['natureza_operacao'] ?? '',
            'documentType' => $row['tipo_documento'] ?? '',
            'paymentMethod' => $row['forma_pagamento'],
            'book' => $row['livro'],
            'page' => $row['folha'],
            'area' => $row['area'],
            'registryOffice' => [
                'name' => $row['cartorio_nome'] ?? '',
                'official' => $row['cartorio_oficial'] ?? '',
                'code' => $row['cartorio_cns'] ?? ''
            ],
            'parties' => []
        ];
        $doiIds[] = $doiId;
    }
    
    if (!empty($doiIds)) {
        // Buscar participantes separadamente
        $idsStr = implode(',', array_map('intval', $doiIds));
        $stmtP = $db->query("SELECT * FROM participantes WHERE doi_id IN ($idsStr)");
        while ($pRow = $stmtP->fetch()) {
            $doiId = $pRow['doi_id'];
            if (isset($dois[$doiId])) {
                $dois[$doiId]['parties'][] = [
                    'name' => $pRow['nome'],
                    'id' => $pRow['cpf_cnpj'],
                    'role' => $pRow['papel'],
                    'share' => (float)$pRow['fracao_ideal'],
                    'civilStatus' => $pRow['estado_civil']
                ];
            }
        }
    }
    
    return array_values($dois);
}

function createDoi($data) {
    $db = Database::getInstance()->getConnection();
    
    try {
        $db->beginTransaction();
        
        // Gerar código único
        $year = date('Y');
        $stmt = $db->query("SELECT COUNT(*) as count FROM dois WHERE codigo LIKE 'DOI-$year-%'");
        $count = $stmt->fetch()['count'] + 1;
        $codigo = sprintf("DOI-%s-%03d", $year, $count);
        
        // Inserir DOI
        $stmt = $db->prepare("
            INSERT INTO dois (
                codigo, data_operacao, competencia, endereco_imovel, matricula, nirf, iptu,
                valor, itbi_valor, itcd_valor, area, tipo_imovel, 
                tipo_operacao, natureza_operacao, tipo_documento, forma_pagamento, 
                livro, folha, cartorio_nome, cartorio_oficial, cartorio_cns, status
            ) VALUES (
                :codigo, :data_operacao, :competencia, :endereco_imovel, :matricula, :nirf, :iptu,
                :valor, :itbi_valor, :itcd_valor, :area, :tipo_imovel,
                :tipo_operacao, :natureza_operacao, :tipo_documento, :forma_pagamento,
                :livro, :folha, :cartorio_nome, :cartorio_oficial, :cartorio_cns, :status
            )
        ");
        
        $stmt->execute([
            ':codigo' => $codigo,
            ':data_operacao' => $data['date'] ?? date('Y-m-d'),
            ':competencia' => $data['competence'] ?? date('m/Y'),
            ':endereco_imovel' => $data['propertyAddress'],
            ':matricula' => $data['registryNumber'],
            ':nirf' => $data['nirf'] ?? null,
            ':iptu' => $data['iptu'] ?? null,
            ':valor' => $data['value'],
            ':itbi_valor' => $data['itbiValue'] ?? 0,
            ':itcd_valor' => $data['itcdValue'] ?? 0,
            ':area' => $data['area'] ?? null,
            ':tipo_imovel' => $data['propertyType'] ?? 'URBANO',
            ':tipo_operacao' => $data['operationType'],
            ':natureza_operacao' => $data['operationNature'] ?? null,
            ':tipo_documento' => $data['documentType'] ?? null,
            ':forma_pagamento' => $data['paymentMethod'] ?? 'VISTA',
            ':livro' => $data['book'] ?? null,
            ':folha' => $data['page'] ?? null,
            ':cartorio_nome' => $data['registryOffice']['name'] ?? null,
            ':cartorio_oficial' => $data['registryOffice']['official'] ?? null,
            ':cartorio_cns' => $data['registryOffice']['code'] ?? null,
            ':status' => 'READY'
        ]);
        
        $doiId = $db->lastInsertId();
        
        // Inserir participantes
        if (!empty($data['parties'])) {
            $stmt = $db->prepare("
                INSERT INTO participantes (doi_id, nome, cpf_cnpj, papel, fracao_ideal, estado_civil)
                VALUES (:doi_id, :nome, :cpf_cnpj, :papel, :fracao_ideal, :estado_civil)
            ");
            
            foreach ($data['parties'] as $party) {
                $stmt->execute([
                    ':doi_id' => $doiId,
                    ':nome' => $party['name'],
                    ':cpf_cnpj' => $party['id'],
                    ':papel' => $party['role'],
                    ':fracao_ideal' => $party['share'] ?? 100,
                    ':estado_civil' => $party['civilStatus'] ?? null
                ]);
            }
        }
        
        $db->commit();
        
        return ['success' => true, 'id' => $codigo];
        
    } catch (Exception $e) {
        $db->rollBack();
        throw $e;
    }
}

function updateDoiStatus($codigo, $status, $receipt = null, $error = null) {
    $db = Database::getInstance()->getConnection();
    
    $stmt = $db->prepare("
        UPDATE dois SET 
            status = :status,
            numero_recibo = COALESCE(:receipt, numero_recibo),
            mensagem_erro = :error,
            atualizado_em = CURRENT_TIMESTAMP
        WHERE codigo = :codigo
    ");
    
    $stmt->execute([
        ':status' => $status,
        ':receipt' => $receipt,
        ':error' => $error,
        ':codigo' => $codigo
    ]);
    
    return $stmt->rowCount() > 0;
}

function deleteDoi($codigo) {
    $db = Database::getInstance()->getConnection();
    
    try {
        $db->beginTransaction();

        // 1. Buscar ID interno para apagar dependencias 
        // (Isso previne erros de constraint se CASCADE nao estiver funcionando no banco)
        $stmt = $db->prepare("SELECT id FROM dois WHERE codigo = :codigo");
        $stmt->execute([':codigo' => $codigo]);
        $doi = $stmt->fetch();

        if ($doi) {
            $doiId = $doi['id'];
            $db->prepare("DELETE FROM participantes WHERE doi_id = :id")->execute([':id' => $doiId]);
            $db->prepare("DELETE FROM transmissoes WHERE doi_id = :id")->execute([':id' => $doiId]);
        }

        // 2. Apagar a DOI
        $stmt = $db->prepare("DELETE FROM dois WHERE codigo = :codigo AND status != 'TRANSMITTED'");
        $stmt->execute([':codigo' => $codigo]);
        $deleted = $stmt->rowCount() > 0;
        
        if ($deleted) {
            $db->commit();
            return true;
        } else {
            // Se não apagou a DOI (ex: já transmitida ou não achou), desfaz tudo
            $db->rollBack();
            return false;
        }

    } catch (Exception $e) {
        $db->rollBack();
        throw $e;
    }
}

function updateDoiData($codigo, $data) {
    $db = Database::getInstance()->getConnection();
    
    try {
        $db->beginTransaction();
        
        // Atualizar DOI
        $stmt = $db->prepare("
            UPDATE dois SET 
                data_operacao = :data_operacao,
                endereco_imovel = :endereco_imovel,
                matricula = :matricula,
                nirf = :nirf,
                iptu = :iptu,
                valor = :valor,
                itbi_valor = :itbi_valor,
                itcd_valor = :itcd_valor,
                area = :area,
                tipo_operacao = :tipo_operacao,
                natureza_operacao = :natureza_operacao,
                tipo_documento = :tipo_documento,
                forma_pagamento = :forma_pagamento,
                livro = :livro,
                folha = :folha,
                cartorio_nome = :cartorio_nome,
                cartorio_oficial = :cartorio_oficial,
                cartorio_cns = :cartorio_cns,
                atualizado_em = CURRENT_TIMESTAMP
            WHERE codigo = :codigo
        ");
        
        $stmt->execute([
            ':codigo' => $codigo,
            ':data_operacao' => $data['date'],
            ':endereco_imovel' => $data['propertyAddress'],
            ':matricula' => $data['registryNumber'],
            ':nirf' => $data['nirf'] ?? null,
            ':iptu' => $data['iptu'] ?? null,
            ':valor' => $data['value'],
            ':itbi_valor' => $data['itbiValue'] ?? 0,
            ':itcd_valor' => $data['itcdValue'] ?? 0,
            ':area' => $data['area'] ?? null,
            ':tipo_operacao' => $data['operationType'],
            ':natureza_operacao' => $data['operationNature'] ?? null,
            ':tipo_documento' => $data['documentType'] ?? null,
            ':forma_pagamento' => $data['paymentMethod'] ?? 'VISTA',
            ':livro' => $data['book'] ?? null,
            ':folha' => $data['page'] ?? null,
            ':cartorio_nome' => $data['registryOffice']['name'] ?? null,
            ':cartorio_oficial' => $data['registryOffice']['official'] ?? null,
            ':cartorio_cns' => $data['registryOffice']['code'] ?? null
        ]);
        
        // Pegar ID numérico
        $stmt = $db->prepare("SELECT id FROM dois WHERE codigo = :codigo");
        $stmt->execute([':codigo' => $codigo]);
        $row = $stmt->fetch();
        
        if (!$row) throw new Exception("DOI não encontrada");
        $doiId = $row['id'];
        
        // Atualizar Participantes (Remove e recria é mais fácil)
        $db->prepare("DELETE FROM participantes WHERE doi_id = :doi_id")->execute([':doi_id' => $doiId]);
        
        if (!empty($data['parties'])) {
            $stmt = $db->prepare("
                INSERT INTO participantes (doi_id, nome, cpf_cnpj, papel, fracao_ideal, estado_civil)
                VALUES (:doi_id, :nome, :cpf_cnpj, :papel, :fracao_ideal, :estado_civil)
            ");
            
            foreach ($data['parties'] as $party) {
                $stmt->execute([
                    ':doi_id' => $doiId,
                    ':nome' => $party['name'],
                    ':cpf_cnpj' => $party['id'],
                    ':papel' => $party['role'],
                    ':fracao_ideal' => $party['share'] ?? 100,
                    ':estado_civil' => $party['civilStatus'] ?? null
                ]);
            }
        }
        
        $db->commit();
        return true;
        
    } catch (Exception $e) {
        $db->rollBack();
        throw $e;
    }
}

// ======================
// FUNÇÕES CRUD - Certificados
// ======================

function getAllCertificados() {
    $db = Database::getInstance()->getConnection();
    $stmt = $db->query("SELECT * FROM certificados ORDER BY ativo DESC, data_validade ASC");
    
    $certs = [];
    while ($row = $stmt->fetch()) {
        $certs[] = [
            'id' => (string)$row['id'],
            'owner' => $row['proprietario'],
            'expiryDate' => $row['data_validade'],
            'type' => $row['tipo'],
            'status' => $row['status'],
            'isActive' => (bool)$row['ativo']
        ];
    }
    
    return $certs;
}

function createCertificado($data) {
    $db = Database::getInstance()->getConnection();
    
    // Determinar status baseado na data
    $expiryDate = new DateTime($data['expiryDate']);
    $now = new DateTime();
    $diff = $now->diff($expiryDate);
    
    if ($expiryDate < $now) {
        $status = 'EXPIRED';
    } elseif ($diff->days <= 30) {
        $status = 'WARNING';
    } else {
        $status = 'VALID';
    }
    
    // Se é o primeiro certificado, ativar automaticamente
    $stmt = $db->query("SELECT COUNT(*) as count FROM certificados");
    $isFirst = $stmt->fetch()['count'] == 0;
    
    $stmt = $db->prepare("
        INSERT INTO certificados (proprietario, tipo, data_validade, status, ativo)
        VALUES (:proprietario, :tipo, :data_validade, :status, :ativo)
    ");
    
    $stmt->execute([
        ':proprietario' => $data['owner'],
        ':tipo' => $data['type'],
        ':data_validade' => $data['expiryDate'],
        ':status' => $status,
        ':ativo' => $isFirst ? 1 : 0
    ]);
    
    return ['success' => true, 'id' => $db->lastInsertId()];
}

function setActiveCertificado($id) {
    $db = Database::getInstance()->getConnection();
    
    $db->beginTransaction();
    try {
        $db->exec("UPDATE certificados SET ativo = 0");
        $stmt = $db->prepare("UPDATE certificados SET ativo = 1 WHERE id = :id");
        $stmt->execute([':id' => $id]);
        $db->commit();
        return true;
    } catch (Exception $e) {
        $db->rollBack();
        throw $e;
    }
}

function deleteCertificado($id) {
    $db = Database::getInstance()->getConnection();
    $stmt = $db->prepare("DELETE FROM certificados WHERE id = :id");
    $stmt->execute([':id' => $id]);
    return $stmt->rowCount() > 0;
}

// ======================
// FUNÇÕES - Transmissões
// ======================

function logTransmissao($doiCodigo, $sucesso, $receipt, $error, $logs) {
    $db = Database::getInstance()->getConnection();
    
    // Buscar ID da DOI
    $stmt = $db->prepare("SELECT id FROM dois WHERE codigo = :codigo");
    $stmt->execute([':codigo' => $doiCodigo]);
    $doi = $stmt->fetch();
    
    if (!$doi) return false;
    
    $stmt = $db->prepare("
        INSERT INTO transmissoes (doi_id, sucesso, numero_recibo, mensagem_erro, logs)
        VALUES (:doi_id, :sucesso, :numero_recibo, :mensagem_erro, :logs)
    ");
    
    $stmt->execute([
        ':doi_id' => $doi['id'],
        ':sucesso' => $sucesso ? 1 : 0,
        ':numero_recibo' => $receipt,
        ':mensagem_erro' => $error,
        ':logs' => json_encode($logs)
    ]);
    
    return true;
}

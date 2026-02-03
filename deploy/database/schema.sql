-- =====================================================
-- DOI Smart 2.0 - Schema do Banco de Dados MySQL
-- Banco: meusis41_doismart_db
-- =====================================================

-- Tabela de usuários (para futuras funcionalidades)
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    cargo VARCHAR(100) DEFAULT 'Escrevente',
    cartorio VARCHAR(255),
    ativo BOOLEAN DEFAULT TRUE,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de certificados digitais
CREATE TABLE IF NOT EXISTS certificados (
    id INT AUTO_INCREMENT PRIMARY KEY,
    proprietario VARCHAR(255) NOT NULL,
    tipo ENUM('A1', 'A3') NOT NULL DEFAULT 'A1',
    data_validade DATE NOT NULL,
    status ENUM('VALID', 'WARNING', 'EXPIRED') NOT NULL DEFAULT 'VALID',
    ativo BOOLEAN DEFAULT FALSE,
    arquivo_path VARCHAR(500),
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela principal de DOIs
CREATE TABLE IF NOT EXISTS dois (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(50) UNIQUE NOT NULL COMMENT 'Ex: DOI-2026-001',
    data_operacao DATE NOT NULL,
    competencia VARCHAR(7) NOT NULL COMMENT 'Ex: 01/2026',
    
    -- Dados do imóvel
    endereco_imovel TEXT NOT NULL,
    matricula VARCHAR(50) NOT NULL,
    nirf VARCHAR(50),
    iptu VARCHAR(50),
    valor DECIMAL(15,2) NOT NULL,
    itbi_valor DECIMAL(15,2) DEFAULT 0.00,
    itcd_valor DECIMAL(15,2) DEFAULT 0.00,
    area VARCHAR(100),
    tipo_imovel ENUM('URBANO', 'RURAL') DEFAULT 'URBANO',
    
    -- Dados da operação
    tipo_operacao VARCHAR(100) NOT NULL COMMENT 'Compra e Venda, Doação, etc.',
    natureza_operacao VARCHAR(100),
    tipo_documento VARCHAR(100),
    forma_pagamento ENUM('VISTA', 'PRAZO') DEFAULT 'VISTA',
    livro VARCHAR(50),
    folha VARCHAR(50),
    cartorio_nome VARCHAR(255),
    cartorio_oficial VARCHAR(255),
    cartorio_cns VARCHAR(50),
    
    -- Status e controle
    status ENUM('DRAFT', 'READY', 'TRANSMITTING', 'TRANSMITTED', 'ERROR') DEFAULT 'READY',
    numero_recibo VARCHAR(100),
    mensagem_erro TEXT,
    
    -- Auditoria
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_status (status),
    INDEX idx_competencia (competencia),
    INDEX idx_data (data_operacao)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de participantes (vendedores/compradores)
CREATE TABLE IF NOT EXISTS participantes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    doi_id INT NOT NULL,
    nome VARCHAR(255) NOT NULL,
    cpf_cnpj VARCHAR(20) NOT NULL,
    papel ENUM('SELLER', 'BUYER') NOT NULL,
    fracao_ideal DECIMAL(5,2) DEFAULT 100.00 COMMENT 'Percentual',
    estado_civil VARCHAR(50),
    
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (doi_id) REFERENCES dois(id) ON DELETE CASCADE,
    INDEX idx_doi (doi_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de histórico de transmissões
CREATE TABLE IF NOT EXISTS transmissoes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    doi_id INT NOT NULL,
    data_transmissao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    sucesso BOOLEAN NOT NULL,
    numero_recibo VARCHAR(100),
    mensagem_erro TEXT,
    logs TEXT COMMENT 'JSON com logs detalhados',
    
    FOREIGN KEY (doi_id) REFERENCES dois(id) ON DELETE CASCADE,
    INDEX idx_doi (doi_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de configurações do sistema
CREATE TABLE IF NOT EXISTS configuracoes (
    chave VARCHAR(100) PRIMARY KEY,
    valor TEXT NOT NULL,
    descricao VARCHAR(255),
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Inserir configurações padrão
INSERT INTO configuracoes (chave, valor, descricao) VALUES
    ('versao_sistema', '2.1.0', 'Versão atual do sistema'),
    ('doi_layout_versao', '4.0.1', 'Versão do layout DOI da RFB'),
    ('gemini_model', 'gemini-1.5-flash', 'Modelo Gemini utilizado')
ON DUPLICATE KEY UPDATE valor = VALUES(valor);

-- Inserir certificado de exemplo
INSERT INTO certificados (proprietario, tipo, data_validade, status, ativo) VALUES
    ('Cartório do 1º Ofício', 'A1', '2027-10-12', 'VALID', TRUE),
    ('Maria Silva (Escrevente)', 'A1', '2026-03-01', 'WARNING', FALSE)
ON DUPLICATE KEY UPDATE atualizado_em = CURRENT_TIMESTAMP;

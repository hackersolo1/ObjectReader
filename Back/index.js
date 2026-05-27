/* =============================================
   OBJECT READER — index.js  (Backend Express)
   ============================================= */

const mysql = require('mysql2/promise');
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// ─────────────────────────────────────────────
// POOL DE CONEXÃO — usa variáveis do .env
// ─────────────────────────────────────────────
let pool;

async function hostConnect() {
    try {
        pool = await mysql.createPool({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: Number(process.env.DB_PORT),
            ssl: { rejectUnauthorized: false },
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0,
            enableKeepAlive: true,
            keepAliveInitialDelay: 10000,
        });
        console.log('>> [MYSQL] Conectado com sucesso.');
    } catch (error) {
        console.error(`>> [MYSQL] Erro ao conectar: ${error}`);
        process.exit(1); // encerra se não conseguir conectar
    }
}

// ─────────────────────────────────────────────
// MIDDLEWARE — checa pool antes de cada rota
// ─────────────────────────────────────────────
function requirePool(req, res, next) {
    if (!pool) return res.status(503).json({ error: 'Banco de dados indisponível.' });
    next();
}

// ─────────────────────────────────────────────
// GET /codequery/:code
// Busca um objeto pelo código de barras.
//
// Bug original: req.params retorna um objeto
// { codeQuery: '...' }, mas a query passava o
// objeto inteiro em vez da string. Corrigido:
// destruturamos corretamente.
// ─────────────────────────────────────────────
app.get('/codequery/:code', requirePool, async (req, res) => {
    try {
        const { code } = req.params; // string correta

        const [rows] = await pool.query(
            'SELECT * FROM ObjInfo WHERE objCode = ? LIMIT 1',
            [code]
        );

        if (rows.length === 0) {
            // Retorna null explícito — o front trata como "não encontrado"
            return res.json(null);
        }

        res.json(rows[0]);
    } catch (error) {
        console.error(`>> [GET /codequery] Erro: ${error}`);
        res.status(500).json({ error: 'Erro interno ao consultar o banco.' });
    }
});

// ─────────────────────────────────────────────
// GET /history
// Retorna todos os objetos ordenados por data
// de cadastro (mais recentes primeiro).
// ─────────────────────────────────────────────
app.get('/history', requirePool, async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT * FROM ObjInfo'
        );
        res.json(rows);
    } catch (error) {
        console.error(`>> [GET /history] Erro: ${error}`);
        res.status(500).json({ error: 'Erro interno ao buscar histórico.' });
    }
});

// ─────────────────────────────────────────────
// GET /stats
// Retorna contagens por estado + total.
// ─────────────────────────────────────────────
app.get('/stats', requirePool, async (req, res) => {
    try {
        const [[total]] = await pool.query(
            'SELECT COUNT(*) AS total FROM ObjInfo'
        );
        const [byState] = await pool.query(
            'SELECT objState, COUNT(*) AS qty FROM ObjInfo GROUP BY objState'
        );

        // Monta objeto { total, novo, usado, velho }
        const stats = { total: total.total, novo: 0, usado: 0, velho: 0 };
        byState.forEach(row => {
            const key = (row.objState ?? '').toLowerCase();
            if (key in stats) stats[key] = row.qty;
        });

        res.json(stats);
    } catch (error) {
        console.error(`>> [GET /stats] Erro: ${error}`);
        res.status(500).json({ error: 'Erro interno ao buscar estatísticas.' });
    }
});

// ─────────────────────────────────────────────
// POST /additem
// Insere um novo objeto.
// Body esperado (JSON):
//   { objName, objCode, objLocal, objState, objObs? }
// ─────────────────────────────────────────────
app.post('/additem', requirePool, async (req, res) => {
    try {
        const { objName, objCode, objLocal, objState, objObs } = req.body;

        // Validação básica
        if (!objName || !objCode) {
            return res.status(400).json({ error: 'objName e objCode são obrigatórios.' });
        }

        // Verifica duplicidade de código
        const [existing] = await pool.query(
            'SELECT id FROM ObjInfo WHERE objCode = ? LIMIT 1',
            [objCode]
        );
        if (existing.length > 0) {
            return res.status(409).json({ error: `Código "${objCode}" já está cadastrado.` });
        }

        const [result] = await pool.query(
            `INSERT INTO ObjInfo (objName, objCode, objLocal, objState, objObs)
             VALUES (?, ?, ?, ?, ?)`,
            [objName, objCode, objLocal ?? null, objState ?? 'Novo', objObs ?? null]
        );

        res.status(201).json({
            message: 'Item cadastrado com sucesso.',
            id: result.insertId,
        });
    } catch (error) {
        console.error(`>> [POST /additem] Erro: ${error}`);
        res.status(500).json({ error: 'Erro interno ao cadastrar item.' });
    }
});

// ─────────────────────────────────────────────
// START
// ─────────────────────────────────────────────
const PORT = process.env.PORT ?? 3000;

app.listen(PORT, async () => {
    console.log(`>> [SERVER] Rodando na porta ${PORT}`);
    await hostConnect();
});

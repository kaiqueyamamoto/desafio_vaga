import { Router } from 'express';
import { TransactionController } from '../controllers/TransactionController';
import multer from 'multer';
import path from 'path';

const router = Router();
const transactionController = new TransactionController();

// Configuração do Multer para upload de arquivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

// Rota para upload e processamento do arquivo
router.post('/upload', upload.single('file'), transactionController.processFile);

// Rota para listar transações
router.get('/', transactionController.listTransactions);

// Rota para obter estatísticas
router.get('/stats', transactionController.getStats);

export default router; 
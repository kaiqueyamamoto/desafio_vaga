import { Router } from 'express';
import multer from 'multer';
import { TransactionController } from '../controllers/TransactionController';

const router = Router();
const transactionController = new TransactionController();

// Configuração do multer para upload de arquivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

// Rotas
router.post('/upload', upload.single('file'), transactionController.processFile);
router.get('/', transactionController.listTransactions);

export const transactionRoutes = router; 
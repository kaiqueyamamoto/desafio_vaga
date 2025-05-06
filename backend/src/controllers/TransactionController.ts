import { Request, Response } from 'express';
import { Transaction } from '../models/Transaction';
import { Client } from '../models/Client';
import fs from 'fs';
import path from 'path';

export class TransactionController {
  /**
   * Processa o arquivo de transações e salva no banco de dados
   */
  async processFile(req: Request, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'Nenhum arquivo enviado' });
      }

      const startTime = Date.now();
      const fileContent = fs.readFileSync(req.file.path, 'utf-8');
      const lines = fileContent.split('\n').filter(line => line.trim());

      let processedCount = 0;
      let skippedCount = 0;

      for (const line of lines) {
        const [id, nome, cpfCnpj, data, valor] = line.split(';').map(item => item.split(':')[1]);

        // Verifica se a transação já existe
        const existingTransaction = await Transaction.findOne({ transactionId: id });
        if (existingTransaction) {
          skippedCount++;
          continue;
        }

        // Busca ou cria o cliente
        let client = await Client.findOne({ cpfCnpj });
        if (!client) {
          client = await Client.create({
            name: nome,
            cpfCnpj
          });
        }

        // Cria a transação
        await Transaction.create({
          transactionId: id,
          client: client._id,
          date: new Date(data),
          value: Number(valor)
        });

        processedCount++;
      }

      const endTime = Date.now();
      const processingTime = (endTime - startTime) / 1000; // em segundos

      // Remove o arquivo temporário
      fs.unlinkSync(req.file.path);

      return res.json({
        message: 'Arquivo processado com sucesso',
        stats: {
          processed: processedCount,
          skipped: skippedCount,
          processingTime: `${processingTime.toFixed(2)}s`
        }
      });
    } catch (error) {
      console.error('Erro ao processar arquivo:', error);
      return res.status(500).json({ error: 'Erro ao processar arquivo' });
    }
  }

  /**
   * Lista as transações com paginação e filtros
   */
  async listTransactions(req: Request, res: Response) {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      const query: any = {};

      // Filtro por nome do cliente
      if (req.query.clientName) {
        const clients = await Client.find({
          name: { $regex: req.query.clientName, $options: 'i' }
        });
        query.client = { $in: clients.map(c => c._id) };
      }

      // Filtro por data
      if (req.query.startDate && req.query.endDate) {
        query.date = {
          $gte: new Date(req.query.startDate as string),
          $lte: new Date(req.query.endDate as string)
        };
      }

      const transactions = await Transaction.find(query)
        .populate('client', 'name cpfCnpj')
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit);

      const total = await Transaction.countDocuments(query);

      return res.json({
        transactions,
        pagination: {
          total,
          page,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Erro ao listar transações:', error);
      return res.status(500).json({ error: 'Erro ao listar transações' });
    }
  }

  /**
   * Obtém estatísticas sobre as transações
   */
  async getStats(req: Request, res: Response) {
    try {
      const startTime = Date.now();

      // Total de transações
      const totalTransactions = await Transaction.countDocuments();

      // Total de clientes
      const totalClients = await Client.countDocuments();

      // Valor total das transações
      const totalValue = await Transaction.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: '$value' }
          }
        }
      ]);

      // Média de valor por transação
      const averageValue = totalValue[0]?.total / totalTransactions || 0;

      // Maior valor de transação
      const highestTransaction = await Transaction.findOne()
        .sort({ value: -1 })
        .populate('client', 'name cpfCnpj');

      // Menor valor de transação
      const lowestTransaction = await Transaction.findOne()
        .sort({ value: 1 })
        .populate('client', 'name cpfCnpj');

      // Data da transação mais recente
      const latestTransaction = await Transaction.findOne()
        .sort({ date: -1 })
        .populate('client', 'name cpfCnpj');

      // Data da transação mais antiga
      const oldestTransaction = await Transaction.findOne()
        .sort({ date: 1 })
        .populate('client', 'name cpfCnpj');

      const endTime = Date.now();
      const processingTime = (endTime - startTime) / 1000; // em segundos

      return res.json({
        stats: {
          totalTransactions,
          totalClients,
          totalValue: totalValue[0]?.total || 0,
          averageValue,
          highestTransaction: highestTransaction ? {
            value: highestTransaction.value,
            client: highestTransaction.client.name,
            date: highestTransaction.date
          } : null,
          lowestTransaction: lowestTransaction ? {
            value: lowestTransaction.value,
            client: lowestTransaction.client.name,
            date: lowestTransaction.date
          } : null,
          dateRange: {
            oldest: oldestTransaction?.date,
            latest: latestTransaction?.date
          },
          processingTime: `${processingTime.toFixed(2)}s`
        }
      });
    } catch (error) {
      console.error('Erro ao obter estatísticas:', error);
      return res.status(500).json({ error: 'Erro ao obter estatísticas' });
    }
  }
} 
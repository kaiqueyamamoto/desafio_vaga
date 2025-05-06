import { useState } from 'react';
import {
  Box,
  Button,
  Container,
  Heading,
  Input,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useToast,
  HStack,
  Text,
  VStack,
  InputGroup,
  InputLeftElement,
  Select,
  Flex,
  Spinner,
} from '@chakra-ui/react';
import { FiUpload, FiSearch, FiCalendar } from 'react-icons/fi';
import axios from 'axios';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Stats } from '../components/StatsCard';

interface Transaction {
  _id: string;
  transactionId: string;
  client: {
    name: string;
    cpfCnpj: string;
  };
  date: string;
  value: number;
}

interface StatsData {
  totalTransactions: number;
  totalClients: number;
  totalValue: number;
  averageValue: number;
  highestTransaction: {
    value: number;
    client: string;
    date: string;
  } | null;
  lowestTransaction: {
    value: number;
    client: string;
    date: string;
  } | null;
  dateRange: {
    oldest: string;
    latest: string;
  };
  processingTime: string;
}

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [page, setPage] = useState(1);
  const [clientName, setClientName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const toast = useToast();
  const queryClient = useQueryClient();

  // Query para buscar estatísticas
  const { data: stats, isLoading: isLoadingStats } = useQuery<StatsData>(
    'stats',
    async () => {
      const response = await axios.get('http://localhost:3001/api/transactions/stats');
      return response.data.stats;
    }
  );

  // Query para buscar transações
  const { data, isLoading } = useQuery(
    ['transactions', page, clientName, startDate, endDate],
    async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
      });

      if (clientName) params.append('clientName', clientName);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const response = await axios.get(`http://localhost:3001/api/transactions?${params}`);
      return response.data;
    }
  );

  // Mutation para upload do arquivo
  const uploadMutation = useMutation(
    async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      const response = await axios.post('http://localhost:3001/api/transactions/upload', formData);
      return response.data;
    },
    {
      onSuccess: () => {
        toast({
          title: 'Arquivo processado com sucesso!',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        queryClient.invalidateQueries(['transactions']);
        queryClient.invalidateQueries('stats');
        setFile(null);
      },
      onError: () => {
        toast({
          title: 'Erro ao processar arquivo',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      },
    }
  );

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (file) {
      uploadMutation.mutate(file);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Heading as="h1" size="xl" textAlign="center">
          Sistema de Reconciliação de Pagamentos
        </Heading>

        <Box p={5} shadow="md" borderWidth="1px" borderRadius="lg">
          <VStack spacing={4}>
            <Input
              type="file"
              accept=".txt"
              onChange={handleFileChange}
              p={1}
            />
            <Button
              colorScheme="blue"
              onClick={handleUpload}
              isLoading={uploadMutation.isLoading}
              isDisabled={!file}
            >
              Upload de Arquivo
            </Button>
          </VStack>
        </Box>

        <Box>
          <HStack spacing={4} mb={4}>
            <Input
              placeholder="Nome do cliente"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
            />
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </HStack>

          {isLoading ? (
            <Flex justify="center">
              <Spinner />
            </Flex>
          ) : (
            <>
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>ID</Th>
                    <Th>Cliente</Th>
                    <Th>CPF/CNPJ</Th>
                    <Th>Data</Th>
                    <Th isNumeric>Valor</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {data?.transactions.map((transaction: Transaction) => (
                    <Tr key={transaction._id}>
                      <Td>{transaction.transactionId}</Td>
                      <Td>{transaction.client.name}</Td>
                      <Td>{transaction.client.cpfCnpj}</Td>
                      <Td>{formatDate(transaction.date)}</Td>
                      <Td isNumeric>{formatCurrency(transaction.value)}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>

              <HStack justify="center" mt={4}>
                <Button
                  onClick={() => setPage(page - 1)}
                  isDisabled={page === 1}
                >
                  Anterior
                </Button>
                <Text>Página {page} de {data?.pagination.pages || 1}</Text>
                <Button
                  onClick={() => setPage(page + 1)}
                  isDisabled={page === data?.pagination.pages}
                >
                  Próxima
                </Button>
              </HStack>
            </>
          )}
        </Box>
      </VStack>
    </Container>
  );
} 
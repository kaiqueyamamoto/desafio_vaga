import { Box, Stat, StatLabel, StatNumber, StatHelpText, SimpleGrid } from '@chakra-ui/react';

interface StatsCardProps {
  label: string;
  value: string | number;
  helpText?: string;
}

export function StatsCard({ label, value, helpText }: StatsCardProps) {
  return (
    <Box
      p={5}
      shadow="md"
      borderWidth="1px"
      borderRadius="lg"
      bg="white"
    >
      <Stat>
        <StatLabel fontSize="lg">{label}</StatLabel>
        <StatNumber fontSize="2xl">{value}</StatNumber>
        {helpText && <StatHelpText>{helpText}</StatHelpText>}
      </Stat>
    </Box>
  );
}

interface StatsProps {
  stats: {
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
  };
}

export function Stats({ stats }: StatsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  return (
    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6} mb={8}>
      <StatsCard
        label="Total de Transações"
        value={stats.totalTransactions}
      />
      <StatsCard
        label="Total de Clientes"
        value={stats.totalClients}
      />
      <StatsCard
        label="Valor Total"
        value={formatCurrency(stats.totalValue)}
      />
      <StatsCard
        label="Valor Médio"
        value={formatCurrency(stats.averageValue)}
      />
      {stats.highestTransaction && (
        <StatsCard
          label="Maior Transação"
          value={formatCurrency(stats.highestTransaction.value)}
          helpText={`Cliente: ${stats.highestTransaction.client} - ${formatDate(stats.highestTransaction.date)}`}
        />
      )}
      {stats.lowestTransaction && (
        <StatsCard
          label="Menor Transação"
          value={formatCurrency(stats.lowestTransaction.value)}
          helpText={`Cliente: ${stats.lowestTransaction.client} - ${formatDate(stats.lowestTransaction.date)}`}
        />
      )}
      <StatsCard
        label="Período"
        value={`${formatDate(stats.dateRange.oldest)} - ${formatDate(stats.dateRange.latest)}`}
      />
      <StatsCard
        label="Tempo de Processamento"
        value={stats.processingTime}
      />
    </SimpleGrid>
  );
} 
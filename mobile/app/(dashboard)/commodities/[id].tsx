import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Dimensions, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { getCommodityById, CommodityDetail } from '../../../services/commodities';
import { LineChart } from 'react-native-chart-kit';
import { ArrowLeft, Search, TrendingUp, TrendingDown } from 'lucide-react-native';

const screenWidth = Dimensions.get('window').width;

type ChartView = 'historico' | 'previsoes';

function getClassLabel(cls: string) {
  const map: Record<string, string> = {
    bom: 'Bom para Compra',
    regular: 'Momento Regular',
    ruim: 'Aguarde',
  };
  return map[cls?.toLowerCase()] ?? cls;
}

function getClassColor(cls: string) {
  const map: Record<string, string> = {
    bom: '#10b981',
    regular: '#f59e0b',
    ruim: '#ef4444',
  };
  return map[cls?.toLowerCase()] ?? '#6b7280';
}

export default function CommodityDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [commodity, setCommodity] = useState<CommodityDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [chartView, setChartView] = useState<ChartView>('historico');

  useEffect(() => {
    if (!id) return;
    
    getCommodityById(id)
      .then((data) => {
        if (!data) setError('Commodity não encontrada');
        else setCommodity(data);
      })
      .catch(() => setError('Erro ao carregar commodity'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading || !commodity) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft color="#a1a1aa" size={24} />
          </TouchableOpacity>
        </View>
        <View style={styles.centerContent}>
          {loading ? (
            <ActivityIndicator size="large" color="#d946ef" />
          ) : (
            <Text style={styles.errorText}>{error}</Text>
          )}
        </View>
      </SafeAreaView>
    );
  }

  const isGood = commodity.classificacao?.toLowerCase() === 'bom';
  const isRegular = commodity.classificacao?.toLowerCase() === 'regular';
  const badgeColor = getClassColor(commodity.classificacao);

  // Preparar dados do gráfico
  const chartLabels = chartView === 'historico' 
    ? commodity.historico.map(h => h.data_referencia.substring(5, 10)) // MM-DD
    : commodity.previsoes.map(p => p.periodo.substring(0, 3)); // Jan, Fev...

  const chartPrices = chartView === 'historico'
    ? commodity.historico.map(h => h.preco_medio)
    : commodity.previsoes.map(p => p.preco_previsto);

  const chartData = {
    labels: chartLabels.length > 0 ? chartLabels : ['N/A'],
    datasets: [
      {
        data: chartPrices.length > 0 ? chartPrices : [0],
        color: (opacity = 1) => `rgba(217, 70, 239, ${opacity})`, // #d946ef
        strokeWidth: 2,
      },
    ],
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft color="#a1a1aa" size={24} />
            <Text style={styles.backText}>Voltar</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.titleSection}>
          <Text style={styles.title}>{commodity.nome}</Text>
          <Text style={styles.price}>R$ {commodity.preco_atual.toFixed(2)}</Text>
        </View>

        <View style={styles.actionsGroup}>
          <TouchableOpacity 
            style={[styles.btnAction, { backgroundColor: '#d946ef' }]} 
            onPress={() => router.push('/(dashboard)/orders')}
          >
            <Text style={styles.btnActionText}>Registrar Compra</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.btnAction, { backgroundColor: 'rgba(217, 70, 239, 0.2)' }]} 
            onPress={() => router.push('/(dashboard)/alerts')}
          >
            <Text style={[styles.btnActionText, { color: '#d946ef' }]}>Criar Alerta</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.insightCard}>
          <View style={styles.insightHeader}>
            <Text style={styles.insightTitle}>Previsão IA</Text>
            <View style={[styles.badge, { backgroundColor: badgeColor + '20', borderColor: badgeColor }]}>
              <Text style={[styles.badgeText, { color: badgeColor }]}>
                {getClassLabel(commodity.classificacao)}
              </Text>
            </View>
          </View>
          
          <View style={styles.insightBody}>
            <View style={styles.variationRow}>
              {commodity.variacao_percentual > 0 ? <TrendingUp color={badgeColor} size={28} /> : <TrendingDown color={badgeColor} size={28} />}
              <Text style={[styles.forecastBig, { color: badgeColor }]}>
                {commodity.variacao_percentual > 0 ? '+' : ''}{commodity.variacao_percentual.toFixed(2)}%
              </Text>
            </View>
            <Text style={styles.insightText}>
              {isGood
                ? `A tendência indica alta de ${commodity.variacao_percentual.toFixed(2)}% em relação à previsão futura (R$ ${commodity.previsao_media_futura.toFixed(2)}). ${commodity.justificativa}`
                : isRegular
                ? `O mercado apresenta variação moderada de ${commodity.variacao_percentual.toFixed(2)}%. ${commodity.justificativa}`
                : `A tendência indica queda. ${commodity.justificativa}`}
            </Text>
          </View>
        </View>

        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>
              {chartView === 'historico' ? 'Histórico de Preços' : 'Previsões Futuras'}
            </Text>
            <View style={styles.toggleGroup}>
              <TouchableOpacity 
                style={[styles.toggleBtn, chartView === 'historico' && styles.toggleActive]}
                onPress={() => setChartView('historico')}
              >
                <Text style={[styles.toggleText, chartView === 'historico' && styles.toggleTextActive]}>Histórico</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.toggleBtn, chartView === 'previsoes' && styles.toggleActive]}
                onPress={() => setChartView('previsoes')}
              >
                <Text style={[styles.toggleText, chartView === 'previsoes' && styles.toggleTextActive]}>Previsões</Text>
              </TouchableOpacity>
            </View>
          </View>

          <LineChart
            data={chartData}
            width={screenWidth - 80}
            height={220}
            chartConfig={{
              backgroundColor: '#111111',
              backgroundGradientFrom: '#111111',
              backgroundGradientTo: '#111111',
              decimalPlaces: 2,
              color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(156, 163, 175, ${opacity})`,
              style: { borderRadius: 16 },
              propsForDots: { r: '4', strokeWidth: '2', stroke: '#d946ef' }
            }}
            bezier
            style={styles.chartStyle}
          />
        </View>

        <View style={{height: 100}} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollContent: {
    padding: 24,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    marginBottom: 24,
    flexDirection: 'row',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingRight: 16,
  },
  backText: {
    color: '#a1a1aa',
    marginLeft: 8,
    fontSize: 16,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 16,
  },
  titleSection: {
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  price: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#d946ef',
    marginTop: 8,
  },
  actionsGroup: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  btnAction: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  btnActionText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  insightCard: {
    backgroundColor: 'rgba(17, 17, 17, 0.7)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#333333',
    marginBottom: 24,
  },
  insightHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  insightTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  insightBody: {},
  variationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  forecastBig: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  insightText: {
    color: '#a1a1aa',
    lineHeight: 22,
    fontSize: 15,
  },
  chartCard: {
    backgroundColor: 'rgba(17, 17, 17, 0.7)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#333333',
  },
  chartHeader: {
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 12,
  },
  toggleGroup: {
    flexDirection: 'row',
    backgroundColor: 'rgba(17, 17, 17, 0.6)',
    borderRadius: 8,
    padding: 4,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  toggleActive: {
    backgroundColor: '#d946ef',
  },
  toggleText: {
    color: '#a1a1aa',
    fontWeight: '500',
  },
  toggleTextActive: {
    color: '#ffffff',
  },
  chartStyle: {
    marginVertical: 8,
    borderRadius: 16,
  }
});

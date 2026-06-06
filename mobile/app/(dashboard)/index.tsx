import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Link } from 'expo-router';
import { getCommodities, Commodity } from '../../services/commodities';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TrendingUp, TrendingDown } from 'lucide-react-native';

function getClassificationLabel(classification: string): string {
  switch (classification.toLowerCase()) {
    case 'bom': return 'Bom para Compra';
    case 'regular': return 'Momento Regular';
    case 'ruim': return 'Aguarde';
    default: return classification;
  }
}

function getClassificationColor(classification: string): string {
  switch (classification.toLowerCase()) {
    case 'bom': return '#10b981'; // emerald-500
    case 'regular': return '#f59e0b'; // amber-500
    case 'ruim': return '#ef4444'; // red-500
    default: return '#6b7280'; // gray-500
  }
}

export default function DashboardIndexScreen() {
  const [commodities, setCommodities] = useState<Commodity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getCommodities()
      .then(setCommodities)
      .catch(() => setError('Não foi possível carregar os dados. Verifique sua conexão.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Dashboard</Text>
          <Text style={styles.subtitle}>Carregando dados do mercado...</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#d946ef" />
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Dashboard</Text>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Dashboard</Text>
          <Text style={styles.subtitle}>Acompanhe suas matérias-primas e veja a recomendação de IA.</Text>
        </View>

        <View style={styles.grid}>
          {commodities.map((item) => {
            const isUp = item.variation_percentage > 0;
            const badgeColor = getClassificationColor(item.classification);

            return (
              <Link href={`/(dashboard)/commodities/${item.id}`} asChild key={item.id}>
                <TouchableOpacity style={styles.card}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>{item.name}</Text>
                    <View style={[styles.badge, { backgroundColor: badgeColor + '20', borderColor: badgeColor }]}>
                      <Text style={[styles.badgeText, { color: badgeColor }]}>
                        {getClassificationLabel(item.classification)}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.priceContainer}>
                    <Text style={styles.price}>R$ {item.actual_price.toFixed(2)}</Text>
                  </View>

                  <View style={styles.forecastContainer}>
                    <Text style={styles.forecastLabel}>Variação prevista:</Text>
                    <View style={styles.variationWrapper}>
                      {isUp ? <TrendingUp size={16} color="#10b981" /> : <TrendingDown size={16} color="#ef4444" />}
                      <Text style={[styles.forecastValue, { color: isUp ? '#10b981' : '#ef4444' }]}>
                        {isUp ? '+' : ''}{item.variation_percentage.toFixed(2)}%
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              </Link>
            );
          })}
        </View>
        <View style={styles.bottomSpacer} />
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#a1a1aa',
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
  },
  grid: {
    gap: 16,
  },
  card: {
    backgroundColor: 'rgba(17, 17, 17, 0.7)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#333333',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
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
  priceContainer: {
    marginBottom: 16,
  },
  price: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  forecastContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#333333',
  },
  forecastLabel: {
    color: '#a1a1aa',
    fontSize: 14,
  },
  variationWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  forecastValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  bottomSpacer: {
    height: 100, // Espaço para a tab bar flutuante
  }
});

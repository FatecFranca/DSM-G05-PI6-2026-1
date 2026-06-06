import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Enterprise, getEnterprises } from '../../../services/enterprises';
import { Search, Mail, Phone, MapPin, Building2 } from 'lucide-react-native';

export default function SuppliersScreen() {
  const [suppliers, setSuppliers] = useState<Enterprise[]>([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState<Enterprise[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    getEnterprises()
      .then(data => {
        setSuppliers(data);
        setFilteredSuppliers(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!search.trim()) {
      setFilteredSuppliers(suppliers);
    } else {
      const lower = search.toLowerCase();
      setFilteredSuppliers(
        suppliers.filter(
          s =>
            s.enterprise_name.toLowerCase().includes(lower) ||
            s.cnpj.includes(lower) ||
            s.type.some(t => t.toLowerCase().includes(lower))
        )
      );
    }
  }, [search, suppliers]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Diretório de Fornecedores</Text>
          <Text style={styles.subtitle}>Consulte informações e contatos da sua rede de fornecimento.</Text>
        </View>

        <View style={styles.searchContainer}>
          <Search size={20} color="#a1a1aa" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por nome, CNPJ ou tipo..."
            placeholderTextColor="#a1a1aa"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {loading ? (
          <View style={styles.centerCard}>
            <ActivityIndicator size="large" color="#d946ef" />
          </View>
        ) : filteredSuppliers.length === 0 ? (
          <View style={styles.centerCard}>
            <Text style={styles.emptyText}>Nenhum fornecedor encontrado.</Text>
          </View>
        ) : (
          <View style={styles.grid}>
            {filteredSuppliers.map(supplier => (
              <View key={supplier.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View>
                    <Text style={styles.cardTitle}>{supplier.enterprise_name}</Text>
                    <Text style={styles.cardCnpj}>CNPJ: {supplier.cnpj}</Text>
                  </View>
                  <Building2 size={24} color="#d946ef" />
                </View>

                <View style={styles.typesRow}>
                  {supplier.type.map((t, i) => (
                    <View key={i} style={styles.typeBadge}>
                      <Text style={styles.typeBadgeText}>{t}</Text>
                    </View>
                  ))}
                </View>

                <View style={styles.contactInfo}>
                  <View style={styles.infoRow}>
                    <Mail size={16} color="#a1a1aa" />
                    <Text style={styles.infoText}>{supplier.email}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Phone size={16} color="#a1a1aa" />
                    <Text style={styles.infoText}>{supplier.phone}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <MapPin size={16} color="#a1a1aa" />
                    <Text style={styles.infoText}>{supplier.address} - {supplier.cep}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
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
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  subtitle: {
    fontSize: 16,
    color: '#a1a1aa',
    marginTop: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(17, 17, 17, 0.7)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333333',
    marginBottom: 24,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    color: '#ffffff',
    fontSize: 16,
  },
  centerCard: {
    backgroundColor: 'rgba(17, 17, 17, 0.7)',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#333333',
  },
  emptyText: {
    color: '#a1a1aa',
    fontSize: 16,
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
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  cardCnpj: {
    color: '#a1a1aa',
    fontSize: 14,
  },
  typesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  typeBadge: {
    backgroundColor: 'rgba(217, 70, 239, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeBadgeText: {
    color: '#d946ef',
    fontSize: 12,
    fontWeight: 'bold',
  },
  contactInfo: {
    borderTopWidth: 1,
    borderTopColor: '#333333',
    paddingTop: 16,
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    color: '#a1a1aa',
    marginLeft: 12,
    fontSize: 14,
    flex: 1,
  }
});

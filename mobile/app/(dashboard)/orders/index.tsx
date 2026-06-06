import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { Commodity, CommodityDetail, getCommodities, getCommodityById } from '../../../services/commodities';
import { Package, DollarSign, Sparkles } from 'lucide-react-native';
import { Picker } from '@react-native-picker/picker';

export default function OrdersScreen() {
  const [commodities, setCommodities] = useState<Commodity[]>([]);
  const [selectedCommodityId, setSelectedCommodityId] = useState("");
  const [commodityDetail, setCommodityDetail] = useState<CommodityDetail | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  
  const [quantity, setQuantity] = useState("");
  const [pricePaid, setPricePaid] = useState("");
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    getCommodities().then(setCommodities).catch(console.error);
  }, []);

  useEffect(() => {
    if (!selectedCommodityId) {
      setCommodityDetail(null);
      return;
    }
    
    let isMounted = true;
    setIsLoadingDetail(true);
    setShowResult(false);
    
    getCommodityById(selectedCommodityId)
      .then((detail) => {
        if (isMounted && detail) {
          setCommodityDetail(detail);
        }
      })
      .catch((err) => console.error("Erro ao carregar detalhes:", err))
      .finally(() => {
        if (isMounted) setIsLoadingDetail(false);
      });

    return () => { isMounted = false; };
  }, [selectedCommodityId]);

  const handleCalculate = () => {
    if (commodityDetail && quantity && pricePaid) {
      setShowResult(true);
    }
  };

  let spotSavings = 0;
  let futureSavings = 0;
  
  if (showResult && commodityDetail && quantity && pricePaid) {
    const qty = parseFloat(quantity);
    const paid = parseFloat(pricePaid);
    
    spotSavings = (commodityDetail.preco_atual - paid) * qty;
    futureSavings = (commodityDetail.previsao_media_futura - paid) * qty;
  }

  const getRecommendation = () => {
    if (futureSavings > 0 && spotSavings > 0) {
      return "Excelente negócio estratégico! Você comprou abaixo do mercado atual e já garantiu proteção contra a inflação projetada para o futuro. Ótima oportunidade para estocar.";
    } else if (futureSavings > 0 && spotSavings <= 0) {
      return "Embora o preço pago esteja acima do mercado atual, a projeção futura indica alta. No longo prazo, essa compra se provará vantajosa.";
    } else if (futureSavings <= 0 && spotSavings > 0) {
      return "Boa compra imediata, mas as projeções indicam queda futura. Cuidado com estoques muito longos, pois o ativo tende a desvalorizar.";
    } else {
      return "Atenção: Compra acima do preço de mercado atual e com projeção futura de queda. Considere renegociar com seus fornecedores ou adiar grandes aquisições.";
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Simulação de Compras</Text>
          <Text style={styles.subtitle}>Analise o ROI da sua compra com IA.</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Detalhes da Transação</Text>
          
          <Text style={styles.label}>Matéria-Prima</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedCommodityId}
              onValueChange={(itemValue) => setSelectedCommodityId(itemValue)}
              style={styles.picker}
              dropdownIconColor="#ffffff"
            >
              <Picker.Item label="Selecione a commodity" value="" color="#a1a1aa" />
              {commodities.map(c => (
                <Picker.Item key={c.id} label={c.name} value={c.id} color={Platform.OS === 'ios' ? '#ffffff' : '#000'} />
              ))}
            </Picker>
          </View>

          <Text style={styles.label}>Quantidade (KG)</Text>
          <View style={styles.inputWrapper}>
            <Package size={20} color="#a1a1aa" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Ex: 500"
              placeholderTextColor="#a1a1aa"
              keyboardType="numeric"
              value={quantity}
              onChangeText={(text) => { setQuantity(text); setShowResult(false); }}
            />
          </View>

          <Text style={styles.label}>Preço Negociado (Unitário)</Text>
          <View style={styles.inputWrapper}>
            <DollarSign size={20} color="#a1a1aa" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="0.00"
              placeholderTextColor="#a1a1aa"
              keyboardType="numeric"
              value={pricePaid}
              onChangeText={(text) => { setPricePaid(text); setShowResult(false); }}
            />
          </View>

          <TouchableOpacity 
            style={[styles.button, (isLoadingDetail || !selectedCommodityId) && styles.buttonDisabled]} 
            onPress={handleCalculate}
            disabled={isLoadingDetail || !selectedCommodityId}
          >
            <Text style={styles.buttonText}>Executar Análise de ROI</Text>
          </TouchableOpacity>
        </View>

        {showResult && commodityDetail && !isLoadingDetail && (
          <View style={[styles.card, styles.aiCard]}>
            <View style={styles.aiHeader}>
              <Sparkles size={24} color="#f59e0b" />
              <Text style={styles.aiTitle}>Análise da IA</Text>
            </View>
            <Text style={styles.aiJustification}>{commodityDetail.justificativa}</Text>
          </View>
        )}

        <View style={styles.resultsArea}>
          {isLoadingDetail ? (
            <View style={styles.card}>
              <ActivityIndicator size="large" color="#d946ef" />
              <Text style={styles.loadingText}>A IA está processando...</Text>
            </View>
          ) : !showResult ? (
            <View style={styles.card}>
              <Text style={styles.emptyText}>Preencha os detalhes para obter o veredito da IA.</Text>
            </View>
          ) : commodityDetail && (
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Resultados</Text>
              
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Economia Spot</Text>
                <Text style={[styles.resultValue, { color: spotSavings >= 0 ? '#10b981' : '#ef4444' }]}>
                  R$ {Math.abs(spotSavings).toFixed(2)} {spotSavings >= 0 ? '(Ganhos)' : '(Perdas)'}
                </Text>
              </View>

              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>ROI Futuro</Text>
                <Text style={[styles.resultValue, { color: futureSavings >= 0 ? '#10b981' : '#ef4444' }]}>
                  R$ {Math.abs(futureSavings).toFixed(2)} {futureSavings >= 0 ? '(Lucro)' : '(Risco)'}
                </Text>
              </View>

              <View style={styles.recommendationBox}>
                <Text style={styles.recommendationTitle}>Veredito da IA</Text>
                <Text style={styles.recommendationText}>{getRecommendation()}</Text>
              </View>
            </View>
          )}
        </View>
        <View style={{height: 100}} />
      </ScrollView>
    </KeyboardAvoidingView>
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
  card: {
    backgroundColor: 'rgba(17, 17, 17, 0.7)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#333333',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
  },
  label: {
    color: '#a1a1aa',
    fontSize: 14,
    marginBottom: 8,
  },
  pickerContainer: {
    backgroundColor: 'rgba(17, 17, 17, 0.6)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333333',
    marginBottom: 16,
    overflow: 'hidden',
  },
  picker: {
    color: '#ffffff',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(17, 17, 17, 0.6)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333333',
    marginBottom: 16,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    color: '#ffffff',
    paddingVertical: 12,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#d946ef',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    backgroundColor: '#475569',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  aiCard: {
    borderColor: 'rgba(245, 158, 11, 0.3)',
    backgroundColor: 'rgba(245, 158, 11, 0.05)',
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  aiTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f59e0b',
  },
  aiJustification: {
    color: '#a1a1aa',
    lineHeight: 22,
  },
  resultsArea: {
    marginTop: 8,
  },
  loadingText: {
    color: '#a1a1aa',
    textAlign: 'center',
    marginTop: 12,
  },
  emptyText: {
    color: '#a1a1aa',
    textAlign: 'center',
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  resultLabel: {
    color: '#a1a1aa',
    fontSize: 16,
  },
  resultValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  recommendationBox: {
    marginTop: 12,
    backgroundColor: 'rgba(17, 17, 17, 0.6)',
    padding: 16,
    borderRadius: 8,
  },
  recommendationTitle: {
    color: '#ffffff',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  recommendationText: {
    color: '#a1a1aa',
    lineHeight: 20,
  }
});

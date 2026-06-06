import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Modal, TextInput, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AlertModel, getAlerts, createAlert, toggleAlertStatus, deleteAlert } from '../../../services/alerts';
import { Commodity, getCommodities } from '../../../services/commodities';
import { Picker } from '@react-native-picker/picker';
import { MessageCircle, Mail, Phone, Trash2, Power, Plus } from 'lucide-react-native';

export default function AlertsScreen() {
  const [alerts, setAlerts] = useState<AlertModel[]>([]);
  const [commodities, setCommodities] = useState<Commodity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCommodityId, setSelectedCommodityId] = useState("");
  const [condition, setCondition] = useState("Abaixo");
  const [targetPrice, setTargetPrice] = useState("");
  const [channel, setChannel] = useState("Telegram");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [statusFilter, setStatusFilter] = useState("todos");
  const [commodityFilter, setCommodityFilter] = useState("todas");

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [fetchedAlerts, fetchedCommodities] = await Promise.all([
        getAlerts(),
        getCommodities()
      ]);
      setAlerts(fetchedAlerts);
      setCommodities(fetchedCommodities);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateAlert = async () => {
    if (!selectedCommodityId) {
      Alert.alert('Atenção', 'Selecione uma commodity para criar o alerta.');
      return;
    }

    const targetPriceValue = targetPrice ? parseFloat(targetPrice.replace(',', '.')) : undefined;
    if (condition !== 'bom' && (targetPriceValue == null || Number.isNaN(targetPriceValue))) {
      Alert.alert('Atenção', 'Informe um preço alvo válido.');
      return;
    }

    setIsSubmitting(true);

    try {
      await createAlert({
        commodityId: parseInt(selectedCommodityId, 10),
        condition: condition as 'Abaixo' | 'Acima' | 'bom',
        targetPrice: condition === 'bom' ? undefined : targetPriceValue,
        channel: channel as 'Telegram' | 'E-mail',
      });

      setModalVisible(false);
      setSelectedCommodityId('');
      setCondition('Abaixo');
      setTargetPrice('');
      setChannel('Telegram');
      await loadData();
      Alert.alert('Sucesso', 'Alerta criado com sucesso.');
    } catch {
      Alert.alert('Erro', 'Não foi possível criar o alerta.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggle = async (id: string) => {
    try {
      await toggleAlertStatus(id);
      setAlerts(alerts.map(a => a.id === id ? { ...a, active: !a.active } : a));
    } catch {
      Alert.alert('Erro', 'Não foi possível alterar o status do alerta.');
    }
  };

  const handleDelete = async (id: string) => {
    Alert.alert('Excluir Alerta', 'Tem certeza que deseja excluir este alerta?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: async () => {
          try {
            await deleteAlert(id);
            setAlerts(alerts.filter(a => a.id !== id));
          } catch {
            Alert.alert('Erro', 'Não foi possível excluir o alerta.');
          }
        }
      }
    ]);
  };

  const filteredAlerts = alerts.filter(alert => {
    // Normaliza o valor de active (caso venha como string "false", 0, etc da API)
    const isActive = alert.active === true || String(alert.active) === 'true' || String(alert.active) === '1';
    
    if (statusFilter === "ativos" && !isActive) return false;
    if (statusFilter === "inativos" && isActive) return false;
    
    if (commodityFilter !== "todas" && alert.commodityName?.toLowerCase() !== commodityFilter.toLowerCase()) return false;
    
    return true;
  });

  const getChannelIcon = (channel: string) => {
    switch (channel.toLowerCase()) {
      case 'telegram': return <MessageCircle size={16} color="#26A5E4" />;
      case 'whatsapp': return <Phone size={16} color="#25D366" />;
      case 'e-mail': return <Mail size={16} color="#EA4335" />;
      default: return <MessageCircle size={16} color="#a1a1aa" />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Meus Alertas</Text>
          <Text style={styles.subtitle}>Gerencie suas regras de notificação sobre o mercado.</Text>
          <TouchableOpacity style={styles.btnCreateAlert} onPress={() => setModalVisible(true)}>
            <Plus size={16} color="#ffffff" />
            <Text style={styles.btnCreateAlertText}>Novo Alerta</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.filtersCard}>
          <Text style={styles.sectionTitle}>Filtros</Text>

          <Text style={styles.label}>Status</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={statusFilter}
              onValueChange={(val) => setStatusFilter(String(val))}
              style={styles.picker}
              dropdownIconColor="#ffffff"
            >
              <Picker.Item label="Todos" value="todos" />
              <Picker.Item label="Apenas Ativos" value="ativos" />
              <Picker.Item label="Apenas Inativos" value="inativos" />
            </Picker>
          </View>

          <Text style={styles.label}>Produto</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={commodityFilter}
              onValueChange={(val) => setCommodityFilter(String(val))}
              style={styles.picker}
              dropdownIconColor="#ffffff"
            >
              <Picker.Item label="Todos os Produtos" value="todas" />
              {commodities.map(c => (
                <Picker.Item key={c.id} label={c.name} value={c.name} />
              ))}
            </Picker>
          </View>
        </View>

        <Modal visible={modalVisible} transparent animationType="fade">
          <KeyboardAvoidingView
            style={styles.modalOverlay}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Criar Alerta</Text>
                <Pressable onPress={() => setModalVisible(false)} style={styles.modalCloseButton}>
                  <Text style={styles.modalCloseText}>Cancelar</Text>
                </Pressable>
              </View>

              <View style={styles.modalBody}>
                <Text style={styles.label}>Matéria-Prima</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={selectedCommodityId}
                    onValueChange={(val) => setSelectedCommodityId(String(val))}
                    style={styles.picker}
                    dropdownIconColor="#ffffff"
                  >
                    <Picker.Item label="Selecione a commodity" value="" />
                    {commodities.map(c => (
                      <Picker.Item key={c.id} label={c.name} value={String(c.id)} />
                    ))}
                  </Picker>
                </View>

                <Text style={styles.label}>Qual a condição?</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={condition}
                    onValueChange={(val) => setCondition(String(val))}
                    style={styles.picker}
                    dropdownIconColor="#ffffff"
                  >
                    <Picker.Item label="Preço cair abaixo de" value="Abaixo" />
                    <Picker.Item label="Preço subir acima de" value="Acima" />
                    <Picker.Item label="Recomendação IA mudar para Bom" value="bom" />
                  </Picker>
                </View>

                {condition !== 'bom' && (
                  <View style={{ marginBottom: 16 }}>
                    <Text style={styles.label}>Preço alvo (R$)</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Ex: 50.00"
                      placeholderTextColor="#777777"
                      keyboardType="numeric"
                      value={targetPrice}
                      onChangeText={setTargetPrice}
                      editable={!isSubmitting}
                    />
                  </View>
                )}

                <Text style={styles.label}>Canal</Text>
                <View style={styles.channelRow}>
                  {['Telegram', 'E-mail'].map(option => {
                    const active = channel === option;
                    return (
                      <TouchableOpacity
                        key={option}
                        style={[styles.channelButton, active && styles.channelButtonActive]}
                        onPress={() => setChannel(option)}
                        disabled={isSubmitting}
                      >
                        <Text style={[styles.channelButtonText, active && styles.channelButtonTextActive]}>{option}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={styles.modalButton}
                    onPress={handleCreateAlert}
                    disabled={isSubmitting}
                  >
                    <Text style={styles.modalButtonText}>{isSubmitting ? 'Salvando...' : 'Salvar Alerta'}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>

        <View style={styles.resultsArea}>
          {isLoading ? (
            <View style={styles.emptyCard}>
              <ActivityIndicator size="large" color="#d946ef" />
              <Text style={styles.emptyText}>Carregando alertas...</Text>
            </View>
          ) : filteredAlerts.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>Nenhum alerta encontrado com os filtros atuais.</Text>
            </View>
          ) : (
            <View style={styles.listContainer}>
              {filteredAlerts.map(alert => (
                <View key={alert.id} style={[styles.alertCard, alert.active ? styles.cardActive : styles.cardInactive]}>
                  <View style={styles.alertHeader}>
                    <Text style={styles.commodityName}>{alert.commodityName}</Text>
                    <View style={[styles.badge, alert.active ? styles.badgeActive : styles.badgeInactive]}>
                      <Text style={[styles.badgeText, alert.active ? styles.badgeTextActive : styles.badgeTextInactive]}>
                        {alert.active ? 'Ativo' : 'Inativo'}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.conditionText}>🎯 {alert.condition}</Text>

                  <View style={styles.channelInfo}>
                    {getChannelIcon(alert.channel)}
                    <Text style={styles.channelText}> via {alert.channel}</Text>
                  </View>

                  <View style={styles.actionsGroup}>
                    <TouchableOpacity 
                      style={[styles.btnAction, alert.active ? styles.btnDeactivate : styles.btnActivate]} 
                      onPress={() => handleToggle(alert.id)}
                    >
                      <Power size={16} color={alert.active ? '#fbbf24' : '#10b981'} />
                      <Text style={[styles.btnActionText, { color: alert.active ? '#fbbf24' : '#10b981' }]}>
                        {alert.active ? 'Desativar' : 'Ativar'}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.btnDelete} 
                      onPress={() => handleDelete(alert.id)}
                    >
                      <Trash2 size={16} color="#ef4444" />
                      <Text style={styles.btnDeleteText}>Excluir</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}
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
  btnCreateAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: '#d946ef',
    alignSelf: 'flex-start',
  },
  btnCreateAlertText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#111111',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#333333',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalCloseButton: {
    padding: 8,
  },
  modalCloseText: {
    color: '#a1a1aa',
    fontSize: 14,
  },
  modalBody: {
    marginTop: 0,
  },
  input: {
    backgroundColor: 'rgba(17, 17, 17, 0.6)',
    color: '#ffffff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#333333',
    padding: 12,
    marginTop: 8,
  },
  channelRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  channelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#333333',
    backgroundColor: 'rgba(17, 17, 17, 0.6)',
    alignItems: 'center',
  },
  channelButtonActive: {
    borderColor: '#d946ef',
    backgroundColor: 'rgba(217, 70, 239, 0.15)',
  },
  channelButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },
  channelButtonTextActive: {
    color: '#d946ef',
  },
  modalActions: {
    marginTop: 8,
  },
  filtersCard: {
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
  resultsArea: {},
  emptyCard: {
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
    marginTop: 12,
  },
  listContainer: {
    gap: 16,
  },
  alertCard: {
    backgroundColor: 'rgba(17, 17, 17, 0.9)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
  },
  cardActive: {
    borderColor: 'rgba(217, 70, 239, 0.3)',
  },
  cardInactive: {
    borderColor: '#333333',
    opacity: 0.8,
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  commodityName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
  },
  badgeInactive: {
    backgroundColor: 'rgba(156, 163, 175, 0.2)',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  badgeTextActive: {
    color: '#10b981',
  },
  badgeTextInactive: {
    color: '#a1a1aa',
  },
  conditionText: {
    color: '#a1a1aa',
    fontSize: 15,
    marginBottom: 8,
  },
  channelInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  channelText: {
    color: '#a1a1aa',
    fontSize: 14,
    marginLeft: 6,
  },
  actionsGroup: {
    flexDirection: 'row',
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#333333',
    paddingTop: 16,
  },
  btnAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(17, 17, 17, 0.6)',
    gap: 6,
  },
  btnActivate: {
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  btnDeactivate: {
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.3)',
  },
  modalButton: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#d946ef',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
  },
  btnActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  btnDelete: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    gap: 6,
  },
  btnDeleteText: {
    color: '#ef4444',
    fontSize: 14,
    fontWeight: '600',
  }
});

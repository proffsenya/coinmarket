import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet,Alert, FlatList, TouchableOpacity, Modal, TextInput, Button, ActivityIndicator } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/AntDesign';
import { createPortfolio, getPortfolios, deletePortfolio } from '../constants/api';
import { useNavigation } from '@react-navigation/native';

const Portfolio = () => {
  const [portfolios, setPortfolios] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [portfolioName, setPortfolioName] = useState('');
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  // Загрузка портфелей
  const loadPortfolios = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await getPortfolios(token);
      setPortfolios(response.data);
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось загрузить портфели');
    } finally {
      setLoading(false);
    }
  };

  // Создание портфеля
  const handleCreatePortfolio = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      await createPortfolio(token, portfolioName);
      await loadPortfolios();
      setModalVisible(false);
      setPortfolioName('');
    } catch (error) {
      Alert.alert('Ошибка', error.response?.data?.detail || 'Ошибка создания');
    }
  };

  useEffect(() => {
    loadPortfolios();
  }, []);

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => setModalVisible(true)}
      >
        <Icon name="plus" size={20} color="white" />
        <Text style={styles.buttonText}>Новый портфель</Text>
      </TouchableOpacity>

      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <FlatList
  data={portfolios}
  renderItem={({ item }) => (
    <View style={styles.portfolioCard}>
      {/* Область для перехода на детали */}
      <TouchableOpacity 
        style={styles.cardContent}
        onPress={() => navigation.navigate('PortfolioDetail', { portfolioId: item.id })}
      >
        <Text style={styles.title}>{item.name}</Text>
      </TouchableOpacity>

      {/* Кнопка удаления отдельно */}
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={async () => {
          try {
            const token = await AsyncStorage.getItem('userToken');
            await deletePortfolio(token, item.id);
            await loadPortfolios();
          } catch (error) {
            Alert.alert('Ошибка удаления');
          }
        }}
      >
        <Icon name="delete" size={20} color="red" />
      </TouchableOpacity>
    </View>
  )}
/>
      )}

      <Modal visible={modalVisible}>
        <View style={styles.modal}>
        <Text style={styles.modalTitle}>Создать Портфель</Text>
          <TextInput
            placeholder="Название портфеля"
            value={portfolioName}
            onChangeText={setPortfolioName}
            style={styles.input}
          />
          <TouchableOpacity style = {styles.addButton} 
          onPress={() => {
                    if (!portfolioName) {
                      Alert.alert("Ошибка", "Заполните все поля");
                      return;
                    }
                    handleCreatePortfolio();
                  }}>
          <Text style={styles.confirmButtonText}>Создать</Text>
          </TouchableOpacity>

          <TouchableOpacity style = {styles.cancelButton} onPress={() => setModalVisible(false)}>
          <Text style={styles.cancelText}>Отмена</Text>
          </TouchableOpacity>
          
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F5F6FA',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    flexDirection: 'row',
    backgroundColor: '#273AA4',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    marginLeft: 8,
    fontWeight: 'bold',
  },
  portfolioCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    flexDirection: 'row', // Располагаем элементы в строку
    justifyContent: 'space-between', // Разделяем контент и кнопку
    alignItems: 'center', // Выравниваем по центру
  },
  cardContent: {
    flex: 1, // Занимает всю доступную ширину кроме кнопки
  },
  portfolioName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  modal: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#F5F6FA',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    marginBottom: 20,
    borderRadius: 6,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  deleteButton: {
    marginLeft: 10,
    padding: 8,
  },
  confirmButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  cancelText: {
    color: 'red',
    fontWeight: 'bold',
  },
  cancelButton: {
    width: '100%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
});

export default Portfolio;
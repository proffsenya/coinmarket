import React, { useEffect, useState } from 'react';
import { View, Modal, Text, TextInput, FlatList,Button, StyleSheet, TouchableOpacity, Dimensions, ActivityIndicator, Alert } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import Icon from 'react-native-vector-icons/AntDesign';
import axios from 'axios';
import { addCryptoToPortfolio, getPortfolios } from '../constants/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const CryptoDetail = ({ route }) => {
  const [historicalData, setHistoricalData] = useState([]); // Исторические данные
  const [error, setError] = useState(null); // Состояние ошибки
  const { crypto } = route.params;
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [portfolios, setPortfolios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPortfolio, setSelectedPortfolio] = useState(null);

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

  // Добавление криптовалюты
  const handleAddCrypto = async (portfolioId) => {
    if (!quantity || !price) {
      Alert.alert('Ошибка', 'Заполните все поля');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('userToken');
      await addCryptoToPortfolio(
        token,
        portfolioId,
        {
          crypto_symbol: crypto.symbol,
          quantity: parseFloat(quantity),
          purchase_price: parseFloat(price)
        }
      );
      Alert.alert('Успешно', 'Криптовалюта добавлена!');
      setAddModalVisible(false);
    } catch (error) {
      Alert.alert('Ошибка', error.response?.data?.detail || 'Ошибка сервера');
    }
  };

  // Функция для загрузки исторических данных
  const fetchHistoricalData = async (symbol) => {
    try {
      const response = await axios.get(
        'https://min-api.cryptocompare.com/data/v2/histohour',
        {
          params: {
            fsym: symbol, // Символ криптовалюты (например, BTC)
            tsym: 'USD', // Целевая валюта (USD)
            limit: 24, // Количество точек данных (24 часа)
            toTs: Math.floor(Date.now() / 1000), // Текущее время в секундах
          },
        }
      );

      if (response.data.Data && response.data.Data.Data) {
        return response.data.Data.Data.map((item) => item.close); // Возвращаем цены закрытия
      } else {
        throw new Error('Данные не найдены');
      }
    } catch (err) {
      console.error('Ошибка при загрузке исторических данных:', err.message);
      return [];
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const historicalPrices = await fetchHistoricalData(crypto.symbol); // Используем символ криптовалюты
        setHistoricalData(historicalPrices);
      } catch (err) {
        setError(err.message || 'Ошибка при загрузке данных');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [crypto.symbol]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#273AA4" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Ошибка: {error}</Text>
      </View>
    );
  }

  // Подготовка данных для графика
  const chartData = {
    labels: historicalData.map((_, index) => `${index}:00`), // Временные метки
    datasets: [
      {
        data: historicalData, // Исторические данные о цене
        color: (opacity = 1) => `rgba(0, 128, 0, ${opacity})`, // Цвет графика
        strokeWidth: 3, // Толщина линии
      },
    ],
  };

  return (
    <View style={styles.container}>
      <Text style={styles.name}>{crypto.name} ({crypto.symbol})</Text>

      {/* График за 24 часа */}
      <LineChart
        data={chartData}
        width={width - 30}
        height={200}
        yAxisLabel="$"
        yAxisSuffix=""
        chartConfig={{
          backgroundColor: '#fff',
          backgroundGradientFrom: '#fff',
          backgroundGradientTo: '#fff',
          decimalPlaces: 2,
          color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          style: {
            borderRadius: 16,
          },
          propsForDots: {
            r: '0', // Убираем точки на графике
          },
          propsForLabels: {
            fontSize: 10, // Уменьшили размер шрифта
          },
          fillShadowGradientOpacity: 0.1, // Прозрачность заливки
          strokeWidth: 1, // Толщина линии
          useShadowColorFromDataset: false,
          formatYLabel: (value) => `$${Number(value).toFixed(0)}`, // Форматирование Y-меток
          
        }}
        bezier={false}
        withVerticalLabels={false}
        withInnerLines={true}
        withOuterLines={false}
        style={styles.chart}
      />

      {/* Цена */}
      <View style={styles.infoContainer}>
        <Text style={styles.label}>Цена:</Text>
        <Text style={styles.value}>${crypto.price}</Text>
      </View>

      {/* Процент изменения за 24 часа */}
      <View style={styles.infoContainer}>
        <Text style={styles.label}>Изменение за 24 часа:</Text>
        <Text
          style={[
            styles.value,
            crypto.percentChange24h >= 0 ? styles.positive : styles.negative,
          ]}
        >
          {crypto.percentChange24h}%
        </Text>
      </View>

      {/* Капитализация */}
      <View style={styles.infoContainer}>
        <Text style={styles.label}>Капитализация:</Text>
        <Text style={styles.value}>${crypto.marketCap}B</Text>
      </View>

      {/* Кнопка "Добавить в портфель" */}
      <TouchableOpacity 
    style={styles.addButton} 
    onPress={() => {
      setAddModalVisible(true);
      loadPortfolios(); // Загружаем портфели при открытии
    }}
  >
    <Icon name="plus" size={20} color="white" />
    <Text style={styles.addButtonText}>Добавить в портфель</Text>
  </TouchableOpacity>

  <Modal visible={addModalVisible} animationType="slide">
  <View style={styles.modal}>
    {/* Заголовок и поля ввода */}
    <View style={styles.centeredContent}>
      <Text style={styles.modalTitle}>Добавить в портфель</Text>
      
      <TextInput
        placeholder="Количество"
        value={quantity}
        onChangeText={(text) => {
          if (/^\d*\.?\d*$/.test(text) || text === '') {
            setQuantity(text);
          } else {
            Alert.alert('Ошибка', 'Введите числовое значение');
          }
        }}
        keyboardType="numeric"
        style={styles.input}
      />
      <TextInput
        placeholder="Цена покупки ($)"
        value={price}
        onChangeText={(text) => {
          if (/^\d*\.?\d*$/.test(text) || text === '') {
            setPrice(text);
          } else {
            Alert.alert('Ошибка', 'Введите числовое значение');
          }
        }}
        keyboardType="numeric"
        style={styles.input}
      />
    
      {/* Список портфелей с переносом строк */}
      <Text style={styles.filterTitle}>Портфели:</Text>
      <View style={styles.portfoliosContainer}>
        {portfolios.map((item) => (
          <TouchableOpacity
            key={item.id.toString()}
            style={[
              styles.filterButton,
              selectedPortfolio === item.id && styles.activeFilter
            ]}
            onPress={() => setSelectedPortfolio(item.id)}
          >
            <Text style={styles.filterText}>{item.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>

    {/* Кнопки действий */}
    <View style={styles.centeredContent}>
      <TouchableOpacity
        style={styles.confirmButton}
        onPress={() => {
          if (!selectedPortfolio || !quantity || !price) {
            Alert.alert("Ошибка", "Заполните все поля");
            return;
          }
          handleAddCrypto(selectedPortfolio);
        }}
      >
        <Text style={styles.confirmButtonText}>Добавить</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.cancelButton}
        onPress={() => setAddModalVisible(false)}
      >
        <Text style={styles.cancelText}>Отмена</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 70,
    backgroundColor: '#FCFDFF',
    flex: 1,
    padding: 16,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: 'red',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  chart: {
    marginVertical: 16,
    borderRadius: 16,
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    color: '#666',
  },
  value: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  positive: {
    color: 'green',
  },
  negative: {
    color: 'red',
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  addButton: {
    flexDirection: 'row',
    backgroundColor: '#273AA4',
    padding: 12,
    borderRadius: 8,
    marginTop:20,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    marginLeft: 8,
    fontWeight: 'bold',
  },
  modal: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: 'white',
  },
  centeredContent: {
    marginTop: 'auto',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#f8f9fa',
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 50,
  },
  filterTitle: {
    fontSize: 14,
    marginRight: 8,
    color: '#666',
  },
  filterButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: 'gray',
    marginRight: 8,
    height: 30,
  },
  activeFilter: {
    backgroundColor: '#273AA4',
  },
  filterText: {
    fontSize: 13,
    color: 'white',
  },
  confirmButton: {
    backgroundColor: '#273AA4',
    borderRadius: 8,
    padding: 12,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  confirmButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  cancelButton: {
    width: '100%',
    alignItems: 'center',
  },
  cancelText: {
    color: 'red',
    fontWeight: 'bold',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  portfoliosContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap', // Перенос на новую строку
    justifyContent: 'flex-start',
    marginTop: 10,
    width: '100%',
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'gray',
    marginRight: 8,
    marginBottom: 8, // Отступ снизу для переноса
    height: 30,
    minWidth: 60, // Минимальная ширина кнопки
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CryptoDetail;
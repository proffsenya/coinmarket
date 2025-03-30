import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Dimensions, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { LineChart } from 'react-native-chart-kit';

const { width } = Dimensions.get('window'); // Получаем ширину экрана

export default function Market() {
  const [cryptos, setCryptos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [limit, setLimit] = useState(10); // Используем число для фильтрации
  const [timeFilter, setTimeFilter] = useState('24h');

  const API_KEY = '1b845958-1738-405e-9ca0-7cbe1e5ba13d'; // Замените на ваш API-ключ

  const fetchCryptos = async () => {
    try {
      const response = await axios.get(
        'https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest',
        {
          headers: {
            'X-CMC_PRO_API_KEY': API_KEY,
          },
          params: {
            start: 1,
            limit: limit, // Используем текущее значение limit
            convert: 'USD',
          },
        }
      );

      setCryptos(response.data.data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) navigation.navigate('Login');
    };
    checkAuth();
  }, []);

  useEffect(() => {
    fetchCryptos();
  }, [limit, timeFilter]);

  // Функция для определения цвета графика
  const getChartColor = (percentChange) => {
    return percentChange > 0 ? 'green' : 'red';
  };

  // Функция для отображения процента изменения
  const renderPercentChange = (percentChange) => {
    return `${percentChange.toFixed(2)}%`;
  };

  const renderItem = ({ item, index }) => {
    const percentChange = item.quote.USD.percent_change_24h;
    const chartColor = getChartColor(percentChange);
  
    return (
      <View style={styles.tableRow}>
        {/* Номер */}
        <View style={[styles.tableCell, styles.centerContent, { flex: 0.5 }]}>
          <Text style={styles.cellText}>{index + 1}</Text>
        </View>
  
        {/* Валюта */}
        <View style={[styles.tableCell, styles.centerContent, { flex: 1.1 }]}>
          <Text style={styles.cellText}>{item.name}{`(${item.symbol})`}</Text>
          <Text style={styles.cellSubText}></Text>
          {/* Добавляем рыночную капитализацию */}
          <Text style={styles.marketCapText}>
            ${(item.quote.USD.market_cap / 1e9).toFixed(2)}B {/* Форматируем в миллиарды */}
          </Text>
        </View>
  
        {/* Цена */}
        <View style={[styles.tableCell, styles.centerContent, { flex: 1.5 }]}>
          <Text style={styles.cellText}>${item.quote.USD.price.toFixed(2)}</Text>
        </View>
  
        {/* График */}
        <View style={[styles.tableCell, styles.centerContent, { flex: 1.9 }]}>
          <LineChart
            data={{
              labels: [], // Убрали метки оси X
              datasets: [
                {
                  data: [
                    item.quote.USD.percent_change_1h,
                    item.quote.USD.percent_change_24h,
                    item.quote.USD.percent_change_7d,
                  ],
                },
              ],
            }}
            width={200} // Увеличили ширину графика
            height={80} // Увеличили высоту графика
            withDots={false}
            withShadow={false}
            withInnerLines={false}
            withOuterLines={false}
            fromZero // Начинаем график с нуля
            chartConfig={{
              backgroundGradientFrom: '#FCFDFF',
              backgroundGradientTo: '#FCFDFF',
              color: (opacity = 1) => chartColor, // Цвет графика в зависимости от изменения цены
              strokeWidth: 2,
              propsForLabels: {
                fontSize: 0, // Убрали цифры слева (метки оси Y)
              },
              withVerticalLabels: false,
            }}
            bezier
          />
          <Text style={[styles.percentChangeText, { color: chartColor }]}>
            {renderPercentChange(percentChange)}
          </Text>
        </View>
      </View>
    );
  };

  // Заголовки таблицы
  const renderTableHeader = () => (
    <View style={styles.tableHeader}>
      <Text style={[styles.headerText, { flex: 0.5 }]}>№</Text>
      <Text style={[styles.headerText, { flex: 1 }]}>Валюта</Text>
      <Text style={[styles.headerText, { flex: 1 }]}>Цена</Text>
      <Text style={[styles.headerText, { flex: 2 }]}>График</Text>
    </View>
  );

  // Фильтры по количеству криптовалют
  const renderLimitFilters = () => (
    <View style={styles.filterContainer}>
      {[10, 50, 100].map((num) => ( // Убрали 200
        <TouchableOpacity
          key={num}
          style={[styles.filterButton, limit === num && styles.activeFilter]}
          onPress={() => setLimit(num)}
        >
          <Text style={styles.filterText}>{num}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#273AA4" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Ошибка: {error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Фильтры по количеству криптовалют */}
      {renderLimitFilters()}

      {/* Заголовки таблицы */}
      {renderTableHeader()}

      {/* Список криптовалют в виде таблицы */}
      <FlatList
        data={cryptos}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FCFDFF',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom:90,
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  filterTitle: {
    fontSize: 14, // Уменьшили размер текста
    marginRight: 8,
  },
  filterButton: {
    paddingHorizontal: 10, // Уменьшили отступы
    paddingVertical: 5, // Уменьшили отступы
    borderRadius: 8,
    backgroundColor: 'gray',
    marginRight: 8,
  },
  activeFilter: {
    backgroundColor: '#273AA4',
  },
  filterText: {
    fontSize: 12, // Уменьшили размер текста
    color: 'white',
  },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#FCFDFF',
  },
  headerText: {
    fontSize: 14, // Уменьшили размер текста
    fontWeight: 'bold',
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8, // Уменьшили отступы
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    width: width, // Таблица на всю ширину экрана
  },
  tableCell: {
    alignItems: 'center',
    justifyContent: 'center', // Выравнивание по центру
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center', // Выравнивание по центру
  },
  cellText: {
    fontSize: 14, // Уменьшили размер текста
    fontWeight: 'bold',
  },
  cellSubText: {
    fontSize: 12, // Уменьшили размер текста
    color: '#666',
  },
  percentChangeText: {
    fontSize: 12, // Уменьшили размер текста
    marginTop: 4,
  },
  loadingContainer: {
    bottom:61,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16, // Уменьшили размер текста
    color: 'red',
  },
  marketCapText: {
    fontSize: 12, // Уменьшили размер текста
    color: '#666',
    marginTop: 4, // Отступ сверху
  },
});
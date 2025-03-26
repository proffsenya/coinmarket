import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRoute } from '@react-navigation/native';



const PortfolioDetail = () => {
  const [portfolio, setPortfolio] = useState(null);
  const [prices, setPrices] = useState({}); // Текущие цены криптовалют
  const [loading, setLoading] = useState(true);
  const route = useRoute();
  const { portfolioId } = route.params;


  // Загрузка данных портфеля
  const loadPortfolio = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await axios.get(
        `http://localhost:8000/portfolios/${portfolioId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPortfolio(response.data);
    } catch (error) {
      console.error('Ошибка:', error);
    } finally {
      setLoading(false);
    }
  };

  // Расчет общей стоимости
  const getTotalValue = () => {
    if (!portfolio) return 0;
    return portfolio.cryptos.reduce((total, crypto) => {
      return total + crypto.purchase_price * crypto.quantity;
    }, 0).toFixed(2);
  };

  useEffect(() => {
    loadPortfolio();
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" style={styles.loader} />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{portfolio.name}</Text>
      <Text style={styles.total}>
        Общая стоимость: ${getTotalValue()} (на основе цен покупки)
      </Text>

      <FlatList
        data={portfolio.cryptos}
        keyExtractor={(item, index) => `${item.crypto_symbol}_${index}`}
        renderItem={({ item }) => (
          <View style={styles.cryptoItem}>
            <Text style={styles.symbol}>{item.crypto_symbol}</Text>
            <Text>Количество: {item.quantity}</Text>
            <Text>Цена покупки: ${item.purchase_price.toFixed(2)}</Text>
            <Text>Стоимость: ${(item.quantity * item.purchase_price).toFixed(2)}</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  total: {
    fontSize: 18,
    marginBottom: 20,
  },
  cryptoItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  symbol: {
    fontSize: 18,
    fontWeight: '500',
  },
  change: {
    fontSize: 16,
    marginTop: 4,
  },
  positive: {
    color: 'green',
  },
  negative: {
    color: 'red',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
  },
});

export default PortfolioDetail;
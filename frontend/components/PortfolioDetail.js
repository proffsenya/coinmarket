import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  ActivityIndicator, 
  TouchableOpacity, 
  Alert 
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRoute, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/AntDesign';
import { deleteCryptoFromPortfolio } from '../constants/api';

const PortfolioDetail = () => {
  const [portfolio, setPortfolio] = useState(null);
  const [prices, setPrices] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const route = useRoute();
  const navigation = useNavigation();
  const { portfolioId } = route.params;

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = await AsyncStorage.getItem('userToken');
      const portfolioRes = await axios.get(
        `http://localhost:8000/portfolios/${portfolioId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPortfolio(portfolioRes.data);

      if (portfolioRes.data.cryptos.length > 0) {
        const symbols = portfolioRes.data.cryptos
          .map(c => c.crypto_symbol.toUpperCase())
          .join(',');

        const pricesRes = await axios.get(
          'https://pro-api.coinmarketcap.com/v2/cryptocurrency/quotes/latest',
          {
            params: { symbol: symbols },
            headers: { 
              'X-CMC_PRO_API_KEY': '1b845958-1738-405e-9ca0-7cbe1e5ba13d',
              'Accept': 'application/json'
            }
          }
        );

        const pricesData = {};
        Object.values(pricesRes.data.data).forEach(cryptoArray => {
          const cryptoData = cryptoArray[0];
          const symbol = cryptoData.symbol.toUpperCase();
          const portfolioCrypto = portfolioRes.data.cryptos
            .find(c => c.crypto_symbol.toUpperCase() === symbol);

          if (portfolioCrypto) {
            const currentPrice = cryptoData.quote.USD.price;
            const purchasePrice = portfolioCrypto.purchase_price;
            const quantity = portfolioCrypto.quantity;
            const changePercent = ((currentPrice - purchasePrice) / purchasePrice * 100).toFixed(2);
            const valueDifference = (currentPrice - purchasePrice) * quantity;

            pricesData[symbol] = {
              currentPrice,
              purchasePrice,
              quantity,
              changePercent,
              valueDifference: valueDifference.toFixed(2),
              currentValue: (currentPrice * quantity).toFixed(2)
            };
          }
        });
        setPrices(pricesData);
      }

    } catch (err) {
      console.error('Ошибка:', err);
      setError(err.message || 'Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = (type = 'current') => {
    if (!portfolio) return 0;
    return portfolio.cryptos.reduce((total, crypto) => {
      const symbol = crypto.crypto_symbol.toUpperCase();
      const price = type === 'current' 
        ? prices[symbol]?.currentPrice 
        : crypto.purchase_price;
      return total + (price || 0) * crypto.quantity;
    }, 0).toFixed(2);
  };

  const calculatePortfolioChange = () => {
    const currentTotal = parseFloat(calculateTotal('current'));
    const purchaseTotal = parseFloat(calculateTotal('purchase'));
    
    if (purchaseTotal === 0) return '0.00';
    
    const change = ((currentTotal - purchaseTotal) / purchaseTotal) * 100;
    return change.toFixed(2);
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#273AA4" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <Text style={styles.retry} onPress={loadData}>Попробовать снова</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{portfolio.name}</Text>
      
      <View style={styles.portfolioSummary}>
        <Text style={styles.summaryLabel}>Общая динамика портфеля:</Text>
        <Text style={[
          styles.summaryPercentage,
          calculatePortfolioChange() >= 0 ? styles.positive : styles.negative
        ]}>
          {calculatePortfolioChange()}%
        </Text>
      </View>

      {portfolio.cryptos.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Ваш портфель пустой</Text>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => navigation.navigate('Search')}
          >
            <Icon name="plus" size={20} color="white" />
            <Text style={styles.buttonText}>Добавить валюту</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <View style={styles.summaryContainer}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Текущая стоимость</Text>
              <Text style={styles.summaryValue}>${calculateTotal('current')}</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Стоимость покупки</Text>
              <Text style={styles.summaryValue}>${calculateTotal('purchase')}</Text>
            </View>
          </View>

          <FlatList
            data={portfolio.cryptos}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => {
              const symbol = item.crypto_symbol.toUpperCase();
              const cryptoData = prices[symbol] || {};

              return (
                <View style={styles.cryptoCard}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.symbol}>{symbol}</Text>
                    <View style={styles.priceContainer}>
                      <Text style={styles.currentPrice}>
                        ${cryptoData.currentPrice?.toFixed(2) || '—'}
                      </Text>
                      <Text style={[
                        styles.changePercent,
                        cryptoData.changePercent >= 0 ? styles.positive : styles.negative
                      ]}>
                        {cryptoData.changePercent || '0.00'}%
                      </Text>
                    </View>
                  </View>

                  <View style={styles.details}>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Количество:</Text>
                      <Text style={styles.detailValue}>{item.quantity}</Text>
                    </View>
                    
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Цена покупки:</Text>
                      <Text style={styles.detailValue}>
                        ${item.purchase_price.toFixed(2)}
                      </Text>
                    </View>

                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Прибыль/убыток:</Text>
                      <Text style={[
                        styles.detailValue,
                        cryptoData.changePercent >= 0 ? styles.positive : styles.negative
                      ]}>
                        ${cryptoData.valueDifference || '—'}
                      </Text>
                    </View>
                  </View>


                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={async () => {
                      try {
                        const token = await AsyncStorage.getItem('userToken');
                        await deleteCryptoFromPortfolio(token, portfolioId, item.id);
                        await loadData();
                      } catch (error) {
                        Alert.alert('Ошибка удаления');
                      }
                    }}
                  >
                    <Text style={styles.cancelText}>Удалить</Text>
                  </TouchableOpacity>
                </View>
              );
            }}
          />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F5F6FA',
    paddingTop: 70,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#FF4D4F',
    marginBottom: 10,
    textAlign: 'center',
  },
  retry: {
    color: '#273AA4',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1C22',
    marginBottom: 16,
  },
  portfolioSummary: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  summaryPercentage: {
    fontSize: 18,
    fontWeight: '700',
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 8,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flex: 1,
    elevation: 2,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#273AA4',
    marginTop: 4,
  },
  cryptoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    position: 'relative',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  symbol: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1C22',
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  currentPrice: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1A1C22',
  },
  changePercent: {
    fontSize: 14,
    fontWeight: '500',
  },
  positive: {
    color: '#10B981',
  },
  negative: {
    color: '#EF4444',
  },
  details: {
    marginTop: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  detailLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1A1C22',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    fontSize: 18,
    color: '#6B7280',
    marginBottom: 20,
  },
  addButton: {
    flexDirection: 'row',
    backgroundColor: '#273AA4',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    marginLeft: 8,
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
});

export default PortfolioDetail;
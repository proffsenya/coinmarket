import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TextInput, Dimensions, TouchableOpacity, Platform } from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/AntDesign';

const { width } = Dimensions.get('window'); // Получаем ширину экрана

const Search = ({ searchQuery }) => {
  const [cryptoList, setCryptoList] = useState([]);
  const [filteredCryptoList, setFilteredCryptoList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchText, setSearchText] = useState(''); // Состояние для текста поиска
  const navigation = useNavigation();

  // Загрузка списка криптовалют с CoinMarketCap API
  useEffect(() => {
    const fetchCryptoList = async () => {
      try {
        const response = await axios.get('https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest', {
          headers: {
            'X-CMC_PRO_API_KEY': '1b845958-1738-405e-9ca0-7cbe1e5ba13d', // Замените на ваш API-ключ
          },
          params: {
            start: 1, // Начальная позиция в списке
            limit: 100, // Лимит криптовалют (можно увеличить)
            convert: 'USD', // Конвертация в USD
          },
        });

        const data = response.data.data.map((crypto) => ({
          id: crypto.id.toString(),
          name: crypto.name,
          symbol: crypto.symbol,
          price: crypto.quote.USD.price.toFixed(2),
          percentChange24h: crypto.quote.USD.percent_change_24h.toFixed(2),
          marketCap: crypto.quote.USD.market_cap.toFixed(2), // Рыночная капитализация
        }));

        setCryptoList(data);
        setFilteredCryptoList(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchCryptoList();
  }, []);

  // Фильтрация списка криптовалют по поисковому запросу
  useEffect(() => {
    if (searchText) {
      const filtered = cryptoList.filter((crypto) =>
        crypto.name.toLowerCase().includes(searchText.toLowerCase()) ||
        crypto.symbol.toLowerCase().includes(searchText.toLowerCase())
      );
      setFilteredCryptoList(filtered);
    } else {
      setFilteredCryptoList(cryptoList);
    }
  }, [searchText, cryptoList]);

  // Обработка нажатия на криптовалюту
  const handleCryptoPress = (crypto) => {
    navigation.navigate('CryptoDetail', { crypto });
  };

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
        <Text style={styles.error}>Ошибка: {error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Строка поиска с иконкой лупы и закруглением */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Icon name="search1" size={20} color="gray" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Поиск криптовалюты..."
            placeholderTextColor="#999"
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>
        {searchText.length > 0 && (
          <TouchableOpacity onPress={() => setSearchText('')} style={styles.clearButton}>
            <Icon name="close" size={20} color="gray" />
          </TouchableOpacity>
        )}
      </View>

      {/* Список криптовалют */}
      <FlatList
        data={filteredCryptoList}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleCryptoPress(item)}>
            <View style={styles.item}>
              <View style={styles.cryptoInfo}>
                <Text style={styles.name}>{item.name} ({item.symbol})</Text>
              </View>
              <View style={styles.priceInfo}>
                <Text style={styles.price}>${item.price}</Text>
                <Text style={[styles.percentChange, item.percentChange24h >= 0 ? styles.positive : styles.negative]}>
                  {item.percentChange24h}%
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F5F6FA',
    paddingTop: 70,
    flex: 1,
  },
  searchContainer: {
    borderColor: 'black',
    paddingBottom: 40,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    width: width, // Занимает всю ширину экрана
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 25, // Закругление 50%
    paddingHorizontal: 16,
    paddingVertical: 8,
    flex: 1,

    // Тень для iOS
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 4, // Тень снизу для Android
      },
    }),
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#000',
  },
  clearButton: {
    marginLeft: 8,
  },
  item: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: width, // Занимает всю ширину экрана
  },
  cryptoInfo: {
    flex: 1,
  },
  priceInfo: {
    alignItems: 'flex-end',
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  percentChange: {
    fontSize: 14,
  },
  positive: {
    color: 'green',
  },
  negative: {
    color: 'red',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  error: {
    color: 'red',
    fontSize: 16,
  },
});

export default Search;
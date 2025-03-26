import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/AntDesign';

export default function Footer({ activeTab, onTabPress }) {

  return (
    <View style={styles.footer}>
      {/* Кнопка Market */}
      <TouchableOpacity
        style={styles.footerButton}
        onPress={() => onTabPress('Market')}
      >
        <Icon
          name="shoppingcart"
          size={24}
          color={activeTab === 'Market' ? '#273AA4' : 'gray'}
        />
        <Text
          style={[
            styles.footerText,
            { color: activeTab === 'Market' ? '#273AA4' : 'black' },
          ]}
        >
          Маркет
        </Text>
      </TouchableOpacity>

      {/* Кнопка Search */}
      <TouchableOpacity
        style={styles.footerButton}
        onPress={() => onTabPress('Search')}
      >
        <Icon
          name="search1"
          size={24}
          color={activeTab === 'Search' ? '#273AA4' : 'gray'}
        />
        <Text
          style={[
            styles.footerText,
            { color: activeTab === 'Search' ? '#273AA4' : 'black' },
          ]}
        >
          Поиск
        </Text>
      </TouchableOpacity>

      {/* Кнопка Portfolio */}
      <TouchableOpacity
        style={styles.footerButton}
        onPress={() => onTabPress('Portfolio')}
      >
        <Icon
          name="piechart"
          size={24}
          color={activeTab === 'Portfolio' ? '#273AA4' : 'gray'}
        />
        <Text
          style={[
            styles.footerText,
            { color: activeTab === 'Portfolio' ? '#273AA4' : 'black' },
          ]}
        >
          Портфель
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    backgroundColor: '#FCFDFF',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 30,

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
  footerButton: {
    alignItems: 'center',
  },
  footerText: {
    marginTop: 4,
    fontSize: 12,
  },
});
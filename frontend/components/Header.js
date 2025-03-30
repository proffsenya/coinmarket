import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Dimensions, TextInput } from 'react-native';
import Icon from 'react-native-vector-icons/AntDesign';
import Modal from 'react-native-modal';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../components/AuthContext';

const { width } = Dimensions.get('window');

export default function Header({ activeTab, onSearch }) {
  const navigation = useNavigation();
  const { user, logout } = useAuth();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [searchText, setSearchText] = useState('');

  const getHeaderText = () => {
    switch (activeTab) {
      case 'Market': return 'Маркет';
      case 'Search': return 'Поиск';
      case 'Portfolio': return 'Портфолио';
      default: return 'Маркет';
    }
  };

  const renderProfileContent = () => (
    <View style={styles.profileContent}>
      <View style={styles.profileHeader}>
        <View style={styles.profileCircleLarge}>
          <Icon name="user" size={40} color="white" />
        </View>
        <Text style={styles.userEmail}>{user?.email}</Text>
        <Text style={styles.userNickname}>{user?.nickname}</Text>
      </View>
      
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={() => {
          logout();
          setIsModalVisible(false);
        }}
      >
        <Text style={styles.logoutButtonText}>Выйти</Text>
      </TouchableOpacity>
    </View>
  );

  const renderAuthButtons = () => (
    <>
      <TouchableOpacity
        style={styles.authButton}
        onPress={() => {
          setIsModalVisible(false);
          navigation.navigate('Login');
        }}
      >
        <Text style={styles.authButtonText}>Войти</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.authButton}
        onPress={() => {
          setIsModalVisible(false);
          navigation.navigate('Register');
        }}
      >
        <Text style={styles.authButtonText}>Регистрация</Text>
      </TouchableOpacity>
    </>
  );

  return (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>{getHeaderText()}</Text>

      <View style={styles.iconsWrapper}>
        {activeTab === 'Search' && (
          <>
            {showSearchInput ? (
              <TextInput
                style={styles.searchInput}
                placeholder="Поиск..."
                value={searchText}
                onChangeText={(text) => {
                  setSearchText(text);
                  onSearch?.(text);
                }}
                autoFocus
                onBlur={() => setShowSearchInput(false)}
              />
            ) : (
              <TouchableOpacity onPress={() => setShowSearchInput(true)}>
                <Icon name="search1" size={24} color="#666" />
              </TouchableOpacity>
            )}
          </>
        )}

        <TouchableOpacity onPress={() => setIsModalVisible(true)}>
          <View style={styles.profileIcon}>
            <Icon name="user" size={24} color="white" />
          </View>
        </TouchableOpacity>
      </View>

      <Modal
        isVisible={isModalVisible}
        onBackdropPress={() => setIsModalVisible(false)}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        backdropOpacity={0.4}
        style={styles.modal}
      >
        <View style={styles.modalContent}>
          {user ? renderProfileContent() : renderAuthButtons()}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#F5F6FA',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 70,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2A2A2A',
  },
  iconsWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  profileIcon: {
    backgroundColor: '#273AA4',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchInput: {
    width: 150,
    height: 40,
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 10,
    backgroundColor: 'white',
  },
  modal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  modalContent: {
    backgroundColor: '#F5F6FA',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    minHeight: 300,
  },
  profileContent: {
    alignItems: 'center',
    gap: 20,
  },
  profileHeader: {
    alignItems: 'center',
    gap: 12,
  },
  profileCircleLarge: {
    backgroundColor: '#273AA4',
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userEmail: {
    fontSize: 18,
    fontWeight: '500',
    color: '#333',
  },
  userNickname: {
    fontSize: 16,
    color: '#666',
  },
  logoutButton: {
    backgroundColor: '#FF4444',
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  authButton: {
    backgroundColor: '#F0F0F0',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
  },
  authButtonText: {
    color: '#273AA4',
    fontSize: 16,
    fontWeight: '600',
  },
});
import React, { useContext, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthProvider, useAuth } from './components/AuthContext';
import Header from './components/Header';
import Footer from './components/Footer';
import Market from './components/Market';
import Search from './components/Search';
import Portfolio from './components/Portfolio';
import Login from './components/Login';
import Register from './components/Register';
import CryptoDetail from './components/CryptoDetail';
import PortfolioDetail from './components/PortfolioDetail';

const Stack = createStackNavigator();

const MainScreen = ({ handleSearch, handleTabPress, activeTab }) => {
  const renderContent = () => {
    switch(activeTab) {
      case 'Market': return <Market />;
      case 'Search': return <Search />;
      case 'Portfolio': return <Portfolio />;
      default: return <Market />;
    }
  };

  return (
    <View style={styles.container}>
      {activeTab !== 'Search' && <Header activeTab={activeTab} onSearch={handleSearch} />}
      <View style={styles.content}>{renderContent()}</View>
      <Footer activeTab={activeTab} onTabPress={handleTabPress} />
    </View>
  );
};

function MainApp() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('Market');
  const [searchQuery, setSearchQuery] = useState('');

  const handleTabPress = (tabName) => setActiveTab(tabName);
  const handleSearch = (query) => setSearchQuery(query);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        <>
          <Stack.Screen name="Main">
            {() => (
              <MainScreen 
                handleSearch={handleSearch}
                handleTabPress={handleTabPress}
                activeTab={activeTab}
              />
            )}
          </Stack.Screen>
          <Stack.Screen name="CryptoDetail" component={CryptoDetail} />
          <Stack.Screen name="PortfolioDetail" component={PortfolioDetail} />
        </>
      ) : (
        <>
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="Register" component={Register} />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <MainApp />
      </NavigationContainer>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FCFDFF',
  },
  content: {
    flex: 1,
  },
});
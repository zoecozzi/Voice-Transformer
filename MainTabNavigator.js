import * as React from 'react'
import { Image } from 'react-native'
import { NavigationContainer } from '@react-navigation/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import HomeScreen from './HomeScreen';
import RecordScreen from './RecordScreen';
import RaveScreen from './RaveScreen';

// Création de la navigation principale
const Tab = createBottomTabNavigator()
export default function MainTabNavigator() {
    return (
        <NavigationContainer>
            <Tab.Navigator
                tabBarOptions={
                    {
                        activeTintColor: '#b777e1',
                        inactiveTintColor: 'gray',
                        labelPosition: 'below-icon'
                    }
                }>
                <Tab.Screen
                /* Ajout des écrans dans la navigation principale */
                    name='Connexion'
                    component={HomeScreen}
                    options={{
                        tabBarIcon: ({ color, size }) => (
                            <MaterialCommunityIcons name="login" size={size} color={color} />
                        ),
                        headerTitle: () => (
                            <Image
                              source={require('./assets/logo.png')}
                              style={{ width: 80, height: 40 }} 
                            />
                          ),
                    }}
                />
                <Tab.Screen
                    /* Ajout des écrans dans la navigation principale */
                    name='Enregistrement'
                    component={RecordScreen}
                    options={{
                        tabBarIcon: ({ color, size }) => (
                            <MaterialCommunityIcons name="microphone" size={size} color={color} />
                        ),
                        headerTitle: () => (
                            <Image
                              source={require('./assets/logo.png')}
                              style={{ width: 80, height: 40 }} 
                            />
                          ),
                    }}
                />
                
                <Tab.Screen
                /* Ajout des écrans dans la navigation principale */
                    name='Transformation'
                    component={RaveScreen}
                    options={{
                        tabBarIcon: ({ color, size }) => (
                            <MaterialCommunityIcons name="music" size={size} color={color} />
                        ),
                        headerTitle: () => (
                            <Image
                              source={require('./assets/logo.png')}
                              style={{ width: 80, height: 40 }} 
                            />
                          ),
                    }}
                />
            </Tab.Navigator>
        </NavigationContainer>
    )
}
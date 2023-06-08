import React from 'react';
import { View, Text, TextInput, Button, Image, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from "axios";
import { useDispatch, useSelector } from 'react-redux';


const HomeScreen = () => {
    const dispatch = useDispatch();
    const serverIP = useSelector((state) => state.serverIP);
    const serverPort = useSelector((state) => state.serverPort);
    const navigation = useNavigation();


    const testConnection = async () => {
        if (serverIP.trim() === '' || serverPort.trim() === '') {
            alert('Veuillez saisir l\'adresse IP et le port');
            return;
        }
        axios
            .get(`http://${serverIP}:${serverPort}`)
            .then(() => {
                alert('Connexion réussie !');
                navigation.navigate('Enregistrement');
            })
            .catch((error) => {
                console.log(error);
                alert("La connexion a échoué");
            });
    };

    return (
        <View style={styles.container}>
            <Image source={require('./assets/logo.png')} style={{ width: 290, height: 200, marginTop: 20, }} />
            <Text style={styles.subtitle}>Veuillez saisir les informations du serveur :</Text>

            <View style={styles.inputContainer}>
                <Text style={styles.label}>Adresse IP du serveur :</Text>
                <TextInput
                    value={serverIP}
                    onChangeText={(text) =>
                        dispatch({ type: "SET_SERVER_IP", payload: text })}
                    placeholder="Adresse IP"
                    style={styles.input}
                />
            </View>

            <View style={styles.inputContainer}>
                <Text style={styles.label}>Port du serveur :</Text>
                <TextInput
                    value={serverPort}
                    onChangeText={(text) =>
                        dispatch({ type: "SET_SERVER_PORT", payload: text })
                    }
                    placeholder="Port"
                    keyboardType="numeric"
                    style={styles.input}
                />
            </View>

            <View style={styles.buttonContainer}><Button color="white" title="Tester la connexion" onPress={testConnection} /></View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    subtitle: {
        fontSize: 16,
        marginTop: 20,
        textAlign: 'center',
    },
    buttonContainer: {
        backgroundColor: '#7f54c9',
        borderRadius: 4,
        paddingVertical: 12,
        marginBottom: 130,
        paddingHorizontal: 24,
        alignItems: 'center',
    },
    inputContainer: {
        width: '100%',
    },
    label: {
        marginBottom: 5,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        width: '100%',
    },
});

export default HomeScreen;

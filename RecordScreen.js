import React, { useState, useEffect } from 'react';
import { View, Button, FlatList, Text, StyleSheet, Alert, TextInput, Modal, TouchableHighlight, TouchableOpacity } from 'react-native';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';

const RecordScreen = () => {
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [sound, setSound] = useState(null);
  const [recordings, setRecordings] = useState([]);
  const [counter, setCounter] = useState(1);
  const [soundUri, setSoundUri] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newName, setNewName] = useState('');

  useEffect(() => {
    loadRecordings();
  }, []);

  /* Permet de démarrer un enregistrement */
  const startRecording = async () => {
    try {
      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) {
        console.log('Permission refusée pour l\'enregistrement audio');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY);

      setRecording(recording);
      setIsRecording(true);
    } catch (error) {
      console.log('Échec du démarrage de l\'enregistrement', error);
    }
  };

  /* Permet d'arrêter un enregistrement */
  const stopRecording = async () => {
    try {
      await recording.stopAndUnloadAsync();
      const info = await FileSystem.getInfoAsync(recording.getURI());
      const newRecording = { uri: info.uri, name: `Enregistrement ${counter}` };
      setCounter(counter + 1);

      setRecordings([...recordings, newRecording]);
      setRecording(null);
      setIsRecording(false);
    } catch (error) {
      console.log('Échec de l\'arrêt de l\'enregistrement', error);
    }
  };

  /* Permet d'écouter un enregistrement */
  const playRecording = async (recordingUri) => {
    try {
      setIsPlaying(true);
      if (sound) {
        await sound.unloadAsync();
      }
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
      });
      const { sound: newSound } = await Audio.Sound.createAsync({ uri: recordingUri }, { shouldPlay: true });

      setSoundUri(recordingUri);

      newSound.setOnPlaybackStatusUpdate((playbackStatus) => {
        if (playbackStatus.didJustFinish) {
          setIsPlaying(false);
          setSound(null);
          setSoundUri(null);
        }
      });
    } catch (error) {
      console.log('Échec de la lecture de l\'enregistrement', error);
    }
  };

  /* Permet de mettre en pause un enregistrement */
  const pauseRecording = async (recordingUri) => {
    try {
      await recordingUri.stopAsync();
      setIsPlaying(false);
      setIsPaused(true);
      setSound(null);
      setSoundUri(null);
    } catch (error) {
      console.log('Échec de la mise en pause de l\'enregistrement', error);
    }
  };

  /* Permet de sauvegarder un enregistrement */
  const saveRecording = async (recordingUri, recordingName) => {
    try {
      const downloadDir = FileSystem.documentDirectory + 'myRecords/';
      const downloadPath = downloadDir + recordingName.replace(/\s+/g, '') + '.wav';

      const dirInfo = await FileSystem.getInfoAsync(downloadDir);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(downloadDir, { intermediates: true });
      }

      await FileSystem.copyAsync({ from: recordingUri, to: downloadPath });
      alert("L'enregistrement a été effectué avec succès!");


      loadRecordings();
    } catch (error) {
      console.log("Échec de la sauvegarde de l'enregistrement", error);
      alert("Une erreur est survenue lors du téléchargement de l'enregistrement. Veuillez réessayer.");
    }
  };

  /* Permet de supprimer les enregistrements */
  const deleteRecording = (recordingUri) => {
    Alert.alert(
      'Confirmation de suppression',
      'Êtes-vous sûr de vouloir supprimer cet enregistrement ?',
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await FileSystem.deleteAsync(recordingUri);
              const updatedRecordings = recordings.filter((recording) => recording.uri !== recordingUri);
              setRecordings(updatedRecordings);
            } catch (error) {
              console.log('Échec de la suppression de l\'enregistrement', error);
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

  const openModal = (recordingUri) => {
    setNewName('');
    setIsModalOpen(true);
    setSoundUri(recordingUri);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  /* Permet de renommer un enregistrement */
  const updateRecordingName = (recordingUri, newName) => {
    const updatedRecordings = recordings.map((recording) => {
      if (recording.uri === recordingUri) {
        return { ...recording, name: newName };
      }
      return recording;
    });
    setRecordings(updatedRecordings);
    closeModal();
  };

  const loadRecordings = async () => {
    try {
      const dirInfo = await FileSystem.getInfoAsync(FileSystem.documentDirectory + 'myRecords/');
      if (dirInfo.exists) {
        const files = await FileSystem.readDirectoryAsync(FileSystem.documentDirectory + 'myRecords/');
        const recordingsInfo = await Promise.all(
          files.map(async (file) => {
            const fileInfo = await FileSystem.getInfoAsync(FileSystem.documentDirectory + 'myRecords/' + file);
            return {
              name: file.split('.')[0],
              uri: fileInfo.uri,
            };
          })
        );

        setRecordings(recordingsInfo);
      }
    } catch (error) {
      console.log('loadRecordings erreurs', error);
    }
  };

  const renderStartRecordingButton = () => {
    const buttonStyles = [styles.recordButton, isRecording && styles.recordingButtonActive];
    const buttonTextStyles = [styles.recordButtonText, isRecording && styles.recordingButtonTextActive];

    return (
      <TouchableOpacity style={buttonStyles} onPress={isRecording ? stopRecording : startRecording}>
        <Text style={buttonTextStyles}>{isRecording ? 'Stopper' : 'Enregister'}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={recordings}
        keyExtractor={(item) => item.uri}
        renderItem={({ item }) => (
          <View style={styles.recordingContainer}>
            <Text style={styles.recordingName}>{item.name}</Text>
            <View style={styles.buttonGroup}>
              <TouchableHighlight onPress={() => {!isPlaying ? playRecording(item.uri) : pauseRecording(item.uri)}} underlayColor="transparent">
                <Feather name="play" size={30} color="#000" />
              </TouchableHighlight>
              <TouchableOpacity onPress={() => deleteRecording(item.uri)} underlayColor="transparent">
                <MaterialCommunityIcons name="trash-can" size={30} color="#000" />
              </TouchableOpacity>
              <TouchableHighlight onPress={() => openModal(item.uri)} underlayColor="transparent">
                <Feather name="edit" size={30} color="#000" />
              </TouchableHighlight>
            </View>
            <Button title="Télécharger" onPress={() => saveRecording(item.uri, item.name)} />
            
          </View>
        )}
      />
      {isModalOpen && (
        <Modal animationType="slide" transparent={true}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Nouveau nom :</Text>
              <TextInput
                style={styles.input}
                onChangeText={(text) => setNewName(text)}
                placeholder="Saisir un nouveau nom"
              />
              <View style={styles.modalButtonGroup}>
                <Button title="Annuler" onPress={closeModal} />
                <Button title="Sauvegarder" onPress={() => updateRecordingName(soundUri, newName)} />
              </View>
            </View>
          </View>
        </Modal>
      )}
      <View style={styles.buttonContainer}>{renderStartRecordingButton()}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContainer: {
    marginBottom: 10,
  },
  recordButton: {
    marginTop: 10,
    backgroundColor: '#7f54c9',
    borderRadius: 4,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  recordingButtonActive: {
    backgroundColor: '#4d3c60',
  },
  recordButtonText: {
    color: '#FFF',
    fontSize: 18,
  },
  recordingButtonTextActive: {
    color: '#FFF',
  },
  recordingContainer: {
    backgroundColor: '#FFF',
    padding: 10,
    borderRadius: 8,
    marginTop: 5,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  recordingName: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: 300,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 8,
    width: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 4,
    padding: 10,
    marginBottom: 10,
  },
  modalButtonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});

export default RecordScreen;


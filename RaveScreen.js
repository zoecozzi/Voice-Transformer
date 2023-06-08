import React, { useState, useEffect } from 'react';
import { View, Text, Button, ActivityIndicator, StyleSheet,TouchableHighlight, FlatList, TouchableOpacity } from 'react-native';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import * as FileSystem from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';
import { Audio } from 'expo-av';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useAssets } from "expo-asset";
import { useDispatch, useSelector } from "react-redux";
import SelectDropdown from 'react-native-select-dropdown';
import axios from "axios";
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import * as Sharing from 'expo-sharing';

/* Section de l'audio présent dans le fichier asset */
const DefaultSoundScreen = () => {
  const [assets, error] = useAssets([require("./assets/demo1.wav")]);
  const [selected, setSelected] = useState(false);
  const dispatch = useDispatch();

  /* Permet de jouer l'enregistrement */
  const playRecording = async (uri) => {
    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
      });
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: uri },
        { shouldPlay: true }
      );
      newSound.setOnPlaybackStatusUpdate((playbackStatus) => {
        if (playbackStatus.didJustFinish) {
        }
      });
    } catch (error) {
      console.log('Failed to play/pause recording', error);
    }
  };

  /* Permet de sélectionner l'enregistrement */
  const toggleSelection = () => {
    setSelected(!selected);
  };

  return (
    /* Affichage de la section "Son par défaut" */
    <View style={styles.screenContainer}>
      <Text style={[styles.title, { marginTop: 16, marginBottom: 16 }]}>Sélectionner un son par défaut</Text>
      <View style={styles.recordingContainer}>
        <TouchableOpacity onPress={() => playRecording(assets[0].uri)} underlayColor="transparent">
          <Feather name="play" size={30} color="#000" />
        </TouchableOpacity>
        <Text style={styles.recordingName}>demo1.wav</Text>
        <TouchableOpacity style={styles.checkboxContainer} onPress={toggleSelection}>
          <MaterialCommunityIcons
            name={selected ? 'checkbox-marked-outline' : 'checkbox-blank-outline'}
            size={24}
            color="black"
            onPress={()=> {
              dispatch({ type: "SET_SELECTED_SOUND", payload: assets[0].localUri })
              setSelected(!selected);
            }
            }
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

/* Section des audios préalablement enregistrés via l'application */
const RecordScreen = () => {
  const [recordings, setRecordings] = useState([]);
  const dispatch = useDispatch();
  const [refreshing, setRefreshing] = useState(false);
  const selectedSound = useSelector((state) => state.selectedSound);
  const [selectedItemIndex, setSelectedItemIndex] = useState(-1);

  /* Permet de rafraîchir la liste des enregistrements */
  const refreshRecordings = async () => {
    setRefreshing(true);
    await loadRecordings();
    setRefreshing(false);
  };

  useEffect(() => {
    loadRecordings();
  }, []);

  /* Permet de charger les enregistrements */
  const loadRecordings = async () => {
    try {
      const dirInfo = await FileSystem.getInfoAsync(
        FileSystem.documentDirectory + 'myRecords/'
      );
      if (dirInfo.exists) {
        const files = await FileSystem.readDirectoryAsync(
          FileSystem.documentDirectory + 'myRecords/'
        );
        const recordingsInfo = await Promise.all(
          files.map(async (file) => {
            const fileInfo = await FileSystem.getInfoAsync(
              FileSystem.documentDirectory + 'myRecords/' + file
            );
            return {
              name: file.split('.')[0],
              uri: fileInfo.uri,
              selected: false,
            };
          })
        );
        setRecordings(recordingsInfo);
      }
    } catch (error) {
      console.log('loadRecordings erreur', error);
    }
  };

  /* Permet de jouer l'enregistrement */
  const playRecording = async (uri) => {
    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
      });
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: uri },
        { shouldPlay: true }
      );
      newSound.setOnPlaybackStatusUpdate((playbackStatus) => {
        if (playbackStatus.didJustFinish) {
        }
      });
    } catch (error) {
      console.log('Failed to play/pause recording', error);
    }
  };

  /* Permet de sélectionner l'enregistrement */
  const toggleSelection = (item, index) => {
    setSelectedItemIndex(index);
    dispatch({ type: "SET_SELECTED_SOUND", payload: item.uri });

    const updatedRecordings = recordings.map((recording, i) => {
      if (i === index) {
        return { ...recording, selected: true };
      } else {
        return { ...recording, selected: false };
      }
    });
    setRecordings(updatedRecordings);
  };

  return (
    /* Affichage de la section "Enregistrement */
    <View style={styles.container}>
      <Text style={[styles.title, { marginTop: 45, marginBottom: 16 }]}>Sélectionner un enregistrement</Text>
      <Text style={styles.sousTitre}>(Scroller vers le bas pour actualiser)</Text>
      <FlatList
        data={recordings}
        keyExtractor={(item) => item.uri}
        renderItem={({ item, index }) => (
          <View style={styles.recordingContainer}>
            <TouchableOpacity onPress={() => playRecording(item.uri)} underlayColor="transparent">
              <Feather name="play" size={30} color="#000" />
            </TouchableOpacity>
            <Text style={styles.recordingName}>{item.name}</Text>
            <TouchableOpacity
              style={styles.checkboxContainer}
              onPress={() => toggleSelection(item, index)}
            >
              <MaterialCommunityIcons
                name={item.selected ? 'checkbox-marked-outline' : 'checkbox-blank-outline'}
                size={24}
                color="black"
              />
            </TouchableOpacity>
          </View>
        )}
        onRefresh={refreshRecordings}
  refreshing={refreshing}
      />
    </View>
  );
};


/* Section des audios importés depuis le téléphone */
const MusicScreen = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [selected, setSelected] = useState(false);
  const dispatch = useDispatch();
  const selectedSound = useSelector((state) => state.selectedSound);

  /* Permet de jouer l'enregistrement */
  const playRecording = async (uri) => {
    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
      });
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: uri },
        { shouldPlay: true }
      );
      newSound.setOnPlaybackStatusUpdate((playbackStatus) => {
        if (playbackStatus.didJustFinish) {
        }
      });
    } catch (error) {
      console.log('Failed to play/pause recording', error);
    }
  };

  /* Permet de sélectionner l'enregistrement */
  const pickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'audio/*',
      });

      if (result.type === 'success') {
        setSelectedFile(result);
      } else {
        setSelectedFile(null);

      }
    } catch (error) {
      console.error(error);
    }
  };

  /* Permet de sélectionner l'enregistrement */
  const toggleSelection = () => {
    setSelected(!selected);
  };

  return (
    /* Affichage de la section "Musique" */
    <View style={styles.screenContainer}>
      <Text style={[styles.title, { marginTop: 16, marginBottom: 16 }]}>Sélectionner un fichier audio dans votre téléphone</Text>
      <View style={styles.uploadButton}><Button title="Importer" onPress={pickFile} color="white" /></View>
      {selectedFile && (
        <View style={styles.recordingContainer}>
          <TouchableOpacity style={styles.recordingItem} onPress={() => playRecording(selectedFile.uri)}>
            <Feather name="play" size={30} color="#000" />
          </TouchableOpacity>
          <Text style={styles.recordingName}>{selectedFile?.name}</Text>
          <TouchableOpacity style={styles.checkboxContainer} onPress={toggleSelection}>
            <MaterialCommunityIcons
              name={selected ? 'checkbox-marked-outline' : 'checkbox-blank-outline'}
              size={24}
              color="black"
              onPress={()=> 
                 {
                  dispatch({ type: "SET_SELECTED_SOUND", payload: selectedFile.uri }) 
                  setSelected(!selected)
                }     
              }
            />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

/* Mise en place des trois sections dans la tabBar */
const RaveScreen = () => {
  const [loading, setLoading] = useState(false);
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'defaultSound', title: 'Son par défaut' },
    { key: 'record', title: 'Enregistrement' },
    { key: 'music', title: 'Musique' },
  ]);

  const selectedSound = useSelector((state) => state.selectedSound);
  const [chooseModal, setChooseModal] = useState(false)
  const [finalModal, setFinalModal] = useState(false)
  const [data, setData] = useState([])
  const [model, setModel] = useState("");
  const [downloadedFile, setDownloadedFile] = useState("");
  const serverIP = useSelector((state) => state.serverIP);
  const serverPort = useSelector((state) => state.serverPort);



    useEffect(() => {
    if (model) {
      axios
        .get(
          `http://${serverIP}:${serverPort}/selectModel/${model}`
        )
        .then()
        .catch((error) => {
          alert(error);
        });
    }
  }, [model]);

  /* Permet de télécharger le fichier audio */
  const sendFile = async () => {

    setLoading(true);
    try {
      const response = await FileSystem.uploadAsync(`http://${serverIP}:${serverPort}` + '/upload', selectedSound, {
        fieldName: 'file',
        httpMethod: 'POST',
        uploadType: FileSystem.FileSystemUploadType.MULTIPART,
        headers: { filename: selectedSound },
      });

      console.log(response.body);

      await downloadFile();
    } catch (error) {
      console.error(error);
      alert('Error', 'An error occurred while sending the file.');
    } finally {
      setLoading(false);
    }
  };

  /* Permet de télécharger le fichier audio */
  const downloadFile = async () => {
    try {
      let directory = FileSystem.documentDirectory + "my_directory";
      const dirInfo = await FileSystem.getInfoAsync(directory);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(directory);
      }

      const { uri } = await FileSystem.downloadAsync(`http://${serverIP}:${serverPort}` + '/download', directory + '/hey.wav');

      console.log('Downloaded file URI:', uri);

      setDownloadedFile(uri);

      setChooseModal(false);
      setFinalModal(true);


    } catch (error) {
      console.error(error);
      alert('Error', 'An error occurred while downloading the file.');
    }
  };

  const renderScene = SceneMap({
    defaultSound: DefaultSoundScreen,
    record: RecordScreen,
    music: MusicScreen,
  });

    useEffect(() => {
      axios
        .get(`http://${serverIP}:${serverPort}/getmodels`)
        .then((response) => {
          setData(response.data.models);
        })
        .catch((error) => {
          console.log(error);
          alert("N'oublier pas de lancer le serveur");
        });
    }, []);

  /* Permet d'écouter l'audio */
    const playRecording = async (uri) => {
    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
      });
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: uri },
        { shouldPlay: true }
      );
      newSound.setOnPlaybackStatusUpdate((playbackStatus) => {
        if (playbackStatus.didJustFinish) {
        }
      });
    } catch (error) {
      console.log('Failed to play/pause recording', error);
    }
  };

  /* Permet de mettre en place la tabBar */
  return (
    <View style={styles.container}>
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: '100%' }}
        renderTabBar={(props) => (
          <TabBar
            {...props}
            indicatorStyle={styles.tabIndicator}
            style={styles.tabBar}
            labelStyle={styles.tabLabel}
          />
          )}
      />
      
      <View style={styles.buttonContainer}>
        <Button title="Transformer l'audio" onPress={() => setChooseModal(true)} color="white" />
      </View>
      {chooseModal && (
        /* Fenêtre pour choisir le modèle de voix */
        <View style={styles.modalContainer}>
          <TouchableOpacity onPress={() => setChooseModal(false)} style={styles.closeButton}>
    <MaterialCommunityIcons name="close" size={24} color="black" />
  </TouchableOpacity>
          <SelectDropdown
            data={data}
            style={styles.selectedSelected}
            onSelect={(selectedItem, index) => {
              setModel(selectedItem);
            }}
            defaultButtonText={"Choisir un modèle"}
            buttonTextAfterSelection={(selectedItem, index) => {
              return selectedItem
            }}
            rowTextForSelection={(item, index) => {
              
              return item
            }}
            buttonStyle={styles.dropdown1BtnStyle}
            buttonTextStyle={styles.dropdown1BtnTxtStyle}
            renderDropdownIcon={isOpened => {
              return <FontAwesome name={isOpened ? 'chevron-up' : 'chevron-down'} color={'#444'} size={18} />;
            }}
            dropdownIconPosition={'right'}
            dropdownStyle={styles.dropdown1DropdownStyle}
            rowStyle={styles.dropdown1RowStyle}
            rowTextStyle={styles.dropdown1RowTxtStyle}
          />
          <View style={styles.transButton}><Button style={styles.buttonSelectedVoice} onPress={sendFile} title='Transformer' disabled={loading} color="white"/></View>
          {loading && <ActivityIndicator />}
        </View>
      )}

      {finalModal && (
        /* Fenêtre pour écouter le son original et le son transformé */
        <View style={styles.modalContainer}>
          <TouchableOpacity onPress={() => setFinalModal(false)} style={styles.closeButton}>
    <MaterialCommunityIcons name="close" size={24} color="black" />
  </TouchableOpacity>
          <View style={styles.recordingContainer}>
            <TouchableHighlight onPress={()=>playRecording(selectedSound)} underlayColor="transparent">
              <Feather name="play" size={30} color="#000" />
              </TouchableHighlight>
              <Text style={styles.recordingName}>Son original</Text>
          </View>
          <View style={styles.recordingContainer}>
            <TouchableHighlight onPress={()=>playRecording(downloadedFile)} underlayColor="transparent">
              <Feather name="play" size={30} color="#000" />
              </TouchableHighlight>
              <Text style={styles.recordingName}>Son transformer</Text>
              <TouchableHighlight onPress={() => Sharing.shareAsync(downloadedFile)} underlayColor="transparent">
              <Feather name="share" size={30} color="#000" />
              </TouchableHighlight>

          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  screenContainer: {
    flex: 1,
    alignItems: 'center',
    marginTop: 32,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginHorizontal: 16,
  },
  buttonContainer: {
    padding: 16,
    backgroundColor: '#7f54c9',
    width: '55%',
    marginBottom: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignSelf: 'center',
  },
  tabBar: {
    backgroundColor: '#4d3c60',
  },
  tabIndicator: {
    backgroundColor: '#FFFFFF',
  },
  tabLabel: {
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
  recordingContainer: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    marginTop: 10,
    height: 80,
    marginRight: 16,
    marginLeft: 16,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  recordingName: {
    flex: 1,
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 18,
    fontSize: 16,
  },
  checkboxContainer: {
    marginLeft: 'auto',
  },
  recordingItem: {
    marginRight: 16,
  },
  modalContainer: {
    flex: 1,
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  uploadButton: {
    width: '40%',
    height: 50,
    backgroundColor: '#7f54c9',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  dropdown1BtnStyle: {
    width: '80%',
    height: 50,
    backgroundColor: '#FFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#444',
  },
  transButton: {
    width: '50%',
    height: 50,
    backgroundColor: '#7f54c9',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  sousTitre: {
    textAlign: 'center',
    marginHorizontal: 16,
    fontStyle: 'italic',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 1, 
  },
  buttonSelectedVoice: {
    zIndex: 100,
  },
  dropdown1BtnTxtStyle: {color: '#444', textAlign: 'left'},
  dropdown1DropdownStyle: {backgroundColor: '#EFEFEF', borderRadius: 8, borderColor: '#444'},
  dropdown1RowStyle: {backgroundColor: '#EFEFEF', borderBottomColor: '#444'},
  dropdown1RowTxtStyle: {color: '#444', textAlign: 'left'},
});

export default RaveScreen;

import React from 'react';
import { StyleSheet, Text, View, Dimensions, Button, TouchableOpacity, TextInput } from 'react-native';
import { Accelerometer } from 'expo-sensors';
import * as Location from 'expo-location';
import * as Permissions from 'expo-permissions';
import MapView, { Polyline } from 'react-native-maps';
import Icon from 'react-native-vector-icons/FontAwesome';
import * as ImagePicker from 'expo-image-picker';
import Modal from 'react-native-modal';
import {Notifications} from 'expo';


async function alertIfRemoteNotificationsDisabledAsync() {
	const { status } = await Permissions.getAsync(Permissions.NOTIFICATIONS);
	if (status !== 'granted') {
		await Permissions.askAsync(Permissions.NOTIFICATIONS);
	}
}


export default class MapScreen extends React.Component {
    constructor(){
        super();
        this.state = {
            ready: false,
            ready2: false,
            intensity : null,
            where: {lat:null, lng:null},
            error: null,

            isModalVisible : false,
            displayQ : 0,
            isPothole : false,
            completion : 0,
            Notifications : null,
            PotholeId : null,
        }
    }

    sendDataToServer(lat, long, intensity) {
      fetch('http://sntc.iitmandi.ac.in:8585/api/post', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lat: lat,
          lon: long,
          yacc: intensity
        }),
      });      
    }

    send2server = () => {
        if(this.state.ready && this.state.ready2){
            if ((this.state.intensity > 1.5) || (this.state.intensity < 0.5)) {
                this.sendDataToServer(this.state.where.lat, this.state.where.lng, this.state.intensity);
                console.log(this.state.where.lat, this.state.where.lng, this.state.intensity);
            }
        }
    }

    componentDidMount(){
        this.setState({ready:false, error: null });
        this.getLocationAsync();
        Accelerometer.setUpdateInterval(500);
        Accelerometer.addListener(accelerometerData => {
            this.setState({
                ready2 : true,
                intensity : accelerometerData.z
            })
            this.send2server();
        });
        alertIfRemoteNotificationsDisabledAsync();
		this.listenForNotifications();
    }

    getLocationAsync = async () => {
      let geoOptions = {
          accuracy: 6,
          timeInterval: 1000
      };
      let { status } = await Permissions.askAsync(Permissions.LOCATION);
      if (status !== 'granted') {
        this.setState({
          errorMessage: 'Permission to access location was denied',
        });
      }

      Location.watchPositionAsync(geoOptions, this.geoSuccess);
    };

    geoSuccess = (position) => {
        this.setState({
            ready:true,
            where: {lat: position.coords.latitude,lng:position.coords.longitude }
        });
    }
    
    geoFailure = (err) => {
      alert('Please turn on GPS');
      this.setState({error: err.message});
    }

    getPic = async () => {
        this.sendNotifications();
      let result = await ImagePicker.launchCameraAsync({
        allowsEditing: false, // higher res on iOS
        aspect: [4, 3],
      });

      if (result.cancelled) {
        return;
      }

      let localUri = result.uri;
      let filename = localUri.split('/').pop();

      let match = /\.(\w+)$/.exec(filename);
      let type = match ? `image/${match[1]}` : `image`;

      let formData = new FormData();
      formData.append('photo', { uri: localUri, name: filename, type });

      return await fetch('http://example.com/upload.php', {
        method: 'POST',
        body: formData,
        header: {
          'content-type': 'multipart/form-data',
        },
      });
    }


    _showModal = () => this.setState({ isModalVisible: true })
 
    _hideModal = () => this.setState({ isModalVisible: false })
    
    // send notif
    sendNotifications = () => {
		const localnotification = {
			title: 'Pothole near you',
			body: 'Help us by anwering a question ',
		};

		const schedulingOptions = { time: Date.now() + 500 };

		Notifications.scheduleLocalNotificationAsync(
			localnotification,
			schedulingOptions
		);
    }

    listenForNotifications = () => {
		Notifications.addListener(notification => {
			if(notification.origin === 'selected'){
				this.setState({
					displayQ : 1
                })
                this._showModal();
			}
		});
    };

    isTherePothole = (flag) => {
		this.setState({
			isPothole: flag,
		})
		if(flag){
			this.setState({
				displayQ : 2
			})
		}else{
			this.setState({
				displayQ : 0
			})
			let sAns = {
				isPothole : false
			}
			this.submitAnswer2server(sAns);
		}
    }
    
    handle_Completion = (compl) => {
		this.setState({
			completion : compl,
		})
	}

	handle_Completion_submit = () => {
		let sAnswer = {
			isPothole : true
		}
		sAnswer.completion = this.state.completion
		
		this.setState({
			displayQ : 0,
		})

		this.submitAnswer2server(sAnswer);
	}

	submitAnswer2server = (ans) => {
        this.setState({
            displayQ : 0,
            isPothole : false,
            completion : 0,
            Notifications : null,
            PotholeId : null,
        })
        console.log(ans);
        this._hideModal();
	}
    


    


    render() {
        return (
            <View style={styles.container}>
              <View>
              <Modal isVisible={this.state.isModalVisible} style={{backgroundColor: 'white'}}>
                <View>
                    {
                        this.state.displayQ === 0 && (
                            <Button
                                title="send notif"
                                onPress={this._handleButtonPress}
                            />
                        )
                    }
                    {
                        this.state.displayQ === 1 && (
                            <View>
                                <Text>
                                    Is there a pothole near you ?
                                </Text>
                                <Button
                                    title="Yes"
                                    onPress={() => {this.isTherePothole(true)}}
                                />
                                <Button
                                    title="No"
                                    onPress={() => {this.isTherePothole(false)}}
                                />
                            </View>
                        )
                    }
                    {
                        this.state.displayQ === 2 && (
                            <View>
                                <Text>
                                    How are the repairs going ? (0-10)
                                </Text>
                                <TextInput
                                    onChangeText={(text)=> this.handle_Completion(text)}
                                    value = {String(this.state.completion)}
                                /> 
                                <Button
                                    title="Submit"
                                    onPress={this.handle_Completion_submit}
                                />
                            </View>
                        )
                    }
                </View>
              </Modal>
              </View>
              <MapView 
                style={styles.mapStyle} 
                showsUserLocation={true} 
                followsUserLocation= {true}
                initialRegion= {{
                  latitude: 29.854,
                  longitude: 77.893,
                  latitudeDelta: .07,
                  longitudeDelta: .07
                }}
              >
              <Polyline
                coordinates= {coordinates}
                strokeWidth = {10}
                strokeColor="#00a8ff"
                lineCap="around"
              />
              </MapView>
              <View
                  style={{
                      position: 'absolute',//use absolute position to show button on top of the map
                      top: '50%', //for center align
                      alignSelf: 'flex-end' //for align to right
                  }}
              >
                  {/* <Button style={styles.btnstyle} title="+" /> */}
                  <TouchableOpacity 
                    style={{ borderWidth:1,
                      borderColor:'rgba(0,0,0,0.2)',
                      alignItems:'center',
                      justifyContent:'center',
                      width:70,
                      height:70,
                      backgroundColor:'#fff',
                      borderRadius:100,
                      marginTop: 270,
                      marginRight: 30
                    }}
                    // onPress={()=> this._showModal()}
                    onPress = { ()=> {this.getPic()}}
                    >
                    <Icon name={"camera"}
                      size={30}
                      color="#01a699" />
                  </TouchableOpacity>
              </View>
            </View>
        );
    }
}

// const point = [[29.85, 77.89],[29.29, 77.19],[29.81, 77.90],[29.2, 77.21],[29.4, 77.55]]; 
const point = []; 
let coordinates = point.map((x)=> {
  return {
    latitude: x[0],
    longitude: x[1]
  }
});
console.log(coordinates);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapStyle: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  }
});

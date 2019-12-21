import React from 'react';
import { StyleSheet, Text, View, Dimensions, Button, TouchableOpacity } from 'react-native';
import { Accelerometer } from 'expo-sensors';
import * as Location from 'expo-location';
import * as Permissions from 'expo-permissions';
import MapView from 'react-native-maps';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Camera } from 'expo-camera';


export default class App extends React.Component {
    constructor(){
        super();
        this.state = {
            ready: false,
            ready2: false,
            intensity : null,
            where: {lat:null, lng:null},
            error: null
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

    async snapPhoto() {
      console.log('Camera Button Pressed');
      
    }

    render() {
        return (
            // <View style={styles.container}>
            //     { !this.state.ready && (
            //     <Text style={styles.big}>Using Geolocation in React Native.</Text>
            //     )}
            //     { this.state.error && (
            //     <Text style={styles.big}>{this.state.error}</Text>
            //     )}
            //     { this.state.ready && (
            //         <Text style={styles.big}>{
            //         `Latitude: ${this.state.where.lat}
            //         Longitude: ${this.state.where.lng}`
            //         }</Text>
            //     )}
            // </View>
            <View style={styles.container}>
              <MapView style={styles.mapStyle} />
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
                    onPress={this.snapPhoto.bind(this)}
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

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         backgroundColor: '#fff',
//         alignItems: 'center',
//         justifyContent: 'center'
//     },
//     big: {
//         fontSize: 48
//     }
// });


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

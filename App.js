import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Acc from './components/acc.js';

export default class App extends React.Component {
    constructor(){
        super();
        this.state = {
            ready: false,
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

    componentDidMount(){
      // this.sendDataToServer(32,32,54);
        let geoOptions = {
            enableHighAccuracy: true,
            timeOut: 20000,
            maximumAge: 3000,
            distanceFilter: 0
        };
        this.setState({ready:false, error: null });
        navigator.geolocation.watchPosition(this.geoSuccess, this.geoFailure, geoOptions);  
    }

    geoSuccess = (position) => {
        console.log(position.coords);
        
        this.setState({
            ready:true,
            where: {lat: position.coords.latitude,lng:position.coords.longitude }
        });
    }
    
    geoFailure = (err) => {
      alert('Please turn on GPS');
      this.setState({error: err.message});
    }
    render() {
        return (
            <View style={styles.container}>
                { !this.state.ready && (
                <Text style={styles.big}>Using Geolocation in React Native.</Text>
                )}
                { this.state.error && (
                <Text style={styles.big}>{this.state.error}</Text>
                )}
                { this.state.ready && (
                    <Text style={styles.big}>{
                    `Latitude: ${this.state.where.lat}
                    Longitude: ${this.state.where.lng}`
                    }</Text>
                )}
                <Acc/>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center'
    },
    big: {
        fontSize: 48
    }
});
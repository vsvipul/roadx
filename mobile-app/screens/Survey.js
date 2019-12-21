import React from 'react';
import { StyleSheet, Text, View, TextInput, Dimensions, Button, TouchableOpacity } from 'react-native';
import {Notifications} from 'expo';

import * as Location from 'expo-location';
import * as Permissions from 'expo-permissions';

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
            where: {lat:null, lng:null},
            error: null,

            displayQ : 0,
            isPothole : false,
            completion : 0,
            Notifications : null,
            PotholeId : null,
        }
    }

    sendDataToServer(lat, long, intensity) {
    //   fetch('http://sntc.iitmandi.ac.in:8585/api/post', {
    //     method: 'POST',
    //     headers: {
    //       Accept: 'application/json',
    //       'Content-Type': 'application/json',
    //     },
    //     body: JSON.stringify({
    //       lat: lat,
    //       lon: long,
    //       yacc: intensity
    //     }),
    //   });      
    }

    componentDidMount(){
        this.setState({ready:false, error: null });
        this.getLocationAsync();
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


    _handleButtonPress = () => {
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
	}

    render() {
        return (
            <View style={styles.container}>
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
            </View>
        );
    }
}

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

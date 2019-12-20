import React, { Component } from 'react';
import {Notifications} from 'expo';
import {Text, View, Button, TextInput} from 'react-native';
import * as Permissions from 'expo-permissions';

async function alertIfRemoteNotificationsDisabledAsync() {
	const { status } = await Permissions.getAsync(Permissions.NOTIFICATIONS);
	if (status !== 'granted') {
		await Permissions.askAsync(Permissions.NOTIFICATIONS);
	}
}

export default class NotifHandler extends Component {
	constructor(){
		super();
		this.state = {
			displayQ : 0,
			isPothole : false,
			completion : 0,
			Notifications : null,
			PotholeId : null,
		}
	}

	_handleButtonPress = () => {
		const localnotification = {
			title: 'Pothole near you',
			body: 'Help us by anwering a question ',
		};

		const schedulingOptions = { time: Date.now() + 1000 };

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

	componentDidMount = () => {
		alertIfRemoteNotificationsDisabledAsync();
		this.listenForNotifications();
	}

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
		console.log(ans);
	}

	render () {
		return (
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
		)
	}


}
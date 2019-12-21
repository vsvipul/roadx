# RoadX : Portable Ecosystem for measuring Road Development

## Description
The project aims to collect data about roads from mobile users through various techniques and give the government various analysis tools to take optimum steps for improving the roadways. 

**Data Collection Technique 1:** Accelerometer-based bump detection. A mobile continuously measures the magnitude of the acceleration. When a certain threshold is crossed, the app uploads the coordinates to a server. By the law of Central Tendency, the area near potholes and bumps will have the maximum distribution. 

**Data Collection Technique 2:** Camera-based app which gives the user the option to send photos of potholes etc. This would serve as a confirmation of the data collected from the technique mentioned above.

**Government Admin Panel:** A map that shows heatmaps of the plotholes. It also gives the government the option to give out optimal contracts based on the DBSCAN algorithm. 

**Tracking App:** In the same app, mobile users can track the progress of ongoing road repairs, giving options to fill out small surveys based on proximity to the repair site. There is also a map that shows location of road repairs.

## Technology Stack

 - Flask 
 - Sklearn 
 - React Native 
 - Javascript 
 - OpenStreet Maps 
 - NodeJS
 - Expo
 - MongoDB

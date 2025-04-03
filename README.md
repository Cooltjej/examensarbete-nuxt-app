# Child Care Tracker

A web application for tracking childcare activities such as feeding, sleep, bowel movements, and sickness logs. This project was built using modern web development tools to create a responsive and user-friendly interface that helps parents and caregivers manage daily routines and monitor their child's well-being.

## Tech Stack

- **Frontend:** Vue 3, Nuxt 3, Vuetify, Pug
- **State Management:** Pinia
- **Backend & Database:** Firebase (Authentication & Firestore)
- **Styling & Icons:** Vuetify Material Design components and Material Design Icons
- **Utilities:** Date-fns for date/time formatting

## Features

- **User Authentication:** Registration, login, persistent login, and password recovery using Firebase.
- **Child Profile Management:** Register and manage child profiles.
- **Activity Logging:** Record feedings, sleep, bowel movements, and sickness logs.
  - Different logging options (e.g., bottle, breastfeeding, solid feeding)
  - Scrollable number inputs for easy data entry
- **Data Visualization:** Sparkline graphs and daily cards to review log data over the past 7 days.
- **User Interface Enhancements:** 
  - Responsive design optimized for one-handed use
  - Dark/light theme switching
  - Toast notifications for user feedback
- **Real-Time Updates:** Firestore integration ensures logs are updated instantly across devices.

## Installation

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/yourusername/child-care-tracker.git
   cd child-care-tracker
Install Dependencies:

bash
Kopiera
npm install
Configure Firebase:

Create a Firebase project and enable Authentication and Firestore.

Add your Firebase configuration to the project (e.g., in a .env file).

Run the Project:

bash
Kopiera
npm run dev
Build & Deployment
To build the project for production, run:

bash
Kopiera
nuxi generate
The generated static files will be in the dist folder. You can deploy these to any static hosting service (e.g., Netlify).

Usage
After signing up and logging in, users can:

Register a child profile.

Log daily activities such as feedings, sleep patterns, bowel movements, and sickness events.

View real-time updates and historical logs with integrated graphs.

Switch between dark and light modes and receive toast notifications on key actions.

License
This project is licensed under the MIT License.

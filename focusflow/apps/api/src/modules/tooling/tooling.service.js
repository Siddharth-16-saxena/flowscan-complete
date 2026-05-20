const fs = require('fs');

const toolPaths = {
  flutter: 'C:\\src\\flutter\\bin\\flutter.bat',
  firebase: 'C:\\Users\\user\\AppData\\Roaming\\npm\\firebase.cmd',
  androidStudio: 'C:\\Program Files\\Android\\Android Studio',
  java: 'C:\\Program Files\\Eclipse Adoptium\\jdk-21.0.6.7-hotspot\\bin\\java.exe',
  git: 'C:\\Program Files\\Git\\cmd\\git.exe',
  node: 'C:\\Program Files\\nodejs\\node.exe',
};

function isAvailable(path) {
  return fs.existsSync(path);
}

function readToolingStatus() {
  return {
    tooling: [
      {
        name: 'Flutter SDK',
        available: isAvailable(toolPaths.flutter),
        detail: 'C:\\src\\flutter\\bin',
        role: 'Native mobile app and Android build pipeline',
      },
      {
        name: 'Firebase CLI',
        available: isAvailable(toolPaths.firebase),
        detail: 'C:\\Users\\user\\AppData\\Roaming\\npm',
        role: 'Firestore, Firebase config, deploy workflows',
      },
      {
        name: 'Android Studio',
        available: isAvailable(toolPaths.androidStudio),
        detail: 'C:\\Program Files\\Android\\Android Studio',
        role: 'Emulator, Android SDK, device debugging',
      },
      {
        name: 'Node.js',
        available: isAvailable(toolPaths.node),
        detail: 'C:\\Program Files\\nodejs',
        role: 'Express API and executable web prototype',
      },
      {
        name: 'Git',
        available: isAvailable(toolPaths.git),
        detail: 'C:\\Program Files\\Git',
        role: 'Source control and release workflow',
      },
      {
        name: 'Java',
        available: isAvailable(toolPaths.java),
        detail: 'Temurin JDK 21',
        role: 'Android build support',
      },
    ],
  };
}

module.exports = { readToolingStatus };

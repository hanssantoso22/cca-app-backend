const { Expo } = require('expo-server-sdk')

exports.sendPushNotification = async (targetTokens = [], message) => {
    try {
        const expo = new Expo()
        const recipients = targetTokens.map(token => ({to: token, sound: "default", message}))
        const chunks = expo.chunkPushNotifications(recipients)
    } catch (err) {
        console.log(err)
    }
}
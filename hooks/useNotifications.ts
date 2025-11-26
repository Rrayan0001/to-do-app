import { useState, useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

export const useNotifications = () => {
    const [expoPushToken, setExpoPushToken] = useState<string | undefined>('');
    const [notification, setNotification] = useState<Notifications.Notification | undefined>(undefined);
    const notificationListener = useRef<Notifications.Subscription | undefined>(undefined);
    const responseListener = useRef<Notifications.Subscription | undefined>(undefined);

    useEffect(() => {
        registerForPushNotificationsAsync().then(token => setExpoPushToken(token));

        notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
            setNotification(notification);
        });

        responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
            console.log(response);
        });

        return () => {
            try {
                if (notificationListener.current) {
                    notificationListener.current.remove();
                }
                if (responseListener.current) {
                    responseListener.current.remove();
                }
            } catch (e) {
                console.warn("Failed to remove notification subscription:", e);
            }
        };
    }, []);

    const scheduleReminder = async (title: string, body: string, date: number) => {
        const trigger = new Date(date);
        // Only schedule if date is in the future
        if (trigger.getTime() <= Date.now()) return null;

        try {
            const id = await Notifications.scheduleNotificationAsync({
                content: {
                    title,
                    body,
                    sound: true,
                },
                trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: trigger },
            });
            return id;
        } catch (e) {
            console.error("Failed to schedule notification", e);
            return null;
        }
    };

    const cancelReminder = async (identifier: string) => {
        try {
            await Notifications.cancelScheduledNotificationAsync(identifier);
        } catch (e) {
            console.error("Failed to cancel notification", e);
        }
    };

    return {
        scheduleReminder,
        cancelReminder,
        expoPushToken
    };
};

async function registerForPushNotificationsAsync() {
    let token;

    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
        });
    }

    if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }
        if (finalStatus !== 'granted') {
            // alert('Failed to get push token for push notification!');
            console.log('Failed to get push token for push notification!');
            return;
        }
        // token = (await Notifications.getExpoPushTokenAsync()).data;
        // console.log(token);
    } else {
        // alert('Must use physical device for Push Notifications');
        console.log('Must use physical device for Push Notifications');
    }

    return token;
}

// 1. Online Push Notifications (Handle JSON and Text payloads)
self.addEventListener('push', function (event) {
    let data = {
        title: 'Qaza Tracker',
        body: 'Namaz ka waqt ho gaya hai! 🕌'
    };

    if (event.data) {
        try {
            // Backend se aane wala JSON data parse karein
            data = event.data.json();
        } catch (e) {
            // Agar DevTools ya simple text aaye toh crash na ho
            data = {
                title: 'Qaza Tracker',
                body: event.data.text()
            };
        }
    }

    const options = {
        body: data.body,
        icon: '/logo.png',   // Make sure these images exist in your public folder
        badge: '/badge.png',
        vibrate: [100, 50, 100],
        data: {
            url: '/' // Click handler ke liye data
        },
        actions: [
            { action: 'open', title: 'Open App' }
        ]
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

// 2. Notification Click Handler
self.addEventListener('notificationclick', function (event) {
    event.notification.close();

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
            // Agar app pehle se khuli hai toh usay focus karein
            for (let i = 0; i < clientList.length; i++) {
                let client = clientList[i];
                if (client.url === '/' && 'focus' in client) {
                    return client.focus();
                }
            }
            // Agar app band hai toh naya tab kholain
            if (clients.openWindow) {
                return clients.openWindow('/');
            }
        })
    );
});

// 3. Force Update (Zaroori: Naye changes foran apply karne ke liye)
self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(clients.claim());
});
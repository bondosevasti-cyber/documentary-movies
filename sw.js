self.addEventListener('push', function(event) {
    let data = { title: 'Cineby', body: 'ახალი ფილმი დაემატა!' };
    
    if (event.data) {
        try {
            data = event.data.json();
        } catch (e) {
            data.body = event.data.text();
        }
    }

    const options = {
        body: data.body,
        icon: 'images/logo/Logo.png', // Generic icon
        badge: 'images/logo/Logo.png',
        vibrate: [100, 50, 100],
        data: {
            url: data.url || 'index.html'
        }
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    event.waitUntil(
        clients.openWindow(event.notification.data.url)
    );
});

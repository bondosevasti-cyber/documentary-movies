self.addEventListener('push', function(event) {
    let data = {
        title: 'Cineby',
        body: 'ახალი კონტენტი დაემატა!',
        icon: 'images/logo/Logo.png',
        image: 'images/logo/Logo.png',
        url: 'https://documentary-movies.vercel.app/'
    };

    if (event.data) {
        try {
            const parsed = event.data.json();
            data = { ...data, ...parsed };
        } catch (e) {
            data.body = event.data.text();
        }
    }

    const options = {
        body: data.body,
        icon: data.icon || 'images/logo/Logo.png',
        badge: 'images/logo/Logo.png',
        image: data.image || null,
        vibrate: [200, 100, 200],
        requireInteraction: false,
        data: {
            url: data.url || 'https://documentary-movies.vercel.app/'
        },
        actions: [
            { action: 'open', title: 'გახსნა' },
            { action: 'close', title: 'დახურვა' }
        ]
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

self.addEventListener('notificationclick', function(event) {
    event.notification.close();

    if (event.action === 'close') return;

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
            const url = event.notification.data.url;
            // If tab is already open, focus it
            for (let client of clientList) {
                if (client.url === url && 'focus' in client) {
                    return client.focus();
                }
            }
            // Otherwise open new tab
            if (clients.openWindow) {
                return clients.openWindow(url);
            }
        })
    );
});

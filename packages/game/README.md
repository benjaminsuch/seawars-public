### Server Events

To emit events from the server to the clients, the event has to be registered first
via `NetworkManager.getServer().event(<event-name>)`. Those can then be sent to the clients via `NetworkObjectComponent` or `NetworkManager`.

#### Listening to server events

The client has to subscribe to an event first via `NetworkManager.getClient().subscribe(<event-name>)`. Only then, the client can receive messages for this event via `NetworkManager.getClient().on(...)`.

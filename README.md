# Ember-offline-sync

This README outlines the details of collaborating on this Ember addon.


## How does it works?

### OfflineStore & Onlinestore

- *OfflineStore* should be the default store of your application [LocalStorageAdapter, IndexedDBAdapter, LocalForageAdapter ...]
- *OnlineStore* is where you sync the data with, you should setup this your self, either using RESTAdapter or JSONAPIAdapter

You dont' have to communicate directly with any of these stores. Ember-offline-sync will inject `syncStore` into your application routes & controllers.

### Synchronization Queue

Ember-offline-sync introduced one hidden model: `pending-change` (which normally you don't have to care about). Any modification to the data will be resulted in creation of 'pending-change' record on the offline-storage. Here is the schema of the model:

```javascript
{
  modelName: DS.attr('string'),   // name of the model
  modelId: DS.attr('string'),     // the id of the changed model (will be useful when the client side want to know
                                  // if a particular model has local modification or not)
  serialized: DS.attr(),          // snapshot of the data at the time
  operation: DS.attr('string'),   // POST, PUT, DELETE
  isConflict: DS.attr('boolean'), // will be set to true if the update request return with statusCode = 409
  createdAt: DS.attr('number')    // time when the change happen
}
```

These `pending-change` records will be picked up and proceeded by the synchronization queue. After the sync, record will be deleted from the offlineStore

### Handle findRecord(type, id)

Ember-offline-sync will return immediately if the model we're looking for is existed in the offlineStore.

In this case it will trigger another request in the background to `findRecord` from the onlineStore, anything comeback will be automatically presented to user & the offline record will be updated with the latest one from onlineStore. This behavior is quite identical to `ember-data`'s background reload model.

If that model is not existed in the offlineStore, it's like you're working with normal `ember-data`.

#### What will happen if there is a conflict between the local record & remote record ?
Well, this can happen in case that there're lots of pending changes (like right after user when online after sometime work offline, the queue has to process lots of changes). The record that we're querying still has local modification that has not been synced.

There will be no problem if the localRecord is the same with remoteRecord. We simply don't have to do anything.

But if localRecord is different with remoteRecord (we need a way to detect that, normally via lastUpdated property in the model), the hardest part of the whole process happen: conflict resolving.

**We will make it simple and let server handle the conflict**: just ignore the conflict and do not replace the localRecord with the remote one, **you will not loose the changes**. The changes is still sitting in the queue waiting to be picked up.

When synchronization queue process the change, it will issue an update request to the remote server. In this case, depends on the implementation of your application API, there could be:

- a HTTP Conflict error: `ember-offline-sync` will throw a `ConflictError(error, pendingChange)`, your application should handle that and decide what to do next. After that, you can flush that pending change using `this.syncStore.flushChange(pendingChange)`, this will delete the `pending-change` record from the offlineStore.

- a 200 reponse: if this case happen, server also seems to ignore the conflict, and update the remote record with whatever we send to it. We're fine. Our changes has been saved. Other's change will be lost.


### Handle findAll()

### Handle createRecord()

## Installation

* `git clone` this repository
* `npm install`
* `bower install`

## Running

* `ember server`
* Visit your app at http://localhost:4200.

## Running Tests

* `ember test`
* `ember test --server`

## Building

* `ember build`

For more information on using ember-cli, visit [http://www.ember-cli.com/](http://www.ember-cli.com/).

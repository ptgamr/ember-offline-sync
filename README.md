# Ember-offline-sync

This README outlines the details of collaborating on this Ember addon.


## How does it works?

### OfflineStore & Onlinestore

- *OfflineStore* should be the default store of your application [LocalStorageAdapter, IndexedDBAdapter, LocalForageAdapter ...]
- *OnlineStore* is where you sync the data with, you should setup this your self, either using RESTAdapter or JSONAPIAdapter

You dont' have to communicate directly with any of these stores. Ember-offline-sync will inject `syncStore` into your application routes & controllers.

### Synchronization Queue

Ember-offline-sync introduced one hidden model: 'pending-change' (which normally you don't have to care about). Any modification to the data will be resulted in creation of 'pending-change' record on the offline-storage. Here is the schema of the model:

```
{
  modelName: DS.attr('string'), // name of the model
  modelId: DS.attr('string'),   // the id of the changed model (will be useful when the client side want to know
                                // if a particular model has local modification or not)
  serialized: DS.attr(),        // snapshot of the data at the time
  operation: DS.attr('string'), // POST, PUT, DELETE
  createdAt: DS.attr('number')  //time when the change happen
}
```

These 'pending-change' records will be picked up and proceeded by the synchronization queue. After the sync, record will be deleted from the offlineStore

### Handle findRecord()

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

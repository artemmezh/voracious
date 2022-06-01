import { List, Record, Map as IMap, OrderedMap, Set as ISet } from 'immutable';

const AnkiPreferencesRecord = new Record({
  modelName: undefined,
  deckName: undefined,
  fieldMap: new OrderedMap(), // Anki field to our field that fills it
});

const PreferencesRecord = new Record({
  showRuby: true,
  showHelp: true,
  subtitleMode: 'manual',
  subtitleOrder: new List(['jpn', 'eng']), // list of iso639-3 codes
  subtitleIgnores: new List([]), // list of iso639-3 codes
  disabledDictionaries: new ISet(),
  dictionaryOrder: new List(),
  anki: new AnkiPreferencesRecord(),
});

const MainStateRecord = new Record({
  modalLoadingMessage: null,
  collections: new IMap(), // locator -> CollectionRecord
  dictionaries: new IMap(), // name -> object that we don't mutate (TODO: make it a Record)
  wordList: new IMap(), // word -> SavedWordRecord
  preferences: new PreferencesRecord(),
});



export default class MainActions {
  constructor(subscribableState) {
    this.state = subscribableState;

    this.initializeState().then(() => {
      console.log('MainActions state initialized');
    });
  }

  initializeState = async () => {
    this.state.set(new MainStateRecord());

    this._setLoadingMessage('Loading profile...');

    this.storage = await createStorageBackend();

    await this._storageLoadProfile();

    await this._storageLoadSavedWordList();

    if (!process.argv.includes('--nodicts')) {
      this._setLoadingMessage('Loading dictionaries...');

      await this._loadDictionaries(progressMsg => {
        this._setLoadingMessage(progressMsg);
      });
    }

    this._clearLoadingMessage();
  };

  _clearLoadingMessage = (msg) => {
    this.state.set(this.state.get().set('modalLoadingMessage', null));
  };

  _setLoadingMessage = (msg) => {
    this.state.set(this.state.get().set('modalLoadingMessage', msg));
  };

  _addCollection = async (name, locator) => {
    console.log('add collection');
  }

  _storageLoadProfile = async () => {
    console.log('storage load profile');
  };

  _storageSaveProfile = async () => {
    const state = this.state.get();
    console.log('storage save profile');
  };

  _storageLoadSavedWordList = async () => {
    console.log('storage load saved word list');
  };

  loadVideoPlaybackPosition = async (collectionLocator, videoId) => {

  };

  _storageSavePlaybackPosition = async (collectionLocator, videoId, position) => {

  };
};

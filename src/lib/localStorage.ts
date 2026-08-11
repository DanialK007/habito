// Local storage service using IndexedDB for offline-first functionality

const DB_NAME = 'HabitoDB';
const DB_VERSION = 1;
const HABITS_STORE = 'habits';
const USER_SETTINGS_STORE = 'userSettings';

class LocalStorageService {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create habits store
        if (!db.objectStoreNames.contains(HABITS_STORE)) {
          const habitsStore = db.createObjectStore(HABITS_STORE, { keyPath: 'id' });
          habitsStore.createIndex('userId', 'userId', { unique: false });
          habitsStore.createIndex('deleted', 'deleted', { unique: false });
        }

        // Create user settings store
        if (!db.objectStoreNames.contains(USER_SETTINGS_STORE)) {
          db.createObjectStore(USER_SETTINGS_STORE, { keyPath: 'key' });
        }
      };
    });
  }

  // Habits CRUD operations
  async getHabits(): Promise<any[]> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([HABITS_STORE], 'readonly');
      const store = transaction.objectStore(HABITS_STORE);
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const habits = request.result.filter(habit => !habit.deleted);
        resolve(habits);
      };
    });
  }

  async getHabitById(id: string): Promise<any | null> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([HABITS_STORE], 'readonly');
      const store = transaction.objectStore(HABITS_STORE);
      const request = store.get(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || null);
    });
  }

  async saveHabit(habit: any): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([HABITS_STORE], 'readwrite');
      const store = transaction.objectStore(HABITS_STORE);
      const request = store.put(habit);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async deleteHabit(id: string): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([HABITS_STORE], 'readwrite');
      const store = transaction.objectStore(HABITS_STORE);
      
      // Soft delete
      const getRequest = store.get(id);
      getRequest.onsuccess = () => {
        const habit = getRequest.result;
        if (habit) {
          habit.deleted = true;
          habit.deletedAt = new Date().toISOString();
          const putRequest = store.put(habit);
          putRequest.onerror = () => reject(putRequest.error);
          putRequest.onsuccess = () => resolve();
        } else {
          resolve();
        }
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  async permanentlyDeleteHabit(id: string): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([HABITS_STORE], 'readwrite');
      const store = transaction.objectStore(HABITS_STORE);
      const request = store.delete(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async restoreHabit(id: string): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([HABITS_STORE], 'readwrite');
      const store = transaction.objectStore(HABITS_STORE);
      
      const getRequest = store.get(id);
      getRequest.onsuccess = () => {
        const habit = getRequest.result;
        if (habit) {
          habit.deleted = false;
          habit.deletedAt = null;
          const putRequest = store.put(habit);
          putRequest.onerror = () => reject(putRequest.error);
          putRequest.onsuccess = () => resolve();
        } else {
          resolve();
        }
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  async getDeletedHabits(): Promise<any[]> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([HABITS_STORE], 'readonly');
      const store = transaction.objectStore(HABITS_STORE);
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const deletedHabits = request.result.filter(habit => habit.deleted);
        resolve(deletedHabits);
      };
    });
  }

  // User settings operations
  async getUserSetting(key: string): Promise<any | null> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([USER_SETTINGS_STORE], 'readonly');
      const store = transaction.objectStore(USER_SETTINGS_STORE);
      const request = store.get(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const result = request.result;
        resolve(result ? result.value : null);
      };
    });
  }

  async setUserSetting(key: string, value: any): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([USER_SETTINGS_STORE], 'readwrite');
      const store = transaction.objectStore(USER_SETTINGS_STORE);
      const request = store.put({ key, value });

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  // Clear all data (for logout/reset)
  async clearAllData(): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([HABITS_STORE, USER_SETTINGS_STORE], 'readwrite');
      
      const habitsStore = transaction.objectStore(HABITS_STORE);
      const settingsStore = transaction.objectStore(USER_SETTINGS_STORE);
      
      const habitsRequest = habitsStore.clear();
      const settingsRequest = settingsStore.clear();

      transaction.onerror = () => reject(transaction.error);
      transaction.oncomplete = () => resolve();
    });
  }
}

export const localStorageService = new LocalStorageService();
import {createMMKV} from 'react-native-mmkv';

export const storage = createMMKV({
  id: 'easysy-storage',
});

export const storageService = {
  getString: (key: string): string | undefined => storage.getString(key),
  setString: (key: string, value: string): void => storage.set(key, value),

  getNumber: (key: string): number | undefined => storage.getNumber(key),
  setNumber: (key: string, value: number): void => storage.set(key, value),

  getBoolean: (key: string): boolean | undefined => storage.getBoolean(key),
  setBoolean: (key: string, value: boolean): void => storage.set(key, value),

  getObject: <T>(key: string): T | null => {
    const raw = storage.getString(key);
    if (!raw) {
      return null;
    }
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  },

  setObject: <T>(key: string, value: T): void => {
    storage.set(key, JSON.stringify(value));
  },

  remove: (key: string): void => {
    storage.remove(key);
  },

  clearAll: (): void => storage.clearAll(),
};

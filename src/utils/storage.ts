const STORAGE_KEY = 'taskflow:columns';

// Функция сохранения колонки в localStorage
export const saveColumns = <T>(columns: T): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(columns));
  } catch (error) {
    console.error('Сохранить файл не удалось:', error);
  }
};

// Загружаем данные из localStorage
export const loadColumns = <T>(): T | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) return null;

    return JSON.parse(raw) as T;
  } catch (error) {
    console.error('Не удалось загрузить колонки:', error);
    return null;
  }
};

export const clearColumns = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};

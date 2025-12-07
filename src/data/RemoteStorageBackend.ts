import type { Cycle } from "./ICycle";
import type { StorageBackend } from "./types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

export class RemoteStorageBackend implements StorageBackend {
  private async fetchAPI<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error?.message || `API request failed: ${response.status}`);
    }

    return response.json();
  }

  // Cycles
  async getCycles(): Promise<Cycle[]> {
    const data = await this.fetchAPI<{ cycles: Cycle[] }>('/cycles');
    return data.cycles;
  }

  async setCycles(cycles: Cycle[]): Promise<void> {
    await this.fetchAPI('/cycles', {
      method: 'POST',
      body: JSON.stringify({ cycles }),
    });
  }

  // Language
  async getLanguage(): Promise<string> {
    const settings = await this.fetchAPI<any>('/settings');
    return settings.language;
  }

  async setLanguage(value: string): Promise<void> {
    await this.fetchAPI('/settings/language', {
      method: 'PUT',
      body: JSON.stringify({ value }),
    });
  }

  // Theme
  async getTheme(): Promise<string> {
    const settings = await this.fetchAPI<any>('/settings');
    return settings.theme;
  }

  async setTheme(value: string): Promise<void> {
    await this.fetchAPI('/settings/theme', {
      method: 'PUT',
      body: JSON.stringify({ value }),
    });
  }

  // IsNotificationEnabled
  async getIsNotificationEnabled(): Promise<boolean> {
    const settings = await this.fetchAPI<any>('/settings');
    return settings.isNotificationEnabled;
  }

  async setIsNotificationEnabled(value: boolean): Promise<void> {
    await this.fetchAPI('/settings/isNotificationEnabled', {
      method: 'PUT',
      body: JSON.stringify({ value }),
    });
  }

  // LastNotificationId
  async getLastNotificationId(): Promise<number> {
    const settings = await this.fetchAPI<any>('/settings');
    return settings.lastNotificationId;
  }

  async setLastNotificationId(value: number): Promise<void> {
    await this.fetchAPI('/settings/lastNotificationId', {
      method: 'PUT',
      body: JSON.stringify({ value }),
    });
  }

  // MaxNumberOfDisplayedCycles
  async getMaxNumberOfDisplayedCycles(): Promise<number> {
    const settings = await this.fetchAPI<any>('/settings');
    return settings.maxNumberOfDisplayedCycles;
  }

  async setMaxNumberOfDisplayedCycles(value: number): Promise<void> {
    await this.fetchAPI('/settings/maxNumberOfDisplayedCycles', {
      method: 'PUT',
      body: JSON.stringify({ value }),
    });
  }
}

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const DEFAULT_SETTINGS_ID = 'default';

export interface Settings {
  language: string;
  theme: string;
  isNotificationEnabled: boolean;
  lastNotificationId: number;
  maxNumberOfDisplayedCycles: number;
}

export async function getSettings(): Promise<Settings> {
  let settings = await prisma.settings.findUnique({
    where: { id: DEFAULT_SETTINGS_ID }
  });

  if (!settings) {
    settings = await prisma.settings.create({
      data: {
        id: DEFAULT_SETTINGS_ID
      }
    });
  }

  return {
    language: settings.language,
    theme: settings.theme,
    isNotificationEnabled: settings.isNotificationEnabled,
    lastNotificationId: settings.lastNotificationId,
    maxNumberOfDisplayedCycles: settings.maxNumberOfDisplayedCycles
  };
}

export async function updateSetting(key: string, value: any): Promise<void> {
  const existing = await prisma.settings.findUnique({
    where: { id: DEFAULT_SETTINGS_ID }
  });

  if (!existing) {
    await prisma.settings.create({
      data: {
        id: DEFAULT_SETTINGS_ID,
        [key]: value
      }
    });
  } else {
    await prisma.settings.update({
      where: { id: DEFAULT_SETTINGS_ID },
      data: { [key]: value }
    });
  }
}

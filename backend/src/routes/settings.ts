import { Router } from 'express';
import { z } from 'zod';
import { getSettings, updateSetting } from '../services/settingsService.js';

const router = Router();

const SettingValueSchema = z.object({
  value: z.union([z.string(), z.number(), z.boolean()])
});

router.get('/', async (req, res, next) => {
  try {
    const settings = await getSettings();
    res.json(settings);
  } catch (error) {
    next(error);
  }
});

router.put('/:key', async (req, res, next) => {
  try {
    const { key } = req.params;
    const result = SettingValueSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        error: {
          message: 'Validation failed',
          details: result.error.errors
        }
      });
    }

    const validKeys = ['language', 'theme', 'isNotificationEnabled', 'lastNotificationId', 'maxNumberOfDisplayedCycles'];
    if (!validKeys.includes(key)) {
      return res.status(400).json({
        error: {
          message: `Invalid setting key: ${key}`
        }
      });
    }

    await updateSetting(key, result.data.value);
    res.json({ key, value: result.data.value });
  } catch (error) {
    next(error);
  }
});

export default router;

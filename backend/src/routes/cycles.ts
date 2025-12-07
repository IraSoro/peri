import { Router } from 'express';
import { z } from 'zod';
import { getAllCycles, saveCycles } from '../services/cycleService.js';

const router = Router();

const CycleSchema = z.object({
  cycleLength: z.number(),
  periodLength: z.number(),
  startDate: z.string()
});

const CyclesArraySchema = z.object({
  cycles: z.array(CycleSchema)
});

router.get('/', async (req, res, next) => {
  try {
    const cycles = await getAllCycles();
    res.json({ cycles });
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const result = CyclesArraySchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        error: {
          message: 'Validation failed',
          details: result.error.errors
        }
      });
    }

    const count = await saveCycles(result.data.cycles);
    res.json({ success: true, count });
  } catch (error) {
    next(error);
  }
});

export default router;

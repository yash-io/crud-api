import express from 'express';
import { listPeople, getPerson, createPerson, updatePerson, deletePerson } from '../middleware/crud.controller.js';

const router = express.Router();

// json crud endpoints via middleware
router.get('/', listPeople);
router.get('/:id', getPerson);
router.post('/', createPerson);
router.put('/:id', updatePerson);
router.delete('/:id', deletePerson);

export default router;

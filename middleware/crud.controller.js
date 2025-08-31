// CRUD controller placed in middleware folder per request
import Person from '../models/Person.js';

// List all people
export async function listPeople(req, res, next) {
  try {
    const people = await Person.find();
    res.json(people);
  } catch (err) { next(err); }
}

// Get one person
export async function getPerson(req, res, next) {
  try {
    const person = await Person.findById(req.params.id);
    if (!person) return res.status(404).json({ error: 'Not found' });
    res.json(person);
  } catch (err) { next(err); }
}

// Create person
export async function createPerson(req, res, next) {
  try {
    const created = await Person.create(req.body);
    res.status(201).json(created);
  } catch (err) { next(err); }
}

// Update person
export async function updatePerson(req, res, next) {
  try {
    const updated = await Person.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ error: 'Not found' });
    res.json(updated);
  } catch (err) { next(err); }
}

// Delete person
export async function deletePerson(req, res, next) {
  try {
    const deleted = await Person.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  } catch (err) { next(err); }
}

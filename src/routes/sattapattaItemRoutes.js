import express from 'express';
import sattapattaItemController from '../controllers/sattapattaItemController.js';
import auth from '../middlewares/auth.js'; // Import your existing auth middleware


const router = express.Router();
import multer from 'multer';
const upload = multer({ storage: multer.memoryStorage() });


router.post('/', auth, upload.array('imageFiles', 5), sattapattaItemController.createItem);
router.put('/edit/:id', auth, upload.array('imageFiles', 5), sattapattaItemController.editOwnItem);
// other routes without multer

router.get('/', sattapattaItemController.getAllItems); // No auth needed for getting all items (public)
router.get('/my-items', auth, sattapattaItemController.getItemsByOwner); // Apply auth middleware
router.get('/:id', sattapattaItemController.getItemById); // No auth needed for getting a single item (public)
router.put('/:id', auth, sattapattaItemController.updateItem); // Apply auth middleware
router.delete('/:id', auth, sattapattaItemController.deleteItem); // Apply auth middleware

export default router;

const express = require('express');
const { check } = require('express-validator');
const { restrictLogIn } = require('../middlewares/authCheck');
const { validate } = require('../middlewares/validate');
const {
    createClass,
    getAllClasses,
    getClassById,
    updateClass,
    deleteClass
} = require('../controllers/class.controller');

const router = express.Router();

// Create a new class
router.post('/',
    restrictLogIn,
    [
        check('name').notEmpty().withMessage('Class name is required.'),
        check('incharge').isMongoId().withMessage('Incharge must be a valid user ID.'),
        check('type').notEmpty().withMessage('Class type is required.')
    ],
    validate,
    createClass
);

router.get('/', restrictLogIn, getAllClasses);


router.get('/:classId',
    restrictLogIn,
    check('classId').isMongoId().withMessage('Invalid Class ID.'),
    validate,
    getClassById
);


router.put('/:classId',
    restrictLogIn,
    [
        check('classId').isMongoId().withMessage('Invalid Class ID.'),
        check('name').optional().notEmpty().withMessage('Class name cannot be empty.'),
        check('incharge').optional().isMongoId().withMessage('Incharge must be a valid user ID.'),
        check('type').optional().notEmpty().withMessage('Class type cannot be empty.')
    ],
    validate,
    updateClass
);


router.delete('/:classId',
    restrictLogIn,
    check('classId').isMongoId().withMessage('Invalid Class ID.'),
    validate,
    deleteClass
);

module.exports = router;

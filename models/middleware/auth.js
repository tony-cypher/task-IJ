const User = require('../models/user');

const auth = async (req, res, next) => {
    console.log('Auth middleware - Session:', req.session);
    console.log('Auth middleware - UserId:', req.session?.userId);

    if (!req.session || !req.session.userId) {
        return res.status(401).send({ error: 'Please authenticate.' });
    }

    try {
        const user = await User.findById(req.session.userId);
        if (!user) {
            throw new Error();
        }
        req.user = user;
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(401).send({ error: 'Please authenticate.' });
    }
};

module.exports = auth;


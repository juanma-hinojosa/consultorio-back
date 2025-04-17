const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token no proporcionado' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // ahora tenés acceso a req.user si lo necesitás
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Token inválido o expirado' });
  }
};

module.exports = verifyToken;

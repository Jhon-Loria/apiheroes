import User from '../models/userModel.js';

const auth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'No autorizado' });
  }
  // Permitir 'Bearer <id>' o solo '<id>'
  let userId = authHeader.trim();
  if (userId.toLowerCase().startsWith('bearer ')) {
    userId = userId.slice(7).trim();
  }
  // Convertir a número si es posible
  if (!/^[0-9]+$/.test(userId)) {
    return res.status(401).json({ error: 'ID de usuario inválido' });
  }
  const user = await User.findById(Number(userId));
  if (!user) {
    return res.status(401).json({ error: 'Usuario no encontrado' });
  }
  req.user = user;
  next();
};

export default auth; 
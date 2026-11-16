const User = require('../models/User');
const Notification = require('../models/Notification');

const getUsers = async (req, res) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (err) {
    console.error('Get users error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.id === req.user.id) return res.status(400).json({ error: 'Cannot delete yourself' });
    if (user.role === 'superadmin') return res.status(403).json({ error: 'Cannot delete a super admin' });

    await User.delete(req.params.id);

    // Log notification
    await Notification.create({
      actor_id: req.user.id,
      actor_name: req.user.name,
      actor_role: req.user.role,
      action: 'deleted',
      target_name: user.name,
      target_role: user.role,
    });

    res.json({ message: 'User deleted' });
  } catch (err) {
    console.error('Delete user error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { getUsers, deleteUser };

const LogoutController = {
  Logout: async (req, res) => {
    try {
      res.clearCookie('Simp_token', {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
      });

      res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error during logout:', error);
      res.status(500).json({ Message: 'An unexpected error occurred during logout' });
    }
  },
};

module.exports = LogoutController;

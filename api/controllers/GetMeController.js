const GetMeController = {
  GetMe: async (req, res) => {
    try {
      res.status(200).json({
        authenticated: true,
        user: req.user // assuming req.user contains user data
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ authenticated: false });
    }
  },
};

module.exports = GetMeController;

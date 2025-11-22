    require('dotenv').config();
    require("./config/db");
    const app = require("./app");
    const PORT = process.env.PORT || 8080;

    // Server Start
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });

import app from "./app.js";
import { testConnection } from "./Database/db.js";

// Test and sync database before starting server
testConnection();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
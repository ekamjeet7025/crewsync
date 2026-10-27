import 'dotenv/config';
import app from './app.js';
import { connect } from './db.js';
await connect();
app.listen(process.env.PORT || 3100, () => console.log(`CrewSync is running at http://localhost:${process.env.PORT || 3100}`));


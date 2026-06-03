const { Client } = require('pg');

async function testAuth(password) {
  const client = new Client({
    user: 'postgres',
    host: 'localhost',
    port: 5432,
    password: password,
    database: 'postgres'
  });
  try {
    await client.connect();
    console.log(`SUCCESS with password: ${password}`);
    
    // Check if EduERP DB exists
    const res = await client.query("SELECT datname FROM pg_database WHERE datname = 'eduerp'");
    if (res.rows.length === 0) {
      console.log("Database 'eduerp' does not exist. Attempting to create...");
      await client.query("CREATE DATABASE eduerp");
      console.log("Database 'eduerp' created successfully.");
    } else {
      console.log("Database 'eduerp' already exists.");
    }
    
    // Create eduerp user if it doesn't exist
    const roleRes = await client.query("SELECT rolname FROM pg_roles WHERE rolname = 'eduerp'");
    if (roleRes.rows.length === 0) {
      console.log("User 'eduerp' does not exist. Creating...");
      await client.query("CREATE USER eduerp WITH PASSWORD 'eduerp_secret'");
      await client.query("ALTER DATABASE eduerp OWNER TO eduerp");
      await client.query("GRANT ALL PRIVILEGES ON DATABASE eduerp TO eduerp");
      console.log("User 'eduerp' created and privileges granted.");
    } else {
      console.log("User 'eduerp' already exists.");
      // Ensure password is correct
      await client.query("ALTER USER eduerp WITH PASSWORD 'eduerp_secret'");
    }
    
    await client.end();
    return true;
  } catch (err) {
    if (err.message.includes('password authentication failed')) {
      console.log(`FAILED with password: ${password}`);
    } else {
      console.error(`ERROR with password ${password}:`, err.message);
    }
    return false;
  }
}

async function main() {
  const success = await testAuth('Tarun@101');
  if (success) {
    console.log("Setup complete!");
    process.exit(0);
  }
  console.log("COULD NOT GUESS PASSWORD.");
  process.exit(1);
}

main();

const mongoose = require('mongoose');

// Store tenant database connections
const tenantConnections = new Map();

// Get or create a tenant database connection
const getTenantConnection = async (databaseName) => {
    try {
        if (!databaseName) {
            throw new Error('Tenant database name is required');
        }

        // Validate database name
        if (!/^lg_t_[a-f0-9]{10}$/.test(databaseName)) {
    throw new Error('Invalid tenant database name');
}

        // Reuse an existing connection
        if (tenantConnections.has(databaseName)) {
            const existingConnection = tenantConnections.get(databaseName);

            if (existingConnection.readyState === 1) {
                console.log(`Reusing connection: ${databaseName}`);
                return existingConnection;
            }

            if (existingConnection.readyState === 2) {
                await existingConnection.asPromise();
                return existingConnection;
            }

            tenantConnections.delete(databaseName);
        }

        // Check MongoDB URI
        if (!process.env.MONGO_URI) {
            throw new Error('MONGO_URI is missing in environment variables');
        }

        // Create a new tenant database connection
        const connection = mongoose.createConnection(
            process.env.MONGO_URI,
            {
                dbName: databaseName,
                maxPoolSize: 10,
                serverSelectionTimeoutMS: 10000
            }
        );

        // Cache the connection
        tenantConnections.set(databaseName, connection);

        await connection.asPromise();

        console.log(`Connected to tenant database: ${databaseName}`);

        return connection;

    } catch (error) {
        tenantConnections.delete(databaseName);

        console.error('Tenant database connection error:', error.message);

        throw error;
    }
};

module.exports = getTenantConnection;
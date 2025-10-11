require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');

async function main(callback) {
    // Obtén la URI de conexión desde el archivo .env
    const URI = process.env.MONGO_URI; // Declara MONGO_URI en tu archivo .env

    // Crear un MongoClient con un objeto MongoClientOptions para configurar la versión estable de la API
    const client = new MongoClient(URI, {
        serverApi: {
            version: ServerApiVersion.v1,
            strict: true,  // Activa el modo estricto para la API
            deprecationErrors: true,  // Errores si usas métodos obsoletos
        }
    });

    try {
        // Conecta el cliente al servidor (opcional a partir de la versión v4.7)
        await client.connect();

        // Envía un ping para confirmar una conexión exitosa
        await client.db("admin").command({ ping: 1 });
        console.log("✅ Successfully connected to MongoDB Atlas!");

        // Llama al callback que recibirá el cliente de la base de datos para ejecutar las operaciones
        await callback(client);

    } catch (e) {
        // Captura cualquier error y muestra en la consola
        console.error('❌ MongoDB Connection Error:', e);
        throw new Error('Unable to Connect to Database');
    } finally {
        // Asegúrate de cerrar la conexión después de realizar las operaciones
        // client.close(); // Descomentar si deseas cerrar la conexión después de la operación
    }
}

module.exports = main;

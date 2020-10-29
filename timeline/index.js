const CosmosClient = require('@azure/cosmos').CosmosClient;
const client = new CosmosClient(process.env.seccamp2020b3_DOCUMENTDB);

module.exports = async function (context, req) {
    context.log(`x-ms-client-principal-name: ${req.headers['x-ms-client-principal-name']}`);

    const user_id = req.headers['x-ms-client-principal-name'];

    if (user_id == null && (req.body == null || req.body.id == null)) {
        context.res = {
            status: 400,
            body: `login or enter id`,
        };
        return;
    }

    const query = {
        query: "SELECT * FROM c WHERE c.user_id = @user_id ORDER BY c.timestamp DESC",
        parameters: [
            {
                name: "@user_id",
                value: (req.body && req.body.id) ? req.body.id : user_id,
            }
        ]
    };
    const result = await client.database("handson").container("messages")
        .items.query(query).fetchAll();
    
    context.log(`Cosmos DB result: ${JSON.stringify(result)}`);

    const msgs = result.resources.map(e => ({user_id: e.user_id, timestamp: e.timestamp, text: e.text}));

    context.res = {
        status: 200,
        body: {msgs}
    };
}
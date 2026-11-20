const { randomUUID } = require('crypto');

function generateEventId() {
    return `evt_${randomUUID()}`;
}

module.exports = {
    generateEventId
};
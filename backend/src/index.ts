import { app } from '@azure/functions';

// Import all function definitions to register them
import './functions/v3';

app.setup({
    enableHttpStream: true,
});
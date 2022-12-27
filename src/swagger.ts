// swagger config
import swaggerJsDoc from 'swagger-jsdoc';
const options = {
	definition: {
		openapi: '3.0.0',
		info: {
			title: 'Accounts managers API',
			version: '1.0.0',
			description: 'accounts-managers API documentation ',
			termsOfService: 'http://example.com/terms/'
		},

		servers: [
			{
				url: 'http://localhost:3000',
				description: 'My API Documentation',
			},
		],
	},
	apis: ['./src/routes/index.ts'],
};

const specs = swaggerJsDoc(options);
export {
	specs,
}
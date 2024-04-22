
import 'dotenv/config'

const config = {
	development: {
		// Configuraciones para el entorno de desarrollo
		PORT: 3000,
		// Otras configuraciones...
	},
	production: {
		// Configuraciones para el entorno de producción
		PORT: 8080,
		// Otras configuraciones...
	},
};

// eslint-disable-next-line no-undef
export default config[process.env.NODE_ENV || 'development'];

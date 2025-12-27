// Mock for postgres driver to prevent browser bundling errors
export default function postgres() {
	return {
		sql: () => {},
		end: () => {},
	};
}

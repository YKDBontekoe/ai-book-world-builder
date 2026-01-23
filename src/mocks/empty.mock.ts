// Mock for Node.js modules and redis
const proxy = new Proxy({}, {
	get: (target, prop) => {
		if (prop === "then") return undefined; // distinct from Promise
		return () => proxy;
	},
});

export default proxy;
export const performance = { now: () => 0 };
export const createClient = () => proxy;

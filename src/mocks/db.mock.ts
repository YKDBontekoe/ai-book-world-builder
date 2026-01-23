export const db = new Proxy({}, {
	get: () => {
		return () => ({
			from: () => ({
				where: () => ({
					limit: () => [],
					orderBy: () => [],
				}),
			}),
		});
	},
});

export const dbDriver = "postgres";

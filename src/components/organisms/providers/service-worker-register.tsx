"use client";

import { useEffect } from "react";

export function ServiceWorkerRegister() {
	useEffect(() => {
		// Unregister any existing service workers to fix loading issues
		// Service Workers are only available in secure contexts (HTTPS) or localhost
		if ("serviceWorker" in navigator && window.location.protocol === "https:") {
			navigator.serviceWorker.getRegistrations().then((registrations) => {
				for (const registration of registrations) {
					registration.unregister();
				}
			});
		}
	}, []);

	return null;
}

"use client";

import { useEffect } from "react";

export function ServiceWorkerRegister() {
	useEffect(() => {
		// Unregister any existing service workers to fix loading issues
		if ("serviceWorker" in navigator) {
			navigator.serviceWorker.getRegistrations().then((registrations) => {
				for (const registration of registrations) {
					registration.unregister().then((success) => {
						if (success) {
							console.log("Service Worker successfully unregistered");
						}
					});
				}
			});
		}
	}, []);

	return null;
}

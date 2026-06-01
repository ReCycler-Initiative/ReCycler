"use client";

import { useEffect } from "react";

export default function Error({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	useEffect(() => {
		console.error(error);
	}, [error]);

	return (
		<div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-white px-6 text-center">
			<h1 className="text-2xl font-semibold text-gray-900">Something went wrong</h1>
			<p className="max-w-md text-sm text-gray-600">
				The page hit an unexpected error. You can try rendering it again.
			</p>
			<button
				type="button"
				onClick={reset}
				className="rounded-full bg-gray-900 px-5 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
			>
				Try again
			</button>
		</div>
	);
}
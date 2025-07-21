<script lang="ts">
	import { Github, Plus } from '@lucide/svelte';

	// Get session from props
	const { data } = $props();
</script>

<svelte:head>
	<title>DeviceGalaxy - Open Source</title>
</svelte:head>

<div>
	<div
		class="flex h-fit w-full flex-col items-center justify-center gap-4 bg-gradient-to-b from-[#35005E] to-[#100031] p-12 px-2 pb-6 text-white"
	>
		<div class="flex items-center justify-center gap-4">
			<h1 class="text-5xl font-bold">Open Source</h1>
		</div>
	</div>

	<div class="h-12 w-full rounded-b-[100%] bg-[#100031] shadow-2xl"></div>
</div>

<div class="flex w-full flex-col items-center justify-center">
	<div class="flex max-w-7xl flex-col gap-4 p-8">
		<div>
			<h2 class="text-2xl font-bold">Source Code</h2>
			<p>
				DeviceGalaxy is fully open source on GitHub! You can view the code, run your own instance,
				or contribute to the project.
			</p>
			<a
				href="https://github.com/RestartB/DeviceGalaxy"
				class="mt-2 flex h-11 w-fit cursor-pointer items-center justify-center gap-2 rounded-full border-2 border-zinc-400 bg-zinc-100 px-4 py-2 font-bold text-nowrap transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700"
				target="_blank"
				title="GitHub Repo"
			>
				<Github size="20" class="flex-shrink-0" />
				GitHub Repo
			</a>
		</div>

		<div>
			<h2 class="text-2xl font-bold">Key Dependencies</h2>
			<p>
				Without these projects, DeviceGalaxy would not be possible. They help provide the core
				functionality that makes the site work.
			</p>

			<ul class="mt-2 flex flex-col gap-2">
				<li>
					<a href="https://svelte.dev" target="_blank" title="Svelte">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="64"
							height="64"
							viewBox="0 0 24 24"
							class="flex-shrink-0"
							><path
								fill="currentColor"
								d="M10.354 21.125a4.44 4.44 0 0 1-4.765-1.767a4.1 4.1 0 0 1-.703-3.107a4 4 0 0 1 .134-.522l.105-.321l.287.21a7.2 7.2 0 0 0 2.186 1.092l.208.063l-.02.208a1.25 1.25 0 0 0 .226.83a1.34 1.34 0 0 0 1.435.533a1.2 1.2 0 0 0 .343-.15l5.59-3.562a1.16 1.16 0 0 0 .524-.778a1.24 1.24 0 0 0-.211-.937a1.34 1.34 0 0 0-1.435-.533a1.2 1.2 0 0 0-.343.15l-2.133 1.36a4 4 0 0 1-1.135.499a4.44 4.44 0 0 1-4.765-1.766a4.1 4.1 0 0 1-.702-3.108a3.86 3.86 0 0 1 1.742-2.582l5.589-3.563a4 4 0 0 1 1.135-.499a4.44 4.44 0 0 1 4.765 1.767a4.1 4.1 0 0 1 .703 3.107a4 4 0 0 1-.134.522l-.105.321l-.286-.21a7.2 7.2 0 0 0-2.187-1.093l-.208-.063l.02-.207a1.25 1.25 0 0 0-.226-.831a1.34 1.34 0 0 0-1.435-.532a1.2 1.2 0 0 0-.343.15L8.62 9.368a1.16 1.16 0 0 0-.524.778a1.24 1.24 0 0 0 .211.937a1.34 1.34 0 0 0 1.435.533a1.2 1.2 0 0 0 .344-.151l2.132-1.36a4 4 0 0 1 1.135-.498a4.44 4.44 0 0 1 4.765 1.766a4.1 4.1 0 0 1 .702 3.108a3.86 3.86 0 0 1-1.742 2.583l-5.589 3.562a4 4 0 0 1-1.135.499m10.358-17.95C18.484-.015 14.082-.96 10.9 1.068L5.31 4.63a6.4 6.4 0 0 0-2.896 4.295a6.75 6.75 0 0 0 .666 4.336a6.4 6.4 0 0 0-.96 2.396a6.83 6.83 0 0 0 1.168 5.167c2.229 3.19 6.63 4.135 9.812 2.108l5.59-3.562a6.4 6.4 0 0 0 2.896-4.295a6.76 6.76 0 0 0-.665-4.336a6.4 6.4 0 0 0 .958-2.396a6.83 6.83 0 0 0-1.167-5.168"
							/></svg
						>
						<div>
							<h3 class="text-xl font-semibold">SvelteKit</h3>
							<p>
								SvelteKit is the backbone of the Projector. It's a full stack framework, allowing me
								to easily create the frontend and backend in one codebase.
							</p>
						</div>
					</a>
				</li>

				<li>
					<a href="https://orm.drizzle.team" target="_blank" title="Drizzle ORM">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="64"
							height="64"
							viewBox="0 0 24 24"
							class="flex-shrink-0"
							><path
								fill="currentColor"
								d="M5.353 11.823a1.036 1.036 0 0 0-.395-1.422a1.063 1.063 0 0 0-1.437.399L.138 16.702a1.035 1.035 0 0 0 .395 1.422a1.063 1.063 0 0 0 1.437-.398zm11.216 0a1.036 1.036 0 0 0-.394-1.422a1.064 1.064 0 0 0-1.438.399l-3.382 5.902a1.036 1.036 0 0 0 .394 1.422c.506.283 1.15.104 1.438-.398zm7.293-4.525a1.036 1.036 0 0 0-.395-1.422a1.06 1.06 0 0 0-1.437.399l-3.383 5.902a1.036 1.036 0 0 0 .395 1.422a1.063 1.063 0 0 0 1.437-.399zm-11.219 0a1.035 1.035 0 0 0-.394-1.422a1.064 1.064 0 0 0-1.438.398l-3.382 5.903a1.036 1.036 0 0 0 .394 1.422c.506.282 1.15.104 1.438-.399z"
							/></svg
						>
						<div>
							<h3 class="text-xl font-semibold">Drizzle</h3>
							<p>
								Drizzle is an ORM that lets me easily interface with DeviceGalaxy's SQL database. By
								using Drizzle, I don't have to worry about writing manual SQL queries, worry about
								escaping strings, etc.
							</p>
						</div>
					</a>
				</li>

				<li>
					<a href="https://www.better-auth.com" target="_blank" title="Better Auth">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="64"
							height="64"
							viewBox="0 0 24 24"
							class="flex-shrink-0"
							><path
								fill="currentColor"
								d="M0 3.39v17.22h5.783v-5.55h6.434V8.939H5.783V3.39Zm12.217 5.55h5.638v6.122h-5.638v5.548H24V3.391H12.217Z"
							/></svg
						>
						<div>
							<h3 class="text-xl font-semibold">Better Auth</h3>
							<p>
								Better Auth is an auth plugin that lets me easily manage my own local auth. It has
								built in support for encrypted and salted passwords, 2FA, OAuth, Drizzle
								integration, and more.
							</p>
						</div>
					</a>
				</li>

				<li>
					<a href="https://lucide.dev" target="_blank" title="Lucide">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="64"
							height="64"
							viewBox="0 0 24 24"
							class="flex-shrink-0"
							><path
								fill="currentColor"
								d="M18.483 1.123a1.1 1.1 0 0 0-.752.362a1.09 1.09 0 0 0 .088 1.54a11.96 11.96 0 0 1 4 8.946a7.62 7.62 0 0 1-7.637 7.636a7.62 7.62 0 0 1-7.637-7.636a3.255 3.255 0 0 1 3.273-3.273c1.82 0 3.273 1.45 3.273 3.273a1.09 1.09 0 0 0 1.09 1.09a1.09 1.09 0 0 0 1.092-1.09c0-3-2.455-5.455-5.455-5.455s-5.454 2.455-5.454 5.455c0 5.408 4.408 9.818 9.818 9.818S24 17.379 24 11.971A14.16 14.16 0 0 0 19.272 1.4a1.1 1.1 0 0 0-.789-.277M9.818 2.15C4.408 2.151 0 6.561 0 11.97a14.16 14.16 0 0 0 4.8 10.637a1.09 1.09 0 0 0 1.54-.096a1.09 1.09 0 0 0-.095-1.54a11.96 11.96 0 0 1-4.063-9a7.62 7.62 0 0 1 7.636-7.637a7.62 7.62 0 0 1 7.637 7.636a3.256 3.256 0 0 1-3.273 3.273a3.256 3.256 0 0 1-3.273-3.273a1.09 1.09 0 0 0-1.09-1.09a1.09 1.09 0 0 0-1.092 1.09c0 3 2.455 5.455 5.455 5.455s5.454-2.455 5.454-5.455c0-5.408-4.408-9.818-9.818-9.818z"
							/></svg
						>
						<div>
							<h3 class="text-xl font-semibold">Lucide</h3>
							<p>
								Lucide is an awesome icon pack, with over 1000 icons, all of them available as
								Svelte components. All of the icons in this project come from them!
							</p>
						</div>
					</a>
				</li>

				<li>
					<a href="https://superforms.rocks" target="_blank" title="SuperForms">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="64"
							height="64"
							viewBox="0 0 24 24"
							class="flex-shrink-0"
							><path
								fill="currentColor"
								d="M19.088 2.477L24 7.606L12.521 20.485l-.925 1.038L0 7.559l5.108-5.082zm-17.434 5.2l6.934-4.003H5.601L1.619 7.636zm12.117-4.003L3.333 9.7l2.149 2.588l10.809-6.241l-.2-.346l2.851-1.646l-.365-.381zm7.52 2.834L8.257 14.034h5.101v-.4h3.667l5.346-5.998zm-7.129 10.338H9.268l2.36 2.843z"
							/></svg
						>
						<div>
							<h3 class="text-xl font-semibold">SuperForms and Zod</h3>
							<p>
								SuperForms is a form library that lets me easily create forms. It integrates with
								Zod for live validation on the client, and server side validation.
							</p>
						</div>
					</a>
				</li>

				<li>
					<a
						href="https://github.com/RestartB/DeviceGalaxy/blob/master/package.json"
						target="_blank"
						title="All Other Dependencies"
					>
						<Plus size="64" class="flex-shrink-0" />
						<div>
							<h3 class="text-xl font-semibold">Every other dependency!</h3>
							<p>
								DeviceGalaxy wouldn't be around without the many other dependencies that it uses. To
								check out the full list, view the package.json file in the GitHub repo!
							</p>
						</div>
					</a>
				</li>
			</ul>
		</div>
	</div>
</div>

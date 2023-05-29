<script lang="ts">
	import { onMount } from "svelte";
	import { blur } from "svelte/transition";
	import Tab, { Label } from "@smui/tab";
	import TabBar from "@smui/tab-bar";
	import Introduction from "./Introduction.svelte";
	import Resume from "./Resume.svelte";
	import Projects from "./Projects.svelte";
	import Contact from "./Contact.svelte";
	import Content from "./Content.svelte";
	import { imgUrls } from "../imageUrls";

	type SectionLabel =
		| "Introduction"
		| "Experience"
		| "Projects"
		| "Resume"
		| "Contact"
		| "";

	let active: SectionLabel = "Introduction";
	let activeProxy: SectionLabel = "Introduction";
	let loaded: boolean = false;

	const sections: { Component: typeof Introduction; label: SectionLabel }[] =
		[
			{ Component: Introduction, label: "Introduction" },
			{ Component: Projects, label: "Projects" },
			{ Component: Resume, label: "Resume" },
			{ Component: Contact, label: "Contact" },
		];

	onMount(() => {
		setTimeout(() => (loaded = true), 50);
	});
</script>

<svelte:head>
	{#each imgUrls as url}
		<link rel="preload" href={url} as="image" />
	{/each}
</svelte:head>

<main>
	<div class="hero-text-container">
		{#if loaded}
			<span in:blur={{ duration: 500, amount: 70 }} class="hero-text">
				<h1>Bryson Davis</h1>
				<h2 class="hero-subtext">
					<!-- developer for interactive media -->
					interactive media + web developer
				</h2>
			</span>
		{/if}
	</div>
	{#if loaded}
		<div
			id="tab-bar"
			class="tab-bar-background"
			in:blur={{ duration: 500, amount: 70 }}
		>
			<span>
				<TabBar
					tabs={["Introduction", "Projects", "Resume", "Contact"]}
					let:tab
					bind:active
				>
					<Tab
						on:click={() => {
							document
								.getElementById("tab-bar")
								.scrollIntoView(true);
							activeProxy = "";
						}}
						{tab}
					>
						<Label>{tab}</Label>
					</Tab>
				</TabBar>
			</span>
		</div>
	{/if}
	<Content>
		{#each sections as { Component: Element, label }}
			{#if label === activeProxy}
				<div
					transition:blur={{ duration: 500, amount: 70 }}
					on:outroend={() => {
						activeProxy = active;
					}}
				>
					<Element />
				</div>
			{/if}
		{/each}
	</Content>
</main>

<style>
	@import "@smui/tab/bare.css";
	@import "@smui/tab-bar/bare.css";

	.hero-text-container {
		height: calc(100vh - 3em);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.hero-text {
		margin: 0;
		background-color: #000000;
		padding: 5vw;
		text-shadow: 3px 3px #6300ee;
	}

	.hero-subtext {
		text-align: right;
	}

	.tab-bar-background {
		background-color: white;
		position: sticky;
		top: 0px;
		bottom: 0px;
		z-index: 2;
	}

	h1 {
		font-family: futura-pt, sans-serif;
		font-weight: 300;
		color: white;
		font-size: 9vw;
		text-transform: lowercase;
		letter-spacing: 4px;
		line-height: 0;
	}

	h2 {
		color: white;
		font-family: futura-pt;
		font-weight: 300;
		font-size: 3vw;
	}
</style>

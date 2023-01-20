<script lang="ts">
	import type { SvelteComponent } from "svelte";
	import { blur } from "svelte/transition";
	import Tab, { Label } from "@smui/tab";
	import TabBar from "@smui/tab-bar";
	import Introduction from "./Introduction.svelte";
	import Resume from "./Resume.svelte";
	import Projects from "./Projects.svelte";
	import Contact from "./Contact.svelte";
	import Content from "./Content.svelte";

	type SectionLabel =
		| "Introduction"
		| "Experience"
		| "Projects"
		| "Resume"
		| "Contact"
		| "";

	let active: SectionLabel = "Introduction";
	let activeProxy: SectionLabel = "Introduction";

	const sections: { Element: typeof SvelteComponent; label: SectionLabel }[] =
		[
			{ Element: Introduction, label: "Introduction" },
			{ Element: Projects, label: "Projects" },
			{ Element: Resume, label: "Resume" },
			{ Element: Contact, label: "Contact" }
		]
</script>

<main>
	<div class="hero-text-container">
		<span class="hero-text">
			<h1>Bryson Davis</h1>
			<h2 class="hero-subtext">
				<!-- developer for interactive media -->
				interactive media + web developer
			</h2>
		</span>
	</div>
	<div id="tab-bar" class="tab-bar-background">
		<TabBar
			tabs={["Introduction", "Projects", "Resume", "Contact"]}
			let:tab
			bind:active
		>
			<Tab
				on:click={() => {
					document.getElementById("tab-bar").scrollIntoView(true);
					activeProxy = "";
				}}
				{tab}
			>
				<Label>{tab}</Label>
			</Tab>
		</TabBar>
	</div>
	<Content>
		{#each sections as { Element, label }}
			{#if label === activeProxy}
				<div
					transition:blur={{ duration: 500, amount: 70 }}
					on:outroend={() => { activeProxy = active }}
				>
					<Element />
				</div>
			{/if}
		{/each}
	</Content>
</main>

<style>
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

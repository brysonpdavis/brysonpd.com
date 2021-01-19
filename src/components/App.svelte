<script>
	import Tab, {Label} from '@smui/tab'
	import TabBar from '@smui/tab-bar'
	import Introduction from './Introduction.svelte'
	import Resume from './Resume.svelte'
	import Projects from './Projects.svelte'
	import Contact from './Contact.svelte'
	import Content from './Content.svelte'

	let active = 'Introduction'
</script>

<style>
	.hero-text-container {
		height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.hero-text {
		margin: 0;
		background-color: #000000aa;
		padding: 24px;
	}

	.hero-subtext {
		text-align: right;
	}

	.tab-bar-background {
		background-color: white;
		position: sticky;
		top: 0px;
		bottom: 0px;
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

<main>
	<div class="hero-text-container">
		<span class = "hero-text">
			<h1>Bryson Davis</h1>
			<h2 class = "hero-subtext">developer for interactive media</h2>
		</span>
	</div>
	<div class="tab-bar-background">
		<TabBar tabs={['Introduction', 'Resume', 'Projects', 'Contact']} let:tab bind:active > 
			<Tab {tab}>
				<Label> {tab} </Label>
			</Tab>
		</TabBar>
	</div>
	<Content>
		{#if active === 'Introduction'}
			<Introduction />
		{:else if active === 'Resume'}
			<Resume />
		{:else if active === 'Projects'}
			<Projects />
		{:else}
			<Contact />
		{/if}
	</Content>
</main>
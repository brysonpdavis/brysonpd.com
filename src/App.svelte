<script>
	import Tab, {Label} from '@smui/tab'
	import TabBar from '@smui/tab-bar'
	import Introduction from './Introduction.svelte'
	import Resume from './Resume.svelte'
	import Projects from './Projects.svelte'
	import Contact from './Contact.svelte'
	import Hero from './Hero.svelte'

	let active = 'Introduction'
</script>

<main>
	<h1>
		Bryson Davis
	</h1>
	<Hero />
	<TabBar tabs={['Introduction', 'Resume', 'Projects', 'Contact']} let:tab bind:active > 
		<Tab {tab}>
			<Label> {tab} </Label>
		</Tab>
	</TabBar>
	{#if active === 'Introduction'}
		<Introduction />
	{:else if active === 'Resume'}
		<Resume />
	{:else if active === 'Projects'}
		<Projects />
	{:else}
		<Contact />
	{/if}

</main>

<style>
	main {
		text-align: center;
		padding: 1em;
		max-width: 240px;
		margin: 0 auto;
	}

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}
</style>
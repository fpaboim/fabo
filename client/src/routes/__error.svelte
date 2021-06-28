<script context='module'>
  export function load({error, status}) {
    return {
      props: {
        title: `${status}: ${error.message}`
      }
    }
  }
</script>

<script>
  export let title
</script>

<main>
  <h2>{title}</h2>
</main>

<style>
</style>

<script context="module">
  import { browser, dev } from '$app/env';

  export const prerender = false
</script>

<script>
  import { post, getPresignedPostData } from '$lib/req_utils'
  import postValidators from '$fabo/models/Post/validation.js'
  import { getErrors } from '$lib/form_utils.js'

  let resetInput = () => {
    return {
      title: '',
      img: '',
      body : '',
    }
  }
  let formInput = resetInput()
  let errorMsgs = resetInput()
  let fileinput = undefined

  const onFileSelected = async e => {
    let image = e.target.files[0];
    let reader = new FileReader();

    if (!image)
      return
    reader.readAsDataURL(image);
    reader.onload = async e => {
      formInput.img = e.target.result
      let res = await post('/upload/signS3', {
        name: image.name,
        type: image.type
      })
      console.log("RESs:", res)
    };
  }

  const handleSubmit = async () => {
    try {
      let res = {}

      const validationErrors = getErrors(formInput, postValidators)
      errorMsgs = {...errorMsgs, ...validationErrors}

      for (let error in errorMsgs) {
        if (errorMsgs[error] != '')
          return
      }

      if (!res.errors) {
        res = await post('/post/create', {
          title: formInput.title,
          body: formInput.body
        })
      }

      if (res.errors) {
        let errors = res.errors
        for (let error in errors) {
          errorMsgs[error] = errors[error].message
        }
        return
      }

      console.log('RES:', res)
    } catch(err) {
      console.log(err)
      alert(err.error)
    }
  }
</script>

<svelte:head>
  <title>Author a post</title>
</svelte:head>

<div class="content">
  <div class="flex flex-col items-center justify-center pt-2">
    <div class="font-semibold text-lg pb-2">Write a post</div>

    <form class='w-full' id="form" on:submit|preventDefault={handleSubmit} novalidate on:keydown={() => errorMsgs = resetInput()}>

      <div class="z-0 w-full mb-5">
        <div class="flex flex-row">
          <label for="title" class="pt-3 text-right w-1/3 duration-300 pr-3 -z-1 origin-0 text-gray-500">title</label>
          <input
            bind:value={formInput.title}
            type="text"
            name="title"
            placeholder=" "
            class="lg:w-1/3 pt-3 pb-2 block w-full px-0 mt-0 bg-transparent border-0 border-b-2 appearance-none focus:outline-none focus:ring-0 focus:border-black border-gray-100"
          />
        </div>
        <span class="h-10 text-sm text-red-600 {errorMsgs['title'] != '' ? 'visible':'invisible'}" id="error">{errorMsgs['title']}</span>
      </div>

      <div class="z-0 w-full mb-5">
        <div class="flex flex-row">
          <label for="img" class="pt-3 text-right w-1/3 duration-300 pr-3 -z-1 origin-0 text-gray-500">img</label>
          <div on:click={()=>{fileinput.click();}} class="w-1/3 flex flex-row justify-center items-center h-28 rounded-lg bg-gray-100">
            {#if formInput.img}
            <img class="rounded-lg object-cover h-28 w-full" src="{formInput.img}" alt="d" />
            {:else}
            <div >Choose Image</div>
            {/if}
          </div>
          <input style="display:none" type="file" accept=".jpg, .jpeg, .png" on:change={(e)=>onFileSelected(e)} bind:this={fileinput} >
        </div>
        <span class="h-10 text-sm text-red-600 {errorMsgs['img'] != '' ? 'visible':'invisible'}" id="error">{errorMsgs['img']}</span>
      </div>

      <div class="z-0 w-full mb-5">
        <div class="flex flex-row">
          <label for="body" class="pt-3 text-right w-1/3 duration-300 pr-3 -z-1 origin-0 text-gray-500">body</label>
          <textarea
            name="body"
            cols="40"
            class="lg:w-1/3 pt-3 pb-2 block w-full px-0 mt-0 bg-transparent border-0 border-b-2 appearance-none focus:outline-none focus:ring-0 focus:border-black border-gray-100"
            bind:value={formInput.body}
            rows="5"/>
        </div>
        <span class="h-10 text-sm text-red-600 {errorMsgs['body'] != '' ? 'visible':'invisible'}" id="error">{errorMsgs['body']}</span>
      </div>

      <div class="pt-5 flex flex-col justify-center items-center">
        <button
          id="button"
          type="submit"
          class="w-full lg:w-40 px-6 py-3 mt-3 text-lg text-white transition-all duration-150 ease-linear rounded-lg shadow outline-none bg-brand-500 hover:bg-brand-600 hover:shadow-lg focus:outline-none"
        >
          Create
        </button>
      </div>

    </form>
  </div>
</div>

<style>
</style>

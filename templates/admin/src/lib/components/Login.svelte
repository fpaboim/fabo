<script context="module">
  export const prerender = true
</script>

<!-- <script>
  import { goto } from "$app/navigation"
  import { User, modal } from '../../store/store'
  import { post, setLocalStorage } from '$lib/req_utils'
  import { getErrors } from '$lib/form_utils.js'
  import userValidators from '$lib/.fabo/models/User/validation.js'

  export let redirect = true
  export let showlogin

  let resetInput = () => {
    return {
      email:     '',
      password:  '',
    }
  }
  let formInput = resetInput()
  let errorMsgs = resetInput()

  const login = async () => {
    try {
      let res = {}

      const validationErrors = getErrors(formInput, userValidators)
      errorMsgs = {...errorMsgs, ...validationErrors}

      for (let error in errorMsgs) {
        if (errorMsgs[error] != '')
          return
      }

      if (!res.errors) {
        res = await post('/user/auth/login', {
          email: formInput.email,
          password: formInput.password
        })
      }

      if (res.errors) {
        let errors = res.errors
        for (let error in errors) {
          errorMsgs[error] = errors[error].message
        }
        return
      }

      if (res.token) {
        setLocalStorage('jwt', res.token)
      }

      delete res.token
      const user = res
      User.set({
        ...$User,
        ...user
      })
      $modal = false

      if (redirect) {
        await goto('/')
      }
    } catch(err) {
      alert(err.error)
    }
  }
</script>

<div class="w-full max-w-lg bg-secondary rounded-lg p-6">
  <h1 class="text-2xl font-bold mb-8">Login</h1>
  <div on:keydown={() => errorMsgs = resetInput()} on:keyup={e=>e.key==='Enter' && login()}>
    <div class="z-0 w-full flex flex-col">
      <label for="email" class="label label-text">Email</label>
      <input
        bind:value={formInput.email}
        type="email"
        name="email"
        placeholder=" "
        class="input input-bordered"
      />
      <span class="h-10 text-sm text-red-600 {errorMsgs['email'] != '' ? 'visible':'invisible'}" id="error">{errorMsgs['email']}</span>
    </div>

    <div class="z-0 w-full flex flex-col">
      <label for="password" class="label label-text">Password</label>
      <input
        bind:value={formInput.password}
        type="password"
        name="password"
        placeholder=" "
        class="input input-bordered"
      />
      <span class="h-10 text-sm text-red-600 {errorMsgs['password'] != '' ? 'visible':'invisible'}" id="error">{errorMsgs['password']}</span>
    </div>

    <div class="form-control mt-6">
      <input type="button" value="Login" class="btn btn-primary" on:click={() => login()}>
    </div>

  </div>
</div>

<style style lang="postcss">

</style>
 -->

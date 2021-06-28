import { amp, browser, dev, prerendering } from '$app/env';
const API_URL = import.meta.env.API_URL;

export function getLocalStorage(key) {
  try {
    const item = localStorage.getItem(key)
    if (item) {
      return item
    }
  } catch(err) {
    return null
  }

  return null
}

export function setLocalStorage(key, value) {
  try {
    localStorage.setItem(key, value)
  } catch(err) {
    return null
  }

  return true
}

export async function post(url, body) {
  if (dev) {
    url = 'http://192.168.111.2:4000/dev' + url
  } else {
    url = 'https://4bff8f2bb6.execute-api.us-east-1.amazonaws.com/prod' + url
  }
  console.log('post:', url)

  let customError = false
  try {
    let headers = {}
    if (!(body instanceof FormData)) {
      headers['Content-Type'] = 'application/json'
      body = JSON.stringify(body)
    }
    const token = getLocalStorage('jwt')
    if (token) {
      headers['Authorization'] = 'Bearer ' + token
    }

    const res = await fetch(url, {
      method: 'POST',
      body,
      headers
    })

    if (!res.ok) {
      // console.log("POST ERROR", res)
      try {
        const data = await res.json()
        if (data.errors) {
          return {errors:data.errors}
        } else {
          return {errors:[]}
        }
      } catch(err) {
        console.log('ERROR:', err)
        throw err
      }
    }

    return res.json()
  } catch (err) {
    console.log(err)
    throw customError ? err : {id: '', message: 'unknown error'}
  }
}

export async function get(url) {
  url = 'http://localhost:4000' + url
  let customError = false
  try {
    let headers = {}
    headers['Content-Type'] = 'application/json'
    const token = getLocalStorage('jwt')
    if (token) {
      headers['Authorization'] = 'Bearer ' + token
    }

    const res = await fetch(url, {
      headers
    })
    console.log('res:', res)

    if (!res.ok) {
      console.log("POST ERROR", res)
      try {
        const data = await res.json()
        const error = data.error
        customError = true
        throw {error}
      } catch(err) {
        console.log('ERROR:', err)
        throw err
      }
    }

    return res.json()
  } catch (err) {
    console.log('ERROR:', err)
    throw customError ? err : {id: '', message: 'unknown error'}
  }
}

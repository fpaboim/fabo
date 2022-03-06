import { amp, browser, dev, prerendering } from '$app/env';

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

function makeUrl(url) {
  url = import.meta.env.VITE_PUBLIC_BASE_PATH + url

  return url
}

export async function postServer(url, body) {
  url = makeUrl(url)

  let customError = false
  try {
    let headers = {}

    headers['Content-Type'] = 'application/json'
    body = JSON.stringify(body)
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

export async function post(url, body) {
  url = makeUrl(url)

  let customError = false
  try {
    let headers = {}

    headers['Content-Type'] = 'application/json'
    body = JSON.stringify(body)
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
        // console.log('ERROR:', err)
        throw err
      }
    }

    return res.json()
  } catch (err) {
    console.log('POST ERROR:', err)
    throw customError ? err : {id: '', message: 'unknown error'}
  }
}

export async function get(url) {
  url = makeUrl(url)

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

export const uploadFileToS3 = (presignedPostData, file) => {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    Object.keys(presignedPostData.fields).forEach(key => {
      formData.append(key, presignedPostData.fields[key]);
    });
    // Actual file has to be appended last.
    formData.append("file", file);
    const xhr = new XMLHttpRequest();
    xhr.open("POST", presignedPostData.url, true);
    xhr.onload = function () {
      if (this.status >= 200 && this.status < 300) {
        resolve(xhr.response);
      } else {
        if (xhr.responseText.includes('maximum allowed size')) {
          reject({
            status: this.status,
            statusText: 'File too large.'
          });
        }
        reject({
          status: this.status,
          statusText: xhr.statusText
        });
      }
    };
    xhr.onerror = function () {
      if (xhr.responseText.includes('maximum allowed size')) {
        reject({
          status: this.status,
          statusText: 'File too large.'
        });
      }
      reject({
        status: this.status,
        statusText: xhr.statusText
      });
    };
    xhr.send(formData);
  });
};


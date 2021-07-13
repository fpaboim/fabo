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

function makeUrl(url) {
  if (dev) {
    url = 'http://192.168.111.3:4000/dev' + url
  } else {
    url = 'api.' + process.env.DOMAIN + url
  }
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
  console.log('post:', url)

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
    xhr.send(formData);
    xhr.onload = function() {
      this.status === 204 ? resolve() : reject(this.responseText);
    };
  });
};

export const getPresignedPostData = selectedFile => {
  return new Promise(resolve => {
    const xhr = new XMLHttpRequest();

    // Set the proper URL here.
    const url = "https://mysite.com/api/files";
    url = makeUrl('/upload/')

    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(
      JSON.stringify({
        name: selectedFile.name,
        type: selectedFile.type
      })
    );
    xhr.onload = function() {
      resolve(JSON.parse(this.responseText));
    };
  });
};

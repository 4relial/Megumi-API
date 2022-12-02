const axios = require("axios")
module.exports = instagramGetUrl = (url_media) => {
  return new Promise(async (resolve, reject) => {
    const BASE_URL = "https://instasupersave.com/"

    //New Session = Cookies
    try {
      const resp = await axios(BASE_URL);
      const cookie = resp.headers["set-cookie"]; // get cookie from request
      const session = cookie[0].split(";")[0].replace("XSRF-TOKEN=", "").replace("%3D", "")

      //REQUEST CONFIG
      var config = {
        method: 'post',
        url: `${BASE_URL}api/convert`,
        headers: {
          'origin': 'https://instasupersave.com',
          'referer': 'https://instasupersave.com/pt/',
          'sec-fetch-dest': 'empty',
          'sec-fetch-mode': 'cors',
          'sec-fetch-site': 'same-origin',
          'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36 Edg/107.0.1418.52',
          'x-xsrf-token': session,
          'Content-Type': 'application/json',
          'Cookie': `XSRF-TOKEN=${session}; instasupersave_session=${session}`
        },
        data: {
          url: url_media
        }
      };

      //REQUEST
      axios(config).then(function(response) {
        let ig = []
        if (Array.isArray(response.data)) {
          response.data.forEach(post => {
            let url = post.sd === undefined ? post.thumb : post.sd.url
            if (url.includes("jpg") || url.includes("webp") || url.includes("png")) {
              ig.push({
                type: 'image',
                link: url
              })
            } else {
              ig.push({
                type: 'video',
                link: url
              })
            }
          })
        } else {
          if (response.data.url[0].url.includes("jpg") || response.data.url[0].url.includes("webp") || response.data.url[0].url.includes("png") || response.data.url[0].url.includes("jpeg")) {
            ig.push({
              type: 'image',
              link: response.data.url[0].url
            })
          } else {
            ig.push({
              type: 'video',
              link: response.data.url[0].url
            })
          }
        }

        resolve({
          results_number: ig.length,
          url_list: ig
        })
      })
        .catch(function(error) {
          reject(error.message)
        })
    } catch (e) {
      reject(e.message)
    }
  })
}
document.getElementById("Home_button").addEventListener("click", function() {
    window.location = "../html_docs/index.html";
  });

document.getElementById("Login_button_1").addEventListener("click", function() {
    window.location = "../html_docs/Login.html";
  });

function parseCookie(name) {
  const cookieName = `${name}=`;
  const decodedCookie = decodeURIComponent(document.cookie);
  const cookieArray = decodedCookie.split(';');

  for (let i = 0; i < cookieArray.length; i++) {
    let cookie = cookieArray[i];
    while (cookie.charAt(0) === ' ') {
      cookie = cookie.substring(1);
    }
    if (cookie.indexOf(cookieName) === 0) {
      return cookie.substring(cookieName.length, cookie.length);
    }
  }

  return null;
}


tbody = document.getElementById("_tbody");
email = parseCookie('email');


fetch(`http://localhost:5000/mydocs/${email}`)
  .then(response => response.json())
  .then(data => {
    data.forEach(element => {
      var docName = element['name'];
      var convName = element['conv_name'];
      var size = element['size'];
      (size < 1024) ? fileSize = size + "KB" : fileSize = (size / (1024 * 1024)).toFixed(2) + "MB";
      htmlRow = `<tr>
                  <td>${docName}</td>
                  <td>${convName}</td>
                  <td>${fileSize}</td>
                  <td><a href="#">Download</a></td>
                </tr>`
      tbody.insertAdjacentHTML('beforeend', htmlRow);
    });
  })

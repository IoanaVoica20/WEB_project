
document.getElementById("Home_button").addEventListener("click", function() {
    document.cookie = `email=guest; path=/`;
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
  
    return null; 
}

function showAlert(imag,text, func) {
    var alertBox = document.getElementById("alertBox");
    var alertTitle = document.getElementById("alertText");
    var alertImage = document.getElementById("alertImage");
    var alertButton = document.getElementById("alertButton");
   
    alertTitle.textContent = text;
    alertImage.src = imag;
  
    alertButton.addEventListener("click",func);
  
    alertBox.style.display = "block";
  
    
}

function hideAlert() {
    alertBox.style.display = "none";
    alertButton.removeEventListener("click", hideAlert);
}


const form = document.querySelector("form");
fileInput = form.querySelector(".file-input");
progressArea = document.querySelector(".progress-area");
uploadedArea = document.querySelector(".uploaded-area");
uploadedFiles = parseCookie('file');

// pentru a deschide browserul oriunde am da click in zona de browse
form.addEventListener("click",()=>{
    fileInput.click();
 
});

document.getElementById("file-input").addEventListener("change", async(ev)=>{  
    ev.preventDefault();
    const Form = ev.target.files;
   
    try {
        for (let i = 0; i < Form.length; i++) {
            let file = Form[i];
            const formData = new FormData();
            formData.append('file', file); // Append the file content to the FormData object
            formData.append('email',parseCookie('email'));
            
            const response = await fetch('http://localhost:5000/upload', {
                method: 'POST',
                body: formData
            });
            if (response.status==200) {
                console.log('Files uploaded.');
            
            } else {
                console.log('Files upload failed.');
            }
            
        }
        
    } catch (error) {
        console.error('Error uploading PDF files: ', error);
    }
    
});

document.getElementById("file-button").addEventListener("click", async(ev)=>{  
    ev.preventDefault();

    if(parseCookie('email') == 'guest')
    {
        showAlert("../images/alert/bad.png","Va recomandam sa va creati un cont pentru a beneficia de salvarea documentelor.",function(){
            hideAlert();
           
        });
    }
    else{
    try {
        const response = await fetch(`http://localhost:5000/files/${parseCookie('email')}`);
        if(response.ok)
        {
            const fileInformation = await response.json();
            for(let i = 0; i < fileInformation.length;i++)
            {
                var size = fileInformation[i]['size'];
                (size < 1024) ? fileSize = size + "KB" : fileSize = (size / (1024 * 1024)).toFixed(2) + "MB";
                const uploadedHTML = `<li class="row">
                                    <div class="content">
                                    <div class="details">
                                        <span class="name">${fileInformation[i]['name']}</span>
                                        <span class="size">${fileSize}</span>
                                    </div>
                                    </div>
                                </li>`;

                uploadedArea.insertAdjacentHTML('beforeend', uploadedHTML);
            }
        }
        else{
            console.log("Get files failed.");
        }
        

    } catch (err) {
        console.error('ERROR: ', err);
    }
}
});

let downloadButton = document.getElementById("DownloadButton");
let progressBar = document.querySelector(".circular-progress");

let ready = false;
let ConvertButton = document.getElementById("Convert_button");
ConvertButton.addEventListener("click", function() {
    
    const firstRow = uploadedArea.querySelector('.row');
    if (firstRow) {
        firstRow.remove();
    }
    email = parseCookie('email');
    data = {};
    data['email'] = email;
    try{
        const response = fetch('http://localhost:5000/convert', {
                method: 'POST',
                body: JSON.stringify(data),
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        if(response.ok)
        {
            console.log("Document converted.");
        }
        else{
            console.log("Conversion failed.");
        }
    } catch (error) {
        console.error('Error uploading PDF files: ', error);
    }
    
    ConvertButton.style.backgroundColor = " rgba(0,0,0,0.5)";
    
    let valueContainer = document.querySelector(".value-container");
    let progressValue = 0;
    let progressEndValue = 100;
    let speed = 20;

    let progress = setInterval(()=>{
        progressValue++;
        valueContainer.textContent = `${progressValue}%`;
        progressBar.style.background = `conic-gradient(
            rgba(173,6,6,0.8) ${progressValue * 3.6}deg,
            rgba(0,0,0,0.5) ${progressValue * 3.6}deg
        )`
        if(progressValue == progressEndValue){
            clearInterval(progress);
            
            downloadButton.style.backgroundColor = "rgba(173,6,6,0.8)";
        }

    },speed)
    ready = true;
    
});

downloadButton.addEventListener("click", async(ev)=> {
    ev.preventDefault();

    
    progressBar.style.background = "none";
    downloadButton.style.backgroundColor = "rgba(0,0,0,0.5)";
    ConvertButton.style.backgroundColor = "rgba(173,6,6,0.8)";
});
   
docsButton = document.getElementById("myDocsButton");
docsButton.addEventListener("click", function() {

    if(parseCookie('email') == 'guest')
    {
        showAlert("../images/alert/bad.png","Va recomandam sa va creati un cont pentru a beneficia de salvarea documentelor.",function(){
            hideAlert();
           
        });
        docsButton.innerHTML = "THIS SECTION IS AVAILABLE ONLY FOR LOGGED USERS";
    }else{
        window.location = "../html_docs/MyDocsPage.html";
    }
});




var card = document.getElementById("cards");
function signin()
{
    card.style.transform = "rotateY(-180deg)";
}
function login()
{
    card.style.transform = "rotateY(0deg)";
}
function forgot()
{
    card.style.transform = "rotateY(-90deg)";
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
document.getElementById("registrationForm").addEventListener('submit',async(ev) =>{
    ev.preventDefault();

    const form = ev.target;
    const formData = new FormData(form);
     
    const data = {};
    for (let [key, value] of formData.entries()) {
        data[key] = value;
    }  
   
    if(verifyRegisterData(data) == true){
        try{
            const hashedPassword = CryptoJS.SHA256(data.password).toString();
            data.password = hashedPassword;
            const response = await fetch('http://localhost:5000/register',{
                method: 'POST',
                body: JSON.stringify(data),
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if(response.status == 409)
            {
                var email = document.getElementById("email");
                email.value="";
                email.placeholder = "This email is already used.";
                email.classList.add("placeholder-red");
            }
            else if(response.ok){
                console.log('Registration successful');
                showAlert("../images/alert/good.png","Registration successful",function(){
                    hideAlert();
                    window.location = "../html_docs/index.html";
                });
                
            }
            else{
                console.log('Registration failed');
            }
        }
        catch(err){
            console.error('ERROR: ',err);
        }
    }
});
function verifyRegisterData(data)
{
    var check = document.getElementById("checkbox");
  
    if (check.checked==false)
    {
        check.classList.add("check-red");
        var agree = document.getElementById("agree");
        agree.classList.add("check-red");
        return false;
    }
    if(data.password != data.password2)
    {
        var p1 = document.getElementById("password");
        var p2 = document.getElementById("password2");
        p1.value = ""; 
        p2.value = ""; 
        p1.placeholder = "Passwords do not match.";
        p2.placeholder = "Passwords do not match.";
        p1.classList.add("placeholder-red");
        p2.classList.add("placeholder-red");
        return false;
    }
   
        
    return true;
}
document.getElementById("loginForm").addEventListener('submit',async(ev)=>{
    ev.preventDefault();
    const form = ev.target;
    const formData = new FormData(form);
    const data = {};
    for (let [key, value] of formData.entries()) {
        data[key] = value;
    }  

    const agreeCheckbox = document.getElementById("agreeCheckbox");
   
    if (agreeCheckbox.checked) {
        if(data['login-email'] == 'admin@admin.com' && data['login-password'] == 'admin'){
            document.cookie = `email=admin; path=/`;
            window.location = "../html_docs/AdminPage.html";
        }
        else{
        try {
            const response = await fetch('http://localhost:5000/login', {
                method: 'POST',
                body: JSON.stringify(data),
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if(response.status==499)
            {
                var email = document.getElementById("Email");
                email.value="";
                email.placeholder = "No account with this email."
                email.classList.add('placeholder-red');
            }
            else if(response.status == 502)
            {
                var password = document.getElementById('pass');
                password.value = "";
                password.placeholder = "Wrong password.";
                password.classList.add('placeholder-red');
            }
            
            else if (response.status == 200) {
                console.log('Login successful.');
                document.cookie = `email=${data['login-email']}; path=/`;
                window.location = "../html_docs/MainPage.html";
                              
            } 
            else {
                console.log('Login failed');
            }
        } catch (err) {
            console.error('ERROR: ', err);
        }
    }
    } else {
        agreeCheckbox.classList.add('check-red')
        var span = document.getElementById("agreeSpan");
        span.classList.add("check-red");
    }
});
document.getElementById("forgotForm").addEventListener('submit',async(ev)=>{
    ev.preventDefault();

    const form = ev.target;
    const formData = new FormData(form);
     
    const data = {};
    for (let [key, value] of formData.entries()) {
        data[key] = value;
    }  
    if(data['f_password'] == data['f_password2'])
    {
        try {
            const response = await fetch('http://localhost:5000/forgot', {
                method: 'POST',
                body: JSON.stringify(data),
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if(response.status == 409)
            {
                var email = document.getElementById('f_email');
                email.value = "";
                email.placeholder = "No accoount with this email.";
                email.classList.add("placeholder-red")
            }
            else if(response.status == 200)
            {
                showAlert("../images/alert/good.png","Password changed.",function(){
                    hideAlert();
                    window.location = "../html_docs/FirstPage.html";
                });
               
            }
            else {
                console.log('Password reset failed');
            }
        }
        catch (err) {
            console.error('ERROR: ', err);
        }
    }else {
        var pass1 = document.getElementById('f_password');
        pass1.value="";
        pass1.placeholder = "Passwords are not the same.";
        pass1.classList.add("placeholder-red");
        var pass2 = document.getElementById('f_password2');
        pass2.value="";
        pass2.placeholder = "Passwords are not the same.";
        pass2.classList.add("placeholder-red");
    }
});



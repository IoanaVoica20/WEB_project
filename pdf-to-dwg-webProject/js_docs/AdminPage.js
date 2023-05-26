document.getElementById("Login_button_1").addEventListener("click", function() {
  window.location = "../html_docs/Login.html";
});

no_users = document.getElementById('no_users');
user_table = document.getElementById('user_table');
var alertBox = document.getElementById("alertBox");
  var alertTitle = document.getElementById("alertText");
  var alertImage = document.getElementById("alertImage");
  var alertButton = document.getElementById("alertButton");

function showAlert(imag,text, func) {
 
  alertTitle.textContent = text;
  alertImage.src = imag;

  alertButton.addEventListener("click",func);

  alertBox.style.display = "block";

  
}

function hideAlert() {
  alertBox.style.display = "none";
  alertButton.removeEventListener("click", hideAlert);
}

async function deleteAccount(email) {
  console.log(email)
  try {
    const response = await axios.delete('http://localhost:5000/del_account', {
      params: {
        email: email,
      },
    });

    if (response.status === 200) {
      console.log('Account deleted successfully.');
    } else {
      console.log('Account not found or deletion failed.');
    }
  } catch (error) {
    console.error('Error deleting account:', error);
  }
}

fetch('http://localhost:5000/no_users')
  .then(response => response.json())
  .then(data => {
    no_users.textContent = data[0].count
});

fetch('http://localhost:5000/users')
  .then(response=>response.json())
  .then(data => {
    data.forEach(element => {
      var name = element['name'];
      var email = element['email'];
      htmlRow=` <tr>
                    <td >${name}</td>
                    <td >${email}</td>
                    <td ><a href="#" id="stergere-${email}"  type="${email}" >STERGE</a></td>
                </tr>`
      user_table.insertAdjacentHTML('beforeend', htmlRow);
      
      var deleteLink = document.getElementById(`stergere-${email}`);
      deleteLink.addEventListener('click', function(event) {
        event.preventDefault();
        showAlert("../images/alert/bad.png","Sigur doriti sa stergeti acest utilizator?",function(){
          document.getElementById('alertButton').addEventListener("click",function(){
            var emailToDelete = event.target.getAttribute('type');
            console.log(emailToDelete);
            deleteAccount(emailToDelete);
            hideAlert(); 
          });
          
        })
    });
  });
});






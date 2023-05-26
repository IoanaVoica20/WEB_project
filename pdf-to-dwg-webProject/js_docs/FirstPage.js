document.getElementById("Login_button_1").addEventListener("click", function() {
  window.location = "../html_docs/Login.html";
});

document.getElementById("Login_button_2").addEventListener("click", function() {
  window.location = "../html_docs/Login.html";
});

document.getElementById("Guest_button").addEventListener("click", async(ev)=>{
  try{
    const response = await fetch('http://localhost:5000/guest',{
      method: 'POST',
      body: "guest"
    });
    if(response.status==200)
    {
      window.location = "../html_docs/MainPage.html";
      document.cookie = `email=guest; path=/`;
    }
    else{
      console.log("Couldn't continue as guest.");
    }
  }
  catch(err){
    console.error('ERROR: ',err);
  }

});
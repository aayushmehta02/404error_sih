const eye = document.querySelector(".fa-eye")
const password = document.querySelector(".password")
const passValue = password.value
const req = document.querySelector(".requirement")


let switchTurn
switchTurn = false

function showPassword(){
    password.type = "text"
    switchTurn=!switchTurn
    
}

function hidePassword(){
    password.type= "password"
    switchTurn=!switchTurn
    
}

eye.addEventListener("click", ()=>{
    if(switchTurn===false){
        showPassword()
    }else{
        hidePassword()
    }
    
})


const selectInput = document.querySelectorAll('.userType')
const image = document.querySelector('.input_img')


selectInput.forEach(function(eachInput){
    eachInput.addEventListener("click", ()=>{
        if(eachInput.value=="Psychiatrist"){
            showImg()
        }else{
            hideImg()
        }
    })
})

function showImg(){
    image.style.display = "block"
}

function hideImg(){
    image.style.display = "none"
}
const link = "http://localhost:3000/expense/expensetable";

const form = document.getElementById('expense');
form.addEventListener('submit', addexpense);
const deleteexpense = document.getElementById("addedexpense");
deleteexpense.addEventListener('click', deleteExpense);
window.addEventListener("DOMContentLoaded", showexpense);

async function addexpense(event){
   event.preventDefault();
   const amount = event.target.amount.value;
   const description = event.target.description.value;
   const category = event.target.category.value;

   const myObj = {
    amount: amount,
    description: description,
    category: category
   }
   try{
      const token = localStorage.getItem('token');
      console.log(token);
      const response = await axios.post(link, myObj, { headers: { "Authorization": token } });
      console.log(response.data.expense);
      displayexpense(response.data.expense);
   }catch(error){
     console.log(error);
   }
}

async function displayexpense(obj){
    const {id, amount, description, category} = obj;
    const ul = document.getElementById('addedexpense');
    const li = document.createElement('li');
    li.innerHTML = `${amount} - ${description} - ${category}`;
    let btn = document.createElement('button');
    btn.id = id;
    btn.type='click';
    btn.textContent = "Delete Expense";
    btn.className ='delete';
    li.appendChild(btn);

    ul.appendChild(li);
}

async function showexpense(){
    hidePremiumButton();
    showLeaderBoard();
    const token = localStorage.getItem('token');
    
    try{
        const details  = await axios.get(link, {headers: {"Authorization" : token}});
        console.log(details);
        details.data.forEach(element=>{
           console.log(element);
           displayexpense(element);
        })
        }
        catch(err){
            console.log(err);
        }
    
}

async function deleteExpense(event){

    const token = localStorage.getItem('token');
   
    if(event.target.classList.contains("delete")){
    const parentele = event.target.parentElement;
    const idvalue = event.target.id;
    try{
        const response = await axios.delete(`${link}/${idvalue}`, {headers: {"Authorization" : token}});
        console.log(response);
        parentele.remove();
    }
    catch(err){
        console.log(err);
    }
    

}
}

document.getElementById('rzy_btn').onclick = async function(e){
    try{
        const token = localStorage.getItem('token');
    const response = await axios .get("http://localhost:3000/purchase/premium", {headers: {"Authorization": token}});
    console.log(response);
    var options = {
        "key": response.data.key_id,
        "order_id": response.data.order.id,
        "handler": async function (response){
            try {
                await axios.post("http://localhost:3000/update-premium-status", {
                    order_id: options.order_id,
                    payment_id: response.razorpay_payment_id
                }, { headers: { "Authorization": token } });
                hidePremiumButton();
                
                alert("You are now a premium user!");
                
            } catch (error) {
                console.error("Error processing premium purchase:", error);
                alert("An error occurred while processing the premium purchase. Please try again later.");
            }
        }
    }
    
    const rzpy1 = new Razorpay(options);
    rzpy1.open();
    e.preventDefault();
    rzpy1.on('payment.failed', function(response){
        console.log(response);
        alert("Something went wrong");
    })
    }catch(err){
        console.log(err);
    }
    
}

function hidePremiumButton() {
    const premiumButton = document.getElementById('rzy_btn');
    const token = localStorage.getItem('token');
    const messageElement = document.getElementById('premiumMessage');
    
    if (premiumButton && token) {
        
        axios.get("http://localhost:3000/check-premium-status", { headers: { "Authorization": token } })
            .then(response => {
                if (response.data.isPremium) {
                    
                    premiumButton.style.display = 'none';
                    messageElement.innerText = 'You are a premium member now!';
                    showLeaderBoard();
                    messageElement.style.display = 'block';
                } else {
                    
                    premiumButton.style.display = 'block';
                    messageElement.style.display = 'none';
                }
            })
            .catch(error => {
                console.error("Error checking premium status:", error);
            });
    }
}

async function showLeaderBoard(){
    const inputElement = document.createElement('input');
    inputElement.type= "button";
    inputElement.value= 'Show LeaderBoard';
    inputElement.onclick = async()=>{
        const token = localStorage.getItem('token');
        const response = await axios.get("http://localhost:3000/premium/showleaderboard", { headers: { "Authorization": token } });
        console.log(response);
        var leaderboardElem = document.getElementById('leaderboard');
        leaderboardElem.innerHTML = '<h1>Leader Board</h1>';
        response.data.forEach((userDetails) =>{
            leaderboardElem.innerHTML += `<li>Name-${userDetails.name} Total Expense -${userDetails.totalexpense}`;
        })
    }
    document.getElementById('premiumMessage').appendChild(inputElement);
    const viewExpenseBtn = document.createElement('input');
    viewExpenseBtn.type = "button";
    viewExpenseBtn.value = 'View Expense Table';
    viewExpenseBtn.onclick = async () => {
        const token = localStorage.getItem('token');
        // Check if the user is a premium user
        /*const response = await axios.get("http://localhost:3000/check-premium-status", { headers: { "Authorization": token } });
        if (response.data.isPremium) {*/
            // Redirect the user to view the expense table
            window.location.href = "/reporttable/index.html";
        /*} else {
            alert("You need to be a premium user to view the expense table.");
        }*/
    }
    document.getElementById('premiumMessage').appendChild(viewExpenseBtn);
}


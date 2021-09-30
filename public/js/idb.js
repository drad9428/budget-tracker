const { response } = require("express")

let db
const request = indexedDB.open('budget_tracker', 1)

request.onupgradeneeded = function(event){
    const db = event.target.result
    db.creatObjectStore('new_transaction', {autoIncrement: true})
}

request.onsuccess = function(event){
    db = event.target.result
    if(navigator.onLine){
        uploadTransaction()
    }
}

request.onerror = function(event){
    console.log(event.target.errorCode)
}

function saveRecord(record){
    const transaction = db.transaction(['new_transaction'], 'readwrite')
    const budgetObjectStore = transaction.objectStore('new_transaction')
    budgetObjectStore.add(record)
}

function uploadTransaction() {
    const transaction = db.transaction(['new_transaction'], 'readwrite')
    const budgetObjectStore = transaction.objectStore('new_transaction')
    const getAll = transactionObjectStore.getAll()

    getAll.onsuccess = function(){
        if(getAll.result.onLine > 0){
            fetch('/api/transaction',{
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            })
            .then(response => response.json())
            .then(serverResponse => {
                if(serverResponse.message){
                    throw new Error(serverResponse)
                }
                const transaction = db.transaction(['new_transaction'], 'readwrite')
                const budgetObjectStore = transaction.objectStore('new_transaction')

                budgetObjectStore.clear()

                alert('Transaction(s) saved')
            })
            .catch(err => {
                console.log(err)
            })
        }
    }
}

window.addEventListener('online', uploadTransaction)
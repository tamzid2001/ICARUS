//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
var m = []

let displayMode = 'browser';
  const mqStandAlone = '(display-mode: standalone)';
  if (navigator.standalone || window.matchMedia(mqStandAlone).matches) {
    displayMode = 'standalone';
  }
  
if("serviceWorker" in navigator){
  navigator.serviceWorker.register("sw.js").then(registration => {
    console.log(registration)
  }).catch(err => {
    console.log(err)
  })
}
// If a fetch error occurs, log it to the console and show it in the UI.
var handleFetchResult = function(result) {
    if (!result.ok) {
      return result.json().then(function(json) {
        if (json.error && json.error.message) {
          throw new Error(result.url + ' ' + result.status + ' ' + json.error.message);
        }
      }).catch(function(err) {
        showErrorMessage(err);
        throw err;
      });
    }
    return result.json();
  };
  
  // Create a Checkout Session with the selected plan ID
  var createCheckoutSession = function(priceId) {
    return fetch("/create-checkout-session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        priceId: priceId
      })
    }).then(handleFetchResult);
  };
  
  // Handle any errors returned from Checkout
  var handleResult = function(result) {
    if (result.error) {
      showErrorMessage(result.error.message);
    }
  };
  
  var showErrorMessage = function(message) {
    var errorEl = document.getElementById("error-message")
    errorEl.innerText = message;
    errorEl.style.display = "block";
  };
  
  /* Get your Stripe publishable key to initialize Stripe.js */
  fetch("/setup")
    .then(handleFetchResult)
    .then(function(json) {
      var publishableKey = json.publishableKey;
      var basicPriceId = json.basicPrice;
  
      var stripe = Stripe(publishableKey);
      // Setup event handler to create a Checkout Session when button is clicked
      document
        .getElementById("subscribe-btn")
        .addEventListener("click", function(evt) {
          document.getElementById("subscribe-btn").innerText = ""
          document.getElementById("subscribe-btn").innerHTML = `<div class="pt-2 mt-2 spinner-border text-primary align-self-center" role="status" style="width: 30px; height: 30px; border-width: 5px;">
        </div>`
          createCheckoutSession(basicPriceId).then(function(data) {
            // Call Stripe.js method to redirect to the new Checkout page
            stripe
              .redirectToCheckout({
                sessionId: data.sessionId
              })
              .then(handleResult);
          });
        });
  
      // Setup event handler to create a Checkout Session when button is clicked
    });
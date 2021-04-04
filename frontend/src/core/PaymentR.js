import React, { useState, useEffect } from "react";
import { Redirect } from "react-router-dom";
import Axios from "axios";
import { API } from "../backend";
import { cartEmpty } from "./helper/cartHelper";
import { isAuthenticated, signout } from "../auth/helper";



const PaymentR = ({
  products,
  reload = undefined,
  setReload = (f) => f,
}) => {
    const [payment_obj, setPaymentObj] =useState()
  const [info, setInfo] = useState({
    checkout_loaded: true,
    success: false,
    error: "",
    payment_object : null,
    // instance: {},
  });

  const userId = isAuthenticated && isAuthenticated().user.id;
  const token = isAuthenticated && isAuthenticated().token;

  const getAmount = () => {
    let amount = 0;
    products.map((p) => {
      amount = amount + parseInt(p.price);
    });
    return amount;
  };

    const handlePaymentSuccess = async(response) => {
        try {
            let bodyData = new FormData();
    
            // we will send the response we've got from razorpay to the backend to validate the payment
            bodyData.append("response", JSON.stringify(response));

            await Axios({
                url: `${API}payment/success/`,
                method: "POST",
                data: bodyData,
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                },
            })
                .then((res) => {
                    // alert('Your order has been placed successfully!')
                    cartEmpty(() => {
                        console.log('Cart Emptied')
                    });
                    setReload(!reload);
                console.log("Everything is OK!");
                })
                .catch((err) => {
                console.log(err);
                });
        } catch (error) {
            console.log(console.error());
        };
        setReload(!reload);
        };



    
    const loadScript = () => {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        document.body.appendChild(script);
        };


    const showRazorpay = async () =>{
        const res = loadScript();

        let product_names = "";
            products.forEach(function (item) {
              product_names += item.name + ", ";
            });

        let total_amount = 0;
        products.map((p) => {
            total_amount = total_amount + parseInt(p.price);
        });

        const orderData = {
            products: product_names,
            amount: total_amount,
        };

        const formData = new FormData();

        for(const name in orderData){
            formData.append(name, orderData[name]);
        }

        const data = await Axios({
        url: `${API}payment/start_payment/${userId}/${token}/`,
        method: "POST",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
        },
        data: formData,
        }).then((res) => {
        return res;
        });

        var options = {
            key_id: `** your razorpay public key id **`,
            key_secret: `** your razorpay secret key id **`,
            amount: data.data.payment.amount,
            currency: "INR",
            name: "Org. Name",
            description: "Test teansaction",
            image: "",
            order_id: data.data.payment.id,
            handler: function (response) {
              // we will handle success by calling handlePayment method and
              // will pass the response that we've got from razorpay
              handlePaymentSuccess(response);
            },
            prefill: {
              name: "User's name",
              email: "User's email",
              contact: "User's phone",
            },
            notes: {
              address: "Razorpay Corporate Office",
            },
            theme: {
              color: "#28a745",
            },
        };
      
        var rzp1 = new window.Razorpay(options);
        rzp1.open();
    }


  const showbtnBuyNow = () => {
    return (
      <div>
        {products.length > 0
          ? (
            <div>
              <button
                onClick={showRazorpay}
                className="btn btn-block btn-success"
              >
                Checkout
              </button>
            </div>
          )
          : (
            <h3>Please login first or add something in cart</h3>
          )}
      </div>
    );
  };

return (
    <div>
        <h3>Your bill is $ {getAmount()}</h3>
        {showbtnBuyNow()}
    </div>
  );
}

export default PaymentR;
